#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var Gpio = require('onoff').Gpio;
var fs = require('fs');
var os = require('os');

const PATHS = [Odi._SRC]

Flux.module.hardware.subscribe({
	next: flux => {
		if (flux.id == 'runtime') {
			retreiveLastModifiedDate(PATHS);
			countSoftwareLines();
			getDiskSpace();
			retreiveCpuTemp();
			retreiveCpuUsage();
			getEtatValue();
		} else if (flux.id == 'cpu') {
			cpuTempTTS();
		}else Odi.error('unmapped flux in Hardware module', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

var etat = new Gpio(13, 'in', 'both', {persistentWatch:true,debounceTimeout:500});
function getEtatValue(){
	Odi.run.etat = etat.readSync();
}

function retreiveCpuTemp(){
	var temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
	temperature = ((temperature/1000).toPrecision(2));
	Odi.run.cpuTemp = temperature;
	log.debug('CPU Temperature updated  ' + temperature + ' degres');
	return temperature;
}

/** Function cpu temperature TTS */
function cpuTempTTS(){
	var temperature = retreiveCpuTemp();
	Flux.next('module', 'tts', 'speak', {lg:'fr', msg:'Mon processeur est a ' + temperature + ' degrai'});
};

//Create function to get CPU information
function cpuAverage() {
	//Initialise sum of idle and time of cores and fetch CPU info
	var totalIdle = 0, totalTick = 0;
	var cpus = os.cpus();
	//Loop through CPU cores
	for(var i = 0, len = cpus.length; i < len; i++) {
		var cpu = cpus[i]; // Select CPU core
		//Total up the time in the cores tick
		for(var type in cpu.times) {
			totalTick += cpu.times[type];
		}
		//Total up the idle time of the core
		totalIdle += cpu.times.idle;
	}
	//Return the average Idle and Tick times
	return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
};
//Grab first CPU Measure
var startMeasure = cpuAverage();
/** Function to get CPU usage */
function retreiveCpuUsage(){
	var endMeasure = cpuAverage();//Grab second Measure
	//Calculate the difference in idle and total time between the measures
	var idleDifference = endMeasure.idle - startMeasure.idle;
	//console.log(idleDifference);console.log(endMeasure.idle);console.log(startMeasure.idle);
	var totalDifference = endMeasure.total - startMeasure.total;
	//console.log(totalDifference);console.log(endMeasure.total);console.log(startMeasure.total);
	var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);//Calculate the average percentage CPU usage
	Odi.run.cpuUsage = percentageCPU + '%';
	log.debug('CPU usage : ' + percentageCPU + ' %');
	return(percentageCPU);
};


/** Function to update last modified date & time of Odi's files */
function retreiveLastModifiedDate(paths, callback) {
	// typeof paths => Array
	paths = paths.join(' ');
	Utils.execCmd('find ' + paths + ' -exec stat \\{} --printf="%y\\n" \\; | sort -n -r | head -n 1', function(data) {
		var lastDate = data.match(/[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}/g);
		log.debug('getLastModifiedDate()', lastDate[0]);
		Odi.run.update = lastDate[0];
		if(callback) callback(lastDate[0]);
	});
}

/** Function to count lines of Odi's software */
function countSoftwareLines(callback) {
	var extensions = ['js', 'json', 'properties', 'sh', 'py', 'html', 'css']; //, 'properties'
	var typesNb = extensions.length;
	var totalLines = 0;
	extensions.forEach(function(item, index) {
		var temp = item;
		Utils.execCmd('find /home/pi/odi/ -name "*.' + temp + '" -print | xargs wc -l', function(data) {
			var regex = /(\d*) total/g;
			var result = regex.exec(data);
			var t = result && result[1] ? result[1] : -1;
			totalLines = parseInt(totalLines) + parseInt(t);
			typesNb--;
			if (!typesNb) {
				log.debug('countSoftwareLines()', totalLines);
				Odi.run.totalLines = totalLines;
				if(callback) callback(totalLines);
			}
		});
	});
}

/** Function to retreive disk space on /dev/root */
function getDiskSpace(callback) {
	Utils.execCmd('df -h', function(data) {
		var diskSpace = data.match(/\/dev\/root.*[%]/gm);
		diskSpace = diskSpace[0].match(/[\d]*%/g);
		log.debug('getDiskSpace()', diskSpace[0]);
		Odi.run.diskSpace = diskSpace[0];
		if(callback) callback(diskSpace);
	});
}
