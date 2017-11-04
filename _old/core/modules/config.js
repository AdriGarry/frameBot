#!/usr/bin/env node

// Module Utils

var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require('os');
var util = require('util');

module.exports = {
	logArray: logArray,
	update: update,
	updateSync: updateSync,
	updateDefault: updateDefault,
	updateOdiSoftwareInfo: updateOdiSoftwareInfo,
	getLastModifiedDate: getLastModifiedDate,
	countSoftwareLines: countSoftwareLines,
	getDiskSpace: getDiskSpace,
	resetCfg: resetCfg
};

/*if(typeof ODI === 'undefined'){
	// hasOwnProperty()...
	console.log('--> ODI global context object is not defined !', typeof ODI);
	// var ODI = {};
	// ODI.utils = require(CORE_PATH + 'modules/utils.js');
}else{
	console.log('--> ODI global context OK', typeof ODI);
}*/

/** Function to log CONFIG array */
function logArray(updatedEntries){
	var col1 = 11, col2 = 16;
	var confArray = '\n|--------------------------------|\n|             CONFIG             |' + '\n|--------------------------------|\n';
	Object.keys(CONFIG).forEach(function(key,index){
		if(key == 'alarms'){
			Object.keys(CONFIG[key]).forEach(function(key2,index2){
				if(key2 != 'd'){
					var c1 = (index2>0 ? ' '.repeat(col1) : key + ' '.repeat(col1-key.toString().length));
					var c2 = key2 + ' ' + (CONFIG[key][key2].h<10?' ':'') + CONFIG[key][key2].h + ':';
					c2 += (CONFIG[key][key2].m<10?'0':'') + CONFIG[key][key2].m;
					if(typeof CONFIG[key][key2].mode === 'string') c2 += ' ' + CONFIG[key][key2].mode.charAt(0);//String(CONFIG[key][key2].mode).charAt(0)
					confArray += '| ' + c1 + ' | ' + c2 + ' '.repeat(col2-c2.length) + ' |\n';
				}
			});
		}else{
			var updated = (updatedEntries && ODI.utils.searchStringInArray(key, updatedEntries)) ? true : false;
			confArray += '| ' + (!updated ? '' : '*') + key + ' '.repeat(col1-key.length-updated) /*(updatedEntries.indexOf(key) == -1 ? ' ' : '*')*/
				+ ' | ' + CONFIG[key] + ' '.repeat(col2-CONFIG[key].toString().length) + ' |\n';
		}
	});
	console.log(confArray + '|--------------------------------|');
};

/** Function to set/edit Odi's config */
function update(newConf, restart, callback){
	console.debug('config.update(newConf)', util.inspect(newConf, false, null)); // TODO revoir pk l'objet n'est plus loggué
	ODI.utils.getJsonFileContent(CONFIG_FILE, function(data){
		var configFile = JSON.parse(data);
		var updatedEntries = [];
		Object.keys(newConf).forEach(function(key,index){
			if(configFile[key] != newConf[key]){
				configFile[key] = newConf[key];
				updatedEntries.push(key);
			}
		});
		global.CONFIG = configFile;
		fs.writeFile(CONFIG_FILE, JSON.stringify(CONFIG, null, 2), function(){
			logArray(updatedEntries);
			if(restart){
				console.debug('process.exit()');
				process.exit();
			}
			if(callback) callback();
		});
	});
};

/** Function to set/edit Odi's config ASYNCHRONOUSLY */
function updateSync(newConf, restart){
	console.debug('config.updateSync(newConf)', util.inspect(newConf, false, null)); // TODO revoir pk l'objet n'est plus loggué
	var configFile = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
	var updatedEntries = [];
	Object.keys(newConf).forEach(function(key,index){
		// updatedEntries.push(key);
		// fileConfig[key] = newConf[key];
		if(configFile[key] != newConf[key]){
			configFile[key] = newConf[key];
			updatedEntries.push(key);
		}
	});
	global.CONFIG = configFile;
	if(updatedEntries.length == 0) return;
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(CONFIG, null, 2));
	logArray(updatedEntries);
	if(restart){
		console.debug('process.exit()');
		process.exit();
	}
};

