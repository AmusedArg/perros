angular.module('perrosApp.factories', []).
	factory('PerroFactory', function(){

		var _templatesFolder = '/partials/templates/';

		var Perro = function(tipo, template){
			this.id = null;
			this.nombre = null;
			this.telefono = null;
			this.fecha = new Date();
			this.foto = 'img/dog.png';
			this.real_date = new Date();
			this.favorito = 0;
			this.tipo = tipo;
			this.template = template;
			this.tags = null;
			this.link_sitio = null;
		};

		var PerroFactory = {
			getPerro: function(tipo){
				switch(tipo){
					case 'perdidos':
						var template = _templatesFolder + 'dialogNuevoPerdido.tmpl.html';
						return new Perro(tipo, template);
						break;
					case 'encontrados': 
						var template = _templatesFolder + 'dialogNuevoEncontrado.tmpl.html';
						return new Perro(tipo, template);
						break;
					case 'avistados':
						var template = _templatesFolder + 'dialogNuevoAvistado.tmpl.html';
						return new Perro(tipo, template);
				}
			}
		}

		return PerroFactory;
	});