#!/usr/bin/env node

'use strict';

const Core = require('./../../core/Core').Core;

const { Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

const FLUX_PARSE_OPTIONS = [
	{ id: 'beforeRestart', fn: beforeRestart },
	{ id: 'goToSleep', fn: goToSleep },
	{ id: 'certbot', fn: renewCertbot }
];

Observers.attachFluxParseOptions('service', 'task', FLUX_PARSE_OPTIONS);

const GO_TO_SLEEP_DELAY = 5 * 60;

function goToSleep() {
	log.info(`goToSleep in ${GO_TO_SLEEP_DELAY / 60} min`);

	// light
	new Flux('interface|hardware|light', GO_TO_SLEEP_DELAY);

	// radiator off
	new Flux('interface|rfxcom|send', { device: 'radiator', value: true });

	new Flux('interface|led|blink', { leds: ['belly', 'eye'], speed: 200, loop: 5 }, { delay: 50 });

	// plugA & plugB off
	new Flux('interface|rfxcom|send', { device: 'plugA', value: false }, { delay: 120 });
	// new Flux('interface|rfxcom|send', { device: 'plugB', value: false }, { delay: 60 });

	if (Core.isAwake()) {
		new Flux('service|context|sleep', null, { delay: GO_TO_SLEEP_DELAY });
	}
}

function beforeRestart() {
	log.info('beforeRestart');
	//new Flux('interface|rfxcom|send', { device: 'plugB', value: true });
}

function renewCertbot() {
	log.INFO('renew Certbot certificate');
	// TODO use https://www.npmjs.com/package/greenlock
	Utils.execCmd('sudo framebot certbot') // TODO sudo useless ?
		.then(data => {
			log.info('Certbot certificate successfully renewed', data);
		})
		.catch(err => {
			Core.error('Error renewing Certbot certificate', err);
		});
}
