var Connection = require('database-connection'),
	crypto = require("crypto"),
	appRoot = require('app-root-path'),
	fs = require("fs"),
	logger = require('logging'),
	PropertiesReader = require('properties-reader'),
	moment = require("moment");

var log = logger();

var properties = PropertiesReader(appRoot+'/config.properties');
const publicFolderName = properties.get('publicFolder');
const MAX_RESULTS = 40;

// get pool connection fro mdatabase
var pool = Connection.getPool();


/** START PUBLIC METHODS DIFINITION **/

function buscarPerro(perro, callback){
	var result = {
		perros: null,
		total: null
	};
	
	if(perro.lugar && perro.lugar.value){
		perro.lugar = perro.lugar.value;
	}

	_getPerros(perro, perro.tipo, 0, function(perros, total){
		_getCantidadPerros(perro, perro.tipo, function(total){
			result.perros = perros;
			result.total = total;
			callback(result);
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
			_editarPerro(perro, function(collar_color){
				callback ({foto: perro.foto, collar_color: collar_color});
			});
		});
	}else if(perro.foto && perro.foto.includes('public_fotos')){
		_editarPerro(perro, function(collar_color){
			callback ({foto: perro.foto, collar_color: collar_color});
		});
	}else{
		_editarPerro(perro, function(collar_color){
			callback ({foto: 'img/dog.png', collar_color: collar_color});
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
			_guardarPerro(perro, function(id, collar_color){
				var imageFullPath = dir+imagen;
				perro.id = id;
				callback ({foto: perro.foto, id: id, collar_color: collar_color});
				_saveImageLabels(imageFullPath, perro);
			});
		});
	}else{
		_guardarPerro(perro, function(id, collar_color){
			callback ({foto: perro.foto, id: id, collar_color: collar_color});
		});
	}
}

function getPerros(perro, tipo, callback){
	var result = {
		perros: null,
		total: null
	};
	
	_getPerros(perro, tipo, perro.page, function(perros){
		_getCantidadPerros(perro, tipo, function(total){
			result.perros = perros;
			result.total = total;
			callback(result);
		});
	});
}

function borrarPerro(id){
	pool.getConnection(function(err, connection) {
		if(err){log.error(err); return; }
		connection.query("UPDATE perros SET eliminado=1 WHERE id=?",[id], function(err, rows, fields) {
			connection.release();
			if (err){
		  		log.error(err);
		  	}
		});
	});
}

function toggleFavorite(id, favorito){
	pool.getConnection(function(err, connection) {
		if(err){log.error(err); return; }
		connection.query("UPDATE perros SET favorito=? WHERE id=?",[favorito, id], function(err, rows, fields) {
			connection.release();
			if (err){
		  		log.error(err);
		  	}
		});
	});
}

function getCoincidencias(filter, callback) {
	var columnas_a_coincidir = '';
	var orderby = ' ORDER BY fecha DESC ';	

	if(filter.matchCollar == 'true'){
		columnas_a_coincidir += ' perros_con_excluidos.has_collar = true AND (perros_con_excluidos.has_collar = coincidencias.has_collar) AND ';
	}
	if(filter.matchLugar == 'true' || filter.matchLugar == null){
		columnas_a_coincidir += '(perros_con_excluidos.lugar = coincidencias.lugar) AND ';
	}
	if(filter.matchRaza == 'true' || filter.matchRaza == null){
		columnas_a_coincidir += ' (perros_con_excluidos.raza = coincidencias.raza) AND ';
	}
	if(filter.matchSexo == 'true' || filter.matchSexo == null){
		columnas_a_coincidir += ' (perros_con_excluidos.sexo = coincidencias.sexo) AND ';
	}

	if(filter.order){
		orderby = _parseOrderBy(filter.order);
	}

	var query = 
		" select perros_con_excluidos.*, group_concat(coincidencias.id,';',coincidencias.foto separator ',') AS coincidencias " +
		" from perros.view_perros_con_exclusiones perros_con_excluidos  "+
		"   join perros.perros coincidencias  "+
		"   on "
				+ columnas_a_coincidir +
		"       (perros_con_excluidos.id <> coincidencias.id) and  "+
		"       (perros_con_excluidos.tipo_perro_id <> coincidencias.tipo_perro_id) and  "+
		"       (perros_con_excluidos.eliminado = 0 and coincidencias.eliminado = 0)  "+
		" group by perros_con_excluidos.id " +
		  orderby;

	pool.getConnection(function(err, connection) {
		if(err){log.error(err); return; }
		connection.query(query, function(err, rows, fields) {
			callback(rows);
			connection.release();
			if (err){
		  		log.error(err);
		  	}
		});
	});
}

function quitarCoincidencia(idPrincipal, idSecundario) {
	pool.getConnection(function(err, connection) {
		if(err){log.error(err); return; }
		connection.query("INSERT INTO coincidencias_descartadas (perro_id, perro_id_coincidencia) VALUES (?,?)", [idPrincipal,idSecundario], function(err, rows, fields) {
			connection.release();
			if (err){
		  		log.error(err);
		  	}
		});
	});
}

/** END PUBLIC METHODS DEFINITION **/

module.exports = {
	buscarPerro: buscarPerro,
	editarPerro: editarPerro,
	guardarPerro: guardarPerro,
	getPerros: getPerros,
	borrarPerro: borrarPerro,
	toggleFavorite: toggleFavorite,
	getCoincidencias: getCoincidencias,
	quitarCoincidencia: quitarCoincidencia
};

/** PRIVATE METHODS DEFINITION **/

function _getPerros(perro, tipo, page, callback){
	var filtros = '';
	var parameters = [];

	if(perro.nombre){
		filtros += " AND nombre LIKE ?";
		parameters.push('%'+perro.nombre+'%');
	}

	if(perro.sexo){
		filtros += " AND sexo LIKE ?";
		parameters.push('%'+perro.sexo+'%');
	}

	if(perro.raza){
		filtros += " AND raza LIKE ?";
		parameters.push('%'+perro.raza+'%');
	}
	if(perro.lugar){
		filtros += " AND lugar LIKE ?";
		parameters.push('%'+perro.lugar+'%');
	}

	if(perro.has_collar === true){
		filtros += " AND has_collar = true ";
		if(perro.collar_detalle){
			filtros += " AND collar_detalle LIKE ? ";
			parameters.push('%'+perro.collar_detalle+'%');
		}
	}
	
	tipo = _normalizeTipo(tipo);
	parameters.push(getIntegerValue(tipo));
	parameters.push(getIntegerValue(page)*MAX_RESULTS);
	parameters.push(MAX_RESULTS);

	pool.getConnection(function(err, connection) {
		if(err){ log.error(err); return; }
		connection.query(
			"SELECT * FROM perros WHERE eliminado=0 "+filtros+" AND tipo_perro_id = ? order by fecha desc LIMIT ?,?", parameters, 
			function(err, rows, fields) {
			  	if (!err){
			  		var result = [];
			  		for (var i = 0; i < rows.length; i++) {
			  			var row = rows[i];
			  			row.has_collar = Boolean(row.has_collar);
			  			row.fecha = moment(row.fecha).format('DD/MM/YYYY');
			  			result.push(row);
			  		}
					callback(result, rows.length);
			  	}else{
			  		log.error(err);
			  	}
			  	connection.release();
			}
		);
	});
}

function _getCantidadPerros(perro, tipo, callback) {
	var filtros = '';
	var parameters = [];

	if(perro.nombre){
		filtros += " AND nombre LIKE ?";
		parameters.push('%'+perro.nombre+'%');
	}

	if(perro.sexo){
		filtros += " AND sexo LIKE ?";
		parameters.push('%'+perro.sexo+'%');
	}

	if(perro.raza){
		filtros += " AND raza LIKE ?";
		parameters.push('%'+perro.raza+'%');
	}
	if(perro.lugar){
		filtros += " AND lugar LIKE ?";
		parameters.push('%'+perro.lugar+'%');
	}

	if(perro.has_collar === true){
		filtros += " AND has_collar = true ";
		if(perro.collar_detalle){
			filtros += " AND collar_detalle LIKE ? ";
			parameters.push('%'+perro.collar_detalle+'%');
		}
	}

	tipo = _normalizeTipo(tipo);

	parameters.push(getIntegerValue(tipo));

	pool.getConnection(function(err, connection) {
		if(err){log.error(err); return; }
		connection.query("SELECT count(id) as total FROM perros WHERE eliminado=0 "+filtros+" AND tipo_perro_id = ?", parameters, function(err, rows, fields) {
			if (!err){
		  		if(rows.length > 0){
		  			callback(rows[0].total);
		  		}
		  	}else{
		  		log.error(err);
		  	}
		  	connection.release();
		});
	});
}

function _guardarPerro(perro, callback) {
	var tipo = _normalizeTipo(perro.tipo);
	var collar_color = _getColorCollar(perro.collar_detalle);
	pool.getConnection(function(err, connection) {
		if(err){log.error(err); return; }
		connection.query("INSERT INTO perros (nombre, tel_contacto, fecha, foto, lugar, raza, sexo, duenio, has_collar, collar_detalle, collar_color, link_sitio, tipo_perro_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",[perro.nombre, perro.telefono, perro.fecha, perro.foto, perro.lugar, perro.raza, perro.sexo, perro.duenio, perro.has_collar, perro.collar_detalle, collar_color, perro.link_sitio, tipo], function(err, result) {
			callback(result.insertId, collar_color);
			connection.release();
			if (err) {log.error(err); throw err; }
		});
	});
}

function _editarPerro(perro, callback) {
	pool.getConnection(function(err, connection) {
		if(err){log.error(err); return; }
		var collar_color = _getColorCollar(perro.collar_detalle);
		connection.query("UPDATE perros SET nombre=?, tel_contacto=?, fecha=?, foto=?, lugar=?, raza=?, sexo=?, duenio=?, has_collar=?, collar_detalle=?, collar_color=?, link_sitio=? WHERE id=?",[perro.nombre, perro.telefono, perro.fecha, perro.foto, perro.lugar, perro.raza, perro.sexo, perro.duenio, perro.has_collar, perro.collar_detalle, collar_color, perro.link_sitio, perro.id], function(err, result) {
			callback(collar_color);
			connection.release();
			if (err) {log.error(err); throw err; }
		});
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
        log.error(error);
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
	};

	const path = require('path');
	const getColors = require('get-image-colors');
	const namer = require('color-namer');
	
	var coloresFinales = [];
	getColors(fileName).then(colors => {
		for (var i = 0; i < colors.length; i++) {
			colors[i] = colors[i].hex();
		}

		// por cada hexa encuentro 3 colores cercanos
		for (var i = 0; i < colors.length; i++) {
			var hexColor = colors[i];
			var coloresCercanos = namer(hexColor).basic;
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
			}else{
				var tags = coloresFinales.join();
			}
			pool.getConnection(function(err, connection) {
				if(err){log.error(err); return; }
				connection.query("UPDATE "+perro.tipo+" SET tags = ? where id = ?",[tags, perro.id], function(err, result) {
					if (err) {
						log.error(err);
					}else{
						log.info("Tags generados para: " + perro.id);
					}
					connection.release();
				});
			});
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

/**
* order String en formato <column>_<orderType>
*/
function _parseOrderBy(order){
	var orderByColumn = order.split("_")[0];
	var orderType = order.split("_")[1];
	var parsedOrderByColumn, parsedOrderType = null;

	if(orderByColumn.toUpperCase() === 'FECHA'){ parsedOrderByColumn = ' fecha '; }
	if(orderByColumn.toUpperCase() === 'LUGAR'){ parsedOrderByColumn = ' lugar '; }
	if(orderByColumn.toUpperCase() === 'RAZA'){ parsedOrderByColumn = ' raza '; }

	if(orderType.toUpperCase() === 'DESC'){ parsedOrderType = ' DESC '; }
	if(orderType.toUpperCase() === 'ASC'){ parsedOrderType = ' ASC '; }	

	if(parsedOrderByColumn && parsedOrderType){
		return ' ORDER BY ' + parsedOrderByColumn + parsedOrderType;
	}else{
		return '';
	}
}

function _getColorCollar(collar_detalle) {
	var materialColors = ['#f44336','#e91e63','#9c27b0','#2196f3','#4caf50','#ffc107','#ff5722','#795548','#9e9e9e','#212121'];
	var colorsName = ['rojo','rosa','violeta','azul','verde','amarillo','naranja','marron','gris', 'negro'];
	var defaultColor = '#009688';
	if(collar_detalle){
		var words = collar_detalle.split(" ");
		for (var i = 0; i < words.length; i++) {
			for (var j = 0; j < colorsName.length; j++) {
				var word = words[i].trim();
				var color = colorsName[j];
				if(word.toUpperCase() === color.toUpperCase()){
					return materialColors[j];
				}
			}
		}
	}
	return defaultColor;
}

function getIntegerValue(val){
	if(isNaN(val)){
		throw "Expected numeric value for: "+val+" !";
	}else if (val < 0 ){
		throw val + " can't be negative.";
	}else{
		return parseInt(val,10);
	}
}