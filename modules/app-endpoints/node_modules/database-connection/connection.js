var PropertiesReader = require('properties-reader'),
	appRoot = require('app-root-path');
	
var properties = PropertiesReader(appRoot+'/config.properties');

var dbUser 		= properties.get('dbUser');
var dbPass 		= properties.get('dbPass');
var dbUser 		= properties.get('dbUser');
var dbPass 		= properties.get('dbPass');
var dbHost 		= properties.get('dbHost');
var dbName 		= properties.get('dbName');
var dbDebugMode = properties.get('dbDebugMode');

var mysql      = require('mysql');

var connection = null;

function createConnection(){
	if(connection == null){
		connection = mysql.createConnection({
			host     : dbHost,
			user     : dbUser,
			password : dbPass,
			database : dbName,
			debug	 : dbDebugMode
		});
	}
};

function getConnection(){
	if(connection == null){
		createConnection();
	}

	return connection;
};

function connect(){
	getConnection().connect();	
}

module.exports = {
	getConnection: getConnection,
	connect: connect
}