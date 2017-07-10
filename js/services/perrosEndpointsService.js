angular.module('perrosApp.services', []).
    factory('perrosService', ['$http', '$httpParamSerializer', 'ImageUploadFactory', function($http, $httpParamSerializer, ImageUploadFactory) {
        var maxResults = 40;
        var perrosService = {};
        var db = firebase.database();
        var imageUploadFactory = new ImageUploadFactory();

        perrosService.guardarPerro = function(perro, callback) {
            var nuevoPerroRef = db.ref("/perros/"+perro.tipo).push();
            perro.id = nuevoPerroRef.key;
            if(perro.foto !== null && perro.foto !== 'img/dog.png' && !perrosService.isUrl(perro.foto)){
                imageUploadFactory.uploadImage(perro.foto, function(filename, url){
                    perro.foto = url;
                    perro.foto_name = filename;
                    var perroJSON = JSON.parse(angular.toJson(perro)); // json simple para guardar en datbase
                    nuevoPerroRef.set(perroJSON)
                        .then(function(){
                            callback(perro);
                        })
                        .catch(function(error){
                            imageUploadFactory.deleteImage(filename);
                            callback(null);
                        });
                });
            }else{
                var perroJSON = JSON.parse(angular.toJson(perro)); // json simple para guardar en datbase
                nuevoPerroRef.set(perroJSON)
                    .then(function(){
                        callback(perro);
                    })
                    .catch(function(error){
                        callback(null);
                    });
            }
        };

        perrosService.actualizarPerro = function(perro, callback) {
            console.log(perro);
            if(perro.foto !== null && perro.foto !== 'img/dog.png' && !perrosService.isUrl(perro.foto)){
                imageUploadFactory.uploadImage(perro.foto, function(filename, url){
                    imageUploadFactory.deleteImage(perro.foto_name); // borrar foto anterior
                    perro.foto = url;
                    perro.foto_name = filename; // nueva foto
                    var perroJSON = JSON.parse(angular.toJson(perro)); // json simple para guardar en datbase
                    db.ref("/perros/"+perro.tipo+"/"+perro.id).update(perroJSON)
                        .then(function(){
                            callback(perro);
                        })
                        .catch(function(error){
                            callback(null);
                        });
                });
            }else{
                var perroJSON = JSON.parse(angular.toJson(perro)); // json simple para guardar en datbase
                db.ref("/perros/"+perro.tipo+"/"+perro.id).update(perroJSON)
                    .then(function(){
                        callback(perro);
                    })
                    .catch(function(error){
                        callback(null);
                    });
            }
        };

        perrosService.isUrl = function(url){
            if(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(url)) {
                return true;
            } else {
                return false;
            }
        };

        perrosService.filtrarPerros = function(perro) {
            var dbRef = db.ref("/perros/"+perro.tipo);
            return dbRef.orderByChild("fecha").once("value");             
        }; 

        perrosService.borrarPerro = function(perro) {
            imageUploadFactory.deleteImage(perro.foto_name); // borrar foto asociada
            return db.ref("/perros/"+perro.tipo+"/"+perro.id).remove();
        };

        perrosService.toggleFavorite = function(perro){
            perro = JSON.parse(angular.toJson(perro));
            return db.ref("/perros/"+perro.tipo+"/"+perro.id).update(perro);
        };

        perrosService.getPerro = function(perro){
            return db.ref("/perros/"+perro.tipo+"/"+perro.id);            
        };

        perrosService.getPerros = function(tipo){
          var dbRef = db.ref("/perros/"+tipo);
          return dbRef.orderByChild("fecha").once("value");
        };

        return perrosService;
    }]);