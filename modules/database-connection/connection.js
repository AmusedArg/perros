var PropertiesReader = require('properties-reader'),
	logger = require('logging'),
	appRoot = require('app-root-path');

var log = logger();

var properties = PropertiesReader(appRoot+'/config.properties');

var dbUser 		= properties.get('dbUser');
var dbPass 		= properties.get('dbPass');
var dbUser 		= properties.get('dbUser');
var dbPass 		= properties.get('dbPass');
var dbHost 		= properties.get('dbHost');
var dbName 		= properties.get('dbName');
var dbDebugMode = properties.get('dbDebugMode');

var mysql      = require('mysql');

var pool = null;

function getPool(){
	if(pool == null){
		pool = mysql.createPool({
			host     : dbHost,
			user     : dbUser,
			password : dbPass,
			database : dbName,
			debug	 : dbDebugMode
		});
	}
	bindErrorHandler(pool);
	return pool;
};

function bindErrorHandler(pool){
	// Attempt to catch disconnects 
	pool.on('connection', function(connection) {

	    connection.on('error', function(err) {
	        log.error(err);
	    });
	    connection.on('close', function(err) {
	        log.error(err);
	    });
	    connection.on('end', function(err) {
	        log.error(err);
	        // attempt to restore connection
	        getPool();
	    });
	});
}

module.exports = {
	getPool: getPool
}