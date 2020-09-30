const alphaRX = /\D?/;
const numRX = /\d+/;

export const id = "EVENT_BASTANI_TEXT_ITOS";

export const name = "Variable: Convert Integer into String Variable";

const updateVars = (args) => 
{	
	var variables = {};
	
	var Ipre = (args.variable.match(alphaRX) || [""])[0];
	var Inum = Number(args.variable.match(numRX)[0]);

	var length = args.length;
	
	var j;
  
	for (let j = 0; j < 52; j++) {
		variables["variable"+j] = j < length ? Ipre + (Inum + j) : 0;
	}
	variables["lastvariable"] = Ipre + (Inum + length - 1);
	
	return variables;
}

const fields = [].concat(
[
	{
		key: "number",
		label: "Number",
		type: "variable",
		postUpdate: (args) => 
		{
			vars = updateVars(args);
			return {
				...args,
				...vars
			};
		}
	},
	{
		key: "multiplier1",
		label: "Multiplier 1",
		type: "variable",
		postUpdate: (args) => 
		{
			vars = updateVars(args);
			return {
				...args,
				...vars
			};
		}
	},
	{
		key: "multiplier2",
		label: "Multiplier 2",
		type: "variable",
		postUpdate: (args) => 
		{
			vars = updateVars(args);
			return {
				...args,
				...vars
			};
		}
	},
	{
		key: "length",
		label: "Length",
		type: "number",
		min: 1,
		max: 52,
		defaultValue: 8,
		postUpdate: (args) => 
		{
			vars = updateVars(args);
			return {
			...args,
			...vars
			};
		}
	},
	{
		key: "emptyvalue",
		label: "Empty String Value",
		type: "number",
		min: 0,
		max: 255,
		defaultValue: 240
	},
	{
		key: "variable",
		label: "Destination First Variable",
		type: "variable",
		defaultValue: "0",
		postUpdate: (args) => 
		{
			vars = updateVars(args);
				return {
				...args,
				...vars
				};
			}
		},
	{
		key: "lastvariable",
		label: "Last Variable (for reference)",
		type: "variable",
		disable: true,
		defaultValue: "0",
		postUpdate: (args) => 
		{
			vars = updateVars(args);
				return {
				...args,
				...vars
				};
			}
		}
	] ,
	Array(52)
	.fill()
	.reduce((arr, _, i) => 
	{
		arr.push({
		key: `variable${i}`,
		hide: true,
		type: "variable",
		defaultValue: i
		});
		return arr;
	}, []),
);

const checkStrings = (input, helpers) =>
{
	const { ifVariableValue,
			variableCopy,
			variablesAdd,
			variablesMod, 
			variablesDiv,
			temporaryEntityVariable,
			variableSetToValue  } = helpers;
	var Ipre = (input.variable.match(alphaRX) || [""])[0];
	var Inum = Number(input.variable.match(numRX)[0]);
	for(let j = 0; j < input.length; j++)
	{
		const current = Ipre + (Inum + (input.length - 1) - j);
		const current2 = Ipre + (Inum + (input.length - 1) - (j + 1));
		const tmp1 = temporaryEntityVariable(0);
		const tmp2 = temporaryEntityVariable(1);
		ifVariableValue(current, ">=", 10, () => {
			variableCopy(tmp1, current); //Copy current number to temp;
			variableSetToValue(tmp2, 10);
			variablesMod(current, tmp2);
			variablesDiv(tmp1, tmp2);
			variablesAdd(current2, tmp1);
		}, () => {});
	}
}

const compile = (input, helpers) => 
{
	const { ifVariableValue,
			variableCopy, 
			variablesAdd,
			variablesMod, 
			variablesDiv,
			variableSetToValue, 
			temporaryEntityVariable} = helpers;

	var Ipre = (input.variable.match(alphaRX) || [""])[0];
	var Inum = Number(input.variable.match(numRX)[0]);

	for (let j = 0; j < input.length; j++) 
	{
		variableSetToValue(Ipre + (Inum + j), 0);
	}

	//Number
	variableCopy(Ipre + (Inum + (input.length - 1)), input.number)
	checkStrings(input, helpers);

	//Mult1
	for(let i = 0; i < 8; i++)
	{
		const tmp1 = temporaryEntityVariable(0);
		const tmp2 = temporaryEntityVariable(1);
		variableCopy(tmp1, input.multiplier1);
		variableSetToValue(tmp2, 2 ** i);
		variablesDiv(tmp1, tmp2);
		variableSetToValue(tmp2, 2);
		variablesMod(tmp1, tmp2);

		ifVariableValue(tmp1, "==", 1, () => 
		{
			const val = String(2 ** (i + 8));
			for(let j = 0; j < val.length; j++)
			{
				const current = Ipre + (Inum + (input.length - 1) - j);
				const currentIndex = (val.length - 1) - j;
				const tmp1 = temporaryEntityVariable(0);
				variableSetToValue(tmp1, parseInt(val[currentIndex]));
				variablesAdd(current, tmp1);
			}
		}, () => {});
		checkStrings(input, helpers);
	}

	//Mult2
	for(let i = 0; i < 8; i++)
	{
		const tmp1 = temporaryEntityVariable(0);
		const tmp2 = temporaryEntityVariable(1);
		variableCopy(tmp1, input.multiplier2);
		variableSetToValue(tmp2, 2 ** i);
		variablesDiv(tmp1, tmp2);
		variableSetToValue(tmp2, 2);
		variablesMod(tmp1, tmp2);

		ifVariableValue(tmp1, "==", 1, () => 
		{
			const val = String(2 ** (i + 16));
			for(let j = 0; j < val.length; j++)
			{
				const current = Ipre + (Inum + (input.length - 1) - j);
				const currentIndex = (val.length - 1) - j;
				const tmp1 = temporaryEntityVariable(0);
				variableSetToValue(tmp1, parseInt(val[currentIndex]));
				variablesAdd(current, tmp1);
			}
		}, () => {});
		checkStrings(input, helpers);
	}
	
	//Set Up Values
	const tmp3 = temporaryEntityVariable(0);
	const tmp4 = temporaryEntityVariable(1);
	variableSetToValue(tmp3, 1);
	variableSetToValue(tmp4, 16)
	
	for(let j = 0; j < input.length; j++)
	{
		const current = Ipre + (Inum + j);
		ifVariableValue(tmp3, "==", 1, () => {
			if(j != (input.length - 1))
			{
				ifVariableValue(current, "==", 0, () => {
					variableSetToValue(current, 240);
				}, () => 
				{//Else
					variableSetToValue(tmp3, 0);
					variablesAdd(current, tmp4);
				});
			}
			else
			{
				variablesAdd(current, tmp4);
			}
		}, () => 
		{//Else
			variablesAdd(current, tmp4);
		});
	}
};

module.exports = 
{
	id,
	name,
	fields,
	compile
};