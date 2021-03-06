angular.module('perrosApp.controllers', []).
	controller('HomeCtrl', ['$scope', '$mdDialog', '$timeout', '$q', '$log', '$filter', '$mdToast', '$mdConstant', 'perrosService', 'PerroFactory','PerrosList','PerrosPaginator','SearchModelFactory', '$state', '$location' , 'CoincidenciasList', 'ErrorFactory', function($scope, $mdDialog, $timeout, $q, $log, $filter, $mdToast, $mdConstant, perrosService, PerroFactory,PerrosList,PerrosPaginator, SearchModelFactory, $state, $location, CoincidenciasList, ErrorFactory) {
		/* Initialization of scope varaibles */
		$scope.TIPO_ENCONTRADO = 'encontrados';
		$scope.TIPO_PERDIDO = 'perdidos';
		$scope.TIPO_AVISTADO = 'avistados';
		$scope.MAX_RESULTS = 40;
		
		$scope.razas = ['Mestizo','Afgano','Airedale Terrier','Akita','American Stafford Terrier','Basenji','Basset','Beagle','Bearded Collie','Bichon Frisse','Bloodhound','Border Collie','Boston Terrier','Boxer','Boyero De Berna','Braco','Breton','bull dog frances','Bull Dog Ingles','Bull Terrier','Bullmastiff','Cairn Terrier','Cane Corso','Caniche','cavalier king charles spaniel','Chihuahua','Chow Chow','Cocker','Collie','CRESTADO CHINO','Dalmata','Doberman','Dogo','Dogo De Burdeos','Earlier Terrier','Faraon','Fila Brasilero','Fox Terrier','Galgo','Golden','Gos D atura o Pastor catalán','Gran Danes','Grifon De Bruselas','Jack Russell','Kuvasz','Labrador','Lasha Apso','lebrel','Malamute','Maltes','Mastiff Ingles','Mastin Español','Mastin Napolitano','Ovejero Aleman','Ovejero Belga','Ovejero Tervueren','Papillon','Pastor Australiano','Pastor De Brie','pastor del caucaso','Pastor Escoces','Pastor Ingles','Pastor Suizo','Pequines','perro de agua español','Pila','Pincher','Pit Bull','Pointer','pomerania','Presa Canario','Pug','Rodhesian','Rottweiler','Salchicha','Samoyedo','San Bernardo','Schnautzer Grande','Schnautzer Mini','Schnautzer Standar','Scottish Terrier','Setter Irlandes','Sharpei','Shiba Inu','Shitzu','Siberiano','Springer Spaniel Ingles','Terranova','Vizla','Weimaraner','Welsh Corgi','Welsh Terrier','West Highland White','Whippet','Yorkshire Terrier'];
   		
   		$scope.uploadingPerdido = false;
   		$scope.uploadingEncontrado = false;
   		$scope.uploadingAvistado = false;

   		$scope.perrosPaginator = new PerrosPaginator();
   		$scope.perrosList = new PerrosList();
   		$scope.coincidenciasList = new CoincidenciasList();
   		$scope.searchModelFactory = new SearchModelFactory();
   		$scope.errorFactory = ErrorFactory;

   		$scope.navActiveItem = $location.path().substring(1, $location.path().length); // active item por defecto
   		$scope.searchModel = $scope.searchModelFactory.getSearchModel($scope.navActiveItem);

   		// modelos busqueda avanzada
   		$scope.tagsSearch = [];
   		$scope.chipSeparators = [$mdConstant.KEY_CODE.COMMA, $mdConstant.KEY_CODE.SPACE, $mdConstant.KEY_CODE.ENTER];

   		getPerros(0, $scope.TIPO_PERDIDO);
   		getPerros(0, $scope.TIPO_ENCONTRADO);
   		getPerros(0, $scope.TIPO_AVISTADO);

   		$scope.changeTab = function(){
			$scope.searchModel = $scope.searchModelFactory.getSearchModel($scope.navActiveItem);
			// reload only if there arent dogs, otherwise just change tab view
			if($scope.perrosList.getCantidadPerrosByTipo($scope.navActiveItem) === 0){
				getPerros(0, $scope.navActiveItem);
			}
   		};

   		$scope.showNuevoPerro = function(ev, tipo) {
   			$scope.nuevoPerro = PerroFactory.getPerro(tipo);
		    $mdDialog.show({
				scope: $scope.$new(),
				templateUrl: '/partials/templates/dialogs/dialogNuevoPerro.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true
		    });
	  	}; 

	  	$scope.guardarPerro = function(perro){
	    	$scope.uploading = true;
	    	perro.lugar = autocomplete.lugar;
	  		perrosService.guardarPerro(perro)
	  			.then(
	  				function(response){
		  				if(response.status == 200){
			  				var data = response.data;
				  			perro.id = data.id;
				  			perro.foto = data.foto;
				  			perro.collar_color = data.collar_color;
				  			perro.fecha = formattedDate(perro.fecha);
				  			perro.real_date = createDateFromString(perro.fecha);
				  			$scope.perrosList.addPerro(perro);
				  			$mdDialog.cancel();
				  			$scope.uploading = false;
				  			autocomplete.lugar = '';
				  			$scope.nuevoPerro = null;
		  				}
			  		},
			  		function(){
			  			$scope.uploading = false;
			  			$mdToast.show(
						    $mdToast.simple()
					        .textContent('No se pudo guardar el perro.')
					        .position('bottom left')
					        .hideDelay(10000)
					        .action('OK')
      						.highlightAction(true)
					        .parent('#dialog-nuevo-perro')
					    );
			  		}
		  		);
	  	};

	  	$scope.guardarPerroEdicion = function(perro){
	  		if(typeof perro.lugar === 'object'){
	  			perro.lugar = perro.lugar.value;
	  		}
	    	$scope.uploadingEdicion = true;
	  		perrosService.actualizarPerro(perro).then(function(response){
	  			perro.foto = response.data.foto;
	  			perro.collar_color = response.data.collar_color;
	  			perro.real_date = createDateFromString(perro.fecha);
  				var perroOriginal = $scope.perrosList.buscarPerro(perro);
  				if(perroOriginal !== null){
  					copyAttributes(perroOriginal, perro);
  				}
	  			$mdDialog.cancel();
	  			$scope.uploadingEdicion = false;
	  			perro.lugar = '';
			    $mdToast.show(
				    $mdToast.simple()
			        .textContent('Los cambios se guardaron correctamente')
			        .position('top right')
			        .hideDelay(3000)
			        .parent('#main-content')
			    );
	  		});
	  	};

  		$scope.editarPerro = function(ev, perro) {
  			perro.has_collar = Boolean(perro.has_collar);
  			if(!perro.lugar || perro.lugar.length <= 0){
  				autocomplete.searchText = '';
  			}
  			
  			$scope.perroEdicion = angular.copy(perro);
  			$scope.perroEdicion.fecha = $scope.perroEdicion.real_date; // para que lo levante el input debe ser un Date
		    $mdDialog.show({
		      	scope: $scope.$new(),
		      	templateUrl: '/partials/templates/dialogs/dialogEditarPerro.tmpl.html',
		      	parent: angular.element(document.body),
		      	targetEvent: ev,
		      	clickOutsideToClose:true
		    });
	  	};

	  	$scope.borrarPerro = function(ev, perro){
	  		var confirm = $mdDialog.confirm()
		          .title('Se borrará el perro definitivamente')
		          .ariaLabel('Borrar')
		          .targetEvent(ev)
		          .ok('Borrar')
		          .cancel('Cancelar');
		    $mdDialog.show(confirm).then(
		    	function() { // click on ok
		  			$mdDialog.hide();
			      	perrosService.borrarPerro(perro.id, perro.tipo).then(function(){
		  			 	$scope.perrosList.deletePerro(perro);
			  		});
		    	}, 
		    	function(){ // click on cancel
		    		$mdDialog.cancel();
		    	}
		    );
	  	};

	  	$scope.openMenuBuscar = function($mdMenu, ev, perro) {
     		$mdMenu.open(ev);
	    };

	    $scope.buscarPerroAvanzado = function(event, perro, tipo){
	    	$scope.searchModel = $scope.searchModelFactory.getSearchModel(tipo);
	    	$scope.searchModel.nombre = null;
	    	$scope.searchModel.raza = null;
	    	$scope.searchModel.sexo = perro.sexo;
	    	$scope.searchModel.lugar = perro.lugar;
	    	$scope.searchModel.tipo = tipo;	   

	    	if(perro.has_collar === true){
	    		$scope.searchModel.has_collar = perro.has_collar;
	    	}

	    	$scope.navActiveItem = tipo;
	    	$state.go($scope.navActiveItem);
	    	$scope.buscarPerro($scope.searchModel);
	    };

	  	$scope.buscarPerro = function (perro) {
	  		$scope.errorFactory.message = null;
	  		angular.element(document.querySelector('#loading-spinner')).removeClass('hide');
			perro.tipo = $scope.navActiveItem;
			$scope.perrosList.deletePerrosByTipo(perro.tipo);
	  		perrosService.filtrarPerros(perro).then(
	  			function (response) {
	  				hideSpinner();
		  			cargarArregloPerros(response.data.perros, response.data.total, perro.tipo);
		  		},
		  		function(){
		  			hideSpinner();
		  			$scope.errorFactory.message = 'Ha ocurrido un error al obtener los perros. Intente nuevamente';
		  		}
	  		);
	  	};

	  	$scope.busquedaAvanzada = function(tags){
	  		tags = tags.join();
	  		angular.element(document.querySelector('#loading-bar')).toggleClass('la-animate');
	  		perrosService.busquedaAvanzada(tags).then(function (response) {
	  			angular.element(document.querySelector('#loading-bar')).toggleClass('la-animate');
	  			$scope.perrosList.setPerrosBusquedaAvanzada([]);
	  			for (var i = response.data.length - 1; i >= 0; i--) {
	   				var perro = response.data[i];
	   				perro.real_date = createDateFromString(perro.fecha);
					$scope.perrosList.addPerroBusquedaAvanzada(perro);
	   			}
	  		});
	  	};

	  	$scope.coincidenciasHeight = function(){
	  		var windowHeight = window.innerHeight - 100;
	  		return {height: windowHeight + 'px'};
	  	};

	  	$scope.verMapa = function(ev, perro){
	  		var zona = perro.lugar + ", AR";
	  		var geocoder = new google.maps.Geocoder();
			geocoder.geocode( { 'address': zona }, function(results, status) {
				if(results.length === 0){return false;}

				var imageMarker = {
				  size: new google.maps.Size(80, 80),
				  origin: new google.maps.Point(0, 0),
				  anchor: new google.maps.Point(17, 34),
				  scaledSize: new google.maps.Size(30, 30)
				};

		  		var map = new google.maps.Map(document.getElementById('map'), {
					center: results[0].geometry.location,
					zoom: 13					
				});

				//perro original
				imageMarker.url = perro.foto;

				var tipoOriginal = perro.tipo.substring(0, perro.tipo.length - 1);

				var marker = new google.maps.Marker({
					position: results[0].geometry.location,
					map: map,
					title: perro.nombre,
					draggable:true,
					label: capitalizeFirstLetter(tipoOriginal),
					animation: google.maps.Animation.DROP,
					icon: imageMarker
				});

				marker.addListener('mousedown', function(){
					  this.getIcon().scaledSize = new google.maps.Size(80,80);
				});

				marker.addListener('mouseup', function(){
					  this.getIcon().scaledSize = new google.maps.Size(30,30);
				});

				// carga de los otros perros cercanos
				var latOriginal = results[0].geometry.location.lat();
				var lngOriginal = results[0].geometry.location.lng();

				var perrosCercanos = [];

				$scope.perrosList.buscarPerrosCercanos(perro).then(function(result) {
					perrosCercanos = result;

					for (var i = 0; i < perrosCercanos.length; i++) {
						var p = perrosCercanos[i];

						if(p.foto){
							imageMarker.url = p.foto;
						}else{
							imageMarker.url = 'img/dog.png';
						}

						var tipo = p.tipo.substring(0, p.tipo.length - 1);

						var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
						var randomLat = parseFloat((Math.random() * (0.00900 - 0.02000) + 0.02000)) * plusOrMinus;
						plusOrMinus = Math.random() < 0.5 ? -1 : 1;
						var randomLng = parseFloat((Math.random() * (0.00900 - 0.02000) + 0.02000)) * plusOrMinus;

						var marker = new google.maps.Marker({
							position: new google.maps.LatLng(latOriginal + randomLat, lngOriginal + randomLng),
							map: map,
							icon: imageMarker,
							draggable:true,
							label: capitalizeFirstLetter(tipo),
							animation: google.maps.Animation.DROP,
							title: p.nombre
						});

						marker.addListener('mousedown', function(){
						  	this.getIcon().scaledSize = new google.maps.Size(80,80);
						});

						marker.addListener('mouseup', function(){
						  	this.getIcon().scaledSize = new google.maps.Size(30,30);
						});
					}
			   	});

			    $mdDialog.show({
					scope: $scope.$new(),
					contentElement: '#dialogMapa',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true
			    });
			});
	  	};

	  	$scope.retryAction = function(navActiveItem){
	  		if(navActiveItem === 'coincidencias'){
	  			$scope.coincidenciasList.loadCoincidencias();
	  		}else{
	  			getPerros(0,navActiveItem);
	  		}
	  	};

	  	$scope.verPublicacion = function(link){
	  		window.open(link, '_blank');
	  	};

	  	$scope.dialogCompararPerros = function(principal, coincidencia, ev){
	  		$mdDialog.show({
	  			locals:{
	  				data: {
		  				principal: principal,
		  				coincidencia: coincidencia
	  				}
	  			},
	  			controller: DialogCompararCtrl,
		      	templateUrl: '/partials/templates/dialogs/dialogCompararPerros.tmpl.html',
		      	parent: angular.element(document.body),
		      	targetEvent: ev,
		      	clickOutsideToClose:true,
		      	fullscreen: true,
		      	onComplete: function(scope, element){
			  		perrosService.getPerro(principal.id).then(function(result){
			  			scope.data.principalFullInfo = result.data;
			  		});

			  		perrosService.getPerro(coincidencia.id).then(function(result){
			  			scope.data.coincidenciaFullInfo = result.data;
			  		});
		      	}
		    });
	  	};

		function DialogCompararCtrl($scope, $mdDialog, data) {
			$scope.data = data;

			$scope.hide = function() {
				$mdDialog.hide();
			};

			$scope.cancel = function() {
				$mdDialog.cancel();
			};
		}

		DialogCompararCtrl.$inject = ['$scope', '$mdDialog', 'data'];

	    $scope.hide = function() {
	      	$mdDialog.hide();
	    };

	    $scope.cancel = function() {
	     	$mdDialog.cancel();
	    };
	    
	  	$scope.toggleFavorite = function(perro){
	  		var favorito = (perro.favorito==1) ? 0 : 1;
	  		perro.favorito = favorito;
  			perrosService.toggleFavorite(perro);
	  	};

	  	function getPerros(page, tipo) {
	  		$scope.errorFactory.message = null;
	  		angular.element(document.querySelector('#loading-spinner')).removeClass('hide');
	  		var searchModel = $scope.searchModel;
	  		searchModel.tipo = undefined;
	  		$scope.perrosList.deletePerrosByTipo(tipo);
	  		perrosService.getPerros(page, tipo, searchModel).then(
	  			function (response) {
		  			hideSpinner();
		   			cargarArregloPerros(response.data.perros, response.data.total, tipo);
		   		},
		   		function(){
		   			hideSpinner();
		   			$scope.errorFactory.message = 'Ha ocurrido un error al obtener los perros. Intente nuevamente';
		   		}
		   	);
	  	}

	  	function capitalizeFirstLetter(string) {
		    return string.charAt(0).toUpperCase() + string.slice(1);
		}

	  	function cargarArregloPerros(data, cantRegistros, tipo){
	  		for (var i = data.length - 1; i >= 0; i--) {
   				var perro = data[i];
   				var newPerro = PerroFactory.getPerro(tipo);
   				newPerro.id = perro.id;
   				newPerro.nombre = perro.nombre;
   				newPerro.telefono = perro.tel_contacto;
				newPerro.fecha = perro.fecha;
				newPerro.real_date = createDateFromString(newPerro.fecha);
				newPerro.foto = perro.foto;
				newPerro.lugar = perro.lugar;
				newPerro.raza = perro.raza;
				newPerro.sexo = perro.sexo;
				newPerro.duenio = perro.duenio;
				newPerro.has_collar = Boolean(perro.has_collar);
				newPerro.collar_detalle = perro.collar_detalle;
				newPerro.collar_color = perro.collar_color;
				newPerro.favorito = perro.favorito;
				newPerro.tags = perro.tags;
				newPerro.link_sitio = perro.link_sitio;
				$scope.perrosList.addPerro(newPerro);
   			}
   			$scope.perrosList.setTotalRegistros(cantRegistros, tipo);
	  	}

	  	function copyAttributes(perroOriginal, perro){
			perroOriginal.nombre = perro.nombre;
			perroOriginal.telefono = perro.telefono;
			perroOriginal.fecha = formattedDate(perro.fecha);
			perroOriginal.real_date = perro.real_date;
			perroOriginal.foto = perro.foto;
			perroOriginal.lugar = perro.lugar;
			perroOriginal.raza = perro.raza;
			perroOriginal.sexo = perro.sexo;
			perroOriginal.duenio = perro.duenio;
			perroOriginal.has_collar = Boolean(perro.has_collar);
			perroOriginal.collar_detalle = perro.collar_detalle;
			perroOriginal.collar_color = perro.collar_color;
			perroOriginal.tipo  = perro.tipo;
			perroOriginal.favorito = perro.favorito;
			perroOriginal.tags = perro.tags;
			perroOriginal.link_sitio = perro.link_sitio;
	  	}

	  	function getSearchModel(tipo){
	  		return $scope.searchModel;
	  	}

	  	$scope.goToPage = function(start, tipo){
	  		getPerros((start-1), tipo);
	  	};

	  	$scope.scrollTop = function(){
	  		document.body.scrollTop = 0;
	  	};

	  	function formattedDate(date) {
		   	return moment(date).format('DD/MM/YYYY');
		}

		function createDateFromString(str){
			var m = moment(str, 'DD/MM/YYYY', true);
			return m.toDate();
		}

		function hideSpinner(){
			angular.element(document.querySelector('#loading-spinner')).addClass('hide');
		}

	    var autocomplete = this;
	    autocomplete.simulateQuery = false;
	    autocomplete.isDisabled    = false;
	    autocomplete.lugar = '';
	    // list of `state` value/display objects
	    autocomplete.lugares       = loadAll();
	    autocomplete.querySearch   = querySearch;
	    autocomplete.selectedItemChange = selectedItemChange;
	    autocomplete.searchTextChange   = searchTextChange;
	    // ******************************
	    // Internal methods
	    // ******************************
	    /**
	     * Search for states... use $timeout to simulate
	     * remote dataservice call.
	     */
	    function querySearch (query) {
	      var results = query ? autocomplete.lugares.filter( createFilterFor(query) ) : autocomplete.lugares,
	          deferred;
	      if (autocomplete.simulateQuery) {
	        deferred = $q.defer();
	        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
	        return deferred.promise;
	      } else {
	        return results;
	      }
	    }
	    function searchTextChange(text) {
      		autocomplete.lugar = text;
	    }
	    function selectedItemChange(item) {
	    	if(item){
				autocomplete.lugar = item.value;
	    	}
	    }
	    /**
	     * Build `states` list of key/value pairs
	     */
	    function loadAll() {
	      var lugares = ["Buenos Aires","Abasto","Abbott","Acassuso","Acevedo","Adolfo Gonzales Chaves (Est. Chaves)","Adrogue","Aeropuerto Internacional Ezeiza","Aguas Verdes","Agustin Mosconi","Agustin Roca","Agustina","Alberdi Viejo","Alberti (Est. Andres Vaccarezza)","Aldo Bonzi","Alejandro Korn","Alejandro Petion","Alfredo Demarchi (Est. Facundo Quiroga)","Altamirano","Alto Los Cardales","Álvarez De Toledo","Alvarez Jonte","America","Andant","Angel Etcheverry","Antonio Carboni","Aparicio","Arana","Arboledas","Área Cinturon Ecologico","Area De Promocion El Triangulo","Arenas Verdes","Arenaza","Argerich","Ariel","Arrecifes","Arribeños","Arroyo Corto","Arroyo De La Cruz","Arroyo Dulce","Arroyo Venado","Arturo Segui","Ascension","Atalaya","Atlantida","Avellaneda","Ayacucho","Azcuenaga","Azopardo","Azul","Bahia Blanca","Bahia San Blas","Baigorrita","Bajo Hondo","Balcarce","Balneario Laguna De Gomez","Balneario Marisol","Balneario Orense","Balneario Pehuen Co","Balneario San Cayetano","Balneario Sauce Grande","Banderalo","Banfield","Baradero","Barker","Barrio America Unida","Barrio Banco Provincia","Barrio Belgrano","Barrio Colinas Verdes","Barrio El Boqueron","Barrio El Carmen (Este)","Barrio El Carmen (Oeste)","Barrio El Casal","Barrio El Coyunco","Barrio El Taladro","Barrio Gambier","Barrio Kennedy","Barrio La Gloria","Barrio Las Casuarinas","Barrio Las Golondrinas","Barrio Las Malvinas","Barrio Las Quintas","Barrio Los Bosquecitos","Barrio Los Pioneros","Barrio Parque Almirante Irizar (Ap. Kilometro 61)","Barrio Parque General San Martin","Barrio Parque Las Acacias","Barrio Rio Salado","Barrio Ruta 24 Kilometro 10","Barrio Saavedra","Barrio Santa Paula","Barrio Santa Rosa","Barrio Universitario","Barrios Lisandro De La Torre Y Santa Marta","Batan","Bayauca","Beccar","Belen De Escobar","Bella Vista","Bellocq","Benavidez","Benito Juarez (Est. Juarez)","Berazategui","Berazategui Oeste","Berdier","Berisso","Bermudez","Bernal","Bernal Oeste","Berutti","Billinghurst","Blancagrande","Blaquier","Blaquier","Bocayuva","Bordenave","Bosques","Boulogne Sur Mer","Bragado","Burzaco","Cabildo","Cachari","Cadret","Camet","Camet Norte","Campana","Campo De Mayo","Campos Salles","Canning","Canning","Cañada Seca","Cañuelas","Capilla Del Señor (Est. Capilla)","Capitan Castro","Capitan Sarmiento","Carapachay","Cardenal Cagliero","Carhue","Carilo","Carlos Beguerie","Carlos Casares","Carlos Keen","Carlos Maria Naon","Carlos Salas","Carlos Spegazzini","Carlos Tejedor","Carlos Tomas Sourigues","Carmen De Areco","Carmen De Patagones","Casalins","Casbas","Cascadas","Caseros","Castelar","Castelli","Castilla","Cazon","Centro Guerrero","Chacabuco","Chacras De San Clemente","Chapadmalal","Chascomus","Chascomus Country Club","Chasico","Chiclana","Chillar","Chivilcoy","Churruca","City Bell","Ciudad Evita","Ciudad Jardin El Libertador","Ciudad Jardin Lomas Del Palomar","Ciudadela","Claraz","Claromeco","Claypole","Club De Campo Larena - Los Quinchos","Colon","Colonia Hinojo","Colonia Mauricio","Colonia Nievas","Colonia San Adolfo","Colonia San Martin","Colonia San Miguel","Colonia San Miguel Arcangel","Colonia San Ricardo (Est. Iriarte)","Colonia Sere","Comandante Nicanor Otamendi","Comodoro Py","Conesa","Copetonas","Coronel Boerr","Coronel Brandsen","Coronel Charlone","Coronel Dorrego","Coronel Martinez De Hoz (Ap. Kilometro 322)","Coronel Pringles (Est. Pringles)","Coronel Segui","Coronel Suarez","Coronel Vidal","Cortines","Costa Bonita","Country Club Bosque Real - Barrio Morabo","Country Club El Casco","Country Club El JagÜEL","Country Club El Rodeo","Country Club Las Praderas","Country Los Medanos","Crotto","Crucesita","Cuartel V","Cucullu","Cura Malal","Curaru","Daireaux","Darregueira","De Bary","De La Canal","De La Garma","Del Carril","Del Valle","Del Viso","Del Viso","Delfin Huergo","Desvio Aguirre","Diego Gaynor","Dique Lujan","Dique N 1","Dock Sud","Dolores","Domselaar","Don Bosco","Don Orione","Don Torcuato Este","Don Torcuato Oeste","D'Orbigny","Dudignac","Dufaur","Duggan","Dunamar","El Arbolito","El Cazador","El Divisorio","El Dorado","El JagÜEL","El Libertador","El Marquesado","El Palomar","El Paraiso","El Pato","El Pensamiento","El Perdido (Est. Jose A. Guisasola)","El Remanso","El Retiro","El Talar","El Trigo","El Triunfo","Elvira","Emilio Ayarza","Emilio V. Bunge","Ensenada","Erezcano","Ernestina","Escalada","Escobar","Espartillar","Espartillar","Espigas","Ezeiza","Estacion Arenales","Estacion Camet","Estacion Chapadmalal","Estanislao Severo Zeballos","Esteban Agustin Gascon","Esteban Echeverria","Estela","Ezpeleta","Ezpeleta Oeste","Faro","Fatima","Felipe Sola","Ferre","Florencio Varela","Florentino Ameghino","Florida","Florida Oeste","Fontezuela","Fortin Acha","Fortin Olavarria","Fortin Tiburcio","Francisco Alvarez","Francisco Madero","Franklin","Frente Mar","Gahan","Gardey","Garin","Garre","General Alvear","General Arenales","General Belgrano","General Conesa","General Daniel Cerri (Est. General Cerri)","General Guido","General Hornos","General Juan Madariaga","General La Madrid","General Las Heras (Est. Las Heras)","General Lavalle","General Mansilla (Est. Bartolome Bavio)","General O'Brien","General Pacheco","General Pinto","General Piran","General Rivas","General Rodriguez","General Rojo","General San Martin","General Villegas (Est. Villegas)","Gerli","Gerli","Germania (Est. Mayor Jose Orellano)","Girodias","Glew","Gobernador Castro","Gobernador Julio A. Costa","Gobernador Udaondo","Gobernador Ugarte","Gomez","Gonzalez Catan","Gonzalez Moreno","Gorchs","Gorostiaga","Gowland","Goyena","Grand Bourg","Gregorio De Laferrere","GrÜNBEIN","Guamini","Guernica","Guerrico","Guillermo Enrique Hudson","Haedo","Hale","Henderson","Herrera Vegas","Hilario Ascasubi","Hinojo","Hortensia","Huanguelen","Hurlingham","Ignacio Correas","Indio Rico","Ines Indart","Ingeniero Adolfo Sourdeaux","Ingeniero Juan Allan","Ingeniero Maschwitz","Ingeniero Pablo Nogues","Ingeniero Thompson","Ingeniero White","Irala","Irene","Irineo Portela","Isidro Casanova","Isla Santiago (Oeste)","Ituzaingo Centro","Ituzaingo Sur","Jeppener","Joaquin Gorina","Jose B. Casas","Jose C. Paz","Jose Hernandez","Jose Ingenieros","Jose Juan Almeyra","Jose Maria Ezeiza","Jose Maria Jauregui (Est. Jauregui)","Jose Marmol","Jose Melchor Romero","Juan A. De La Peña","Juan A. Pradere","Juan Anchorena (Est. Urquiza)","Juan Bautista Alberdi (Est. Alberdi)","Juan Couste (Est. Algarrobo)","Juan E. Barra","Juan F. Ibarra","Juan Jose Paso","Juan Maria Gutierrez","Juan N. Fernandez","Junin","La Angelita","La Armonia","La Aurora (Est. La Niña)","La Baliza","La Beba","La Caleta","La Capilla","La Carreta","La Choza","La Colina","La Constancia","La Cumbre","La Delfina","La Emilia","La Invencible","La Larga","La Limpia","La Lonja","La Lucila","La Luisa","La Manuela","La Matanza","La Pala","La Plata","La Reja","La Rica","La Sofia","La Tablada","La Trinidad","La Union","La Violeta","Labarden","Laguna Alsina (Est. Bonifacio)","Laguna De Lobos","Lanus Este","Lanus Oeste","Laplacette","Laprida","Lartigau","Las Armas","Las Bahamas","Las Carabelas","Las Flores","Las Marianas","Las Martinetas","Las Tahonas","Las Toninas","Las Toscas","Leandro N. Alem","Lezica Y Torrezuri","Libano","Libertad","Licenciado Matienzo","Lima","Lin Calel","Lincoln","Lisandro Olmos","Llavallol","Loberia","Lobos","Loma Hermosa","Loma Verde","Loma Verde","Lomas De Copello","Lomas De Zamora","Lomas Del Mirador","Lomas Del Rio Lujan (Est. Rio Lujan)","Longchamps","Lopez","Lopez Lecube","Los Angeles","Los Cachorros","Los Cardales","Los Hornos","Los Indios","Los Naranjos","Los Pinos","Los Polvorines","Los Talas","Los Toldos","Los Troncos Del Talar","Lozano","Lucas Monteverde","Lucila Del Mar","Luis Guillon","Lujan","Magdala","Magdalena","Maipu","Malvinas Argentinas","Malvinas Argentinas","Manuel B. Gonnet","Manuel B. Gonnet (Est. French)","Manuel J. Cobo (Est. Lezama)","Manuel Ocampo","Manzanares","Manzone","Maquinista F. Savio Este","Maquinista F. Savio Oeste","Mar Azul","Mar Chiquita","Mar De Ajo","Mar De Ajo Norte","Mar De Cobo","Mar De Las Pampas","Mar Del Plata","Mar Del Sur","Mar Del Tuyu","Marcelino Ugarte (Est. Dennehy)","Marcos Paz","Maria Ignacia (Est. Vela)","Mariano Acosta","Mariano Benitez","Mariano H. Alfonzo (Est. San Patricio)","Mariano Unzue","Martin Coronado","Martinez","Massey (Est. Elordi)","Matheu","Mauricio Hirsch","Maximo Fernandez (Est. Juan F. Salaberry)","Maximo Paz","Mayor Buratovich","Maza","Mechita","Mechita (Est. Mecha)","Mechongue","Medanos","Mercedes","Merlo","Micaela Cascallares (Est. Cascallares)","Ministro Rivadavia","Mira Pampa","Miramar","Moctezuma","Mones Cazon","Monte Chingolo","Monte Grande","Monte Hermoso","Moquehua","Morea","Moreno","Moron","Morse","Munro","Muñiz","Napaleofu","Navarro","Necochea","Nicanor Olivera (Est. La Dulce)","Norberto De La Riestra","Norumbega","Nueva Plata","Obligado","Ochandio","O'Higgins","Olascoaga","Olavarria","Oliden","Olivera","Olivos","Open Door","Ordoqui","Orense","Oriente","Ostende","Pablo Podesta","Parada Orlando","Parada Robles","Parada Robles - Pavon","Pardo","Pasman","Paso Del Rey","Pasteur","Patricios","Paula","Pavon","Pavon","Pearson","Pedernales","Pedro Luro","Pehuajo","Pellegrini","Pereyra","Perez Millan","Pergamino","Pichincha","Piedritas","Pieres","PigÜE","Pila","Pilar","Pinamar","Pinzon","Piñeyro","Pipinas","Pirovano","Pla","Platanos","Playa Dorada","Plomer","Polvaredas","Pontaut","Pontevedra","Porvenir","Presidente Derqui","Presidente Peron","Puan","Pueblo Doyle","Pueblo Gouin","Pueblo Nuevo","Pueblo San Jorge","Puerto Parana","Punta Alta (Est. Almirante Solier)","Punta Indio","Punta Lara","Punta Mogotes","Quenuma","Quequen","Quilmes","Quilmes Oeste","Rafael Calzada","Rafael Castillo","Rafael Obligado","Ramallo","Ramon Biaus","Ramon Santamarina","Ramos Mejia","Ramos Otero","Rancagua","Ranchos","Ranelagh","Rauch","Rawson","Recalde","Remedios De Escalada","Remedios Escalada De San Martin","Reta","Ricardo Rojas","Rincon De Milberg","Ringuelet","Rio Tala","Rivera","Roberto Cano","Roberto De Vicenzo","Roberto J. Payro","Roberts","Rojas","Roosevelt","Roque Perez","Rufino De Elizalde","Ruta Sol","Saavedra","Saenz Peña","Saforcada","Saladillo","Salazar","Saldungaray","Salliquelo","Salto","Salvador Maria","Samborombon","San Agustin","San Andres De Giles","San Antonio De Areco","San Antonio De Padua","San Bernardo","San Bernardo (Est. Guanaco)","San Carlos De Bolivar (Est. Bolivar)","San Cayetano","San Clemente Del Tuyu","San Emilio","San Enrique","San Fernando","San Francisco De Bellocq","San Francisco Solano","San Francisco Solano","San German","San Isidro","San Jose","San Jose","San Justo","San Manuel","San Mauricio","San Mayol","San Miguel","San Miguel Del Monte (Est. Monte)","San Nicolas De Los Arroyos","San Pedro","San Roman","San Sebastian","San Vicente","Sansinena","Santa Clara Del Mar","Santa Coloma","Santa Elena","Santa Eleodora","Santa Lucia","Santa Luisa","Santa Maria","Santa Regina","Santa Rosa","Santa Teresa","Santa Teresita","Santa Trinidad","Santo Domingo","Santos Lugares","Sarandi","Sarasa","Sevigne","Sierra Chica","Sierra De La Ventana","Sierra De Los Padres","Sierras Bayas","Smith","Sol De Mayo","Solanet","Solis","Stroeder","Suipacha","Sundblad","Tamangueyu","Tandil","Tapalque","Tapiales","Tedin Uriburu","Temperley","Teniente Origone","Thames","Tigre","Timote","Todd","Tolosa","Tomas Jofre","Tornquist","Torres","Tortuguitas","Tortuguitas","Tortuguitas","Transradio","Trenque Lauquen","Tres Algarrobos (Est. Cuenca)","Tres Arroyos","Tres De Febrero","Tres Lomas","Tres Picos","Tres Sargentos","Tristan Suarez","Tronge","Trujui","Turdera","Udaquiola","Urdampilleta","Uribelarrea","Valdes","Valentin Alsina","Valeria Del Mar","Vasquez","Vedia","Velloso","Veronica","Vicente Casares","Vicente Lopez","Victoria","Vieytes","Villa  Eduardo Madero","Villa Adelina","Villa Adelina","Villa Alfredo Fortabat","Villa Alsina (Est. Alsina)","Villa Angelica (Est. El Socorro)","Villa ArgÜELLO","Villa Arrieta","Villa Astolfi","Villa Ayacucho","Villa Ballester","Villa Bernardo Monteagudo","Villa Bordeau","Villa Bosch (Est. Juan Maria Bosch)","Villa Brown","Villa Cacique (Est. Alfredo Fortabat)","Villa Campi","Villa Canto","Villa Castelar (Est. Erize)","Villa Catela","Villa Centenario","Villa Chacabuco","Villa Coronel Jose M. Zapiola","Villa De Mayo","Villa Del Mar","Villa Dolores","Villa Dominico","Villa Elisa","Villa Elvira","Villa España","Villa Esperanza","Villa Espil","Villa Espora","Villa Fiorito","Villa Flandria Norte","Villa Flandria Sur","Villa Francia (Est. Coronel Granada)","Villa Garibaldi","Villa General Antonio J. De Sucre","Villa General Arias (Est. Kilometro 638)","Villa General Eugenio Necochea","Villa General Fournier (Est. 9 De Julio Sud)","Villa General Jose Tomas Guido","Villa General Juan G. Las Heras","Villa General Savio (Est. Sanchez)","Villa Gesell","Villa Gobernador Udaondo","Villa Godoy Cruz","Villa Granaderos De San Martin","Villa Gregoria Matorras","Villa Grisolia (Est. Achupallas)","Villa Hermosa","Villa Independencia","Villa Iris","Villa Jose Leon Suarez","Villa Juan Martin De Pueyrredon","Villa La Arcadia","Villa La Florida","Villa La Serrania","Villa Laguna La Brava","Villa Las Encadenadas","Villa Lia","Villa Libertad","Villa Luzuriaga","Villa Lynch","Villa Lynch Pueyrredon","Villa Maipu","Villa Manuel Pomar","Villa Margarita","Villa Madero","Villa Maria","Villa Maria Irene De Los Remedios De Escalada","Villa Marques Alejandro Maria De Aguado","Villa Martelli","Villa Moll (Est. Moll)","Villa Montoro","Villa Nueva","Villa Ortiz (Est. Coronel Mom)","Villa Parque Cecir","Villa Parque Girado","Villa Parque Presidente Figueroa Alcorta","Villa Parque San Lorenzo","Villa Parque Sicardi","Villa Porteña","Villa Progreso","Villa Raffo","Villa Ramallo","Villa Riccio","Villa Roch","Villa Rodriguez (Est. Barrow)","Villa Rosa","Villa Roth (Est. Ingeniero Balbin)","Villa Ruiz","Villa Saboya","Villa San Andres","Villa San Carlos","Villa San Jose","Villa San Luis","Villa Santa Rosa","Villa Santos Tesei","Villa Sarmiento","Villa Sauze","Villa Serrana La Gruta","Villa Vatteone","Villa Ventana","Villa Yapeyu","Villa Zula","Villalonga","Villanueva  (Ap. Rio Salado)","Villars","Viña","Virrey Del Pino","Virreyes","Vivorata","Warnes","Wilde","William C. Morris","Yutuyaco","Zarate","Zavalia","Zelaya","Zenon Videla Dorna","Zona Aeropuerto Internacional Ezeiza","11 De Septiembre","12 De Octubre","16 De Julio","17 De Agosto","20 De Junio","25 De Mayo","30 De Agosto","9 De Abril","9 De Julio","Catamarca","Aconquija","Adolfo E. Carranza","Alijilan","Alto De Las Juntas","Amadores","Amanao","Ancasti","Andalgala","Andalhuala","Anillaco","Anquincila","Antinaco","Antofagasta De La Sierra","Antofalla","Apoyaco","Balde De La Punta","Banda De Lucero","Bañado De Ovanta","Barranca Larga","Barrio Bancario","Belen","Buena Vista","Capayan","Casa De Piedra","Casa De Piedra","Caspichango","Cerro Negro","Chañar Punco","Chaquiago","Choya","Chuchucaruana","Chumbicha","Colana","Collagasta","Colonia Del Valle","Colonia Nueva Coneta","Colpes","Colpes","Concepcion","Condor Huasi","Coneta","Copacabana","Cordobita","Corral Quemado","Costa De Reyes","El Alamito","El Alamito","El Alto","El Aybal","El Bañado","El Bañado","El Bañado","El Bolson","El Cajon","El Cerrito","El Desmonte","El Divisadero","El Durazno","El Hueco","El Lindero","El Pajonal (Est. Poman)","El Pantanillo","El Peñon","El Portezuelo","El Potrero","El Pueblito","El Puesto","El Puesto","El Quimilo","El Rodeo","El Rosario","El Salado","Esquiu","Famatanca","Farallon Negro","Fiambala","Fuerte Quemado","Guayamba","Hualfin","Huaycama","Huaycama","Huillapima","Icaño","Infanzon","Jacipunco","Joyango","La Aguada","La Bajada","La Candelaria","La Carrera","La Dorada","La Falda De San Antonio","La Guardia","La Higuera","La Hoyada","La Loma","La Majada","La Merced","La Mesada","La Puerta","La Puntilla","La Puntilla","La Puntilla","La Ramadita","La Tercena","La Viña","Lampacito","Las Cañas","Las Chacritas","Las Esquinas","Las Juntas","Las Juntas","Las Lajas","Las Mojarras","Las Palmitas","Las Tejas","Lavalle","Londres","Loro Huasi","Los Altos","Los Angeles","Los Balverdis","Los Castillos","Los Corrales","Los Nacimientos","Los Nacimientos","Los Talas","Los Varela","Manantiales","Medanitos","Medanitos","Miraflores","Monte Potrero","Mutquin","Palo Blanco","Palo Labrado","Palo Seco","Pampa Blanca","Polcos","Poman","Pomancillo Este","Pomancillo Oeste","Pozo Del Mistol","Puerta De Corral Quemado","Puerta De San Jose","Punta De Balasto","Punta Del Agua","Quiros","Ramblones","Recreo","Rincon","S. F. Del V. De Catamarca","San Antonio","San Antonio","San Antonio","San Isidro","San Jose","San Jose","San Jose Banda","San Jose Norte","San Jose Villa","San Martin","San Miguel","San Pablo","San Pedro","San Pedro","Santa Cruz","Santa Maria","Santa Rosa","Saujil","Saujil","Sijan","Singuil","Sumalao","Tapso","Taton","Tinogasta","Vilisman","Villa De Balcozna","Villa Dolores","Villa Las Pirquitas","Villa Vil","Yapes","Chaco","Avia Terai","Barranqueras","Barrio De Los Pescadores","Basail","Campo Largo","Capitan Solari","Charadai","Charata","Chorotis","Ciervo Petiso","Colonia Aborigen","Colonia Baranda","Colonia Benitez","Colonia Elisa","Colonia Popular","Colonias Unidas","Concepcion Del Bermejo","Coronel Du Graty","Corzuela","Cote Lai","El Espinillo","El Sauzal","El Sauzalito","Enrique Urien","Estacion Estacion General Obligado","Fontana","Fortin Las Chuñas","Fortin Lavalle","Fuerte Esperanza","Gancedo","General Capdevila","General Jose De San Martin","General Pinedo","General Vedia","Haumonia","Hermoso Campo","Horquilla","Ingeniero Barbet","Isla Del Cerrito","Itin","Juan Jose Castelli","La Clotilde","La Eduvigis","La Escondida","La Leonesa","La Sabana","La Tigra","La Verde","Laguna Blanca","Laguna Limpia","Lapachito","Las Breñas","Las Garcitas","Las Palmas","Los Frentones","Machagai","Makalle","Margarita Belen","Meson De Fierro","Miraflores","Napalpi","Napenay","Nueva Pompeya","Pampa Almiron","Pampa Del Indio","Pampa Del Infierno","Pampa Landriel","Presidencia De La Plaza","Presidencia Roca","Presidencia Roque Saenz Peña","Puerto Bermejo Nuevo","Puerto Bermejo Viejo","Puerto Eva Peron","Puerto Lavalle","Puerto Tirol","Puerto Vilelas","Quitilipi","Resistencia","Rio Muerto","Samuhu","San Bernardo","Santa Sylvina","Selvas Del Rio De Oro","Taco Pozo","Tres Isletas","Venados Grandes","Villa Angela","Villa Berthet","Villa El Palmar","Villa Rio Bermejito","Wichi","Zaparinqui","Chubut","Acceso Norte","Aldea Apeleg","Aldea Beleiro","Aldea Epulef","Aldea Escolar","Alto Rio Senguer","Arroyo Verde","Astra","Bahia Bustamante","Barrio Caleta Cordova","Barrio Caleta Olivares","Barrio Castelli","Barrio Ciudadela","Barrio Gasoducto","Barrio GÜEMES","Barrio Laprida","Barrio Manantial Rosales","Barrio Militar - Aeropuerto Militar","Barrio Prospero Palazzo","Barrio Restinga Ali","Barrio Rodriguez Peña","Barrio Saavedra","Barrio Sarmiento","Barrio Villa S.U.P.E.","Barrio 25 De Mayo","Blancuntre","Buen Pasto","Buenos Aires Chico","Camarones","Carrenleufu","Cerro Condor","Cholila","Colan Conhue","Comodoro Rivadavia","Corcovado","Cushamen Centro","Diadema Argentina","Dique Florentino Ameghino","Doctor Ricardo Rojas","Dolavon","El Escorial","El Hoyo","El Maiten","El Mirasol","Epuyen","Esquel","Facundo","Frontera De Rio Pico","Gaiman","Gan Gan","Garayalde","Gastre","Gobernador Costa","Gualjaina","Jose De San Martin","Km. 11 - Cuarteles","Km. 3 - General Mosconi","Km. 5 - Presidente Ortiz","Km. 8 - Don Bosco","Lago Blanco","Lago Epuyen","Lago Puelo","Lago Rosario","Lagunita Salada","Las Plumas","Leleque","Los Altares","Los Cipreses","Paso De Indios","Paso Del Sapo","Playa Magagna","Playa Union","Puerto Madryn","Puerto Piramide","Puerto Rawson","Quinta El Mirador","Rada Tilly","Rawson","Rio Mayo","Rio Pico","Sarmiento","Tecka","Telsen","Trelew","Trevelin","Villa Futalaufquen","Yala Laubat","28 De Julio","Ciudad Autonoma De Bs As","Agronomia","Almagro","Balvanera","Barracas","Belgrano","Boedo","Caballito","Chacarita","Coghlan","Colegiales","Constitucion","Flores","Floresta","La Boca","Liniers","Mataderos","Monserrat","Monte Castro","Nueva Pompeya","Nuñez","Palermo","Parque Avellaneda","Parque Chacabuco","Parque Chas","Parque Patricios","Paternal","Puerto Madero","Recoleta","Retiro","Saavedra","San Cristobal","San Nicolas","San Telmo","Velez Sarsfield","Versalles","Villa Crespo","Villa Del Parque","Villa Devoto","Villa Gral Mitre","Villa Lugano","Villa Luro","Villa Ortuzar","Villa Pueyrredon","Villa Real","Villa Riachuelo","Villa Santa Rita","Villa Soldati","Villa Urquiza","Cordoba","Achiras","Adelia Maria","Agua De Oro","Alcira (Est. Gigena)","Aldea Santa Maria","Alejandro Roca (Est. Alejandro)","Alejo Ledesma","Alicia","Almafuerte","Alpa Corral","Alta Gracia","Alto Alegre","Alto De Los Quebrachos","Alto Resbaloso - El Barrial","Altos De Chipion","Amboy","Ambul","Ana Zumaran","Anisacate","Arias","Arroyito","Arroyo Algodon","Arroyo Cabral","Arroyo Los Patos","Arroyo San Antonio","Ascochinga","Assunta","Atahona","Ausonia","Avellaneda","Ballesteros","Ballesteros Sur","Balnearia","Bañado De Soto","Barrio Gilbert","Barrio Las Quintas","Barrio Santa Isabel","Barrio Villa Del Parque","Bell Ville","Bengolea","Benjamin Gould","Berrotaran","Bialet Masse","Bouwer","Brinkmann","Bulnes","Cabalango","Calchin","Calchin Oeste","Camilo Aldao","Caminiaga","Canals","Candelaria Sur","Canteras El Sauce","Canteras Quilpo","Cañada De Luque","Cañada De Machado","Cañada De Rio Pinto","Cañada Del Sauce","Capilla De Los Remedios","Capilla De Siton","Capilla Del Carmen","Capilla Del Monte","Capilla Vieja","Capitan General Bernardo O Higgins","Carnerillo","Carrilobo","Casa Bamba","Casa Grande","Caseros Centro","Cavanagh","Cerro Colorado","Cerro Colorado","Cerro Colorado","Chajan","Chalacea","Chancani","Chañar Viejo","Charbonier","Charras","Chazon","Chilibroste","Chucul","Chuña","Chuña Huasi","Churqui Cañada","Cienaga Del Coro","Cintra","Colazo","Colonia Almada","Colonia Anita","Colonia Barge","Colonia Bismarck","Colonia Bremen","Colonia Caroya","Colonia Italiana","Colonia Las Cuatro Esquinas","Colonia Las Pichanas","Colonia Marina","Colonia Prosperidad","Colonia San Bartolome","Colonia San Pedro","Colonia Santa Maria","Colonia Tirolesa","Colonia Valtelina","Colonia Veinticinco","Colonia Vicente AgÜERO","Colonia Videla","Colonia Vignaud","Colonia 10 De Julio","Conlara","Copacabana","Cordoba","Coronel Baigorria","Coronel Moldes","Corral De Bustos","Corral Quemado","Corralito","Corralito","Cosquin","Costa Azul","Costasacate","Country Chacras De La Villa","Country San Isidro","Cruz Alta","Cruz Caña","Cruz De Caña","Cruz Del Eje","Cuesta Blanca","Dalmacio Velez","Dean Funes","Del Campillo","Despeñaderos (Est. Dr. Lucas A. De Olmos)","Devoto","Diego De Rojas","Dique Chico","Dos Arroyos","Dumesnil","El Alcalde (Est. Tala Norte)","El Arañado","El Brete","El Chacho","El Corcovado - El Torreon","El Crispin","El Diquecito","El Fortin","El Fuertecito","El Huayco","El Manzano","El Pantanillo","El Pueblito","El Pueblito","El Rastreador","El Rincon","El Rodeo","El Tio","El Tuscal","El Valle","Elena","Embalse","Esquina","Esquina Del Alambre","Estacion Colonia Tirolesa","Estacion Lecueder","Estacion Luxardo","Estancia De Guadalupe","Estancia Vieja","Etruria","Eufrasio Loza","Falda Del Cañete","Falda Del Carmen","Freyre","General Baldissera","General Cabrera","General Deheza","General Fotheringham","General Levalle","General Paz","General Roca","Guanaco Muerto","Guasapampa","Guatimozin","GÜTEMBERG","Hernando","Hipolito Bouchard","Huanchillas","Huerta Grande","Huinca Renanco","Idiazabal","Impira","Inriville","Isla Verde","Italo","James Craik","Jardin Arenales","Jesus Maria","Jose De La Quintana","Juarez Celman","Justiniano Posse","Kilometro 658","Laferrere","La Banda","La Batea","La Boca Del Rio","La Calera","La Carbonada","La Carlota","La Carolina","La Cautiva","La Cesira","La Cortadera","La Cruz","La Cumbre","La Cumbrecita","La Cumbrecita","La Falda","La Floresta","La Francia","La Gilda","La Granja","La Higuera","La Laguna","La Paisanita","La Palestina","La Pampa","La Paquita","La Para","La Paz","La Paz","La Perla","La Playa","La Playosa","La Poblacion","La Posta","La Puerta","La Puerta","La Quinta","La Ramada","La Rancherita","La Rinconada","La Serranita","La Tordilla","La Travesia","Laborde","Laboulaye","Laguna Larga","Las Acequias","Las Albahacas","Las Arrias","Las Bajadas","Las Caleras","Las Calles","Las Cañadas","Las Chacras","Las Chacras","Las Gramillas","Las Higueras","Las Isletillas","Las Jarillas","Las Junturas","Las Mojarras","Las Oscuras","Las Palmas","Las Peñas","Las Peñas","Las Perdices","Las Playas","Las Rabonas","Las Saladas","Las Tapias","Las Varas","Las Varillas","Las Vertientes","Leguizamon","Leones","Loma Bola","Los Callejones","Los Cedros","Los Cerrillos","Los Chañaritos","Los Chañaritos","Los Chañaritos","Los Cisnes","Los Cocos","Los Condores","Los Hornillos","Los Hoyos","Los Mistoles","Los Molinos","Los Molles","Los Molles","Los Pozos","Los Reartes","Los Romeros","Los Surgentes","Los Talares","Los Zorros","Lozada","Luca","Lucio V. Mansilla","Luque","Lutti","Luyaba","Malagueño","Malena","Mallin","Malvinas Argentinas","Manfredi","Maquinista Gallini","Marcos Juarez","Marull","Matorrales","Mattaldi","Mayu Sumaj","Media Naranja","Melo","Mendiolaza","Mi Granja","Mi Valle","Mina Clavero","Miramar","Monte Buey","Monte De Los Gauchos","Monte Del Rosario","Monte Leña","Monte Maiz","Monte Ralo","Monte Ralo","Montecristo","Morrison","Morteros","Mussi","Nicolas Bruzzone","Noetinger","Noetinger","Nono","Obispo Trejo","Olaeta","Oliva","Olivares De San Nicolas","Onagoity","Oncativo","Ordoñez","Pacheco De Melo","Pajas Blancas","Pampayasta Norte","Pampayasta Sur","Panaholma","Parque Calmayo","Parque Norte","Pascanas","Pasco","Paso Del Durazno","Paso Del Durazno","Paso Viejo","Pilar","Pincen","Piquillin","Plaza De Mercedes","Plaza Luxardo","Plaza San Francisco","Porteña","Potrero De Garay","Pozo Del Molle","Pozo Nuevo","Pueblo Comechingones","Pueblo Italiano","Puesto De Castro","Punta Del Agua","Quebracho Herrado","Quebracho Ladeado","Quebrada De Los Pozos","Quebrada De Luna","Quilino","Rafael Garcia","Ramon J. Carcano","Ranqueles","Rayo Cortado","Rincon","Rio Bamba","Rio Ceballos","Rio Cuarto","Rio De Los Sauces","Rio Primero","Rio Segundo","Rio Tercero","Rosales","Rosario Del Saladillo","Sacanta","Sagrada Familia","Saira","Saladillo","Saldan","Salsacate","Salsipuedes","Sampacho","San Agustin","San Antonio De Arredondo","San Antonio De Litin","San Basilio","San Carlos Minas","San Clemente","San Esteban","San Francisco","San Francisco Del Chañar","San Geronimo","San Huberto","San Ignacio (Loteo San Javier)","San Ignacio (Loteo Velez Crespo)","San Javier Y Yacanto","San Joaquin","San Jose","San Jose De La Dormida","San Jose De Las Salinas","San Lorenzo","San Marcos","San Marcos Sierra","San Martin","San Nicolas","San Pedro","San Pedro De GÜTEMBERG","San Pedro De Toyos","San Pedro Norte","San Roque","San Severo","San Vicente","Sanabria","Santa Catalina","Santa Catalina (Est. Holmberg)","Santa Elena","Santa Elena","Santa Eufemia","Santa Magdalena (Est. Jovita)","Santa Maria De Punilla","Santa Monica","Santa Rosa De Calamuchita","Santa Rosa De Rio Primero (Est. Villa Santa Rosa)","Santiago Temple","Sarmiento","Saturnino Maria Laspiur","Sauce Arriba","Sebastian Elcano","Seeber","Segunda Usina","Serrano","Serrezuela","Silvio Pellico","Simbolar","Sinsacate","Socavones","Solar De Los Molinos","Suco","Tala Cañada","Tala Huasi","Talaini","Tancacha","Taninga","Tanti","Tasna","Ticino","Tinoco","Tio Pujio","Toledo","Toro Pujio","Tosno","Tosquitas","Transito","Trinchera","Tuclame","Ucacha","Unquillo","Valle Alegre","Valle De Anisacate","Valle Hermoso","Viamonte","Vicuña Mackenna","Villa  La Bolsa","Villa  Los Aromos","Villa Albertina","Villa Allende","Villa Alpina","Villa Amancay","Villa Ascasubi","Villa Berna","Villa Candelaria Norte","Villa Carlos Paz","Villa Cerro Azul","Villa Ciudad De America (Loteo Diego De Rojas)","Villa Ciudad Parque Los Reartes (1A. Seccion)","Villa Ciudad Parque Los Reartes (3A. Seccion)","Villa Concepcion Del Tio","Villa Cura Brochero","Villa De Las Rosas","Villa De Maria","Villa De Pocho","Villa De Soto","Villa Del Dique","Villa Del Prado","Villa Del Rosario","Villa Del Totoral","Villa Del Transito","Villa Dolores","Villa El Chacay","Villa El Fachinal","Villa El Tala","Villa Elisa","Villa Flor Serrana","Villa Fontana","Villa General Belgrano","Villa Giardino","Villa Gutierrez","Villa Huidobro (Est. Cañada Verde)","Villa La Donosa","Villa La Rivera","Villa La Viña","Villa Lago Azul","Villa Los Llanos","Villa Los Patos","Villa Maria","Villa Nueva","Villa Oeste","Villa Parque Santa Ana","Villa Parque Siquiman","Villa Quilino","Villa Quillinzo","Villa Reduccion","Villa Rio Icho Cruz","Villa Rossi","Villa Rumipal","Villa San Esteban","Villa San Isidro","Villa San Jose","Villa San Miguel","Villa Santa Cruz Del Lago","Villa Santa Eugenia","Villa Sarmiento","Villa Sarmiento","Villa Sierras De Oro","Villa Tulumba","Villa Valeria","Villa Yacanto","Washington","Wenceslao Escalante","Yocsina","Corrientes","Alvear","Barrio Esperanza","Bella Vista","Beron De Astrada","Bonpland","Cazadores Correntinos","Chavarria","Colonia Carlos Pellegrini","Colonia Carolina","Colonia Libertad","Colonia Liebig'S","Colonia Pando","Concepcion","Corrientes","Cruz De Los Milagros","Curuzu Cuatia","El Sombrero","Empedrado","Esquina","Estacion Libertad","Estacion Torrent","Felipe Yofre","Garruchos","Gobernador Igr. Valentin Virasoro","Gobernador Juan E. Martinez","Goya","Guaviravi","Ingenio Primer Correntino","Ita Ibate","Itati","Ituzaingo","Jose Rafael Gomez (Garabi)","Juan Pujol","La Cruz","Laguna Brava","Lavalle","Lomas De Vallejos","Loreto","Mariano I. Loza (Est. Justino Solari)","Mburucuya","Mercedes","Mocoreta","Monte Caseros","Nuestra Señora Del Rosario De Caa Cati","Palmar Grande","Parada Acuña","Parada Pucheta","Paso De La Patria","Paso De Los Libres","Pedro R. Fernandez (Est. Manuel F. Mantilla)","Perugorria","Ramada Paso","Riachuelo","Saladas","San Antonio","San Carlos","San Cayetano","San Cosme","San Lorenzo","San Luis Del Palmar","San Miguel","San Roque","Santa Ana","Santa Lucia","Santa Rosa","Santo Tome","Sauce","Tabay","Tapebicua","Villa Cordoba","Villa Olivari","Yahape","Yapeyu","9 De Julio (Est. Pueblo 9 De Julio)","Entre Rios","Aldea Asuncion","Aldea Brasilera","Aldea Maria Luisa","Aldea Protestante","Aldea Salto","Aldea San Antonio","Aldea San Francisco","Aldea San Juan","Aldea San Rafael","Aldea Santa Maria","Aldea Santa Rosa","Aldea Spatzenkutter","Aldea Valle Maria","Altamirano Sur","Antelo","Aranguren","Arroyo Baru","Arroyo Martinez","Basavilbaso","Benito Legeren","Betbeder","Bovril","Calabacilla","Caseros","Ceibas","Cerrito","Chajari","CharigÜE","Clodomiro Ledesma","Colon","Colonia Alemana","Colonia Avellaneda","Colonia Avigdor","Colonia Ayui","Colonia Elia","Colonia Ensanche Sauce","Colonia Ensayo","Colonia General Roca","Colonia Hugues","Colonia La Argentina","Colonia Peña","Colonia Santa Maria","Colonia Yerua","Concepcion Del Uruguay","Concordia","Conscripto Bernardi","Crespo","Diamante","Don Cristobal","Durazno","El Brillante","El Cimarron","El Colorado","El Palenque","El Pingo","El Redomon","El Solar","Enrique Carbo","Estacion Arroyo Cle","Estacion Camps","Estacion Lazo","Estacion Puiggari","Estacion Raices","Estacion Yerua","Estancia San Pedro","Faustino M. Parera","Febre","Federacion","Federal","General Almada","General Alvear","General Campos","General Galarza","General Racedo","General Ramirez","Gilbert","Gobernador EchagÜE","Gobernador Mansilla","Gobernador Sola","Gualeguay","Gualeguaychu","Guardamonte","Hambis","Hasenkamp","Hernandarias","Hernandez","Herrera","Hocker","Ibicuy","Ingeniero Miguel Sajaroff","Irazusta","Jubileo","La Clarita","La Criolla","La Paz","La Picada","Laguna Del Pescado","Larroque","Las Guachas","Las Moscas","Las Tejas","Las Tunas","Libaros","Los Charruas","Los Conquistadores","Lucas Gonzalez","Macia","Maria Grande","Medanos","Mojones Norte","Molino Doll","Nogoya","Nueva Escocia","Nueva Vizcaya","ñANCAY","Oro Verde","Osvaldo Magnasco","Paraje La Virgen","Parana","Paso De La Laguna","Pedernal","Piedras Blancas","Pronunciamiento","Pueblo Arrua","Pueblo Bellocq (Est. Las Garzas)","Pueblo Brugo","Pueblo Cazes","Pueblo General Belgrano","Pueblo General San Martin","Pueblo Liebig'S","Pueblo Moreno","Puerto Las Cuevas","Puerto Ruiz","Puerto Yerua","Rincon De Nogoya","Rocamora","Rosario Del Tala","San Benito","San Gustavo","San Jaime De La Frontera","San Jose","San Jose De Feliciano","San Pedro","San Salvador","San Victor","Santa Ana","Santa Anita","Santa Elena","Sauce De Luna","Sauce Montrull","Sauce Pinto","Segui","Sir Leonard","Sosa","Strobel","Tabossi","Tezanos Pinto","Ubajay","Urdinarrain","Viale","Victoria","Villa  Elisa","Villa Adela","Villa Clara","Villa Del Rosario","Villa Dominguez","Villa Fontana","Villa Gdor. Luis F. Etchevehere","Villa Libertador San Martin","Villa Mantero","Villa Paranacito","Villa San Justo","Villa San Marcial (Est. Gobernador Urquiza)","Villa Urquiza","Villa Zorraquin","Villaguay","Xx De Setiembre","1º De Mayo","Formosa","Banco Payagua","Bartolome De Las Casas","Buena Vista","Clorinda","Colonia Campo Villafañe","Colonia Pastoril","Colonia Sarmiento","Comandante Fontana","El Colorado","El Espinillo","El Potrillo","El Recreo","Estanislao Del Campo","Formosa","Fortin Cabo 1º Lugones","Fortin Sargento 1º Leyes","General Lucio V. Mansilla","General Mosconi","Gran Guardia","Herradura","Ibarreta","Ingeniero Guillermo N. Juarez","Juan G. Bazan","Laguna Blanca","Laguna Gallo","Laguna Naick-Neck","Laguna Yema","Las Lomitas","Los Chiriguanos","Mariano Boedo","Mision Tacaagle","Mojon De Fierro","Palma Sola","Palo Santo","Pirane","Porton Negro","Posta Cambio Zalazar","Pozo De Maza","Pozo Del Mortero","Pozo Del Tigre","Puerto Pilcomayo","Riacho He-He","Riacho Negro","San Francisco De Laishi","San Hilario","San Martin I","San Martin Ii","Siete Palmas","Subteniente Perin","Tatane","Tres Lagunas","Villa Del Carmen","Villa Escolar","Villa General GÜEMES","Villa General Manuel Belgrano","Villa Kilometro 213","Villa Trinidad","Jujuy","Abdon Castro Tolay","Abra Pampa","Abralaite","Aguas Calientes","Arrayanal","Arroyo Colorado","Bananal","Barcena","Barrio El Milagro","Barrio La Union","Barrio Tabacaleros","Barrios","Bermejito","Caimancito","Calilegua","Cangrejillos","Carahunco","Casabindo","Casira","Caspala","Catua","Centro Forestal","Chalican","Cienega","Cieneguillas","Cochinoca","Coctaca","Colonia San Jose","Coranzuli","Cusi Cusi","Don Emilio","El Acheral","El Aguilar","El Carmen","El Ceibal","El Condor","El Fuerte","El Moreno","El Piquete","El Puesto","El Quemado","El Talar","El Toro","Fleming","Fraile Pintado","Guerrero","Hipolito Yrigoyen (Est. Iturbe)","Huacalera","Huancar","Humahuaca","Juella","La Almona","La Cienega","La Esperanza","La Intermedia","La Manga","La Mendieta","La Quiaca","Lagunillas De Farallon","Leon","Libertad","Libertador Grl. San Martin (Est. Ledesma)","Liviara","Llulluchayoc","Los Lapachos (Est. Maquinista Veron)","Los Nogales","Loteo Navea","Lozano","Maimara","Maiz Negro","Manantiales","Mina Providencia","Mina 9 De Octubre","Miraflores","Misarrumi","Monterrico","Nuevo Pirquitas","Ocloyas","Olaroz Chico","Oratorio","Paicone","Palma Sola","Palos Blancos","Palpala","Pampa Blanca","Pampichuela","Parapeti","Pastos Chicos","Paulina","Perico","Piedritas","Pila Pardo","Puente Lavayen","Puesto Del Marquez","Puesto Sey","Puesto Viejo","Pumahuasi","Purmamarca","Rinconada","Rinconadillas","Rio Blanco","Rodeito","Rosario De Rio Grande","San Antonio","San Antonio","San Francisco","San Francisco De Alfarcito","San Isidro","San Jose","San Juan De Oros","San Juan De Quillaques","San Juancito","San Lucas","San Pablo De Reyes","San Pedro (Est. San Pedro De Jujuy)","San Salvador De Jujuy (Est. Jujuy)","Santa Ana","Santa Catalina","Santa Clara","Santuario De Tres Pozos","Sauzal","Susques","Tilcara","Tres Cruces","Tumbaya","Tusaquillas","Uquia (Est. Senador Perez)","Valle Colorado","Valle Grande","Vinalito","Volcan","Yacoraite","Yala","Yavi","Yavi Chico","Yoscaba","Yuto","La Pampa","Abramo","Adolfo Van Praet","Agustoni","Algarrobo Del Aguila","Alpachiri","Alta Italia","Anguil","Anzoategui","Arata","Ataliva Roca","Bernardo Larroude","Bernasconi","Caleufu","Carro Quemado","Catrilo","Ceballos","Chacharramendi","Colonia Baron","Colonia San Jose","Colonia Santa Maria","Conhelo","Coronel Hilario Lagos  (Est. Aguas Buenas)","Cuchillo Co","Damian Maisonave (Est. Simson)","Doblas","Dorila","Eduardo Castex","Embajador Martini","Falucho","General Acha","General Manuel J. Campos","General Pico","General San Martin (Est. Villa Alba)","Gobernador Duval","Guatrache","Hucal","Ingeniero Foster","Ingeniero Luiggi","Intendente Alvear","Jacinto Arauz","La Adela","La Gloria","La Humada","La Maruja","La Reforma","Limay Mahuida","Lonquimay","Loventue","Luan Toro","Macachin","Mauricio Mayer","Metileo","Miguel Cane","Miguel Riglos","Monte Nievas","Naico","Ojeda","Parera","Peru","Pichi Huinca","Puelches","Puelen","Quehue","Quemu Quemu","Quetrequen","Rancul","Realico","Relmo","Rolon","Rucanelo","Santa Isabel","Santa Rosa","Santa Teresa","Sarah","Speluzzi","Telen","Toay","Tomas M. Anchorena","Trebolares","Trenel","Unanue","Uriburu","Vertiz","Victorica","Villa Mirasol","Winifreda","25 De Mayo","La Rioja","Aicuña","Aimogasta","Alpasinche","Alto Carrizal","Alto JagÜE","Amana","Ambil","Aminga","Amuschina","Andolucas","Anguinan","Angulos","Anillaco","Anjullon","Antinaco","Arauco","Bajo Carrizal","Bajo JagÜE","Banda Florida","Bañado De Los Pantanos","Campanas","Castro Barros","Chamical","Chañar","Chañarmuyo","Chaupihuasi","Chepes","Chilecito","Chuquis","Colonia Anguinan","Colonia Catinzaco","Colonia Malligasta","Colonia Ortiz De Ocampo","Colonia Vichigasta","Cuipan","Desiderio Tello","Estacion Mazan","Famatina","Guanchin","Guandacol","JagÜE","La Cuadra","La Puntilla","La Rioja","Las Talas","Loma Blanca","Los Molinos","Los Palacios","Los Robles","Los Sarmientos","Machigasta","Malanzan","Malligasta","Milagro","Miranda","Nacate","Nonogasta","Olpas","Olta","Pagancillo","Patquia","Pinchas","Pituil","Plaza Vieja","Polco","Portezuelo","Punta De Los Llanos","Salicas","San Antonio","San Antonio","San Blas","San Miguel","San Nicolas","San Pedro","Santa Clara","Santa Cruz","Santa Florentina","Santa Rita De Catuna","Santa Vera Cruz","Santo Domingo","Sañogasta","Shaqui","Suriyaco","Tama","Tilimuqui","Tuyubil","Ulapes","Vichigasta","Villa Castelli","Villa Mazan","Villa San Jose De Vinchina","Villa Sanagasta","Villa Union","Mendoza","Agrelo","Agua Escondida","Alto Salvador","Alto Verde","Andrade","Bardas Blancas","Barrancas","Barrio Adina I Y Ii","Barrio Alto Del Olvido","Barrio Belgrano Norte","Barrio Campos El Toledano","Barrio Chivilcoy","Barrio Cooperativa Los Campamentos","Barrio Echeverria","Barrio El Cepillo","Barrio El Nevado","Barrio Emanuel","Barrio Empleados De Comercio","Barrio Intendencia","Barrio Jesus De Nazaret","Barrio Jocoli Ii","Barrio La Esperanza","Barrio La Palmera","Barrio La Pega","Barrio Lagunas De Bartoluzzi","Barrio Las Rosas","Barrio Los Charabones","Barrio Los Jarilleros","Barrio Los Olivos","Barrio Maria Auxiliadora","Barrio Molina Cabrera","Barrio Perdriel Iv","Barrio Primavera","Barrio Rivadavia","Barrio San Cayetano","Barrio 12 De Octubre","Bermejo","Blanco Encalada","Bowen","Buena Nueva","Cacheuta","Campo Los Andes","Capdevila","Capdeville","Capilla Del Rosario","Capitan Montoya","Carmensa","Carrodilla","Chacras De Coria","Chapanay","Chilecito","Chivilcoy","Ciudad De San Martin","Ciudad De San Rafael","Colonia Las Rosas","Colonia Segovia (Est. Amigorena)","Coquimbito","Cordon Del Plata","Costa De Araujo","Costa Flores","Cruz De Piedra","Cuadro Benegas","Cuadro Nacional","Cuadro Ortega","Desaguadero","Dorrego","El Algarrobal","El Borbollon","El Carmelo","El Carrizal","El Challao","El Manzano","El Mirador","El Nihuil","El Paramillo","El Pastal","El Pedregal","El Peral","El Plumerillo","El Resguardo","El Salto","El Sauce","El Sosneado","El Tropezon","El Vergel","El Zapallar","Eugenio Bustos","Fray Luis Beltran","General Alvear (Est.Colonia Alvear Norte)","General Belgrano","General Gutierrez","Gobernador Benegas","Godoy Cruz","Goudge","Guaymallen","Ingeniero Giagnoni","Ingeniero Gustavo Andre","Jaime Prats","Jesus Nazareno","Jocoli","Jocoli","Jocoli Viejo","Junin","La Arboleda","La Central","La Cieneguita","La Colonia","La Consulta","La Dormida","La Esperanza","La Florida","La Libertad","La Llave Nueva","La Paz","La Primavera","La Puntilla","Las Cañas","Las Carditas","Las Catitas (Est. J. N. Lencinas)","Las Compuertas","Las Cuevas","Las Heras","Las Leñas","Las Malvinas","Las Paredes","Las Tortugas","Las Vegas","Las Violetas","Los Arboles","Los Barriales","Los Campamentos","Los Compartos","Los Corralitos","Los Manantiales","Los Penitentes","Los Reyunos","Los Sauces","Lujan De Cuyo","Luzuriaga","Maipu","MalargÜE","Mayor Drummond","Medrano","Medrano","Mendoza","Monte Coman","Montecaseros","Mundo Nuevo","Nueva California (Est. Moluches)","Nueva Ciudad","Palmira","Panquehua","Papagayos","Pareditas","Pedro Molina","Perdriel","Phillips","Piedras Blancas","Pobre Diablo","Polvaredas","Potrerillos","Presidente Sarmiento","Puente De Hierro","Puente Del Inca","Punta De Vacas","Punta Del Agua","Rama Caida","Real Del Padre","Reduccion De Abajo","Rivadavia","Rodeo De La Cruz","Rodeo Del Medio","Rodriguez Peña","Russell","Salto De Las Rosas","San Carlos","San Francisco Del Monte","San Francisco Del Monte","San Jose","San Jose","San Roque","Santa Maria De Oro","Santa Rosa","Tres Esquinas","Tres Porteñas","Tunuyan","Tupungato","Ugarteche","Uspallata","Valle Del Sol","Villa Antigua","Villa Atuel","Villa Atuel Norte","Villa Bastias","Villa El Refugio","Villa Nueva","Villa Teresa","Villa Tulumaya","Vista Flores","Vistalba","25 De Mayo","3 De Mayo","Misiones","Alba Posse","Alberdi","Almafuerte","Almirante Brown","Apostoles","Aristobulo Del Valle","Arroyo Del Medio","Azara","Barra Concepcion","Bernardo De Irigoyen","Bonpland","Caa - Yari","Campo Grande","Campo Ramon","Campo Viera","Candelaria","Capiovi","Caraguatay","Cerro Azul","Cerro Cora","Colonia Alicia","Colonia Aurora","Colonia Polana","Colonia Victoria","Concepcion De La Sierra","Corpus","Cruce Caballero","Domingo Savio","Dos Arroyos","Dos De Mayo Nucleo I","Dos De Mayo Nucleo Ii","Dos De Mayo Nucleo Iii","Dos Hermanas","El Alcazar","El Salto","El Soberbio","Eldorado","Esperanza","Estacion Apostoles","Florentino Ameghino","Fracran","Garuhape","Garupa","General Alvear","General Urquiza","Gobernador Lopez","Gobernador Roca","Guarani","Helvecia","Hipolito Yrigoyen","Integracion","Itacaruare","Jardin America","La Corita","Laharrague","Leandro N. Alem","Libertad","Loreto","Los Helechos","Maria Magdalena","Martires","Mbopicua","Mojon Grande","Montecarlo","Nemesio Parma","Oasis","Obera","Olegario V. Andrade","Panambi","Panambi Kilometro 8","Paraiso","Pindapoy","Piñalito Sur","Piray Kilometro 18","Posadas","Profundidad","Pueblo Illia","Puerto Iguazu","Puerto Leoni","Puerto Mado","Puerto Pinares","Puerto Piray","Puerto Rico","Puerto Santa Ana","Rincon De Azara","Roca Chica","Ruiz De Montoya","Salto Encantado","San Alberto","San Antonio","San Francisco De Asis","San Gotardo","San Ignacio","San Javier","San Jose","San Martin","San Miguel","San Pedro","San Vicente","Santa Ana","Santa Maria","Santa Rita","Santiago De Liniers","Santo Pipo","Taruma","Tobuna","Tres Capones","Valle Hermoso","Villa Akerman","Villa Bonita","Villa Libertad","Villa Parodi","Villa Roulet","Wanda","1º De Mayo","25 De Mayo","9 De Julio","9 De Julio Kilometro 20","Neuquen","Alumine","Andacollo","Añelo","Arroyito","Bajada Del Agrio","Barrancas","Barrio Ruca Luhe","Buta Ranquil","Caviahue","Centenario","Chorriaca","Chos Malal","Copahue","Covunco Centro","Cutral Co","El Chocon","El Cholar","El Huecu","Huinganco","Junin De Los Andes","La Buitrera","Las Coloradas","Las Lajas","Las Ovejas","Loncopue","Los Catutos","Los Miches","Manzano Amargo","Mari Menuco","Mariano Moreno","Neuquen","Octavio Pico","Paso Aguerre","Picun Leufu","Piedra Del Aguila","Plaza Huincul","Plottier","Quili Malal","Ramon M. Castro","Rincon De Los Sauces","San Martin De Los Andes","San Patricio Del Chañar","Santo Tomas","Senillosa","Taquimilan","Tricao Malal","Varvarco","Villa Del Curi Leuvu","Villa El Chocon","Villa La Angostura","Villa Pehuenia","Villa Traful","Vista Alegre Norte","Vista Alegre Sur","Zapala","11 De Octubre","Rio Negro","Aguada Cecilio","Aguada De Guerra","Aguada Guzman","Allen","Arroyo Los Berros","Arroyo Ventana","Bahia Creek","Bajo San Cayetano","Barda Del Medio","Barrio Blanco","Barrio Calle Ciega Nº 10","Barrio Calle Ciega Nº 6","Barrio Canale","Barrio Chacra Monte","Barrio Colonia Conesa","Barrio Costa Este","Barrio Costa Linda","Barrio Costa Oeste","Barrio El Labrador","Barrio El Maruchito","Barrio El Petroleo","Barrio El Pilar","Barrio El Treinta","Barrio Frontera","Barrio Goretti","Barrio Guerrico","Barrio Isla 10","Barrio La Barda","Barrio La Costa","Barrio La Defensa","Barrio La Lor","Barrio La Ribera - Barrio Apycar","Barrio Las Angustias","Barrio Mar Del Plata","Barrio Maria Elvira","Barrio Mosconi","Barrio Norte","Barrio Pino Azul","Barrio Porvenir","Barrio Presidente Peron","Barrio Puente De Madera","Barrio Puente 83","Barrio Santa Rita","Barrio Tres Luces","Barrio Union","Barrio Union","Barrio Virgen De Lujan","Catriel","Cerro Policia","Cervantes","Chelforo","Chichinales","Chimpay","Choele Choel","Cinco Saltos","Cipolletti","Clemente Onelli","Colan Conhue","Colonia Julia Y Echarren","Colonia Suiza","Comallo","Comico","Cona Niyeu","Contralmirante Cordero","Coronel Belisle","Darwin","Dina Huapi","El Bolson","El Cain","El Condor","El Cuy","El Foyel","El Juncal","Ferri","General Conesa","General Enrique Godoy","General Fernandez Oro","General Roca","Guardia Mitre","Ingeniero Jacobacci","Ingeniero Luis A. Huergo","Ingeniero Otto Krause","La Loberia","Laguna Blanca","Lamarque","Las Bayas","Las Grutas","Las Perlas","Los Menucos","Loteo Costa De Rio","Luis Beltran","Mainque","Mamuel Choique","Maquinchao","Mencue","Mina Santa Teresita","Ministro Ramos Mexia","Nahuel Niyeu","Naupa Huen","ñIRIHUAU","ñORQUINCO","Ojos De Agua","Paso Cordova","Paso Cordova","Paso Flores","Peninsula Ruca Co","Peñas Blancas","Pilcaniyeu","Pilquiniyeu","Pilquiniyeu Del Limay","Playas Doradas","Pomona","Pozo Salado","Prahuaniyeu","Puerto San Antonio Este","Punta Colorada","Rio Chico (Est. Cerro Mesa)","Rio Colorado","Rio Villegas","San Antonio Oeste","San Carlos De Bariloche","San Javier","Sargento Vidal","Sierra Colorada","Sierra Grande","Sierra Paileman","Treneta","Valcheta","Valle Azul","Viedma","Villa Alberdi","Villa Campanario","Villa Catedral","Villa Del Parque","Villa Llanquin","Villa Llao Llao","Villa Los Coihues","Villa Manzano","Villa Regina","Villa San Isidro","Yaminue","Salta","Acoyte","Aguaray","Aguas Blancas","Alto De La Sierra","Ampascachi","Angastaco","Animana","Antilla","Apolinario Saravia","Atocha","Barrio El Jardin De San Martin","Barrio El Milagro","Barrio San Rafael","Cabra Corral","Cachi","Cafayate","Campamento Vespucio","Campichuelo","Campo Blanco","Campo Duran","Campo La Cruz","Campo Quijano","Campo Santo","Capiazuti","Capitan Juan Page","Carboncito","Ceibalito","Centro 25 De Junio","Cerrillos","Chicoana","Cobos","Cobres","Colonia Santa Rosa","Copo Quile","Coronel Cornejo","Coronel Juan Sola (Est. Morillo)","Coronel Moldes","Coronel Mollinedo","Coronel Olleros","Country Club El Tipal","Country Club La Almudena","Dragones","El Barrial","El Bordo","El Carril","El Galpon (Est. Foguista J. F. Juarez)","El Jardin","El Naranjo","El Potrero (Apeadero Cochabamba)","El Quebrachal","El Tabacal","El Tala (Est. Ruiz De Los Llanos)","El Tunal","Embarcacion","Gaona","General Ballivian","General GÜEMES (Est. GÜEMES)","General Mosconi (Est. Vespucio)","General Pizarro","Guachipas","Hickman","Hipolito Yrigoyen (Est. Tabacal)","Iruya","Isla De Cañas","Joaquin V. Gonzalez","La Caldera","La Candelaria","La Cienaga","La Merced","La Mision","La Poma","La Puerta","La Silleta","La Union","La Viña","Las Costas","Las Lajitas","Los Blancos","Los Toldos","Luis Burela","Lumbreras","Macapillo","Metan Viejo","Mision Chaqueña","Mision Curva El Talar","Mision El Cruce","Mision El Siwok","Mision Kilometro 6","Mision La Mora","Mision Lapacho I","Mision Lapacho Ii","Mision Tierras Fiscales","Molinos","Nazareno","Nuestra Señora De Talavera","Olacapato","Pacara","Padre Lozano","Payogasta","Pichanal","Piquete Cabado","Piquirenda","Pluma De Pato","Poscaya","Presa El Tunal","Profesor Salvador Mazza (Est. Pocitos)","Pueblo Viejo","Recaredo","Rio Del Valle","Rio Piedras","Rivadavia","Rosario De La Frontera","Rosario De Lerma","Salta","San Agustin","San Antonio De Los Cobres","San Carlos","San Felipe","San Jose De Metan (Est. Metan)","San Jose De Orquera","San Marcos","San Ramon De La Nueva Oran (Est. Oran)","Santa Maria","Santa Rosa","Santa Rosa De Los Pastos Grandes","Santa Victoria","Santa Victoria Este","Seclantas","Talapampa","Tartagal","Tobantirenda","Tolar Grande","Tolloche","Tolombon","Tranquitas","Urundel","Vaqueros","Villa Los Alamos","Villa San Lorenzo","Yacuy","San Juan","Alto De Sierra","Alto De Sierra","Angualasto","Astica","Balde Del Rosario","Barreal","Barrio Ruta 40","Barrio Sadop","Bella Vista","Bermejo","Calingasta","Campo Afuera","Cañada Honda","Carpinteria","Caucete","Chimbas","Chucuma","Cienaguita","Colonia Fiorito","Colonia Fiscal","Colonia Gutierrez","Colonia Gutierrez","Divisadero","Dos Acequias (Est. Los Angacos)","El Encon","El Fiscal","El Medanito","El Medano","El Mogote","El Rincon","El Rincon","Gran China","Guanacache","Huaco","Iglesia","La Cañada","La Chimbera","La Falda","La Rinconada","Las Chacritas","Las Flores","Las Lagunas","Las Talas","Las Tapias","Los Baldecitos","Los Berros","Los Medanos","Marayes","Mogna","Niquivil","Pampa Vieja","Pedernal","Pie De Palo","Pismanta","Punta Del Medano","Quinto Cuartel","Rawson","Rivadavia","Rodeo","San Isidro","San Isidro (Est. Los Angacos)","San Jose De Jachal","San Juan","Santa Lucia","Tamberias","Tamberias","Tudcum","Tupeli","Usno","Vallecito","Villa Aberastain","Villa Ampacama","Villa Barboza","Villa Basilio Nievas","Villa Bolaños","Villa Borjas","Villa Centenario","Villa Dominguito (Est. Puntilla Blanca)","Villa Don Bosco (Est. Angaco Sud)","Villa El Salvador","Villa El Salvador","Villa El Tango","Villa General San Martin","Villa Ibañez","Villa Independencia","Villa Krause","Villa Malvinas Argentinas","Villa Media Agua","Villa Mercedes","Villa Nacusi","Villa Paula Albarracin","Villa Pituil","Villa San Agustin","Villa San Martin","Villa Santa Rosa","Villa Sefair Talacasto","Villa Tacu","9 De Julio","San Luis","Alto Pelado","Alto Pencoso","Anchorena","Arizona","Bagual","Balde","Batavia","Beazley","Buena Esperanza","Candelaria","Carolina","Carpinteria","Cazador","Cerro Colorado","Cerro De Oro","Chosmes","Concaran","Cortaderas","Cruz De Piedra","Desaguadero","El Chorrillo","El Trapiche","El Volcan","Fortin El Patria","Fortuna","Fraga","Jarilla","Juan Jorba","Juan Llerena","Juana Koslay","Justo Daract","La Bajada","La Calera","La Florida","La Majada","La Maroma","La Punilla","La Punta","La Toma","La Vertiente","Lafinur","Las Aguadas","Las Chacras","Las Chacras","Las Lagunas","Lavaisse","Leandro N. Alem","Los Cajones","Los Molles","Los Overos","Lujan","Martin De Loyola","Merlo","Mosmota","Nahuel Mapa","Naschel","Navia","Nogoli","Nueva Galia","Papagayos","Paso Grande","Potrerillo","Potrero De Los Funes","Quines","Renca","Rio Grande","Rio Juan Gomez","Riocito","Saladillo","Salinas Del Bebedero","San Francisco Del Monte De Oro","San Jeronimo","San Jose Del Morro","San Luis","San Martin","San Pablo","San Roque","Santa Rosa Del Conlara","Talita","Tilisarao","Union","Villa De La Quebrada","Villa De Praga","Villa Del Carmen","Villa General Roca","Villa Larca","Villa Mercedes","Villa Reynolds","Villa Salles","Zanjitas","Santa Cruz","Bajo Caracoles","Caleta Olivia","Cañadon Seco","Comandante Luis Piedrabuena","El Calafate","El Chalten","El Turbio (Est. Gobernador Mayer)","Fitz Roy","Gobernador Gregores","Hipolito Yrigoyen","Jaramillo","Julia Dufour","Koluel Kaike","Las Heras","Los Antiguos","Mina 3","Perito Moreno","Pico Truncado","Puerto Deseado","Puerto San Julian","Puerto Santa Cruz","Rio Gallegos","Rospentek","Tellier","Tres Lagos","Yacimientos Rio Turbio","28 De Noviembre","Santa Fe","Aaron Castellanos (Est. Castellanos)","Acebal","Aguara Grande","Albarellos","Alcorta","Aldao","Aldao (Est. Casablanca)","Alejandra","Álvarez","Alvear","Ambrosetti","Amenabar","Angel Gallardo","Angelica","Angeloni","Arbilla","Arequito","Arminda","Armstrong","Arocena","Arroyo Aguiar","Arroyo Ceibal","Arroyo Leyes","Arroyo Seco","Arrufo","Arteaga","Ataliva","Aurelia","Avellaneda (Est. Ewald)","Balneario La Verde","Balneario Monje","Barrancas","Barrio Arroyo Del Medio","Barrio Caima","Barrio Cicarelli","Barrio El Pacaa - Barrio Comipini","Barrio Mitre","Barrios Acapulco Y Veracruz","Bauer Y Sigel","Bella Italia","Beravebu","Berna","Bernardo De Irigoyen (Est. Irigoyen)","Bigand","Bombal","Bouquet","Bustinza","Cabal","Cacique Ariacaiquin","Cafferata","Calchaqui","Campo Andino","Candioti","Cañada De Gomez","Cañada Del Ucle","Cañada Ombu","Cañada Rica","Cañada Rosquin","Capitan Bermudez","Capivara","Carcaraña","Carlos Pellegrini","Carmen","Carmen Del Sauce","Carreras","Carrizales (Est. Clarke)","Casalegno","Casas","Casilda","Castelar","Castellanos","Cavour","Cayasta","Cayastacito","Centeno","Cepeda","Ceres","Chabas","Chañar Ladeado","Chapuy","Chovet","Christophersen","Classon","Colmena","Colonia Ana","Colonia Belgrano","Colonia Bicha","Colonia Bossi","Colonia Cello","Colonia Dolores","Colonia Duran","Colonia Margarita","Colonia Medici","Colonia Raquel","Colonia Rosa","Constanza","Coronda","Coronel Arnold","Coronel Bogado","Coronel Fraga","Coronel Rodolfo S. Dominguez","Correa","Crispi","Cuatro Esquinas","Cululu","Curupayti","Desvio Arijon","Diaz","Diego De Alvear","Egusquiza","El Araza","El Caramelo","El Rabon","El Trebol","Elisa","Elortondo","Emilia","Empalme San Carlos","Empalme Villa Constitucion","Esmeralda","Esperanza","Estacion Clucellas","Estacion Presidente Roca","Estacion Saguier","Esteban Rams","Esther","Eusebia Y Carolina","Eustolia","Felicia","Fighiera","Firmat","Firmat","Florencia","Fortin Olmos","Franck","Fray Luis Beltran","Frontera","Fuentes","Funes","Gaboto","Galvez","Garabato","Garibaldi","Gato Colorado","General Gelly","General Lagos","Gessler","Gobernador Crespo","GÖDEKEN","Godoy","Golondrina","Granadero Baigorria","Gregoria Perez De Denis  (Est. El Nochero)","Grutly","Guadalupe Norte","Helvecia","Hersilia","Hipatia","Huanqueros","Hughes","Humberto Primo","Humboldt","Ibarlucea","Ingeniero Chanourdie","Intiyaco","Irigoyen","Jacinto L. Arauz","Josefina","Juan B. Molina","Juncal","Kilometro 101","Kilometro 115","La Brava","La Cabral","La Chispa","La Criolla (Est. Cañadita)","La Gallareta","La Isleta","La Pelada","La Penca Y Caraguata","La Rubia","La Sarita","La Vanguardia","Labordeboy","Laguna Paiva","Landeta","Lanteri","Larguia","Larrechea","Las Avispas","Las Bandurrias","Las Garzas","Las Palmeras","Las Parejas","Las Petacas","Las Rosas","Las Toscas","Las Tunas","Lazzarino","Lehmann","Llambi Campbell","Logroño","Loma Alta","Lopez (Est. San Martin De Tours)","Los Amores","Los Cardos","Los Laureles","Los Molinos","Los Muchachos - La Alborada","Los Nogales","Los Quirquinchos","Los Zapallos","Lucio V. Lopez","Luis Palacios (Est. La Salada)","Maciel","Maggiolo","Malabrigo","Marcelino Escalada","Margarita","Maria Juana","Maria Luisa","Maria Susana","Maria Teresa","Matilde","Maximo Paz (Est. Paz)","Melincue  (Est. San Urbano)","Miguel Torres","Moises Ville","Monigotes","Monje","Monte Flores","Monte Vera","Montefiore","Montes De Oca","Murphy","Nare","Nelson","Nueva Lehmann","Nuevo Torino","ñANDUCITA","Oliveros","Palacios","Paraje Chaco Chico","Paraje La Costa","Paraje San Manuel","Paraje 29","Pavon","Pavon Arriba","Pedro Gomez Cello","Perez","Peyrano","Piamonte","Pilar","Piñero (Est. Erasto)","Plaza Clucellas","Plaza Matilde","Plaza Saguier","Pozo Borrado","Pozo De Los Indios","Presidente Roca","Progreso","Providencia","Pueblo Andino","Pueblo Esther","Pueblo Marini","Pueblo Muñoz (Est. Bernard)","Pueblo Santa Lucia","Pueblo Uranga","Puerto Aragon","Puerto Arroyo Seco","Puerto General San Martin","Puerto Reconquista","Pujato","Rafaela","Ramayon","Ramona","Reconquista","Recreo","Ricardone","Rincon Norte","Rincon Potrero","Roldan","Romang","Rosario","Rueda","Rufino","Sa Pereyra","Saladero Mariano Cabal","Salto Grande","San Agustin","San Antonio","San Antonio De Obligado","San Bernardo","San Carlos Centro","San Carlos Norte","San Carlos Sud","San Cristobal","San Eduardo","San Eugenio","San Fabian","San Francisco De Santa Fe","San Genaro","San Genaro Norte","San Gregorio","San Guillermo","San Javier","San Jeronimo Del Sauce","San Jeronimo Norte","San Jeronimo Sud","San Jorge","San Jose De La Esquina","San Jose Del Rincon","San Justo","San Lorenzo","San Mariano","San Martin De Las Escobas","San Martin Norte","San Vicente","Sancti Spiritu","Sanford","Santa Clara De Buena Vista","Santa Clara De Saguier","Santa Fe","Santa Isabel","Santa Margarita","Santa Rosa De Calchines","Santa Teresa","Santo Domingo","Santo Tome","Santurce","Sargento Cabral","Sarmiento","Sastre","Sauce Viejo","Serodino","Silva (Est. Abipones)","Soldini","Soledad","Stephenson","Suardi","Sunchales","Susana","Tacuarendi (Emb. Kilometro 421)","Tacural","Tartagal (Est. El Tajamar)","Teodelina","Theobald","Timbues","Toba","Tortugas","Tostado","Totoras","Traill","Venado Tuerto","Vera (Est. Gobernador Vera)","Vera Y Pintado (Est. Guaranies)","Videla","Vila","Villa Adelina","Villa Amelia","Villa Ana","Villa Cañas","Villa Constitucion","Villa Del Plata","Villa Eloisa","Villa Elvira","Villa Gobernador Galvez","Villa Guillermina","Villa Josefina","Villa La Rivera (Comuna Oliveros)","Villa La Rivera (Comuna Pueblo Andino)","Villa Laura (Est. Constituyentes)","Villa Minetti","Villa Mugueta","Villa Ocampo","Villa San Jose","Villa Saralegui","Villa Trinidad","Villada","Virginia","Wheelwright","Wildermuth (Est. Granadero B. Bustos)","Zavalla","Zenon Pereyra","Santiago Del Estero","Abra Grande","Aerolito","Alhuampa","Ancajan","Antaje","Añatuya","Ardiles","Argentina","Árraga","Averias","Bandera","Bandera Bajada","Beltran","Brea Pozo","Campo Gallo","Cañada Escobar","Casares","Caspi Corral","Chañar Pozo De Abajo","Chauchillas","Chaupi Pozo","Chilca Juliana","Choya","Clodomira","Colonia Alpina","Colonia Dora","Colonia El Simbolar","Colonia San Juan","Colonia Tinco","Coronel Manuel L. Rico","Cuatro Bocas","Donadeu","El Bobadal","El Cabure","El Charco","El Charco","El Colorado","El Crucero","El Cuadrado","El Dean","El Mojon","El Mojon","El Rincon","El Zanjon","El 49","Estacion Atamisqui","Estacion La Punta","Estacion Robles","Estacion Taboada","Estacion Tacañitas","Fernandez","Fortin Inca","Frias","Garza","Gramilla","Gramilla","Guardia Escolta","Hasse","Hernan Mejia Miraval","Herrera","Huyamampa","Icaño","Ingeniero Forres (Est. Chaguar Punco)","Isca Yacu","Isca Yacu Semaul","Kilometro 30","La Aurora","La Banda","La Cañada","La Darsena","La Firmeza","La Invernada","La Nena","La Nueva Donosa","Laprida","Las Delicias","Las Palmitas","Las Tinajas","Lavalle","Libertad","Lilo Viejo","Los Cardozos","Los Juries","Los Miranda","Los Nuñez","Los Pirpintos","Los Quiroga","Los Soria","Los Telares","Los Tigres","Lugones","Maco","Malbran","Mansupa","Maquito","Matara","Medellin","Minerva","Monte Quemado","Morales","Nueva Esperanza","Nueva Esperanza","Nueva Francia","Palo Negro","Pampa De Los Guanacos","Patay","Pozo Betbeder","Pozo Hondo","Pozuelos","Pueblo Pablo Torelo (Est. Otumpa)","Puesto De San Antonio","Quimili","Ramirez De Velazco","Rapelli","Real Sayana","Rodeo De Valdez","Roversi","Sachayoj","San Jose Del Boqueron","San Pedro","San Pedro","San Pedro","San Pedro","Santa Maria","Santiago Del Estero","Santo Domingo","Santos Lugares","Sauzal","Selva","Simbol","Simbolar","Sol De Julio","Sumamao","Sumampa","Sumampa Viejo","Suncho Corral","Tapso","Termas De Rio Hondo","Tintina","Tomas Young","Tramo 16","Tramo 20","Urutau","Vaca Huañuna","Vilelas","Villa Atamisqui","Villa Figueroa","Villa General Mitre (Est. Pinto)","Villa Gimenez","Villa La Punta","Villa Mailin","Villa Nueva","Villa Ojo De Agua","Villa Rio Hondo","Villa Salavina","Villa San Martin (Est. Loreto)","Villa Silipica","Villa Turistica Del Embalse","Villa Union","Vilmer","Vinara","Vuelta De La Barranca","Weisburd","Yanda","Yuchan","Tierra Del Fuego","Laguna Escondida","Puerto Argentino","Rio Grande","Tolhuin","Ushuaia","Tucuman","Acheral","Aguilares","Alderetes","Alpachiri","Alto Verde","Amaicha Del Valle","Arcadia","Atahona","Banda Del Rio Sali","Barrio Aeropuerto","Barrio Araujo","Barrio Casa Rosada","Barrio El Cruce","Barrio Lomas De Tafi","Barrio Mutual San Martin","Barrio Parada 14","Barrio San Felipe","Barrio San Jorge","Barrio San Jose Iii","Barrio San Roque","Barrio U.T.A. Ii","Bella Vista","Campo De Herrera","Capitan Caceres","Choromoro","Colalao Del Valle","Colombres","Colonia Mayo - Barrio La Milagrosa","Concepcion","Delfin Gallo","Diagonal Norte","El Bracho","El Cadillal","El Chañar","El Corte","El Manantial","El Mollar","El Naranjo","El Paraiso","Estacion Araoz","Ex Ingenio Esperanza","Ex Ingenio Los Ralos","Ex Ingenio Lujan","Ex Ingenio Nueva Baviera","Ex Ingenio San Jose","Famailla","Garmendia","Graneros","Iltico","Ingenio Fronterita","Ingenio La Florida","Ingenio San Pablo","Ingenio Santa Barbara","Juan Bautista Alberdi","La Cocha","La Florida","La Ramada","La Reduccion","La Trinidad","Lamadrid","Las Cejas","Lastenia","Los Gutierrez","Los Pocitos","Los Puestos","Los Ralos","Los Sarmientos","Lules","Luz Y Fuerza","Macomitas","Manuel Garcia Fernandez","Medina","Monteagudo","Monteros","Nueva Trinidad","Pacara","Pala Pala","Piedrabuena","Pueblo Independencia","Ranchillos","Rio Chico","Rio Colorado","Rio Seco","San Andres","San Jose De La Cocha","San Miguel De Tucuman (Est. Tucuman)","San Pedro De Colalao","Santa Ana","Santa Cruz","Santa Lucia","Santa Rosa De Leales","Sargento Moya","Simoca","Soldado Maldonado","Taco Ralo","Tafi Del Valle","Tafi Viejo","Teniente Berdina","Villa  Padre Monti","Villa Belgrano","Villa Benjamin Araoz","Villa Burruyacu","Villa Carmela","Villa Chicligasta","Villa Clodomiro Hileret","Villa De Trancas","Villa Fiad - Ingenio Leales","Villa Las Flores","Villa Leales","Villa Mariano Moreno - El Colmenar","Villa Nueva Italia","Villa Quinteros","Villa Recaste","Villa Tercera","Yerba Buena - Marcos Paz","7 De Abril"];
	      return lugares.map( function (lugar) {
	        return {
	          value: lugar.toLowerCase(),
	          display: lugar
	        };
	      });
	    }
	    /**
	     * Create filter function for a query string
	     */
	    function createFilterFor(query) {
	      var lowercaseQuery = angular.lowercase(query);
	      return function filterFn(lugar) {
	        return (lugar.value.indexOf(lowercaseQuery) === 0);
	      };
	    }
	}])
	.directive("fileread", [function () {
	    return {
	        scope: {
	            fileread: "="
	        },
	        link: function (scope, element, attributes) {
	            element.bind("change", function (changeEvent) {
	                var reader = new FileReader();
	                reader.onload = function (loadEvent) {
	                    scope.$apply(function () {
	                        scope.fileread = loadEvent.target.result;
	                    });
	                };
	                reader.readAsDataURL(changeEvent.target.files[0]);
	            });
	        }
	    };
	}])
	.directive('forceSelectFocus', function() {
  		return {
    		restrict: 'A',
   	 		require: ['^^mdSelect', '^ngModel'],
    		link: function(scope, element, controller) {
      			scope.$watch(function () {
			        var foundElement = element;
			        while (!foundElement.hasClass('md-select-menu-container')) {
			        	foundElement = foundElement.parent();
			        }
	        		return foundElement.hasClass('md-active');
	      		}, function (newVal) {
			        if (newVal) {
			            element.focus();
			        }
		      	});
		    }
  		};
  	})
	.filter('capitalize', function() {
	    return function(input) {
	      	return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
	    };
	});
