angular.module('perrosApp.factories').
	factory('PerrosList', ['$filter', '$q', 'perrosService', function($filter, $q, perrosService){
		var PerrosList = function(){
			this.perrosList = [];
			this.perrosBusquedaAvanzada = [];
			this.registros = [];
			this.perrosService = perrosService;
			var self = this;

			this.addPerro = function(perro){
				self.perrosList.push(perro);
			}

			this.deletePerro = function(perro){
				self.perrosList = $filter('filter')(self.perrosList, function(value, index) {return value.id !== perro.id;}); 	
				self.perrosBusquedaAvanzada = $filter('filter')(self.perrosBusquedaAvanzada, function(value, index) {return value.id !== perro.id;}); 	
			}

			this.deletePerrosByTipo = function(tipo){
				self.perrosList = $filter('filter')(self.perrosList, function(value, index) {return value.tipo !== tipo ;}); 	
			}

			this.buscarPerro = function(perro){
				var i=0, len=self.perrosList.length;
		    	for (; i<len; i++) {
		      		if (+self.perrosList[i].id == +perro.id) {
		        		return self.perrosList[i];
		      		}
		    	}
		    	return null;
			}

			this.buscarPerrosCercanos = function(perro){
				var perros = [];
				var perroTmp = {lugar: perro.lugar}; // busco solo por lugar
				var deferred = $q.defer(); 

				if(perro.tipo === 'perdidos'){
					self.perrosService.getPerros(0, 999999, 'encontrados', perroTmp).then(function (response) {
						for (i in response.data[0]) {
						  response.data[0][i].tipo = 'encontrados';
						}
			   			perros = perros.concat(response.data[0]);
				   		self.perrosService.getPerros(0, 999999, 'avistados', perroTmp).then(function (response) {
				   			for (i in response.data[0]) {
							  response.data[0][i].tipo = 'avistados';
							}
				   			perros = perros.concat(response.data[0]);
				   			deferred.resolve(perros);
				   		});
			   		});

				}else if(perro.tipo === 'encontrados'){
					self.perrosService.getPerros(0, 999999, 'perdidos', perroTmp).then(function (response) {
						for (i in response.data[0]) {
						  response.data[0][i].tipo = 'perdidos';
						}
			   			perros = perros.concat(response.data[0]);
				   		self.perrosService.getPerros(0, 999999, 'avistados', perroTmp).then(function (response) {
				   			for (i in response.data[0]) {
							  response.data[0][i].tipo = 'avistados';
							}
				   			perros = perros.concat(response.data[0]);
				   			deferred.resolve(perros);
				   		});
			   		});

				}
			    
			    return deferred.promise;
			}

			this.getCantidadPerrosByTipo = function(tipo){
				return self.getPerrosListByTipo(tipo).length;
			}
			
			this.getPerrosListByTipo = function(tipo){
				return $filter('filter')(self.perrosList, function(value, index) {return value.tipo === tipo ;}); 
			}

			this.getFavoritos = function(){
				return $filter('filter')(self.perrosList, function(value, index) {return value.favorito == '1' ;}); 
			}

			this.setTotalRegistros = function(cant, tipo){
				self.registros[tipo] = cant;
			}

			this.addPerroBusquedaAvanzada = function(perro){
				self.perrosBusquedaAvanzada.push(perro);
			}			

			this.setPerrosBusquedaAvanzada = function(perros){
				self.perrosBusquedaAvanzada = perros;
			}

			this.getPerrosBusquedaAvanzada = function(){
				return self.perrosBusquedaAvanzada;
			}
		};

		return PerrosList;
	}]);