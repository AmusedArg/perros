angular.module('perrosApp.factories').
    factory('FirebaseAuthenticator', function() {
        var FirebaseAuthenticator = function(){
            this.login = function(email, password){
                return firebase.auth().signInWithEmailAndPassword(email, password);
            };
        };

        return FirebaseAuthenticator;
    });