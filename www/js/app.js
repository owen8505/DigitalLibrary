angular.module('App', ['App.services', 'App.controllers'])
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    }])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider
        	.when('/', {
				controller: 'LoginCtrl',
				templateUrl: 'templates/login.html'
			})
			.when('/library', {
				controller: 'LibraryCtrl',
				templateUrl: 'templates/library.html'
			})
			.when('/connection', {
				controller: 'ConnectionCtrl',
				templateUrl: 'templates/connection.html'
			})
			.otherwise({
				redirectTo: '/'
			});
    }]);