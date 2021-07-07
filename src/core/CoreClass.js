#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');

const Lock = require('./Lock');

const Logger = require('./../api/Logger'),
   Utils = require('./../api/Utils'),
   CORE_DEFAULT = require(_PATH + 'data/framebotDefault.json');
// const CoreError = require(_PATH + 'src/api/CoreError.js');

const log = new Logger(__filename);

module.exports = class Core {
   constructor(Core, descriptor, startTime) {
      this.startTime = startTime;
      for (let path in CORE_DEFAULT.paths) {
         // Setting _PATHS
         this[path] = _PATH + CORE_DEFAULT.paths[path];
      }
      this.url = descriptor.url;
      this._CONF = _PATH + 'bots/' + descriptor.name.toLowerCase() + '/';

      this.conf = new Lock(require(Core._TMP + 'conf.json'), Core._TMP + 'conf.json');
      this.run = new Lock(CORE_DEFAULT.runtime);
      this.const = new Lock(CORE_DEFAULT.const, null, true);

      this.const('name', descriptor.name.trim().toLowerCase());
      this.isAwake = isAwake;
      this.isOnline = isOnline;
      this.descriptor = descriptor;
      this.error = error;
      // Core.Error = CoreError;
      this.errors = [];
      this.gpio = require(Core._CONF + 'gpio.json');
      this.ttsMessages = require(Core._CONF + 'ttsMessages.json');
   }

   isAwake() {
      return this.conf('mode') !== 'sleep';
   }

   isOnline() {
      return this.run('network.public') !== 'offline';
   }

   error(message, data, stackTrace) {
      if (!CoreError) {
         CoreError = require(_PATH + 'src/api/CoreError.js');
      }
      new CoreError(message, data, stackTrace); // TODO throw real error, but bad requests will show stack trace...
   }
}

