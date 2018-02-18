#!/usr/bin/env node
'use strict';

var log = new (require(ODI_PATH + 'src/core/Logger.js'))(__filename);
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var fs = require('fs');

var Flux = {};
setTimeout(() => {
	Flux = require(ODI_PATH + 'src/core/Flux.js');
	// console.log(Flux.next);
}, 100);

/** accessor: object(|id, value, table, restart]) */
function Lock(obj, file) {
	var self = this;
	self._obj = obj;
	if (file) {
		self.file = file;
	} else {
		self.file = false;
	}
	return _functions;

	function _functions(id, newValue, restart, table) {
		if (!id) return self._obj; //return all object
		if (typeof newValue !== 'undefined')
			return _setter(id, newValue, restart, table); //set value
		else return _getter(id); //get value
	}

	function _getter(id) {
		if (self._obj.hasOwnProperty(id)) {
			return self._obj[id];
		} else if (id.indexOf('.' > -1)) {
			var keys = id.split('.');
			return self._obj[keys[0]][keys[1]];
		} else {
			return log.error('_getObjValue ERROR:', id);
		}
	}

	function _setter(id, newValue, restart, table) {
		if (self.file) {
			let updateBegin = new Date();
			log.debug('Updating :', newValue, restart);
			_setValue(self._obj, id, newValue);
			let updatedEntries = [id];
			fs.writeFileSync(self.file, JSON.stringify(self._obj, null, 1));
		} else {
			_setValue(self._obj, id, newValue);
		}
	}

	function _setValue(object, id, newValue) {
		// log.info('---> setValue()', id, newValue, object);
		let id2;
		if (id.indexOf('.') > -1) {
			let keys = id.split('.');
			id = keys[0];
			id2 = keys[1];
		}
		if (object.hasOwnProperty(id)) {
			if (Array.isArray(object[id])) {
				object[id].push(newValue);
			} else {
				if (id2) object[id][id2] = newValue;
				else object[id] = newValue;
			}
			if (Flux.next) {
				// console.log('------YES');
				//Flux.next('module', 'runtime', 'updated', { id: id, value: newValue }, null, null, false);
			}
		} else {
			log.error('setValue ERROR:', id);
		}
	}
}

module.exports = Lock;
