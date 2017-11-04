#!/usr/bin/env node

// Module Fip

var spawn = require('child_process').spawn;

var playing = false;

var fipInterval;

module.exports = {
	playing: isPlaying,
	playFip: playFip,
	stopFip: stopFip
};

function isPlaying(){
	return playing;
}

/** Function to play FIP radio */
function playFip(){
	console.log('playFip()> playing', playing);
	if(!playing){
		console.log('Play FIP RADIO...');
		spawn('sh', ['/home/pi/odi/core/sh/fip.sh']);
		playing = true;
		ODI.leds.altLeds(100, 1.3);

		fipInterval = setInterval(function(){
			if(playing){
				ODI.leds.altLeds(100, 1.3);
			}
		}, 13*1000);
		console.log('playFip()> playing', playing);

		cancel.watch(function(err, value){ // TODO : remove ???
			clearInterval(fipInterval);
			playing = false;
		});
	}else{
		console.log('Already playing FIP');
		// PLAY FIP WITH !VOLUME (invert volume)
	}

	setTimeout(function(){
		stopFip();
	}, 60*60*1000);
	ODI.hardware.mute(60, 'Auto Mute FIP');
};

/** Function to stop FIP radio */
function stopFip(message){
	if(playing){
		console.log('playFip()> playing', playing);
		console.debug(message || 'Stoping FIP RADIO.');
	}
	spawn('sh', ['/home/pi/odi/core/sh/mute.sh']); // Inutile ?
	playing = false;
	clearInterval(fipInterval);
	ODI.leds.eye.write(0);
	ODI.leds.belly.write(0);
	ODI.leds.clearLeds();
};