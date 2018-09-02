#!/usr/bin/env node

'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new(require(Core._CORE + 'Logger.js'))(__filename);
const Flux = require(Core._CORE + 'Flux.js');
const Utils = require(_PATH + 'src/core/Utils.js');
const fs = require('fs');

Flux.controller.watcher.subscribe({
	next: flux => {
		if (flux.id == 'startWatch') {
			startWatch();
		} else if (flux.id == 'stopWatch') {
			stopWatch();
		} else Core.error('unmapped flux in Watcher controller', flux, false);
	},
	error: err => {
		Core.error(flux);
	}
});

const PATHS = [Core._SRC, Core._DATA];
var watchers = [];

function startWatch() {
	log.info('starting watchers on', PATHS);
	PATHS.forEach(path => {
		watchers.push(addWatcher(path, relaunch));
	});
	Core.conf('watcher', true);
}

function stopWatch() {
	log.info('watchers stop', PATHS);
	watchers.forEach(watcher => {
		removeWatcher(watcher);
	});
	Core.conf('watcher', false);
}

var timer;

function addWatcher(path, action) {
	let watcher = fs.watch(path, {
		recursive: true
	}, (eventType, filename) => {
		if (eventType) {
			if (!timer) {
				timer = new Date();
			}
			let logInfo = path.match(/\/(\w*)\/$/g);
			log.info(eventType, logInfo[0] || logInfo, filename, '[' + Utils.executionTime(timer) + 'ms]');
			waitForUpdateEnd(action);
		}
	});
	return watcher;
}

function removeWatcher(watcher) {
	watcher.close();
}
var watchTimeout;

function waitForUpdateEnd(action) {
	log.debug('waiting for update end...');
	clearTimeout(watchTimeout);
	watchTimeout = setTimeout(() => {
		action();
	}, 2000);
}

function relaunch() {
	log.INFO('>> relaunching...');
	Flux.next('service|system|restart', Core.conf('mode'));
}