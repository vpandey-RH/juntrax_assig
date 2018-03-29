const 	errors 			= require('restify-errors');
const 	config 			= require('../config');
const 	Logs 			= require('../models/Logs');
const	Path			= '/set-logs';
const 	request			= require('request-promise');

var 	options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: 'AIzaSyBRVAaTAP_5lLT0ZuAc7aF1tV_Ag_vNLOg',
	formatter: null
};
var geocoder = require('node-geocoder')(options);
// var rateLimitPerInterval = 1;
// var rateLimitInterval = 1000000;
// var cacheExpiry = 86400000;
// var geocacher = require('node-geocacher')(geocoder, geocacher_db, cacheExpiry,
// 				rateLimitInterval, rateLimitPerInterval);
// var geocacher_db = config.db.geocache;

module.exports = function(server, server_start_time) {

	function setLogs(Hostname, Port, Path, data, callback) {
		const   options 	= {
    		url: 	'http://' + Hostname + ':' + Port + Path,
    		method: 'POST',
    		headers: {
	        	'Content-Type': 'application/json',
	        	'Connection':   'keep-alive',
	        	"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Mobile/14G60"
    		},
    		body:    data,
    		json:    true
		};
		request(options).then(function(response) {
			callback(response, 201);
    	}).catch (function (err) {
    		callback(err, 500);
    	});
	}

	server.post('/set-logs', function (req, res, next) {
		let Log = new Logs(req.body);
		Log.save(function(err) {
			if (err) {
				res.send(500, {msg:err})
			}
			res.send(201, {msg: "Logs insertion successful"});
		});
	});

	server.get('/uptime', function (req, res, next) {
		var 	uptime 		= Math.abs(new Date().getTime() - server_start_time);
		let 	data 		= {name: "uptime", response: "201"};
		const	Hostname	= req.connection.localAddress.split(":").pop();
		const	Port		= req.connection.localPort;
		setLogs(Hostname, Port, Path, data, function(response, status){
			if (status == 201) {
				res.send(status, {uptime: uptime});
			} else {
				res.send(status, {error: response});
			}
		});
	});



	server.get('/get-logs', function (req, res, next) {
		var 	time1 		= new Date(req.query.t1 * 1000);
		var 	time2 		= new Date(req.query.t2 * 1000);
		const	Hostname	= req.connection.localAddress.split(":").pop();
		const	Port		= req.connection.localPort;
		Logs.find({
    		createdAt: {
        		$gte: new Date(time1),
        		$lt:  new Date(time2)
    		}
		}, function(err, doc) {
			let data 	  = {name: "get-logs", response: "200"};
			if (err) {
				let data  = {name: "get-logs", response: "500"};
			}
			setLogs(Hostname, Port, Path, data, function(response, status){
				if (status == 201) {
					res.send(status, {response: doc});
				} else {
					res.send(status, {error: response});
				}
			});
		});
	});


	server.get('/geocode', function (req, res, next) {
  		var 	latitude 	= req.query.lat;
  		var 	longitude	= req.query.long;
		const	Hostname	= req.connection.localAddress.split(":").pop();
		const	Port		= req.connection.localPort;
		geocoder.reverse({lat:latitude, lon:longitude})
		.then(function(resp) {
			let data = {name: "geocode", response: "201"};
			setLogs(Hostname, Port, Path, data, function(response, status){
				if (status == 201) {
					res.send(status, {response: resp});
				} else {
					res.send(status, {error: response});
				}
			});
		})
		.catch(function(err) {
			let data = {name: "geocode", response: "500"};
			setLogs(Hostname, Port, Path, data, function(response, status){
				res.send(500, {error: error});
			});
		});
	});
}