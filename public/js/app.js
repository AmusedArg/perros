angular.module('perrosApp', [
	'ngMaterial',
	'ngAnimate',
	'ngRoute',
	'perrosApp.controllers',
	'perrosApp.services',
  'perrosApp.factories',
  'angular.backtop'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
	when("/home", {templateUrl: "partials/home.html"}).
	when("/drivers/:id", {templateUrl: "partials/driver.html", controller: "driverController"}).
	otherwise({redirectTo: '/home'});
}])
.config(['$mdDateLocaleProvider', function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
	  	return moment(date).format('DD/MM/YYYY');
    };

    $mdDateLocaleProvider.parseDate = function(dateString) {
	    var m = moment(dateString, 'DD/MM/YYYY', true);
	    return m.isValid() ? m.toDate() : new Date(NaN);
	};
}])
.config(['$mdIconProvider', function($mdIconProvider) {
  $mdIconProvider
    .iconSet('facebook', 'img/icons/facebook.svg', 24)
    .iconSet('facebook', 'img/icons/red-ascotera.svg', 24);
}])
.config(['$mdDateLocaleProvider', function($mdDateLocaleProvider) {
  // Example of a French localization.
  $mdDateLocaleProvider.months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  $mdDateLocaleProvider.shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  $mdDateLocaleProvider.days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  $mdDateLocaleProvider.shortDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
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
}]);