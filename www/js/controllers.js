angular.module('App.controllers', [])
.controller('LoginCtrl', ['$scope', '$location', function ($scope, $location) {
	$scope.title = 'Digital Library';
	$scope.connecting = 'Connecting to Device';
	$scope.ready = 'Device is Ready';
	
	$scope.login = function(user) {
		if (user.username == undefined) {
			alert('Introduce tu usuario para continuar.');
		} else if (user.password == undefined) {
			alert('Introduce tu password para continuar.');
		} else {
			if (user.username == 'test' && user.password == 'test') {
				$location.path('/library');
			} else {
				alert('Usuario y contraseña inválidos.');
			}
		}
	};
}])
.controller('LibraryCtrl', ['$scope', function ($scope) {
	// Controlador para library
	// alert('LibraryCtrl');
}]);