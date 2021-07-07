#!/usr/bin/env node

'use strict';

const startTime = new Date();
console.log('\u2022');

const argv = process.argv;
console.log('argv', argv);
const name = process.argv[2];
const forcedParams = {
	debug: argv.includes('debug') ? true : false,
	sleep: argv.includes('sleep') ? true : false,
	test: argv.includes('test') ? true : false
};

global._PATH = __dirname.match(/\/.*\//g)[0];

const fs = require('fs');
console.log('\n' + fs.readFileSync('./bots/' + argv[2] + '/logo.txt', 'utf8').toString());

const descriptor = require(_PATH + 'bots/' + name + '/descriptor.json');

const Core = require('./core/Core').initializeContext(descriptor, forcedParams, startTime);

const Flux = require('./api/Flux');

const logger = require('./api/Logger');

const log = new logger(__filename, Core.conf('mode'));

const Utils = require('./api/Utils');
const botName = Core.const('name').charAt(0).toUpperCase() + Core.const('name').slice(1);
log.info(' -->  ' + botName + ' ready [' + Utils.executionTime(Core.startTime) + 'ms]');

Utils.delay(2).then(() => {
	log.table(Core.const(), 'CONST');
})

////////  TEST section  ////////
if (Core.conf('mode') === 'test') {
	setTimeout(function () {
		new Flux('interface|tts|speak', { lg: 'en', msg: 'Integration tests sequence' });
		const integrationTests = require('./test/integration/tests');
		integrationTests.launch();
	}, 1000);
}


// TTS to test
//setTimeout(testSound, 3000);

function testSound() {
	const { spawn } = require('child_process');

	log.test('testSound...');
	let mplayerProcess = spawn('mplayer', ['-ao', 'alsa', '-volstep', 10, '-volume', 60, 'media/mp3/system/beBack.mp3']);

	mplayerProcess.stderr.on('data', err => {
		log.test(`stderr: ${err}`);
	});
}

const TestClass = require('./modules/services/TestModuleClass');

let testClass = new TestClass('mode');
testClass.onInit();