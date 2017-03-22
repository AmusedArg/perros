var Connection = require('database-connection'),
	crypto = require("crypto"),
	appRoot = require('app-root-path'),
	fs = require("fs"),
	PropertiesReader = require('properties-reader'),
	moment = require("moment");
	
Connection.connect();

var properties = PropertiesReader(appRoot+'/config.properties');
const publicFolderName = properties.get('publicFolder');
const connection = Connection.getConnection();


/** START PUBLIC METHODS DIFINITION **/

function buscarPerro(perro, callback){
	var result = [];
	result[0] = Array();
	result[1] = '';
	
	if(perro.lugar && perro.lugar.value){
		perro.lugar = perro.lugar.value;
	}

	_getPerros(perro.nombre, perro.sexo, perro.raza, perro.lugar, perro.tipo, 0, 40, function(perros, total){
		_getCantidadPerros(perro.nombre, perro.sexo, perro.raza, perro.lugar, perro.tipo, function(total){
			var result = [];
			result[0] = perros;
			result[1] = total;
			callback(JSON.stringify(result));
		});
	});
}

function editarPerro(perro, callback){
	if(!perro.fecha){
		perro.fecha = moment().format('YYYY-MM-DD');
	}

	var imagen = '';

	if(perro.foto && perro.foto !== 'img/dog.png' && !perro.foto.includes('public_fotos')){
		var folder = crypto.randomBytes(20).toString('hex');
		var dir = appRoot+'/'+publicFolderName+'/public_fotos/'+folder+'/';
		
		if (!fs.existsSync(dir)){
		    fs.mkdirSync(dir);
		}
		
		_saveImage(perro.foto, dir, function(imagen){
			perro.foto = 'public_fotos/'+folder+'/'+imagen;
			_editarPerro(perro, function(){
				callback (perro.foto);
			});
		});
	}else if(perro.foto && perro.foto.includes('public_fotos')){
		_editarPerro(perro, function(){
			callback (perro.foto);
		});
	}else{
		_editarPerro(perro, function(){
			callback ('img/dog.png');
		});
	}
}

function guardarPerro(perro, callback){
	var folder = crypto.randomBytes(20).toString('hex');
	var dir = appRoot+'/'+publicFolderName+'/public_fotos/'+folder+'/';

	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir);
	}

	if(!perro.fecha){
		perro.fecha = moment().format('YYYY-MM-DD');
	}

	if(perro.foto && perro.foto !== 'img/dog.png'){
		_saveImage(perro.foto, dir, function(imagen){
			perro.foto = 'public_fotos/'+folder+'/'+imagen;
			_guardarPerro(perro, function(id){
				var imageFullPath = dir+imagen;
				perro.id = id;
				callback (JSON.stringify({foto: perro.foto, id: id}));
				_saveImageLabels(imageFullPath, perro);
			});
		});
	}else{
		_guardarPerro(perro, function(id){
			callback (JSON.stringify({foto: perro.foto, id: id}));
		});
	}
}

function getPerros(perro, tipo, callback){
	var result = [];
	result[0] = Array();
	result[1] = '';
	_getPerros(perro.nombre, perro.sexo, perro.raza, perro.lugar, tipo, perro.start, perro.end, function(perros){
		_getCantidadPerros(perro.nombre, perro.sexo, perro.raza, perro.lugar, tipo, function(total){
			var result = [];
			result[0] = perros;
			result[1] = total;
			callback(JSON.stringify(result));
		});
	});
}

function borrarPerro(id){
	connection.query("UPDATE perros SET eliminado=1 WHERE id=?",[id], function(err, rows, fields) {
		if (err){
	  		console.log(err);
	  	}
	});
}

function toggleFavorite(id, favorito){
	connection.query("UPDATE perros SET favorito=? WHERE id=?",[favorito, id], function(err, rows, fields) {
		if (err){
	  		console.log(err);
	  	}
	});
}

/** END PUBLIC METHODS DEFINITION **/

