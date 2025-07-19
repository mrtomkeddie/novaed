'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const appendToExpression = (displayVal: string, expressionVal: string) => {
    if (display === 'Error') {
        setDisplay(displayVal);
        setExpression(expressionVal);
    } else if (display === '0') {
        setDisplay(displayVal);
        setExpression(expressionVal);
    } else {
        setDisplay(display + displayVal);
        setExpression(expression + expressionVal);
    }
  };

  const handleNumberClick = (num: string) => {
    appendToExpression(num, num);
  };
  
  const handleOperatorClick = (op: string) => {
      if (display === 'Error') return;
      // Avoid adding multiple operators in a row
      const lastChar = expression.trim().slice(-1);
      if (['+', '-', '*', '/'].includes(lastChar)) return;
      appendToExpression(` ${op} `, ` ${op} `);
  };

  const handleFunctionClick = (func: string) => {
    appendToExpression(`${func}(`, `Math.${func}(`);
  };

  const handleConstantClick = (name: string, value: string) => {
    appendToExpression(name, value);
  };
  
  const handleParenthesis = (paren: string) => {
    appendToExpression(paren, paren);
  }

  const handleSquare = () => {
    appendToExpression('^2', '**2');
  }

  const handleDecimalClick = () => {
    if (display === 'Error') return;
    const currentNumber = display.split(/[\+\-\*\/]/).pop() || '';
    if (currentNumber.includes('.')) return;
    appendToExpression('.', '.');
  };

  const handleEqualsClick = () => {
    if (display === 'Error') return;
    try {
      // Basic sanitization, not foolproof.
      const sanitizedExpression = expression.replace(/[^-()\d/*+.]/g, '');
      const result = new Function(`return ${expression}`)();
      const finalResult = parseFloat(result.toFixed(10)); // Fix floating point issues
      setDisplay(String(finalResult));
      setExpression(String(finalResult));
    } catch (e) {
      setDisplay('Error');
      setExpression('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };
  
  const handleBackspace = () => {
    if (display === 'Error' || display.length === 1) {
      handleClear();
    } else {
      setDisplay(display.slice(0, -1));
      setExpression(expression.slice(0, -1));
    }
  };

  return (
    <div className="w-full">
      <Input
        type="text"
        value={display}
        readOnly
        className="mb-4 text-right text-3xl font-mono h-16 bg-background"
        aria-label="Calculator display"
      />
      <div className="grid grid-cols-4 gap-2 text-lg">
        <Button variant="outline" onClick={() => handleFunctionClick('sin')}>sin</Button>
        <Button variant="outline" onClick={() => handleFunctionClick('cos')}>cos</Button>
        <Button variant="outline" onClick={() => handleFunctionClick('tan')}>tan</Button>
        <Button variant="outline" onClick={() => handleConstantClick('π', 'Math.PI')}>π</Button>

        <Button variant="outline" onClick={() => handleParenthesis('(')}>(</Button>
        <Button variant="outline" onClick={() => handleParenthesis(')')}>)</Button>
        <Button variant="outline" onClick={() => handleFunctionClick('sqrt')}>√</Button>
        <Button variant="outline" onClick={handleSquare}>x²</Button>
        
        <Button variant="destructive" onClick={handleClear}>C</Button>
        <Button variant="outline" onClick={handleBackspace}>&larr;</Button>
        <Button variant="outline" onClick={() => handleOperatorClick('%')}>%</Button>
        <Button variant="outline" onClick={() => handleOperatorClick('/')}>&divide;</Button>

        <Button variant="secondary" onClick={() => handleNumberClick('7')}>7</Button>
        <Button variant="secondary" onClick={() => handleNumberClick('8')}>8</Button>
        <Button variant="secondary" onClick={() => handleNumberClick('9')}>9</Button>
        <Button variant="outline" onClick={() => handleOperatorClick('*')}>&times;</Button>
        
        <Button variant="secondary" onClick={() => handleNumberClick('4')}>4</Button>
        <Button variant="secondary" onClick={() => handleNumberClick('5')}>5</Button>
        <Button variant="secondary" onClick={() => handleNumberClick('6')}>6</Button>
        <Button variant="outline" onClick={() => handleOperatorClick('-')}>-</Button>

        <Button variant="secondary" onClick={() => handleNumberClick('1')}>1</Button>
        <Button variant="secondary" onClick={() => handleNumberClick('2')}>2</Button>
        <Button variant="secondary" onClick={() => handleNumberClick('3')}>3</Button>
        <Button variant="outline" onClick={() => handleOperatorClick('+')}>+</Button>

        <Button variant="secondary" className="col-span-2" onClick={() => handleNumberClick('0')}>0</Button>
        <Button variant="secondary" onClick={handleDecimalClick}>.</Button>
        <Button variant="default" onClick={handleEqualsClick}>=</Button>
      </div>
    </div>
  );
}
