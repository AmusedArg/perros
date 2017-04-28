angular.module('perrosApp.factories').
	factory('CoincidenciasList', ['$filter', '$q', 'perrosService', function($filter, $q, perrosService){
		var CoincidenciasList = function(){
			this.coincidencias = [];
			this.perrosService = perrosService;
			this.buscando = false;
			var self = this;

			this.quitarCoincidencia = function(idPrincipal, idCoincidencia){
				$filter('filter')(self.coincidencias, function(perroPrincipal, indexP) {
					if (perroPrincipal.id === idPrincipal){
						return $filter('filter')(perroPrincipal.coincidencias, function(coincidencia, indexS) {
							if(coincidencia.id === idCoincidencia){
								perroPrincipal.coincidencias.splice(indexS,1);
								if(perroPrincipal.coincidencias.length === 0){
									self.coincidencias.splice(indexP,1);
								}
							}
						});
					}
				});

				perrosService.quitarCoincidencia(idPrincipal, idCoincidencia);
			};

			this.getCoincidencias = function(){
				return self.coincidencias;
			};

			this.hasCoincidencias = function(){
				return this.coincidencias.length > 0;
			};

			this.loadCoincidencias = function(filter){
				self.coincidencias = [];
				self.buscando = true;
		  		perrosService.loadCoincidencias(filter).then(function (response) {
		  			var datos = response.data;
		  			for (var i = 0; i < datos.length; i++) {
		  				var c = datos[i];
		  				var principal = {
		  					id: c.id,
		  					foto: c.foto,
		  					coincidencias: []
		  				};

		  				var coincidencias = c.coincidencias.split(',');

		  				for (var j = 0; j < coincidencias.length; j++) {
			  				var secundario = {
			  					id: parseInt(coincidencias[j].split(';')[0],10),
			  					foto: coincidencias[j].split(';')[1]
			  				};

			  				if(!c.excluidos || ((c.excluidos) && (c.excluidos.split(",").indexOf(secundario.id.toString()) === -1))){
			  					principal.coincidencias.push(secundario);
			  				}
		  				}
		  				if(principal.coincidencias.length > 0){
		  					self.coincidencias.push(principal);
		  				}
		  			}
		  			self.buscando = false;
		  		});
		  	};		  
		};

		return CoincidenciasList;
	}]);