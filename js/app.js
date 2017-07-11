var app = angular.module('perrosApp', [
	'ngMaterial',
	'ngAnimate',
	'ngRoute',
	'perrosApp.controllers',
	'perrosApp.services',
  'perrosApp.factories',
  'angular.backtop',
  'bw.paging',
  'ui.router'
]).
config(['$stateProvider', '$urlRouterProvider','$locationProvider' , function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.when('/','/perdidos');

  var perdidosState = {
    name: 'perdidos',
    url: '/perdidos',
    templateUrl: "partials/perdidos.html"
  };

  var encontradosState = {
    name: 'encontrados',
    url: '/encontrados',
    templateUrl: "partials/encontrados.html"
  };

  var avistadosState = {
    name: 'avistados',
    url: '/avistados',
    templateUrl: "partials/avistados.html"
  };

  var favoritosState = {
    name: 'favoritos',
    url: '/favoritos',
    templateUrl: "partials/favoritos.html"
  };

  var coincidenciasState = {
    name: 'coincidencias',
    url: '/coincidencias',
    templateUrl: "partials/coincidencias.html"
  };

  var loginState = {
    name: 'login',
    url: '/login',
    templateUrl: "partials/login.html",
    resolve: {
      //need to chain our promises since we neeed to first load the authenticate.js
      //and second, execute authenticate()
      authenticate: ['$q', 'FirebaseAuthenticator', function($q, FirebaseAuthenticator) {
        //declare a deferred promise
        var deferred = $q.defer();
        var firebaseAuthenticator = new FirebaseAuthenticator();
        firebaseAuthenticator.login().then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          console.log(token);
          deferred.resolve('authenticated!');
          // ...
        }).catch(function(error) {
            //authenticate fail, reject the promise
            console.log(error);
            deferred.reject('authenticate failed');

        });

        return deferred.promise;
      }]
    }
  };

  $stateProvider.state(perdidosState);
  $stateProvider.state(encontradosState);
  $stateProvider.state(avistadosState);
  $stateProvider.state(favoritosState);
  $stateProvider.state(loginState);
}])
.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false); // change to true for dev
  $compileProvider.commentDirectivesEnabled(false);
  $compileProvider.cssClassDirectivesEnabled(false);
}])
.config(['$mdDateLocaleProvider', function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
	  	return moment(date).format('DD/MM/YYYY');
    };

    $mdDateLocaleProvider.parseDate = function(dateString) {
	    var m = moment(dateString, 'DD/MM/YYYY', true);
	    return m.isValid() ? m.toDate() : new Date(NaN);
	};

  $mdDateLocaleProvider.months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  $mdDateLocaleProvider.shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  $mdDateLocaleProvider.days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  $mdDateLocaleProvider.shortDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
}])
.config(['$mdIconProvider', function($mdIconProvider) {
  $mdIconProvider
    .iconSet('facebook', 'img/icons/facebook.svg', 24)
    .iconSet('facebook', 'img/icons/red-ascotera.svg', 24);
}])
.config(['$mdThemingProvider', function($mdThemingProvider) {
  $mdThemingProvider.theme('pinkPurpleTheme')
    .primaryPalette('indigo', {
      'default': '400', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
    })
    // If you specify less than all of the keys, it will inherit from the
    // default shades
    .accentPalette('pink', {
      'default': '200' // use shade 200 for default, and keep all other shades the same
    });

  $mdThemingProvider.theme('avistados')
      .primaryPalette('blue')
      .accentPalette('blue');
}])
.config(['$sceDelegateProvider', function($sceDelegateProvider) {
     $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://10.217.37.44:8082/demo/add']);
 }]);