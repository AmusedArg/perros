var express = require("express"),  
    app = express(),
    bodyParser  = require("body-parser"),
    appRoot = require('app-root-path'),
    PropertiesReader = require('properties-reader'),
    endpoints = require('app-endpoints'),
    methodOverride = require("method-override");

var properties = PropertiesReader(appRoot+'/config.properties');
const publicFolderName = properties.get('publicFolder');

var router = express.Router();

router.post('/search', function(req, res) {  
	var perro = req.body;
	endpoints.buscarPerro(perro, function(result){
		res.end(result);
	});
});

router.post('/perros/editar', function(req, res) {  
	var perro = req.body;
	endpoints.editarPerro(perro, function(result){
		res.end(result);
	});
});

router.post('/perros/guardar', function(req, res) {  
	var perro = req.body;
	endpoints.guardarPerro(perro, function(result){
		res.end(result);
	});
});

router.get('/perros/avistados', function(req, res) {  
	endpoints.getPerros(req.query, 1, function(result){
		res.end(result);
	});
});

router.get('/perros/encontrados', function(req, res) {  
	endpoints.getPerros(req.query, 2, function(result){
		res.end(result);
	});
});

router.get('/perros/perdidos', function(req, res) {  
	endpoints.getPerros(req.query, 3, function(result){
		res.end(result);
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


/** NODE SERVER CONFIGURATION AND START UP **/
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb'}));  
app.use(bodyParser.json({limit: '50mb'}));  
app.use(methodOverride());
app.use(router);
app.use('/', express.static(__dirname + '/' + publicFolderName));
app.listen(8888, function() {  
	console.log("Ejecutando aplicacion en http://localhost:8080");
});