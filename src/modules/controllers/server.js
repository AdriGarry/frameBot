#!/usr/bin/env node

/** http codes
 *		200 : OK
 *		401 : Unauthorized (sleep)
 *		418 : I'm a teapot ! (other POST request)
 */

const http = require('http'),
	https = require('https'),
	express = require('express'),
	fs = require('fs'),
	compression = require('compression'),
	bodyParser = require('body-parser');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(_PATH + 'src/core/Utils.js');

const middleware = require(Core._MODULES + 'controllers/server/middleware.js'),
	api = require(Core._MODULES + 'controllers/server/api.js');

const HTTP_SERVER_PORT = 3210,
	HTTPS_SERVER_PORT = 4321,
	CREDENTIALS = {
		key: fs.readFileSync(Core._SECURITY + 'key.pem'),
		cert: fs.readFileSync(Core._SECURITY + 'cert.pem')
	};

Core.flux.controller.server.subscribe({
	next: flux => {
		if (flux.id == 'start') {
			startUIServer(flux.value);
		} else if (flux.id == 'closeUIServer') {
			closeUIServer(flux.value);
		} else Core.error('unmapped flux in Server controller', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function startUIServer(modulesApi) {
	startHttpServer();
	startHttpsServer(modulesApi);
}

var ui, uiHttps;
var httpServer, httpsServer;

function startHttpServer() {
	ui = express();
	httpServer = http.createServer(ui);
	ui.get('*', (req, res) => {
		if (req.isSocket) return res.redirect('wss://' + req.headers.host + req.url);
		log.debug('Redirecting http to https');
		return res.redirect('https://' + req.headers.host + req.url);
	}).listen(HTTP_SERVER_PORT);
}

function startHttpsServer(modulesApi) {
	// ui = express();
	uiHttps = express();
	// CORS
	// ui.use(function(request, response, next) {
	// 	response.header('Access-Control-Allow-Origin', '*');
	// 	response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	// 	next();
	// });
	// ui.options('/*', function(request, response, next) {
	// 	response.header('Access-Control-Allow-Methods', 'GET, POST'); //'GET, PUT, POST, DELETE, OPTIONS'
	// 	response.send();
	// });

	uiHttps.use(compression()); // Compression web
	uiHttps.use(express.static(Core._WEB)); // For static files

	uiHttps.use(bodyParser.json()); // to support JSON-encoded bodies
	uiHttps.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
	uiHttps.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));

	uiHttps.use(middleware.security());

	api.attachRoutes(uiHttps, modulesApi);

	httpsServer = https.createServer(CREDENTIALS, uiHttps).listen(HTTPS_SERVER_PORT, () => {
		log.info('API https server started [' + Utils.executionTime(Core.startTime) + 'ms]');
		Core.do('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { log: 'trace' });
	});
}

function closeUIServer(breakDuration) {
	log.INFO('closing UI server for', breakDuration / 1000, 'seconds');
	// ui.close();
	// servor.close();
	ui = null;
}

const sys = require('sys');
const spawn = require('child_process').spawn;
// const filename = process.ARGV[2];
// if (!filename) return sys.puts('Usage: node <server.js> <filename>');

var tail = spawn('tail', ['-f', Core._LOG + Core.name + '.log']);

http
	.createServer(function(req, res) {
		sys.puts('new connection..');
		res.writeHead(200, { 'Content-Type': 'text/plain;charset=UTF-8' });
		tail.stdout.on('data', function(data) {
			res.write(data);
		});
	})
	.listen(3000);
