angular.module('App.controllers', ['ngResource'])
.factory('data', [function() {
	var data = {};
	data.hideMenu = true;
	data.filter = "";
	data.resultFilter = "";
	data.breadcrumb = {
		departmentId : 0,
		departmentName : "",
		folderId : 0,
		folderName : "",
		totalElements : 0
	}
	data.setCache = function (key, value) {
		window.localStorage.setItem(key, JSON.stringify(value));
	}
	data.getCache = function (key) {
		return JSON.parse(window.localStorage.getItem(key));
	}
	data.isCache = function (key) {
		return window.localStorage.getItem(key) !== null;
	}
	data.removeCache = function (key) {
		window.localStorage.removeItem(key);
	}
	if (!data.isCache('last_viewed')) {
		data.setCache('last_viewed', []);
	}
	return data;
}])
.controller('LoginCtrl', ['$scope', '$location', function ($scope, $location) {
	// Funciones
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
.controller('MenuCtrl', ['$scope', '$resource', '$http', '$q','data', function ($scope, $resource, $http, $q, data) {
	// Se guarda la variable data.
	$scope.data = data;
	
	// Servicio que traería todo el menú
	$scope.menu = [
		{id:"1", name: "Front Office", functionalArea: [
			{id:"1", name: "Executive Management"}
		]},
		{id:"2", name: "Policy Group", functionalArea: [
			{id:"2", name: "Policy"}
		]},
		{id:"3", name: "Program Office", functionalArea: [
			{id:"3", name: "Project Management"}
		]},
		{id:"4", name: "Management", functionalArea: [
			{id:"4", name: "Office Administration"},
			{id:"5", name: "Human Resources"},
			{id:"6", name: "Procurement"},
			{id:"7", name: "Finances"},
			{id:"8", name: "Logistics"},
			{id:"9", name: "IT Support"},
			{id:"10", name: "COR"},
			{id:"11", name: "Grants"}
		]}
	];
	
	$http.defaults.headers.common.Authorization = 'Basic ' + btoa('supportserver\lopeze' + ':' + '@P4ssw0rd!');
	var deferred = $q.defer();
	var MenuService = $resource(
		"http://samepage.mexusbio.org/sites/DigitalLibrary/_vti_bin/INL.Mexico.Services/DigitalLibrary.svc/Menu/supportserver%20lopeze",
		//"http://samepage.mexusbio.org/",
		//"http://httpbin.org/post",
		//"http://httpbin.org/basic-auth/supportserver\lopeze/@P4ssw0rd!",
		{}
	).get(
		{},
		function (event) {
			deferred.resolve(event);
		},
		function (response) {
			deferred.reject(response);
		}
	);
	var MenuServicePromise = deferred.promise;
	MenuServicePromise.then(
		function(event) {alert('Success: ' + JSON.stringify(event)); },
		function(response) {alert('Error: ' + JSON.stringify(response)); }
	);
}])
.controller('LibraryCtrl', ['$scope', 'data', function ($scope, data) {
	// Se guarda la variable data.
	$scope.data = data;
	
	// Variables
	$scope.data.breadcrumb.departmentId = 0;
	$scope.data.breadcrumb.departmentName = "Last Viewed";
	$scope.elements = $scope.data.getCache('last_viewed');
	$scope.clase = 'icons';
	
	// Funciones
	$scope.searchDocumentFolder = function(departmentId, departmentName) {
		$scope.data.hideMenu = true;
		$scope.data.breadcrumb.departmentId = departmentId;
		$scope.data.breadcrumb.departmentName = departmentName;
		$scope.data.breadcrumb.folderId = 0;
		$scope.data.breadcrumb.folderName = "";
		$scope.data.breadcrumb.totalElements = 10;
		
		$scope.elements = [];
		var pos = 0;
		for (var i = 0; i < 5; i++) {
			var random = Math.random() * 100;
			if (random >= 50) {
				$scope.elements[pos++] = {id:"" + random, name: "" + departmentName + random, type:"folder"};
			}
		}
		
		if (departmentId == 0) {
			$scope.elements = $scope.data.getCache('last_viewed');
			$scope.data.breadcrumb.totalElements = $scope.elements.length;
		}
	}
	
	$scope.searchDocuments = function(documentFolderId, documentFolderName) {
		$scope.data.hideMenu = true;
		$scope.data.breadcrumb.folderId = documentFolderId;
		$scope.data.breadcrumb.folderName = documentFolderName;
		$scope.data.breadcrumb.totalElements = 100;
		
		$scope.elements = [];
		var pos = 0;
		for (var i = 0; i < 10; i++) {
			var random = Math.random() * 100;
			if (random >= 50) {
				$scope.elements[pos++] = {id:"" + random, name: "" + documentFolderName + random, type:"document-1"};
			}
		}
	}
	
	$scope.downloadDocument = function(document) {
		var last_viewed = $scope.data.getCache('last_viewed');
		var arreglo = [];
		var i = 0;
		arreglo[i++] = document;
		for (j = 0; j < last_viewed.length; j++) {
			if (i < 10) {
				if (last_viewed[j].id != document.id) {
					arreglo[i++] = last_viewed[j];
				}
			} else {
				break;
			}
		}
		$scope.data.setCache('last_viewed', arreglo);
	}
	
	$scope.filterFolders = function () {
		alert('Filtrando folders por ' + $scope.data.folderFilter.text);
	}
	$scope.filterDocuments = function () {
		alert('Filtrando documentos por ' + $scope.data.documentFilter.type + ', ' + $scope.data.documentFilter.text);
	}
}]);