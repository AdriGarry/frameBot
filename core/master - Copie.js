#!/usr/bin/env node

/** Params detection */
// const lastUpdated = process.argv[2];

/** Odi's global variables  */
global.ODI_PATH = '/home/pi/odi/';
global.CORE_PATH = '/home/pi/odi/core/';
global.CONFIG_FILE = '/home/pi/odi/conf.json';
global.DATA_PATH = '/home/pi/odi/data/';
global.LOG_PATH = '/home/pi/odi/log/';
global.WEB_PATH = '/home/pi/odi/web/';

console.debug = function(o){}; // debug init to false

var fs = require('fs');
var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var utils = require(CORE_PATH + 'modules/utils.js');
var leds = require(CORE_PATH + 'modules/leds.js');

utils.getLastModifiedDate([CORE_PATH, WEB_PATH, DATA_PATH], function(lastUpdate){
	utils.setDefaultConfig({update: lastUpdate}, false);
});

var odiPgm, odiState = false, errorLimit = 1;
const logoNormal = fs.readFileSync(DATA_PATH + 'odiLogo.properties', 'utf8').toString().split('\n');
const logoSleep = fs.readFileSync(DATA_PATH + 'odiLogoSleep.properties', 'utf8').toString().split('\n');


/* ------------- START CORE -------------*/
console.log('\r\n>> Odi\'s CORE started');

startOdi(); // First init

ok.watch(function(err, value){
	if(!odiState){ // Watch green button to force start... DEPRECATED ???
		utils.setConfig({mode: 'ready'}, true);
		startOdi();
	}
});

var logDate, logMode = getLogMode(), timeToWakeUp;
var date, month, day, hour, min, sec;

/** Function to start up Odi */
function startOdi(exitCode){
	global.CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
	spawn('sh', [CORE_PATH + 'sh/mute.sh']); // Mute // + LEDS ???

	var logo;
	// console.log('==> CONFIG.mode', CONFIG.mode);
	// console.log('==> exitCode', exitCode);
	if(CONFIG.mode == 'sleep' || typeof exitCode === 'number' && exitCode > 0){
		logMode = ' O';// inutile (cf getLogMode())
		logo = logoSleep;
		odiPgm = spawn('node', [CORE_PATH + 'odiSleep.js'/*, mode*/]);
	// }else if(CONFIG.mode == 'ready'){
	}else{
		timeToWakeUp = 0;
		logMode = ' Odi';// inutile (cf getLogMode())
		logo = logoNormal;
		odiPgm = spawn('node', [CORE_PATH + 'odi.js'/*, exitCode*/]);
	}

	console.log('\n\n' + logo.join('\n'));

	var startTime = utils.logTime('h:m (D/M)');
	// console.log('startTime', startTime);
	utils.setConfig({startTime: startTime}, false); // TODO à déplacer dans odi.js & odiSleep.js ?!?

	etat.watch(function(err, value){
		logMode = getLogMode();
	});

	odiState = true;
	odiPgm.stdout.on('data', function(data){ // Template log output
		console.log(utils.logTime('D/M h:m:s') + logMode + '/ ' + data);
	});

	odiPgm.stderr.on('data', function(data){ // Template log error
		// console.log(typeof data);
		// console.log(data);
		var util = require('util');
		console.log(util.inspect(data));
		if(CONFIG.mode == 'ready') spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'error']);
		setTimeout(function(){
			leds.altLeds(30, 1.5);
		}, 1500);
		console.error(utils.logTime('D/M h:m:s') + logMode + '_ERROR/ ' + data);
		// var tempErr = (new Error()).stack;
		// console.log('stack');
		// console.log(tempErr);
	});
	
	odiPgm.on('exit', function(code){ // SetUpRestart Actions
		spawn('sh', [CORE_PATH + 'sh/mute.sh']);  // Mute // + LEDS ???
		odiState = false;
		console.log('\r\n-----------------------------------' + (code>10 ? (code>100 ? '---' : '--') : '-'));
		console.log('>> Odi\'s CORE restarting... [code:' + code + ']\r\n\r\n');
		startOdi(code);
	});
};

function getLogMode(){
	value = etat.readSync();
	if(value != etat.readSync()){
		getLogMode();
	}
	if(1 == value) return ' ODI';
	else return ' Odi';
}

var decrementInterval;
/** Funtion to decrement time (time before wake up log while sleeping */
var decrementTime = function(){
	decrementInterval = setInterval(function(){
		if(timeToWakeUp > 0){
			timeToWakeUp = timeToWakeUp - 1;
			logMode = ' O...' + Math.floor(timeToWakeUp/60) + ':' + Math.floor(timeToWakeUp%60);
			// console.log('decrementTime : ' + timeToWakeUp);
		}else{
			// console.log('timeToWakeUp <= 0 [' + timeToWakeUp + ']  clearInterval !'); clearInterval(decrementInterval); // return;
		}
	}, 60*1000);
};
