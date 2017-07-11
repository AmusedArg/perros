angular.module('perrosApp.services', []).
    factory('perrosService', ['$http', '$httpParamSerializer', 'ImageUploadFactory', function($http, $httpParamSerializer, ImageUploadFactory) {
        var maxResults = 40;
        var perrosService = {};
        var db = firebase.database();
        var imageUploadFactory = new ImageUploadFactory();
        var errores = {};

        perrosService.guardarPerro = function(perro, callback) {
            var nuevoPerroRef = db.ref("/perros/"+perro.tipo).push();
            perro.id = nuevoPerroRef.key;
            if(perro.foto !== null && perro.foto !== 'img/dog.png' && !perrosService.isUrl(perro.foto)){
                imageUploadFactory.uploadImage(perro.foto, function(filename, url){
                    perro.foto = url;
                    perro.foto_name = filename;
                    //no se pudo guardar la goto
                    if(filename === null || url === null){
                        errores.file_upload_fail = true;
                    }
                    var perroJSON = JSON.parse(angular.toJson(perro)); // json simple para guardar en datbase
                    nuevoPerroRef.set(perroJSON)
                        .then(function(){
                            callback(perro, errores);
                        })
                        .catch(function(error){
                            errores.save_dog_fail = true;
                            imageUploadFactory.deleteImage(filename);
                            callback(null, errores);
                        });
                });
            }else{
                var perroJSON = JSON.parse(angular.toJson(perro)); // json simple para guardar en datbase
                nuevoPerroRef.set(perroJSON)
                    .then(function(){
                        callback(perro, null);
                    })
                    .catch(function(error){
                        errores.save_dog_fail = true;
                        callback(null,errores);
                    });
            }
        };

        perrosService.actualizarPerro = function(perro, callback) {
            if(perro.foto !== null && perro.foto !== 'img/dog.png' && !perrosService.isUrl(perro.foto)){
                imageUploadFactory.uploadImage(perro.foto, function(filename, url){
                    //no se pudo guardar la goto
                    if(filename === null || url === null){
                        errores.file_upload_fail = true;
                    }
                    imageUploadFactory.deleteImage(perro.foto_name); // borrar foto anterior
                    perro.foto = url;
                    perro.foto_name = filename; // nueva foto
                    var perroJSON = JSON.parse(angular.toJson(perro)); // json simple para guardar en datbase
                    db.ref("/perros/"+perro.tipo+"/"+perro.id).update(perroJSON)
                        .then(function(){
                            callback(perro, errores);
                        })
                        .catch(function(error){
                            errores.save_dog_fail = true;
                            callback(null, errores);
                        });
                });
            }else{
                var perroJSON = JSON.parse(angular.toJson(perro)); // json simple para guardar en datbase
                db.ref("/perros/"+perro.tipo+"/"+perro.id).update(perroJSON)
                    .then(function(){
                        callback(perro, errores);
                    })
                    .catch(function(error){
                        errores.save_dog_fail = true;
                        callback(null, errores);
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
            return dbRef.orderByChild("real_date").limitToFirst(10).once("value");             
        }; 

        perrosService.borrarPerro = function(perro) {
            if(angular.isDefined(perro.foto_name)){
                imageUploadFactory.deleteImage(perro.foto_name); // borrar foto asociada
            }
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
          return dbRef.orderByChild("real_date").limitToFirst(10).once("value");
        };

        return perrosService;
    }]);