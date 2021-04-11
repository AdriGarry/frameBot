#!/usr/bin/env node

'use strict';

const Core = require('./Core.js').Core;
const Logger = require('../api/Logger.js'),
	CronJobList = require('../api/CronJobList.js');

const log = new Logger(__filename);

module.exports = class ModuleLoader {
	constructor(modules, modulesPath) {
		this.modules = modules;
		this.modulesPath = modulesPath;
	}

	loadCoreModules() {
		log.test(this.modules)
		let modulesLoaded = _requireCoreModules(this.modules, this.modulesPath);
		log.test('core modules loaded [' + modulesLoaded + ']');
	}

	loadModules() {
		Object.keys(this.modules).forEach(moduleType => {
			let modulesLoaded = _requireModules(moduleType, this.modules[moduleType].base, this.modulesPath);
			if (Core.isAwake() && this.modules[moduleType].hasOwnProperty('full')) {
				modulesLoaded += ', ' + _requireModules(moduleType, this.modules[moduleType].full, this.modulesPath);
			}
			log.info(moduleType, 'loaded [' + modulesLoaded + ']');
		});
	}

	setupCron() {
		let cronList = _organizeCron();
		let moduleCrons = new CronJobList(cronList, 'from modules');
		moduleCrons.start();
	}
};

var loadedModules = {};

function _requireCoreModules(moduleArray, modulesPath) {
	let modulesLoadedList = '';
	log.test('_requireCoreModules', moduleArray)
	moduleArray.forEach(coreModule => {
		log.test(modulesPath + coreModule + '.js')
		loadedModules[coreModule] = require(modulesPath + coreModule + '.js');
	});

	modulesLoadedList += moduleArray.join(', ');
	return modulesLoadedList;
}

function _requireModules(moduleType, moduleArray, modulesPath) {
	let modulesLoadedList = '';
	for (let i = 0; i < moduleArray.length; i++) {
		loadedModules[moduleArray[i]] = require(modulesPath + moduleType + '/' + moduleArray[i] + '.js');
	}
	modulesLoadedList += moduleArray.join(', ');
	return modulesLoadedList;
}

function _organizeCron() {
	let cronList = [];
	Object.keys(loadedModules).forEach(mod => {
		if (loadedModules[mod].cron) {
			if (Array.isArray(loadedModules[mod].cron.base)) cronList.push.apply(cronList, loadedModules[mod].cron.base);
			if (Array.isArray(loadedModules[mod].cron.full) && Core.isAwake())
				cronList.push.apply(cronList, loadedModules[mod].cron.full);
		}
	});
	return cronList;
}
