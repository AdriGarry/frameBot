'use strict';

// const https = require('https');

const sendmail = require('sendmail')();
// const Email = require('email-templates');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

module.exports = {};

Core.flux.service.mail.subscribe({
	next: flux => {
		if (flux.id == 'send') {
			send(flux.value);
		} else Core.error('unmapped flux in Mail service', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function send(emailArg) {
	log.test('send', emailArg);
	sendmail(
		{
			from: 'adrigarry@gmail.com',
			to: 'adrigarry@gmail.com',
			subject: 'test sendmail',
			html: 'Mail from Odi! '
		},
		function(err, reply) {
			log.error(err && err.stack);
			console.dir(reply);
			log.info(reply);
		}
	);
}

function send2(emailArg) {
	log.info('send', emailArg);

	let data = { access_token: '7iz5olq94ycm1c2kb9fm6r2j' };
	data.subject = 'Odi...';
	data.text = 'Hi there, from email now!';

	let options = {
		hostname: 'postmail.invotes.com',
		port: 80,
		path: '/send' + 'subject=HEY&text=ALLO&access_token=7iz5olq94ycm1c2kb9fm6r2j',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	let req = https.request(options, res => {
		console.log(`STATUS: ${res.statusCode}`);
		console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		res.setEncoding('utf8');
		res.on('data', chunk => {
			console.log(`BODY: ${chunk}`);
		});
		res.on('end', () => {
			console.log('No more data in response.');
		});
	});

	req.on('error', e => {
		console.error(`problem with request: ${e.message}`);
	});

	// Write data to request body
	req.write(data.toString());
	req.end();
}

// function js_send() {
// 	var request = new XMLHttpRequest();
// 	request.onreadystatechange = function() {
// 		if (request.readyState == 4 && request.status == 200) {
// 			js_onSuccess();
// 		} else if (request.readyState == 4) {
// 			js_onError(request.response);
// 		}
// 	};

// 	var subject = document.querySelector('#' + form_id_js + " [name='subject']").value;
// 	var message = document.querySelector('#' + form_id_js + " [name='text']").value;
// 	data_js['subject'] = subject;
// 	data_js['text'] = message;
// 	var params = toParams(data_js);

// 	request.open('POST', 'https://postmail.invotes.com/send', true);
// 	request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

// 	request.send(params);

// 	return false;
// }

// function toParams(data_js) {
// 	var form_data = [];
// 	for (var key in data_js) {
// 		form_data.push(encodeURIComponent(key) + '=' + encodeURIComponent(data_js[key]));
// 	}

// 	return form_data.join('&');
// }

// function send(emailArg) {
// 	log.test('send', emailArg);
// 	const email = new Email({
// 		message: {
// 			from: 'odi@adrigarry.com',
// 			attachments: [
// 				{
// 					// filename: 'text1.txt',
// 					content: 'Hi there!'
// 				}
// 			]
// 		},
// 		// uncomment below to send emails in development/test env:
// 		// send: true
// 		transport: {
// 			jsonTransport: true
// 		}
// 	});

// 	// log.test('send', email);

// 	email
// 		.send({
// 			message: {
// 				to: 'adrigarry@gmail.com'
// 			},
// 			locals: {
// 				name: 'Odi'
// 			}
// 		})
// 		.then(result => {
// 			log.info(result);
// 		})
// 		.catch(err => {
// 			log.error(err);
// 		});
// }
