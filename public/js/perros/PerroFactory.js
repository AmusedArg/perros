angular.module('perrosApp.factories', []).
	factory('PerroFactory', function(){

		var _dialogsTemplatesFolder = '/partials/templates/dialogs/';

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
			this.has_collar = null;
			this.collar_detalle = null;
			this.collar_color = null;
			this.link_sitio = null;
			this.hasFacebookLink = function(){
				return (this.link_sitio && this.link_sitio.indexOf('facebook') != -1);
			};
			this.hasRedMascoteraLink = function(){
				return (this.link_sitio && this.link_sitio.indexOf('redmascotera') != -1);
			};
			this.hasOtherLink = function(){
				return (this.link_sitio && !this.hasFacebookLink() && !this.hasRedMascoteraLink());
			};
			this.isFavorito = function(){
				return (this.favorito==1);
			};
			this.isHembra = function(){
				return (this.sexo=='Hembra');
			};
			this.isMacho = function(){
				return (this.sexo=='Macho');
			};
		};

		var PerroFactory = {
			getPerro: function(tipo){
				var template;
				switch(tipo){
					case 'perdidos':
						template = _dialogsTemplatesFolder + 'dialogNuevoPerdido.tmpl.html';
						return new Perro(tipo, template);
					case 'encontrados': 
						template = _dialogsTemplatesFolder + 'dialogNuevoEncontrado.tmpl.html';
						return new Perro(tipo, template);
					case 'avistados':
						template = _dialogsTemplatesFolder + 'dialogNuevoAvistado.tmpl.html';
						return new Perro(tipo, template);
				}
			}
		};

		return PerroFactory;
	});