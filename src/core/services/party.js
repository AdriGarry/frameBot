#!/usr/bin/env node

// Module Party

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');
var spawn = require('child_process').spawn;
/*var tts = require(CORE_PATH + 'modules/tts.js');
var service = require(CORE_PATH + 'modules/service.js');*/

var date = new Date();
var hour = date.getHours();
var pastHour = hour;
var minRing = true;

module.exports = {
	setParty: setParty
};

/** Function jukebox (repeat) */
function setParty(test){
	log.info('LET\'S START PARTY !!  <|:-)  <|:-)  <|:-) \ntest: : ' + test);
	if(test == true){
			var deploy = spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', 'test']);
			log.info('test = ' + test);
			Flux.next('module', 'tts', 'speak', {lg:'en', msg:'test mode'});
			Flux.next('module', 'tts', 'speak', {lg:'en', msg:'LET\'S START PARTY IN TEST MODE!!'});
	}/* else {
			ODI.tts.speak('en', 'LET\'S START PARTY !!');
	}*/
	setTimeout(function(){
		spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh', 'startParty']);
	}, 3000);

	setInterval(function(test){
		log.info('IT\'S PARTY TIME !!  <|:-) \ntest: : ' + test);
		var date = new Date();
		var day = date.getDay();
		var hour = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		if(test == true){
			test = min % 10;
			log.info('/!\\ /!\\  TEST PARTY !!  /!\\ /!\\  _min = ' + test);			
		} else { test = 0; }
		if((hour == 23 && min == 0 || test == 3) && sec < 16) {
			spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh', '23h']);
			log.info('23h...');
		} else if((hour == 23 && min == 30 || test == 4) && sec < 16) {
			spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh', '23h30']);
			log.info('23h30...');
		} else if((hour == 23 && min == 59 || test == 5) && sec < 16) {
			spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh', 'compteARebours']);
			log.info('Compte a rebours setup');
			setTimeout(function(){
				spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh', 'compteARebours2']);
				log.info('Compte a rebours start');
			}, 2000);
		} else if((hour == 0 && min == 13|| test == 6) && sec < 16) {
			spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh']);
			log.info('De Par mes circuits et transistors !');
			setTimeout(function(){
				spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh', 'puisJeExprimer']);
				log.info('Puis-je m\'exprimer ?');
			}, 2000);
			setTimeout(function(){
				spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh', 'discours']);
				log.info('Discours...');
			}, 8000);
		} else if((min % 11 == 0 || test == 1) && sec < 16) {
			spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh']);
			log.info('B Par mes circuits et transistors !');
		} else if((min % 12 == 0 || test == 2) && sec < 16) {
			spawn('sh', ['/home/pi/odi/core/sh/soundsParty.sh', 'pasAssezSaoul']);
			log.info('Pas assez saoul ?!');
		} else if((min % 13 == 0) && sec < 16) {
			ODI.service.weather();
		}
		// TODO ajouter d'autres trucs (now, today... et tout revoir en fait!)
	}.bind(this, test), 15*1000);
};