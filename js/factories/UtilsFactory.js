angular.module('perrosApp.factories').
	factory('UtilsFactory', function(){
		
		var UtilsFactory = {
			getHexColorCollar: function(collar_detalle) {
				var materialColors = ['#f44336','#e91e63','#9c27b0','#2196f3','#4caf50','#ffc107','#ff5722','#795548','#9e9e9e','#212121'];
				var colorsName = ['rojo','rosa','violeta','azul','verde','amarillo','naranja','marron','gris', 'negro'];
				var defaultColor = '#009688';
				if(collar_detalle){
					var words = collar_detalle.split(" ");
					for (var i = 0; i < words.length; i++) {
						for (var j = 0; j < colorsName.length; j++) {
							var word = words[i].trim();
							var color = colorsName[j];
							if(word.toUpperCase() === color.toUpperCase()){
								return materialColors[j];
							}
						}
					}
				}
				return defaultColor;
			}
		};

		return UtilsFactory;
	});