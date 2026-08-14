const calcDisplay = document.getElementById('calculator-answer');
const PI_STR = '3.1415926535897932';
let calcString = '', cooldown = false;

function calcBtn(button){
	if(cooldown){
		return;
	}
	else {
		cooldown = true;
		setTimeout(function(){
			cooldown = false;
		}, 100);
		if(calcString=='Error' || calcString=='0'){
			calcString='';
		}
		switch(button){
			case 'EQU':
				calcString = calculateResult();
				break;
			case 'DEL':
				calcString = '';
				break;
			case 'INT':
				let n = parseFloat(calcString);
				if(n && /[^0123456789\.e]/.test(calcString)==false){
					calcString = formatNumber(Math.trunc(n));
				}
				break;
			case 'PI':
				let lastchar = calcString[calcString.length-1] || 'X';
				if(/[^0123456789\.e]/.test(lastchar)==false){
					calcString += '*';
				}
				calcString += PI_STR;
				break;
			default:
				calcString += button;
		}
		calcDisplay.innerHTML = calcString.replaceAll('*','&times;').replaceAll('/','&divide;').replaceAll(PI_STR, 'PI') || '0';
	}
}

function calculateResult(){
	let cs = calcString.replaceAll('+-', '+M').replaceAll('*-', '*M').replaceAll('/-', '/M').replaceAll('--', '+'), iterations = 0;
	if(cs[0]=='-'){
		cs = cs.replace('-', 'M');
	}
	if(/[\+-\/\*][\+-\/\*]/.test(cs)){
		return 'Error'
	}
	let inputTokens = cs.match(/([M0123456789\.e]+)|(\+)|(-)|(\*)|(\/)/g), outputTokens = [], tokenStack = [];
	for(i of inputTokens){
		if(['+', '-', '*', '/'].includes(i)){
			if(i=='+' || i=='-'){
				while(tokenStack[tokenStack.length-1]){
					outputTokens.push(tokenStack.pop());
					iterations++;
					if(iterations>1e5){
						return 1;
					}
				}
			}
			else {
				while(tokenStack[tokenStack.length-1] == '*' || tokenStack[tokenStack.length-1] == '/'){
					outputTokens.push(tokenStack.pop());
					iterations++;
					if(iterations>1e5){
						return 1;
					}
				}
			}
			tokenStack.push(i);
		}
		else {
			let numberValue = parseFloat(i.replace('M', '-'));
			if(isFinite(numberValue)==false){
				return 'Error';
			}
			outputTokens.push(numberValue);
		}
	}
	while(tokenStack.length){
		outputTokens.push(tokenStack.pop());
		iterations++;
		if(iterations>1e5){
			return 'Error';
		}
	}
	let calcStack = [];
	for(i of outputTokens){
		if(typeof i=='number'){
			calcStack.push(i);
		}
		else {
			let op1 = calcStack.pop() || 0;
			let op2 = calcStack.pop() || 0;
			switch(i){
				case '+':
					calcStack.push(op1 + op2);
					break;
				case '-':
					calcStack.push(op2 - op1);
					break;
				case '*':
					calcStack.push(op1 * op2);
					break;
				case '/':
					calcStack.push(op2 / op1);
					break;
			}
		}
	}
	return formatNumber(calcStack[0]);
}

function formatNumber(num){
	if(isFinite(num)==false){
		return 'Error';
	}
	else if(num >= 1e10){
		return parseFloat(num.toPrecision(6)).toExponential().replace('+', '');
	}
	else if(num >= 1e8){
		return String(Math.round(num*1e2)/1e2);
	}
	else if(num >= 1e4){
		return String(Math.round(num*1e4)/1e4);
	}
	return String(Math.round(num*1e8)/1e8);
}
