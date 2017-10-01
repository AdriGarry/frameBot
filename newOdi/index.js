#!/usr/bin/env node
'use strict'

const argv = process.argv;
const forcedDebug = argv[2] == 'debug' ? true : false;
// if(forcedDebug) console.log();

global.ODI_PATH = __filename.match(/\/.*\//g)[0];

var Odi = require(ODI_PATH + 'core/Odi.js').init(__filename.match(/\/.*\//g)[0]);
console.log('\r\nNew Odi starting...', Odi.conf.debug ? 'DEBUG' : (forcedDebug ? 'DEBUG (forced)' : ''));
// console.log('Odi.conf.debug', Odi.conf.debug);
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename, forcedDebug || Odi.conf.debug);// Odi.conf.debug || forcedDebug
log.debug('argv', argv);

// Utils.js à part pour tout ce qui peut servir de partout...
var Utils = require(Odi.CORE_PATH + 'Utils.js');
console.log(Utils);

// Flux
var Flux = require(Odi.CORE_PATH + 'Flux.js');

// Services
var mood = require(Odi.CORE_PATH + 'services/mood.js');
var music = require(Odi.CORE_PATH + 'services/music.js');
var system = require(Odi.CORE_PATH + 'services/system.js');
var time = require(Odi.CORE_PATH + 'services/time.js');
var tools = require(Odi.CORE_PATH + 'services/tools.js');
var tts = require(Odi.CORE_PATH + 'services/tts.js');
var video = require(Odi.CORE_PATH + 'services/video.js');

// Modules
var hardware = require(Odi.CORE_PATH + 'modules/hardware.js');
var led = require(Odi.CORE_PATH + 'modules/led.js');
var sound = require(Odi.CORE_PATH + 'modules/sound.js');

/////////////  TEST  /////////////
// Flux.next(id, value, subject [,delay, ?])
//Flux.next('id', {value1: 'AA', value2: 'BB'}, 'subject');

// var Log = require(Odi.CORE_PATH + 'Logger.js').init(__filename.match(/(\w*).js/g)[0]),
// log = new Log('toto');

log.info('I\'m Ready !!');

setTimeout(function () {
  log.debug('PROCESS.EXIT');
  process.exit();
}, 25000);

// console.trace(); // to get line number