module.exports = {
	buscarPerro: buscarPerro,
	editarPerro: editarPerro,
	guardarPerro: guardarPerro,
	getPerros: getPerros,
	borrarPerro: borrarPerro,
	toggleFavorite: toggleFavorite
}

function _getPerros(nombre, sexo, raza, lugar, tipo, start, end, callback){
	var result = [];
	result[0] = Array();

	var filtros = '';
	var parameters = [];

	if(nombre){
		filtros += " AND nombre LIKE ?";
		parameters.push('%'+nombre+'%');
	}

	if(sexo){
		filtros += " AND sexo LIKE ?";
		parameters.push('%'+sexo+'%');
	}

	if(raza){
		filtros += " AND raza LIKE ?";
		parameters.push('%'+raza+'%');
	}
	if(lugar){
		filtros += " AND lugar LIKE ?";
		parameters.push('%'+lugar+'%');
	}
	
	tipo = _normalizeTipo(tipo);

	parameters.push(parseInt(tipo, 10));
	parameters.push(parseInt(start,10));
	parameters.push(parseInt(end,10));

	connection.query(
		"SELECT * FROM perros WHERE eliminado=0 "+filtros+" AND tipo_perro_id = ? order by fecha desc LIMIT ?,?", parameters, 
		function(err, rows, fields) {
		  	if (!err){
		  		var result = [];
		  		for (var i = 0; i < rows.length; i++) {
		  			var row = rows[i];
		  			row.fecha = moment(row.fecha).format('DD/MM/YYYY');
		  			result.push(row);
		  		}
				callback(result, rows.length);
		  	}else{
		  		console.log(err);
		  	}
		}
	);
}

function _getCantidadPerros(nombre, sexo, raza, lugar, tipo, callback) {
	var filtros = '';
	var parameters = [];

	if(nombre){
		filtros += " AND nombre LIKE ?";
		parameters.push('%'+nombre+'%');
	}

	if(sexo){
		filtros += " AND sexo LIKE ?";
		parameters.push('%'+sexo+'%');
	}

	if(raza){
		filtros += " AND raza LIKE ?";
		parameters.push('%'+raza+'%');
	}
	if(lugar){
		filtros += " AND lugar LIKE ?";
		parameters.push('%'+lugar+'%');
	}

	tipo = _normalizeTipo(tipo);

	parameters.push(parseInt(tipo, 10));

	connection.query("SELECT count(id) as total FROM perros WHERE eliminado=0 and tipo_perro_id = ?"+filtros, parameters, function(err, rows, fields) {
		if (!err){
	  		if(rows.length > 0){
	  			callback(rows[0].total);
	  		}
	  	}else{
	  		console.log(err);
	  	}
	});
}

function _guardarPerro(perro, callback) {
	var tipo = _normalizeTipo(perro.tipo);
	connection.query("INSERT INTO perros (nombre, tel_contacto, fecha, foto, lugar, raza, sexo, duenio, link_sitio, tipo_perro_id) VALUES (?,?,?,?,?,?,?,?,?,?)",[perro.nombre, perro.telefono, perro.fecha, perro.foto, perro.lugar, perro.raza, perro.sexo, perro.duenio, perro.link_sitio, tipo], function(err, result) {
		if (err) throw err;
		callback(result.insertId);
	});
}

function _editarPerro(perro, callback) {
	connection.query("UPDATE perros SET nombre=?, tel_contacto=?, fecha=?, foto=?, lugar=?, raza=?, sexo=?, duenio=?, link_sitio=? WHERE id=?",[perro.nombre, perro.telefono, perro.fecha, perro.foto, perro.lugar, perro.raza, perro.sexo, perro.duenio, perro.link_sitio, perro.id], function(err, result) {
		if (err) throw err;
		callback();
	});
}

