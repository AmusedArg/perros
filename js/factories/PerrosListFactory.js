angular.module('perrosApp.factories').
	factory('PerrosList', ['$filter', '$q', 'perrosService', function($filter, $q, perrosService){
		var PerrosList = function(){
			this.perrosList = [];
			this.registros = [];
			this.perrosService = perrosService;
			var self = this;

			this.addPerro = function(perro){
				self.perrosList.push(perro);
				if(self.registros[perro.tipo] >= 0 === false){
					self.registros[perro.tipo] = 0;
				}
				self.registros[perro.tipo]++;
			};

			this.deletePerro = function(perro){
				self.perrosList = $filter('filter')(self.perrosList, function(value, index) {return value.id !== perro.id;}); 	
				self.registros[perro.tipo]--;
			};

			this.deletePerrosByTipo = function(tipo){
				self.registros[tipo] = 0;
				self.perrosList = $filter('filter')(self.perrosList, function(value, index) {return value.tipo !== tipo ;}); 	
			};

			this.buscarPerro = function(perro){
				var i=0, len=self.perrosList.length;
		    	for (; i<len; i++) {
		      		if (self.perrosList[i].id === perro.id) {
		        		return self.perrosList[i];
		      		}
		    	}
		    	return null;
			};

			this.getCantidadPerrosByTipo = function(tipo){
				return self.getPerrosListByTipo(tipo).length;
			};
			
			this.getPerrosListByTipo = function(tipo, page, max_results){
				var results = 0;
				if((page >= 0) === false || (max_results >= 0) === false){
					page = 0;
					max_results = 40;
				}
				var firstIndex = page*max_results;
				var lastIndex = firstIndex + max_results;
				var listado = $filter('filter')(self.perrosList, function(value, index) {return (value.tipo === tipo) ;});
				listado = listado.reverse(); // ya vienen ordenados pero ascendentemente por fecha
				return listado.slice(firstIndex, lastIndex);
			};

			this.getFavoritos = function(){
				return $filter('filter')(self.perrosList, function(value, index) {return value.favorito == '1' ;}); 
			};

			this.setTotalRegistros = function(cant, tipo){
				self.registros[tipo] = cant;
			};
		};

		return PerrosList;
	}]);