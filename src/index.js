#!/usr/bin/env node

'use strict';

const startTime = new Date();
console.log('\u2022');

const argv = process.argv;
const name = process.argv[2];
const forcedParams = {
	debug: argv.indexOf('debug') > 0 ? true : false,
	sleep: argv.indexOf('sleep') > 0 ? true : false,
	test: argv.indexOf('test') > 0 ? true : false
};

global._PATH = __dirname.match(/\/.*\//g)[0];

const descriptor = require(_PATH + '_' + name + '/descriptor.json');
var Core = require(_PATH + 'src/core/Core.js').initializeContext(
	__filename.match(/\/.*\//g)[0],
	descriptor,
	forcedParams,
	startTime
);

const log = new (require(Core._CORE + 'Logger.js'))(__filename, Core.conf('mode'));
log.debug('argv:', argv);

const Utils = require(Core._CORE + 'Utils.js');
log.info(' -->  ' + Core.Name + ' ready [' + Utils.executionTime(Core.startTime) + 'ms]');

////////  TEST section  ////////
if (Core.conf('mode') == 'test') {
	setTimeout(function() {
		Core.do('interface|tts|speak', { lg: 'en', msg: 'test sequence' });
		require(Core._SRC + 'test/tests.js').launch();
	}, 1000);
}

Core.do('service|mail|send', {}, { delay: 3 });