function _saveImage(imagen, dir, callback) {
	if(!imagen) return 'img/dog.png';
	// Regular expression for image type:
    // This regular image extracts the "jpeg" from "image/jpeg"
    var imageTypeRegularExpression      = /\/(.*?)$/;      

    // Generate random string
    var crypto                          = require('crypto');
    var seed                            = crypto.randomBytes(20);
    var uniqueSHA1String                = crypto
                                           .createHash('sha1')
                                            .update(seed)
                                             .digest('hex');

    var base64Data = imagen;

    var imageBuffer                      = decodeBase64Image(base64Data);
    var userUploadedFeedMessagesLocation = dir;

    var uniqueRandomImageName            = 'image-' + uniqueSHA1String;
    // This variable is actually an array which has 5 values,
    // The [1] value is the real image extension
    var imageTypeDetected                = imageBuffer
                                            .type
                                             .match(imageTypeRegularExpression);

    var userUploadedImagePath            = userUploadedFeedMessagesLocation + 
                                           uniqueRandomImageName +
                                           '.' + 
                                           imageTypeDetected[1];

    // Save decoded binary image to disk
    try
    {
    	require('fs').writeFile(userUploadedImagePath, imageBuffer.data,  
        function() 
        {
          	callback(uniqueRandomImageName +'.' + imageTypeDetected[1]);
        });
    }
    catch(error)
    {
        console.log('ERROR:', error);
    }
}

function decodeBase64Image(dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
	var response = {};

	if (matches.length !== 3) 
	{
	return new Error('Invalid input string');
	}

	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');

	return response;
}

