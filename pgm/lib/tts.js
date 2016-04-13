#!/usr/bin/env node
// Module TTS

var spawn = require('child_process').spawn;
var fs = require('fs');
var leds = require('./leds.js');
var request = require('request');
var utils = require('./utils.js');
var deploy;
var self = this;
var content;
var messages = '/home/pi/odi/pgm/data/ttsMessages.properties';
var lastTTSFilePath = '/home/pi/odi/pgm/tmp/lastTTS.log';

var speak = function(lg, txt){
utils.clearLastTTS();
utils.testConnexion(function(connexion){
	if(connexion == true){
		// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/utils.sh', 'clearLastTTS']);
		// console.log('LastTTS deleted.');
		if(txt == '' || txt === 'undefined'){
		// if(txt == '' || typeof txt === 'undefined'){
			content = fs.readFileSync(messages, 'UTF-8').toString().split('\n'); // \r\n
			var rdmMax = content.length;
			var rdmNb = ((Math.floor(Math.random()*rdmMax)));
			txt = content[rdmNb];
			console.log('Random speech : ' + rdmNb + '/' + rdmMax);
			txt = txt.split(';');
			lg = txt[0];
			txt = txt[1];
		}
		console.log('TTS [' + lg + '] "' + txt + '"');
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/tts.sh', lg, txt]);
		var blinkTime = (txt.length/15) + 1;
		leds.blinkEye((Math.floor(Math.random()*5) + 1)*50, blinkTime);
		fs.appendFile(lastTTSFilePath, lg + ';' + txt, function(err){ // NE PAS CONSERVER L'HISTORIQUE !!!
			if(err) console.error(err);
		});
		setTimeout(function(lg, txt){
			// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/utils.sh', 'clearLastTTS']);
			// console.log('LastTTS deleted.');
		}, 20*1000);
	} else {
		console.error('No network, can\'t get TTS data /!\\');
		// var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/tts2.sh', lg, txt]); --> espeak
	}
});
};
exports.speak = speak;

var lastTTS = function(){
	var content = fs.readFileSync(lastTTSFilePath, 'UTF-8').toString().split('\n'); // PREVENIR SI FICHIER NON EXISTANT !!!
	// console.log('content=> ' + content);
	txt = content[content.length-1].split(';');
	lg = txt[0];
	txt = txt[1];
	if(typeof lg === 'undefined' || typeof txt === 'undefined'){
		lg = 'en';
		txt = '.undefined'; // Vous pouvez r�p�ter ?
	}
	console.log('LastTTS=> ' + lg + ';' + txt);
	self.speak(lg, txt);
};
exports.lastTTS = lastTTS;


var getTTS = function(lg, txt){
};
exports.getTTS = getTTS;