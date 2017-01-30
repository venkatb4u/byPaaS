const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var log = console.log;


// var outSample = "T-H-H-E-D-V-C-E-M-T";



console.log((function fibSecret(inp) {
	var inp = inp.replace(/ /g , ""),
		alphaOnly = (function alphaOnly(a) {
		    var b = '';
		    for (var i = 0; i < a.length; i++) 
		        if (a[i] >= 'A' && a[i] <= 'z') b += a[i];
		    return b;
		})(inp);

	var fib = [0,1],
		output = alphaOnly.charAt(0).toUpperCase() + '-' + alphaOnly.charAt(1).toUpperCase();
	
    for (var i = 1; i <= alphaOnly.length; i++) {
    	var nextVal = fib[i] + fib[i - 1],
    		nextChar = alphaOnly.charAt(nextVal);
        fib.push(nextVal);
        if (!nextChar) 
        	break;
        output += '-' + nextChar.toUpperCase();

    }
    return output;
})("The Da Vinci Code is a 2003 mystery-detective novel by Dan Brown"));

// log(fibSecret("The Da Vinci Code is a 2003 mystery-detective novel by Dan Brown"));