function _saveImageLabels(image, perro){
	// Imports the Google Cloud client library
	const Vision = require('@google-cloud/vision');

	// Instantiates a client
	const vision = Vision();

	// The path to the local image file
	const fileName = image;

	var opts = {
		maxResults: 10
	}

	const path = require('path');
	const getColors = require('get-image-colors');
	const namer = require('color-namer')
	
	var coloresFinales = [];
	getColors(fileName).then(colors => {
		for (var i = 0; i < colors.length; i++) {
			colors[i] = colors[i].hex();
		}

		// por cada hexa encuentro 3 colores cercanos
		for (var i = 0; i < colors.length; i++) {
			var hexColor = colors[i];
			var coloresCercanos = namer(hexColor)['basic'];
			for (var j = 0; j < 3; j++) {
				if(coloresCercanos[j].distance <= 25){
					coloresFinales.push(coloresCercanos[j].name);
				}else{
					break; // no sigo recorriendo si la distancia ya es mayor
				}
			}
		}

		// quitar duplicados
		coloresFinales = coloresFinales.filter(function(elem, pos) {
		    return coloresFinales.indexOf(elem) == pos;
		});

		// traducir colores
		var coloresIngles = ['white','yellow','fuchsia','red','silver','gray','olive','purple','maroon','aqua','lime','teal','green','blue','navy','black','alice blue', 'antique white', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanched almond', 'blue', 'blue violet', 'brown', 'burly wood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflower blue', 'cornsilk', 'crimson', 'cyan', 'dark blue', 'dark cyan', 'dark goldenrod', 'dark gray', 'dark green', 'dark khaki', 'dark magenta', 'dark olivegreen', 'dark orange', 'dark orchid', 'dark red', 'dark salmon', 'dark seagreen', 'dark slateblue', 'dark slategray', 'dark turquoise', 'dark violet', 'deep pink', 'deep skyblue', 'dim gray', 'dodger blue', 'fire brick', 'floral white', 'forest green', 'fuchsia', 'gainsboro', 'ghost white', 'gold', 'goldenrod', 'gray', 'green', 'green yellow', 'honeydew', 'hot pink', 'indian red', 'indigo', 'ivory', 'khaki', 'lavender', 'lavender blush', 'lawn green', 'lemon chiffon', 'light blue', 'light coral', 'light cyan', 'light goldenrodyellow', 'light green', 'light grey', 'light pink', 'light salmon', 'light seagreen', 'light skyblue', 'light slategray', 'light steelblue', 'light yellow', 'lime', 'lime green', 'linen', 'magenta', 'maroon', 'medium aquamarine', 'medium blue', 'medium orchid', 'medium purple', 'medium seagreen', 'medium slateblue', 'medium springgreen', 'medium turquoise', 'medium violetred', 'midnight blue', 'mint cream', 'misty rose', 'moccasin', 'navajo white', 'navy', 'old lace', 'olive', 'olive drab', 'orange', 'orange red', 'orchid', 'pale goldenrod', 'pale green', 'pale turquoise', 'pale violetred', 'papaya whip', 'peach puff', 'peru', 'pink', 'plum', 'powder blue', 'purple', 'red', 'rosy brown', 'royal blue', 'saddle brown', 'salmon', 'sandy brown', 'sea green', 'seashell', 'sienna', 'silver', 'sky blue', 'slate blue', 'slate gray', 'snow', 'spring green', 'steel blue', 'tan', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'white smoke', 'yellow', 'yellow green'];
		var coloresEspanol = ['blanco','amarillo','fucsia','red','plata','gris','aceituna','purpura','granate','agua','lima','verde azulado','verde','azul','armada','negro','alice blue','blanco antiguo','agua','aguamarina','azur','beige','sopa de mariscos','negro','almendras blanqueadas','azul','violeta azul','marron','madera fornida','cadetblue','monasterio','chocolate','coral','azul del cornflower','seda de maiz','carmesi','cian','azul oscuro','cian oscuro','dark goldenrod','gris oscuro','verde oscuro','caqui oscuro','magenta oscuro','verde oliva oscuro','naranja oscuro','orquidea oscura','rojo oscuro','salmon oscuro','dark seagreen','dark slateblue','dark slategray','turquesa oscura','violeta oscuro','rosa profundo','deep skyblue','gris oscuro','dodger blue','ladrillo de fuego','blanco floral','bosque verde','fucsia','gainsboro','blanco fantasma','oro','vara de oro','gris','verde','verde amarillo','gotas de miel','rosa caliente','indio rojo','indigo','marfil','caqui','lavanda','rubor de lavanda','verde cesped','gasa limon','azul claro','coral claro','cian claro','luz goldenrodyellow','verde claro','gris claro','rosa claro','salmon ligero','light seagreen','luz cielo azul','light slategray','luz aceroblue','amarillo claro','lima','verde lima','lino','magenta','granate','aguamarina mediana','azul medio','orquidea mediana','purpura media','medio seagreen','slateblue medio','springgreen medio','turquesa media','medium violetred','azul medianoche','crema de menta','misty rose','mocasin','navajo blanco','armada','encaje viejo','aceituna','verde oliva','naranja','rojo naranja','orquidea','vara de oro palida','verde palido','turquesa palido','pale violetred','latigo de papaya','melocoton','peru','rosado','ciruela','azul palido','purpura','red','rosy brown','azul real','silla de montar','salmon','sandy brown','mar verde','concha','tierra de siena','plata','cielo azul','azul pizarra','gris pizarra','nieve','primavera verde','azul acero','marron','cardo','tomate','turquesa','violeta','trigo','blanco','humo blanco','amarillo','amarillo verde'];

		for (var i = 0; i < coloresFinales.length; i++) {
			var color = coloresFinales[i];
			var index = coloresIngles.indexOf(color);
			if(index != -1){
				coloresFinales[i] = coloresEspanol[index];
			}
		}

		// Performs label detection on the local file
		vision.detectLabels(fileName, opts)
		.then((results) => {
			if(results[1].error !== null){
				var googleTags = results[0];
				var tags = googleTags.concat(coloresFinales).join();
				
				connection.query("UPDATE "+perro.tipo+" SET tags = ? where id = ?",[tags, perro.id], function(err, result) {
					if (err) {
						console.log(err);
					}else{
						console.log("Tags generados para: " + perro.id);
					}
				});
			}else{
				connection.query("UPDATE "+perro.tipo+" SET tags = ? where id = ?",[coloresFinales.join(), perro.id], function(err, result) {
					if (err) {
						console.log(err);
					}
				});
			}
		});
	});	
}

function _normalizeTipo(tipo){
	if(isNaN(tipo)){
		switch(tipo){
			case 'avistados':
				return 1;
			case 'encontrados':
				return 2;
			case 'perdidos':
				return 3;
			default: 
				return null;
		}
	}else{
		return tipo;
	}
}