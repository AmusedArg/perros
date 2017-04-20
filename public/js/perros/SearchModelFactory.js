angular.module('perrosApp.factories').
	factory('SearchModelFactory', ['$filter', function($filter){
		var SearchModelFactory = function(){
			
			var self = this;
			
			this.modelos = [];

			this.getSearchModel = function(tipo){
				var searchModel = null;

				for (var i = 0; i < self.modelos.length; i++) {
					if(self.modelos[i].tipo === tipo){
						searchModel = self.modelos[i];
						return searchModel;
					}
				}
				if(searchModel === null){
					searchModel = self.buildSearchModel(tipo);
					self.modelos.push(searchModel);
				}

				return searchModel;
			};

			this.buildSearchModel = function(tipo){
				var model = {
					nombre: null,
					sexo: null,
					raza: null,
					lugar: null,
					has_collar: null,
					collar_detalle: null,
					tipo: tipo
				};
				return model;
			};

			this.addSearchModel = function(model){
				var selfModel = self.getSearchModel(model.tipo);
				selfModel.nombre = model.nombre;
				selfModel.sexo = model.sexo;
				selfModel.raza = model.raza;
				selfModel.lugar = model.lugar;
				selfModel.has_collar = model.has_collar;
				selfModel.collar_detalle = model.collar_detalle;
				selfModel.tipo = model.tipo;
				self.modelos.push(selfModel);
			};
		};

		return SearchModelFactory;
	}]);