const config = require('./config');
const restify = require('restify');
const mongoose = require('mongoose');
const restifyPlugins = require('restify-plugins');
var   jwt = require('restify-jwt-community');
const server = restify.createServer({
	name: config.name
});

// Auth
var jwtConfig = {
    secret: config.Jwt_Secret
}

server.use(jwt(jwtConfig).unless({path: ['/getToken', '/setLogs', '/geoCode']}));

var server_start_time = new Date().getTime();

server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());
server.listen(config.port, function (err) {

	// establish connection to mongodb
	mongoose.Promise = global.Promise;
	mongoose.connect(config.db.uri);

	const db = mongoose.connection;

	db.on('error', function (err) {
	    console.error(err);
	    process.exit(1);
	});

	db.once('open', function () {
		require('./routes')(server, server_start_time);
	    console.log(`Server is listening on port ${config.port}`);
	});
});
