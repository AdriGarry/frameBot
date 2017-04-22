#!/usr/bin/env node

// Module Utils

var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require("os");
/*var hardware = require(CORE_PATH + 'modules/hardware.js');
var leds = require(CORE_PATH + 'modules/leds.js');
var exclamation = require(CORE_PATH + 'modules/exclamation.js');*/

module.exports = {
	logTime: logTime,
	logConfigArray: logConfigArray,
	setConfig: setConfig,
	resetConfig: resetConfig,
	prepareLogs: prepareLogs,
	getJsonFileContent: getJsonFileContent,
	appendJsonFile: appendJsonFile,
	searchStringInArray: searchStringInArray,
	//randomAction: randomAction,
	testConnexion: testConnexion,
};

/** Function to return date time. Pattern: 'DT' */
function logTime(param, date){
	if(typeof date === 'undefined') date = new Date();
	var D = date.getDate();
	var M = date.getMonth()+1;
	var h = date.getHours();
	var m = date.getMinutes();
	var s = date.getSeconds();
	var now = '';

	for(var i = 0; i < param.length; i++){
		switch(param[i]){
			case 'D':
				now += (D<10 ? '0' : '') + D;
				break;
			case 'M':
				now += (M<10 ? '0' : '') + M;
				break;
			case 'h':
				now += (h<10 ? '0' : '') + h;
				break;
			case 'm':
				now += (m<10 ? '0' : '') + m;
				break;
			case 's':
				now += (s<10 ? '0' : '') + s;
				break;
			default:
				now += param[i];
		}
	}
	// console.log('utils.now(param)', param, now);
	return now;
};

/** Function to log CONFIG array */
function logConfigArray(updatedEntries){
	// updatedEntries.indexOf(tts.voice) == -1
	var col1 = 11, col2 = 15;
	var confArray = '\n|-------------------------------|\n|             CONFIG            |' + '\n|-------------------------------|\n';
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
			var updated = 0;
			if(updatedEntries && updatedEntries.indexOf(key)) updated = 1;
			// var updated = updatedEntries.indexOf(key) == -1 ? 0 : 1;
			confArray += '| ' + (updated ? '*' : '') + key + ' '.repeat(col1-key.length-updated) /*(updatedEntries.indexOf(key) == -1 ? ' ' : '*')*/
				+ ' | ' + CONFIG[key] + ' '.repeat(col2-CONFIG[key].toString().length) + ' |\n';
		}
	});
	console.log(confArray + '|-------------------------------|');
};

/** Function to set/edit Odi's config */
function setConfig(newConf, restart, callback){
	console.debug('setConfig(newConf)', newConf);
	//logConfigArray();
	getJsonFileContent(CONFIG_FILE, function(data){
		var config = JSON.parse(data);
		var updatedEntries = [];
		Object.keys(newConf).forEach(function(key,index){
			updatedEntries.push(key);
			config[key] = newConf[key];
		});
		//config.update = now('T (D)');
		//console.log('now("dt")', now('dt'));
		global.CONFIG = config;
		fs.writeFile(CONFIG_FILE, JSON.stringify(CONFIG, null, 2), function(){
			logConfigArray(updatedEntries);
			if(restart){
				// ODI.hardware.restartOdi();
				console.debug('process.exit()');
				process.exit();
			}
			if(callback) callback();
		});
	});
};

/** Function to reset Odi's config */
function resetConfig(restart){
	console.log('resetConfig()', restart ? 'and restart' : '');
	logConfigArray();
//	config.update = now('dt');

	var stream = fs.createReadStream(DATA_PATH + 'defaultConf.json');/*, {bufferSize: 64 * 1024}*/
	stream.pipe(fs.createWriteStream(ODI_PATH + 'conf.json'));
	var had_error = false;
	stream.on('error', function(e){
		had_error = true;
		console.error('utils.resetConfig() stream error', e);
	});
	stream.on('close', function(){
		if(!had_error && restart) {
			// ODI.hardware.restartOdi();
			ODI.utils.setConfig({mode: 'ready'}, true);
		}
	});
};

/** Function to format logs */
function prepareLogs(lines, callback){
	var content = fs.readFileSync(LOG_PATH + 'odi.log', 'UTF-8').toString().split('\n');
	content = content.slice(-lines); //-120
	content = content.join('\n');
	callback(content);
	return content;
};

/** Function getJsonFileContent */
var fileExceptions = ['voicemail.js'];
function getJsonFileContent(filePath, callback){
	console.debug('getJsonFileContent() ', filePath);
	fs.readFile(filePath, function(err, data){
		if(err && err.code === 'ENOENT' && !searchStringInArray(filePath, fileExceptions)){
			console.error('No file : ' + filePath);
			callback(null);
		}else{
			callback(data);
		}
	});
};

/** Function to append object in JSON file */
function appendJsonFile(filePath, obj, callback){
	console.debug('appendJsonFile() ', filePath, obj);
	var fileData;
	fs.exists(filePath, function(exists){
		if(exists){
			console.debug("Yes file exists");
			fs.readFile(filePath, 'utf8', function(err, data){
				if(err) console.log(err);
				else{
					fileData = JSON.parse(data);
					fileData.push(obj);
					fileData = JSON.stringify(fileData, null, 2).replace(/\\/g, "").replace(/\"{/g, "{").replace(/\}"/g, "}");
					console.debug('fileData', fileData);
					fs.writeFile(filePath, fileData);
				}
			});
		}else{
			console.debug("File not exists")
			fileData = [];
			fileData.push(obj);
			fileData = JSON.stringify(fileData, null, 2).replace(/\\/g, "").replace(/\"{/g, "{").replace(/\}"/g, "}");
			console.debug(fileData);
			fs.writeFile(filePath, fileData);
		}
	});
};

/** Function to return true if one of string of stringArray is found in string param */
function searchStringInArray(string, stringArray){
	console.debug('searchStringInArray()', string, stringArray);
	for(var i = 0;i<stringArray.length;i++){
		if(string.toLowerCase().search(stringArray[i].toLowerCase()) > -1){
			return true;
		}
	}
	return false;
};

/** Function to test internet connexion */
function testConnexion(callback){
	//console.debug('testConnexion()...');
	require('dns').resolve('www.google.com', function(err) {
		if(err){
			// console.debug('Odi is not connected to internet (utils.testConnexion)   /!\\');
			callback(false);
		}else{
			//console.debug('Odi is online   :');
			callback(true);
		}
	});
};

/** Function to return last Odi's start/restart time */
const startHour = new Date().getHours();
const startMin = new Date().getMinutes();
const startTime = (startHour > 12 ? startHour-12 : startHour) + '.' + (startMin<10?'0':'') + startMin + ' ' + (startHour > 12  ? 'PM' : 'AM');
function getStartTime(){
	return startTime;
};

/** Function to repeat/concat a string */
String.prototype.repeat = function(num){
	return new Array(Math.abs(num) + 1).join(this);
};

/*String.prototype.format = function(){
	var args = Array.prototype.slice.call(arguments);
	args.unshift(this.valueOf());
	return util.format.apply(util, args);
};*/

/** Function to test if an array contains an element */
/*Array.prototype.contains = function(element){
	return this.indexOf(element) > -1;
};*/