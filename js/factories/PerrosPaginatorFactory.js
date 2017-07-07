angular.module('perrosApp.factories').
	factory('PerrosPaginator', function(){

		var PerrosPaginator = function(){
			this.paginas = [];
			var self = this;

			this.setPaginaActual = function(pagina, tipo){
				self.paginas[tipo] = pagina;
			};

			this.getPaginaActual = function(tipo){
				return self.paginas[tipo];
			};	

			this.paginaSiguiente = function(tipo){
				self.paginas[tipo]++;
			};

			this.paginaAnterior = function(tipo){
				self.paginas[tipo]--;
			};
		};

		return PerrosPaginator;
	});