/** Function to set/edit Odi's default config file */
const DEFAULT_CONFIG_FILE = '/home/pi/odi/data/defaultConf.json';
function updateDefault(newConf, restart, callback){
	console.debug('setDefaultConfig(newConf)', util.inspect(newConf, false, null)); // TODO revoir pk l'objet n'est plus loggué
	//logArray();
	ODI.utils.getJsonFileContent(DEFAULT_CONFIG_FILE, function(data){
		var configFile = JSON.parse(data);
		var updatedEntries = [];
		Object.keys(newConf).forEach(function(key,index){
			// updatedEntries.push(key);
			// config[key] = newConf[key];
			if(configFile[key] != newConf[key]){
				configFile[key] = newConf[key];
				updatedEntries.push(key);
			}
		});
		global.CONFIG = configFile;
		if(updatedEntries.length == 0) return;
		fs.writeFile(DEFAULT_CONFIG_FILE, JSON.stringify(CONFIG, null, 2), function(){
			// logArray(updatedEntries);
			if(restart){
				console.debug('process.exit()');
				process.exit();
			}
			if(callback) callback();
		});
	});
};

/** Function to update Odi\'s software params (last date & time, totalLines) */
function updateOdiSoftwareInfo(){
	console.log('updating Odi\'s software infos (last date & time, totalLines)');
	ODI.config.getLastModifiedDate([CORE_PATH, WEB_PATH], function(lastUpdate){
		ODI.config.countSoftwareLines(function(totalLines){
			ODI.config.getDiskSpace(function(diskSpace){
				// if(CONFIG.totalLines != totalLines || CONFIG.update != lastUpdate || CONFIG.diskSpace != diskSpace){ // TODO delete this test and write on conf files only if updatedEntries.lentgh > 0
					ODI.config.updateDefault({update: lastUpdate, totalLines: totalLines, diskSpace: diskSpace}, false);
					ODI.config.update({update: lastUpdate, totalLines: totalLines, diskSpace: diskSpace}, false);
				// }
			});
		});
	});
};

/** Function to update last modified date & time of Odi's files */
function getLastModifiedDate(paths, callback){ // typeof paths => Array
	paths = paths.join(' ');
	ODI.utils.execCmd('find ' + paths + ' -exec stat \\{} --printf="%y\\n" \\; | sort -n -r | head -n 1', function(data){
		var lastDate = data.match(/[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}/g);
		console.debug('getLastModifiedDate()', lastDate[0]);
		callback(lastDate[0]);
	});
};

/** Function to count lines of Odi's software */
function countSoftwareLines(callback){
	var extensions = ['js', 'json', 'sh', 'py', 'html', 'css'];//, 'properties'
	var typesNb = extensions.length;
	var totalLines = 0;
	extensions.forEach(function(item, index){
		var temp = item;
		ODI.utils.execCmd('find /home/pi/odi/ -name "*.' + temp + '" -print | xargs wc -l', function(data){
			var regex = /(\d*) total/g;
			var result = regex.exec(data);
			var t = result && result[1] ? result[1] : -1;
			totalLines = parseInt(totalLines)+parseInt(t);
			typesNb--;
			if(!typesNb){
				console.debug('countSoftwareLines()', totalLines);
				callback(totalLines);
			}
		});
	});
};

/** Function to retreive disk space on /dev/root */
function getDiskSpace(callback){
	ODI.utils.execCmd('df -h', function(data){
		var diskSpace = data.match(/\/dev\/root.*[%]/gm);
		diskSpace = diskSpace[0].match(/[\d]*%/g);
		console.debug('getDiskSpace()', diskSpace[0]);
		callback(diskSpace);
	});
};

/** Function to reset Odi's config */
function resetCfg(restart){
	console.log('resetCfg()', restart ? 'and restart' : '');
	logArray();
//	config.update = now('dt');

	var stream = fs.createReadStream(DATA_PATH + 'defaultConf.json');/*, {bufferSize: 64 * 1024}*/
	stream.pipe(fs.createWriteStream(ODI_PATH + 'conf.json'));
	var had_error = false;
	stream.on('error', function(e){
		had_error = true;
		console.error('config.resetCfg() stream error', e);
	});
	stream.on('close', function(){
		if(!had_error && restart) {
			process.exit();
		}
	});
};