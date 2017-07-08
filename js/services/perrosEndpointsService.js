angular.module('perrosApp.services', []).
    factory('perrosService', ['$http', '$httpParamSerializer', function($http, $httpParamSerializer) {
        var maxResults = 40;
        var perrosService = {};
        var db = firebase.database();

        perrosService.guardarPerro = function(perro) {
            var nuevoPerroRef = db.ref("/perros").push();
            return nuevoPerroRef.set(perro);
        };

        perrosService.actualizarPerro = function(perro) {
            return db.ref("/perros").update(perro);
        };

        perrosService.filtrarPerros = function(perro) {
            var dbRef = db.ref("/perros");
            return dbRef.orderByKey().limitToFirst(maxResults).once("value");             
        }; 

        perrosService.borrarPerro = function(id, tipo) {
            return db.ref("/perros/"+id).remove();
        };

        perrosService.toggleFavorite = function(perro){
            return db.ref("/perros").update(perro);
        };

        perrosService.getPerro = function(perroId){
            return db.ref("/perros/"+perroId);            
        };

        perrosService.getPerros = function(startKey, tipo, perro){
          var dbRef = db.ref("/perros");
          if(startKey){
            return dbRef.orderByKey().startAt(startKey).limitToFirst(maxResults).once("value");
          }else{
            return dbRef.orderByKey().limitToFirst(maxResults).once("value"); 
          }
        };

        perrosService.busquedaAvanzada = function (tags) {
            return $http.post('/advancedSearch', {tags: tags}); 
        };

        return perrosService;
    }]);