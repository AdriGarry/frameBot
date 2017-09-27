#!/usr/bin/env node
'use strict'

// conductor.js / dispatcher.js ??

const Rx = require('rxjs');

var ODI = require(ODI_PATH + 'core/shared.js');

console.log('--brain');
// console.log(ODI.flux);

// ODI.flux.action = Rx.Observable.create((observer) => {

ODI.flux.action = new Rx.Subject();

ODI.flux.button.subscribe({
	next: data => {
		// console.log('Brain:', data);
		if(data.id == 'ok'){
			console.log('Brain: Ok button', data);
			ODI.flux.action.next({id:'bip', value: 'ok'});
		}else if(data.id == 'cancel'){
			console.log('Brain: Cancel button...', data);
			ODI.flux.action.next({id:'bip', value:'cancel'});
		}else if(data.id == 'blue'){
			throw new Error('Brain: >> Odi Error from BLUE button', data);
		}else{
			console.log('Brain: (else statement)', data);
		}
	},
	// error: err => console.error('error in brain: ' + err)
	error: err => {throw new Error('Brain: Odi Error to define from button flux', err)}
});

/*ODI.flux.action = Rx.Observable.create((observer) => {
	ODI.flux.button.subscribe({
		next: data => {
			// console.log('Brain:', data);
			if(data.id == 'ok'){
				console.log('Brain: Ok button', data.value);
				observer.next({id:'bip', value: 'ok'});
			}else if(data.id == 'cancel'){
				console.log('Brain: Cancel button...', data.value);
				observer.next({id:'bip', value:'cancel'});
			}else if(data.id == 'blue'){
				throw new Error('Brain: >> Odi Error from BLUE button', data);
			}else{
				console.log('Brain: (else statement)', data);
			}
		},
		// error: err => console.error('error in brain: ' + err)
		error: err => {throw new Error('Brain: Odi Error to define from button flux', err)}
	});
	setTimeout(()=> observer.next('Brain loaded'), 1000);
});*/