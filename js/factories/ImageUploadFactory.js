angular.module('perrosApp.factories').
    factory('ImageUploadFactory', function() {
        var ImageUploadFactory = function(){
            self = this;
            this.storageRef = firebase.storage().ref();
            this.uploadImage = function(file, callback){
                var filename = '_' + Math.random().toString(36).substr(2, 9);
                var uploadTask = self.storageRef.child('images').child(filename).putString(file.substring(23), 'base64');
                uploadTask.on('state_changed', function(snapshot){
                    }, function(error) {
                        console.log(error);
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
                        console.log(error);
                      // Uh-oh, an error occurred!
                    });
            };
        };

        return ImageUploadFactory;
    });