const 	errors 			= require('restify-errors');
const 	config 			= require('../config');
const 	Logs 			= require('../models/Logs');
const	Path			= '/setLogs';
const 	request			= require('request-promise');
var 	options  		= config.geocode_options;
var 	geocoder 		= require('node-geocoder')(options);

module.exports = function(server, server_start_time) {

	var max_request_per_hour = 10;
	var current_no_of_req    = 0;

	function resetMaxRequestPerHour () {
		current_no_of_req = 0;
		console.log("Number of current Requests reset to default.");
	}
	setTimeout(resetMaxRequestPerHour, 3600000);

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

	server.post('/setLogs', function (req, res, next) {
		let Log = new Logs(req.body);
		Log.save(function(err) {
			if (err) {
				res.send(500, {msg:err})
			}
			res.send(201, {msg: "Logs insertion successful"});
		});
	});

	server.post('/getToken', function (req, res, next) {
		const	Hostname	= req.connection.localAddress.split(":").pop();
		const	Port		= req.connection.localPort;
		let 	data 	= {name: "getToken", response: "201"};
		if (!req.body.role) {
			let 	data = {name: "getToken", response: "400"};
        	resp = new errors.BadRequestError('Incomplete registration information.')
    	} else {
	        const 	jwt 	= require('jsonwebtoken');
	        const 	token 	= jwt.sign(req.body, config.Jwt_Secret);
	        var		resp 	= req.body;
	        resp['token']   = token;
    	}
    	setLogs(Hostname, Port, Path, data, function(response, status){
			if (status == 201) {
				res.send(status, {uptime: uptime});
			} else {
				res.send(status, {error: response});
			}
		});
    	res.send(201, {response:resp});
	});

	server.get('/uptime', function (req, res, next) {
		if (req.user.role != 'admin') {
        	return res.send(400, {error: 'You don\'t have sufficient priviledges.'})
    	}
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


	server.get('/getLogs', function (req, res, next) {
		if (req.user.role != 'admin') {
        	return res.send(400, {error: 'You don\'t have sufficient priviledges.'})
    	}
    	if (req.query.t1 > req.query.t2) {
    		return res.send(400, {error: 'Timestamp Range is invalid.'})
    	}
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
			let data 	  = {name: "getLogs", response: "200"};
			if (err) {
				let data  = {name: "getLogs", response: "500"};
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


	server.get('/geoCode', function (req, res, next) {
  		var 	latitude 	= req.query.lat;
  		var 	longitude	= req.query.long;
		const	Hostname	= req.connection.localAddress.split(":").pop();
		const	Port		= req.connection.localPort;
		current_no_of_req += 1;
		if (current_no_of_req > max_request_per_hour) {
			res.send(500, {error: "Sorry the limit for this API exceeded."});
		}
		else {
			geocoder.reverse({lat:latitude, lon:longitude})
			.then(function(resp) {
				let data = {name: "geoCode", response: "201"};
				setLogs(Hostname, Port, Path, data, function(response, status){
					if (status == 201) {
						res.send(status, {response: resp});
					} else {
						res.send(status, {error: response});
					}
				});
			})
			.catch(function(err) {
				let data = {name: "geoCode", response: "500"};
				setLogs(Hostname, Port, Path, data, function(response, status){
					res.send(500, {error: error});
				});
			});
		}
	});

	server.post('/setGeocodeApiLimit', function(req, res, next) {
		if (req.user.role != 'admin') {
        	return res.send(400, {error: 'You don\'t have sufficient priviledges.'})
    	}
		var 	newLimit 	= req.body.reqLimit;
		const	Hostname	= req.connection.localAddress.split(":").pop();
		const	Port		= req.connection.localPort;
		max_request_per_hour = newLimit;
		let data = {name: "setGeoCodeApiLimit", response: "201"};
		setLogs(Hostname, Port, Path, data, function(response, status){
			if (status == 201) {
				res.send(status, {response: 'New Request Limit was set successfully.'});
			} else {
				res.send(status, {error: response});
			}
		});
	});
}