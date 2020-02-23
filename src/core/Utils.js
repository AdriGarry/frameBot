#!/usr/bin/env node
'use strict';

const { exec } = require('child_process'),
	fs = require('fs'),
	fsPromises = fs.promises,
	os = require('os'),
	request = require('request'),
	dns = require('dns');

// Utils static factory (should not require Core.js or Flux.js)
const log = new (require(_PATH + 'src/core/Logger.js'))(__filename);

module.exports = {
	//array
	randomItem: randomItem,
	searchStringInArray: searchStringInArray,
	arrayToObject: arrayToObject,

	//custom/execution/all
	codePosition: codePosition,
	execCmd: execCmd,

	//network
	testConnection: testConnection,
	getLocalIp: getLocalIp,
	getPublicIp: getPublicIp,
	post: post,
	postOdi: postOdi,

	//file
	getJsonFileContent: getJsonFileContent,
	getAbsolutePath: getAbsolutePath,
	getDuration: getSoundOrVideoDuration,
	deleteFolderRecursive: deleteFolderRecursive,
	appendJsonFile: appendArrayInJsonFile,
	directoryContent: directoryContent,

	//number
	numberWithDot: numberWithDot,
	perCent: perCent,
	random: random,
	rdm: random,

	//string
	repeatString: repeatString,
	formatStringLength: formatStringLength,
	firstLetterUpper: firstLetterUpper,
	capitalizeFirstLetter: capitalizeFirstLetter,
	formatDuration: formatDuration,
	addPatternBefore: addPatternBefore,

	//date/time
	delay: delay,
	delayMs: delayMs,
	logTime: logTime,
	executionTime: executionTime,
	isWeekend: isWeekend,
	getNextDateObject: getNextDateObject
};

/**
 * Function to retreive code position (file & line) at runtime
 * @param {*} steps
 */
function codePosition(steps) {
	let stack = new Error().stack;
	// console.log(stack);
	let data = stack.match(/([a-zA-Z]+.js:\d+)/gm);
	if (isNaN(steps)) steps = 0;
	if (Array.isArray(data) && data[steps]) {
		let result = data[steps].split(':');
		return { file: result[0], line: result[1] };
	}
	return '';
}

/**
 * Repeats a string.
 * @param {String} char(s)
 * @param {Number} number of times
 * @return {String} repeated string
 */
function repeatString(string, times) {
	return Array(times + 1).join(string);
}

function formatStringLength(string, expectedLength, before) {
	let stringLength = string.length,
		stringFormated;
	if (stringLength >= expectedLength) {
		stringFormated = string.substring(0, expectedLength);
	} else {
		if (before) {
			stringFormated = repeatString(' ', expectedLength - stringLength) + string;
		} else {
			stringFormated = string + repeatString(' ', expectedLength - stringLength);
		}
	}
	return stringFormated;
}

function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			let curPath = path + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

/** Function to append object in JSON file */
function appendArrayInJsonFile(filePath, obj) {
	let startTime = new Date();
	fsPromises
		.readFile(filePath)
		.catch(_fileNotExists)
		.then(data => _appendFileData(data, obj))
		.then(data => fsPromises.writeFile(filePath, data))
		.then(() => log.debug('file ' + filePath + ' updated in', executionTime(startTime) + 'ms'))
		.catch(err => Core.error('Utils.appendArrayInJsonFile', err));
}

function _fileNotExists(err) {
	return new Promise((resolve, reject) => {
		if (err.code == 'ENOENT') resolve('[]');
		else reject(err);
	});
}

