angular.module('perrosApp.services', []).
    factory('perrosService', ['$http', '$httpParamSerializer', function($http, $httpParamSerializer) {
        var maxResults = 40;
        var perrosService = {};
        var db = firebase.database();

        perrosService.guardarPerro = function(perro) {
            return $http.post('/perros/guardar', (perro));
        };

        perrosService.actualizarPerro = function(perro) {
            return $http.post('/perros/editar', perro);
        };

        perrosService.filtrarPerros = function(perro) {
            return $http.post('/search', perro);
        }; 

        perrosService.borrarPerro = function(id, tipo) {
            return $http.post('/borrar', {id: id, tipo: tipo});
        };

        perrosService.toggleFavorite = function(perro){
            return $http.post('/favoritos', perro);
        };

        perrosService.getPerro = function(perroId){
            return $http.get('/perro/'+perroId);
        };

        perrosService.getPerros = function(startKey, tipo, perro){
          var dbRef = db.ref("/perros");
          if(startKey){
            return dbRef.orderByKey().startAt(startKey).limitToFirst(maxResults).once("value");
          }else{
            return dbRef.orderByKey().limitToFirst(maxResults).once("value"); 
          }
        };

        perrosService.loadCoincidencias = function(filter){
            return $http.get('/coincidencias', {params: filter});
        };

        perrosService.quitarCoincidencia = function(idPrincipal, idSecundario){
            return $http.post('/coincidencia/baja', {idPrincipal: idPrincipal, idSecundario: idSecundario});
        };

        perrosService.busquedaAvanzada = function (tags) {
            return $http.post('/advancedSearch', {tags: tags}); 
        };

        return perrosService;
    }]);