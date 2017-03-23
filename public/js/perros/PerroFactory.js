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
			}
		};

		var PerroFactory = {
			getPerro: function(tipo){
				switch(tipo){
					case 'perdidos':
						var template = _dialogsTemplatesFolder + 'dialogNuevoPerdido.tmpl.html';
						return new Perro(tipo, template);
						break;
					case 'encontrados': 
						var template = _dialogsTemplatesFolder + 'dialogNuevoEncontrado.tmpl.html';
						return new Perro(tipo, template);
						break;
					case 'avistados':
						var template = _dialogsTemplatesFolder + 'dialogNuevoAvistado.tmpl.html';
						return new Perro(tipo, template);
				}
			}
		}

		return PerroFactory;
	});