function _appendFileData(data, obj) {
	return new Promise((resolve, reject) => {
		try {
			let fileData;
			try {
				fileData = JSON.parse(data);
			} catch (err) {
				log.info(data);
				log.error('appendFileData: error while JSON.parse(data)', err);
			}
			if (!Array.isArray(fileData)) fileData = [fileData];

			fileData.push(obj);

			let jsonData = JSON.stringify(fileData, null, 2)
				.replace(/\\/g, '')
				.replace(/\"{/g, '{')
				.replace(/\}"/g, '}');

			resolve(jsonData);
		} catch (err) {
			reject(err);
		}
	});
}

/** Get name of files in directory. Return a Promise  */
function directoryContent(path) {
	return new Promise((resolve, reject) => {
		fs.readdir(path, (err, files) => {
			if (err) {
				reject(err);
			} else {
				resolve(files);
			}
		});
	});
}

/** Function getJsonFileContent. Return a Promise */
const FILE_NOT_FOUND_EXCEPT = ['/home/odi/core/tmp/voicemail.json', '/home/odi/core/tmp/record.json'];
function getJsonFileContent(filePath) {
	log.debug('getJsonFileContent() ', filePath);
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, function(err, data) {
			if (err && err.code === 'ENOENT' && !searchStringInArray(filePath, FILE_NOT_FOUND_EXCEPT)) {
				log.error('No file: ' + filePath);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

/** Function to return true if one of string of stringArray is found in string param */
function searchStringInArray(string, stringArray) {
	for (let i = 0; i < stringArray.length; i++) {
		if (stringArray[i].toLowerCase().indexOf(string.toLowerCase()) > -1) {
			return stringArray[i];
		}
	}
	return false;
}

function arrayToObject(array, property) {
	return array.reduce((obj, item) => {
		obj[item[property]] = item;
		return obj;
	}, {});
}

function getLocalIp() {
	let ifaces = os.networkInterfaces(),
		localIp = '';
	Object.keys(ifaces).forEach(function(ifname) {
		let alias = 0;
		ifaces[ifname].forEach(function(iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return;
			}
			if (alias >= 1) {
				// this single interface has multiple ipv4 addresses
				// console.log(ifname + ':' + alias, iface.address);
				localIp += ifname + ':' + alias + ' ' + iface.address;
			} else {
				// this interface has only one ipv4 adress
				// console.log(ifname, iface.address);
				localIp += ifname + ' ' + iface.address;
			}
			++alias;
		});
	});
	return localIp;
}

function getPublicIp() {
	return new Promise((resolve, reject) => {
		execCmd('curl icanhazip.com')
			.then(data => {
				resolve(data);
			})
			.catch(err => {
				log.warn("Can't retreive public IP " + err);
				reject(err);
			});
	});
}

function post(url, data) {
	return new Promise((resolve, reject) => {
		request.post(
			{
				url: url,
				headers: {
					'Content-Type': 'application/json'
				},
				json: true,
				data: data
			},
			(err, httpResponse, body) => {
				if (err) reject(err);
				resolve(body);
			}
		);
	});
}

function postOdi(url, data) {
	return new Promise((resolve, reject) => {
		request.post(
			{
				url: url,
				headers: {
					'Content-Type': 'application/json',
					'User-Interface': 'UIv5'
				},
				json: true,
				data: data
			},
			(err, httpResponse, body) => {
				if (err) reject(err);
				resolve(body);
			}
		);
	});
}

/** Function to test internet connection */
function testConnection() {
	return new Promise((resolve, reject) => {
		dns.resolve('www.google.com', function(err) {
			if (err) {
				reject();
			} else {
				log.debug("I'm online, connected on the internet!");
				resolve();
			}
		});
	});
}

/** Function to execute a shell command. Return a Promise */
function execCmd(command, noLog) {
	return new Promise((resolve, reject) => {
		exec(command, { shell: true }, (err, stdout, stderr) => {
			if (err && !noLog) {
				log.error('execCmd', err, stderr);
				reject(err);
			} else {
				resolve(stdout);
			}
		});
	});
}

function getAbsolutePath(path, prefix) {
	if (typeof path !== 'string') {
		log.error('Path must be a string: ' + typeof path, path);
		return false;
	}
	if (path.indexOf('/home') === -1) {
		path = prefix + path;
	}
	if (!fs.existsSync(path)) {
		log.error('Wrong file path', path);
		return false;
	}
	return path;
}

/** Function to retreive mp3 file duration. Return a Promise */
function getSoundOrVideoDuration(soundFile, callback) {
	log.debug('getDuration:', soundFile);
	return new Promise((resolve, reject) => {
		execCmd('mplayer -ao null -identify -frames 0 ' + soundFile + ' 2>&1 | grep ID_LENGTH')
			.then(data => {
				try {
					if (data == '') {
						getDuration(soundFile, callback);
					}
					let duration = data.split('=')[1].trim();
					resolve(parseInt(duration));
				} catch (err) {
					// Don't log error because the method will call itself until OK !
					// console.error('getDuration error:', err);
					reject(err);
				}
			})
			.catch(err => {
				log.error('getDuration error', err);
				reject(err);
			});
	});
}

function firstLetterUpper(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/** Function to repeat/concat a string */
String.prototype.repeat = function(num) {
	if (Number(num)) return new Array(Math.abs(num) + 1).join(this);
	return '';
};

/** Function to remove quotes in a string */
String.prototype.unQuote = function() {
	return this.replace(/'|"/gm, '');
};

/** Function to calculate execution time of something */
function executionTime(startTime, formatResultPattern) {
	let elapsedTime = new Date() - startTime;
	if (formatResultPattern) {
		return addPatternBefore(elapsedTime, formatResultPattern);
	}
	return elapsedTime;
}

function addPatternBefore(time, pattern) {
	if (typeof pattern == 'string') {
		return pattern.charAt(0).repeat(pattern.length - time.toString().length) + time;
	}
	return time;
}

function formatDuration(duration) {
	duration = parseInt(duration);
	if (duration > 120) {
		return Math.round(duration / 60) + 'm' + (duration % 60) + 's';
	}
	return duration + 's';
}

function numberWithDot(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function perCent(value, total, precision) {
	return ((value / total) * 100).toFixed(precision | 2);
}

function random(arg1, arg2) {
	let min, max;
	if (arg2) {
		min = arg1;
		max = arg2;
	} else {
		min = 0;
		max = arg1 || 2;
	}
	return Math.floor(Math.random() * (max - min) + min);
}

function randomItem(array) {
	let length = array.length;
	let randomIndex = random(length); // length - 1
	return array[randomIndex];
}

function delay(sec) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, sec * 1000);
	});
}

function delayMs(ms) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

/** Function to return date time. Pattern: 'YDT' */
const dateTimeDefaultPattern = 'D/M h:m:s';
function logTime(param, date) {
	if (typeof date === 'undefined') date = new Date();
	let D = date.getDate();
	let M = date.getMonth() + 1;
	let Y = date.getFullYear();
	let h = date.getHours();
	let m = date.getMinutes();
	let s = date.getSeconds();
	let x = date.getMilliseconds();
	let now = '';

	if (typeof param === 'undefined') param = dateTimeDefaultPattern;
	for (let i = 0; i < param.length; i++) {
		switch (param[i]) {
			case 'Y':
				now += Y;
				break;
			case 'M':
				now += (M < 10 ? '0' : '') + M;
				break;
			case 'D':
				now += (D < 10 ? '0' : '') + D;
				break;
			case 'h':
				now += (h < 10 ? '0' : '') + h;
				break;
			case 'm':
				now += (m < 10 ? '0' : '') + m;
				break;
			case 's':
				now += (s < 10 ? '0' : '') + s;
				break;
			case 'x':
				now += (x < 100 ? (x < 10 ? '00' : '0') : '') + x;
				break;
			default:
				now += param[i];
		}
	}
	return now;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**  Function to return next object with date from array of objects with date property **/
function getNextDateObject(datesObjectArray) {
	let nextDateObject;
	datesObjectArray.forEach(obj => {
		if (!nextDateObject || (nextDateObject && nextDateObject.date > obj.date)) nextDateObject = obj;
	});
	return nextDateObject;
}

function isWeekend(date) {
	if (!date) date = new Date();
	let day = date.getDay();
	return day === 6 || day === 0;
}

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
	let date = new Date(this.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
	// January 4 is always in week 1.
	let week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};
