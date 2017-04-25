var express = require("express"),  
    bodyParser  = require("body-parser"),
    appRoot = require('app-root-path'),
    PropertiesReader = require('properties-reader'),
    endpoints = require('app-endpoints'),
    compression = require('compression'),
    logger = require('logging'),
    methodOverride = require("method-override"),
    app = express();

var log = logger();

var properties = PropertiesReader(appRoot+'/config.properties');
const publicFolderName = properties.get('publicFolder');
const appPort = properties.get('appPort');

var router = express.Router();

// compress responses
app.use(compression());

router.post('/search', function(req, res) {  
	var perro = req.body;
	endpoints.buscarPerro(perro, function(result){
		res.end(JSON.stringify(result));
	});
});

router.post('/perros/editar', function(req, res) {  
	var perro = req.body;
	endpoints.editarPerro(perro, function(result){
		res.end(JSON.stringify(result));
	});
});

router.post('/perros/guardar', function(req, res) {  
	var perro = req.body;
	endpoints.guardarPerro(perro, function(result){
		res.end(JSON.stringify(result));
	});
});

router.get('/perros/avistados', function(req, res) {  
	endpoints.getPerros(req.query, 1, function(result){
		res.end(JSON.stringify(result));
	});
});

router.get('/perros/encontrados', function(req, res) {  
	endpoints.getPerros(req.query, 2, function(result){
		res.end(JSON.stringify(result));
	});
});

router.get('/perros/perdidos', function(req, res) {  
	endpoints.getPerros(req.query, 3, function(result){
		res.end(JSON.stringify(result));
	});
});

router.post('/borrar', function(req, res) {  
	var perro = req.body;
	endpoints.borrarPerro(perro.id);
	res.end();
});

router.post('/favoritos', function(req, res) {  
	var perro = req.body;
	endpoints.toggleFavorite(perro.id, perro.favorito);
	res.end();
});

router.get('/coincidencias', function(req, res) {  
	endpoints.getCoincidencias(function(results){
		res.end(JSON.stringify(results));
	});
});

router.post('/coincidencia/baja', function(req, res) {  
	var coincidencia = req.body;
	endpoints.quitarCoincidencia(coincidencia.idPrincipal, coincidencia.idSecundario);
	res.end();
});


/** NODE SERVER CONFIGURATION AND START UP **/
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb'}));  
app.use(bodyParser.json({limit: '50mb'}));  
app.use(methodOverride());
app.use(router);
app.use('/', express.static(__dirname + '/' + publicFolderName));

startServer();

process.on('exit', function(){
	log.error("Reiniciando servidor!");
	// try restart server
	startServer();
});

function startServer(){
	app.listen(appPort, function() {  
		log.info("Ejecutando aplicacion en http://localhost:"+appPort);
	});
}