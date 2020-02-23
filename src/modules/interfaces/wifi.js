#!/usr/bin/env node
'use strict';

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js'),
	WIFI_NETWORK_LIST = require(Core._SECURITY + 'credentials.json').wifi;

const piWifi = require('pi-wifi');

module.exports = {};

Core.flux.interface.wifi.subscribe({
	next: flux => {
		if (flux.id == 'connect') {
			connect(flux.value);
		} else if (flux.id == 'disconnect') {
			disconnect();
		} else {
			Core.error('unmapped flux in Wifi interface', flux, false);
		}
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	keepOnline();
});

function keepOnline() {
	log.info('keepOnline');
	keepOnlineRecursive();
}

// TODO replace by setInterval() ? or not if increment timeout before next connection
function keepOnlineRecursive() {
	// TODO replace by setInterval() ? or not if increment timeout before next connection
	Utils.testConnection().catch(() => {
		connectIfAvailable();
	});
	Utils.delay(30).then(() => {
		keepOnlineRecursive();
	});
}

function scanNetworks() {
	return new Promise((resolve, reject) => {
		piWifi.scan(function(err, networks) {
			if (err) {
				Core.error('Wifi list error', err.message);
				reject(err);
			}
			let availableNetworksId = [];
			networks.forEach(network => {
				availableNetworksId.push(network.ssid);
			});
			log.info('Available networks:', availableNetworksId); // TODO set to debug level
			resolve(networks);
		});
	});
}

async function connectIfAvailable() {
	log.info('connectIfAvailable');
	let availableNetworks = await scanNetworks();
	log.debug('connectIfAvailable.availableNetworks', availableNetworks);
	let networkToConnect = null;
	availableNetworks.forEach(network => {
		Object.keys(WIFI_NETWORK_LIST).forEach(knownNetworkId => {
			if (WIFI_NETWORK_LIST[knownNetworkId].ssid === network.ssid) {
				log.test('yeah', WIFI_NETWORK_LIST[knownNetworkId]);
				networkToConnect = WIFI_NETWORK_LIST[knownNetworkId];
				return;
			}
		});
	});
	if (networkToConnect) connect(networkToConnect);
	else log.warn('No known wifi network available!');
}

function connect(wifi) {
	log.info('connecting to wifi ' + wifi.ssid + '...');
	piWifi.connect(wifi.ssid, wifi.password, function(err) {
		if (err) {
			Core.error('Wifi connection error', err.message);
			return;
		}
		log.info('Successfully connected to wifi', wifi.ssid);
	});
}

function disconnect() {
	log.info('disconnect');
}
