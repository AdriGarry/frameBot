#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');

const Logger = require('../api/Logger'),
   Utils = require('../api/Utils'),
   CORE_DEFAULT = require(_PATH + 'data/framebotDefault.json');
// const CoreError = require(_PATH + 'src/api/CoreError.js');

const log = new Logger(__filename);

module.exports = class CoreLoader {
   constructor(Core, descriptor, startTime) {
      log.info('Core context initializing...');
      Core = _setUpCoreObject(Core, descriptor, startTime);
   }
}

// TODO mode to CoreInstancier code bellow
function initializeContext(descriptor, forcedParams, startTime) {
   log.info('Core context initializing...');
   Core = _setUpCoreObject(Core, descriptor, startTime);

   let confUpdate = {},
      forcedParamsLog = '',
      packageJson = require(_PATH + 'package.json');

   Core.const('startTime', Utils.logTime('h:m (D/M)'));
   Core.const('version', packageJson.version);

   if (forcedParams.sleep) {
      Core.conf('mode', 'sleep');
      confUpdate.mode = 'sleep';
      forcedParamsLog += 'sleep ';
   }
   if (forcedParams.debug) {
      log.level('debug');
      forcedParamsLog += 'debug ';
   }
   if (forcedParams.test) {
      confUpdate.mode = 'test';
      forcedParamsLog += 'test ';
   }
   if (forcedParamsLog != '') console.log('forced', forcedParamsLog);

   // log.table(Core.conf(), 'CONFIG'); // deprecated
   if (Core.isAwake()) {
      spawn('omxplayer', ['--vol', -602, Core._MP3 + 'system/startup.mp3']);
   }

   if (Core.conf('log') != 'info') log.level(Core.conf('log'));

   if (descriptor.conf && typeof descriptor.conf == 'object') {
      Object.keys(descriptor.conf).forEach(key => {
         if (Core.conf(key) == '.') {
            confUpdate[key] = descriptor.conf[key];
         }
      });
   }

   const Observers = require('../api/Observers');
   Observers.init(descriptor.modules);

   const Flux = require('../api/Flux.js'),
      ModuleLoader = require('./ModuleLoader.js');

   new Flux('service|context|update', confUpdate, { delay: 0.1, log: 'debug' });

   log.info('Core context initialized [' + Utils.executionTime(startTime) + 'ms]');
   let moduleLoader = new ModuleLoader(descriptor.modules);
   moduleLoader.load();
   log.info('all modules loaded [' + Utils.executionTime(Core.startTime) + 'ms]');

   new Flux('interface|server|start', null, { log: 'trace' });
   moduleLoader.setupCron();
   Object.seal(Core);
   return Core;
}

function error(message, data, stackTrace) {
   if (!CoreError) {
      CoreError = require(_PATH + 'src/api/CoreError.js');
   }
   new CoreError(message, data, stackTrace); // TODO throw real error, but bad requests will show stack trace...
}
