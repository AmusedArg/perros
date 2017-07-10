angular.module('perrosApp.factories').
    factory('ImageUploadFactory', function() {
        var ImageUploadFactory = function(){
            self = this;
            this.storageRef = firebase.storage().ref();
            this.uploadImage = function(file, callback){
                var extension = self.getExtension(file);
                if(!extension){
                    callback(null,null);
                }
                var metadata = {
                  contentType: 'image/'+extension,
                };
                var filename = '_' + Math.random().toString(36).substr(2, 9) + "." + extension;
                var uploadTask = self.storageRef.child('images').child(filename).putString(file.substring(23), 'base64', metadata);
                uploadTask.on('state_changed', function(snapshot){
                    }, function(error) {
                        uploadTask.cancel();
                        callback(null, null);
                    }, function() {
                    // Handle successful uploads on complete
                    callback(filename, uploadTask.snapshot.downloadURL);
                });
            };
            this.deleteImage = function(file){
                self.storageRef.child('images').child(file).delete()
                    .then(function() {
                      // File deleted successfully
                    })
                    .catch(function(error) {
                      // Uh-oh, an error occurred!
                    });
            };
            this.getExtension = function(file){
                if(file.indexOf('image/png') !== -1){return 'png';}
                if(file.indexOf('image/jpg') !== -1){return 'jpg';}
                if(file.indexOf('image/jpeg') !== -1){return 'jpeg';}
                return null;
            };
        };

        return ImageUploadFactory;
    });