#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
var log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Utils = require(Core._CORE + 'Utils.js');

log.info('Module test sequence...');

const Rx = require('rxjs');
const assert = require('assert');
var Flux = require(Core._CORE + 'Flux.js');

// const testTTSList = [{lg: 'en', msg: 'Test' },	{lg: 'fr', msg: 'Test' }];

module.exports.run = function(succeedTest) {
	//Flux.next('interface|tts|speak', testTTSList[Utils.random(testTTSList.length)], null, null, true);
	// Flux.next('interface|led|toggle', { leds: ['eye', 'belly', 'satellite'], value: 0 }, 3, null, null, true);
	// Flux.next('interface|led|blink', { leds: ['belly'], speed: 600, loop: 100 });

	assert.ok(Core.conf());
	assert.equal(Core.conf('mode'), 'test');
	assert.ok(Core.isAwake());

	assert.ok(Core.run());
	assert.equal(Core.run('music'), false);
	assert.equal(Core.run('alarm'), false);

	Flux.next('interface|hardware|cpuTTS', null, { delay: 0.1 });

	setTimeout(() => {
		assert.equal(Core.errors.length, 0);
		Flux.next('interface|sound|mute', { delay: 3, message: 'DELAY 3' });
		setTimeout(() => {
			succeedTest('moduleTest', true);
		}, 5000);
	}, 30000);
};
