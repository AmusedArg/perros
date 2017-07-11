angular.module('perrosApp.factories').
    factory('FirebaseAuthenticator', function() {
        var FirebaseAuthenticator = function(){
            this.provider = new firebase.auth.GoogleAuthProvider();

            this.login = function(){
                return firebase.auth().signInWithPopup(this.provider);
            };
        };

        return FirebaseAuthenticator;
    });