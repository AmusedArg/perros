angular.module('perrosApp.factories').
	factory('PerroFactory', function(){

		var Perro = function(tipo){
			this.id = null;
			this.nombre = null;
			this.telefono = null;
			this.fecha = new Date();
			this.foto = 'img/dog.png';
			this.real_date = new Date();
			this.favorito = 0;
			this.tipo = tipo;
			this.tags = null;
			this.has_collar = false;
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
			this.getDescripcionTipoSingular = function(){
				return this.tipo.substring(0, this.tipo.length-1);
			};
		};

		var PerroFactory = {
			getPerro: function(tipo){
				switch(tipo){
					case 'perdidos':
						return new Perro(tipo);
					case 'encontrados': 
						return new Perro(tipo);
					case 'avistados':
						return new Perro(tipo);
				}
			}
		};

		return PerroFactory;
	});