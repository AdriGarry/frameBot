#!/usr/bin/env node
'use strict'

var Odi = require(ODI_PATH + 'core/Odi.js').Odi;
var log = new (require(Odi.CORE_PATH + 'Logger.js'))(__filename);

const subject = { type: 'service', id: 'tts' };

var Flux = require(Odi.CORE_PATH + 'Flux.js');

Flux.service.tts.subscribe({
	next: flux => {
		if (!Flux.inspect(flux, subject)) return;
		log.info('TTS service', flux);
	},
	error: err => { Odi.error(flux) }
});