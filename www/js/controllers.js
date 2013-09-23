angular.module('App.controllers', ['ngResource'])
.factory('data', [function() {
	var data = {};
	data.hideMenu = true;
    data.showLoader = false;
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
.controller('MenuCtrl', ['$scope', '$resource', '$q','data', function ($scope, $resource, $q, data) {
	// Se guarda la variable data.
	$scope.data = data;
    $scope.data.showLoader = true;
                         
    //var loaderTimeout = $timeout(function() { alert('Error de conexión'); }, 10000);
                         
	// Servicio que traería todo el menú
	/*$scope.menu = [
		{id:"1", name: "Front Office", functionalArea: [
			{id:"1", name: "Executive Management"}
		]},
		{id:"2", name: "Policy Group", functionalArea: [
			{id:"2", name: "Policy"}
		]},
		{id:"3", name: "Program Office", functionalArea: [
			{id:"3", name: "Project Management"}
		]}
	];*/
	
	//$http.defaults.headers.common.Authorization = 'Basic ' + btoa('supportserver\lopeze' + ':' + '@P4ssw0rd!');
	var deferred = $q.defer();
	var MenuService = $resource(
		"http://sap.mexusbio.org/DigitalLibraryServices/SharePointDataAccess.svc/Menu",
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
		function(event) {
                            //$timeout.cancel(loaderTimeout);
                            $scope.data.showLoader = false;
                            $scope.menu = event.GetMenuResult;
                        },
		function(response) {
                            alert('Error: Menu couldn\'t be retrieved');
                            }
	);
}])
.controller('LibraryCtrl', ['$scope', '$resource', '$q', 'data', function ($scope, $resource, $q, data) {
	// Se guarda la variable data.
	$scope.data = data;
	
	// Variables
	$scope.data.breadcrumb.departmentId = 0;
	$scope.data.breadcrumb.departmentName = "Last Viewed";
	$scope.elements = $scope.data.getCache('last_viewed');
	$scope.data.breadcrumb.totalElements = $scope.elements.length;
	$scope.clase = 'icons';
	
	// Funciones
	$scope.searchDocumentFolder = function(departmentId, departmentName, departmentUrl) {
		$scope.data.hideMenu = true;
		$scope.data.breadcrumb.departmentId = departmentId;
		$scope.data.breadcrumb.departmentName = departmentName;
		$scope.data.breadcrumb.departmentUrl = departmentUrl;
		$scope.data.breadcrumb.folderId = 0;
		$scope.data.breadcrumb.folderName = "";
		
		/**
		
		$scope.elements = [];
		var pos = 0;
		for (var i = 0; i < 5; i++) {
			var random = Math.random() * 100;
			if (random >= 50) {
				$scope.elements[pos++] = {id:"" + random, name: "" + departmentName + random, type:"folder"};
			}
		}
		$scope.data.breadcrumb.totalElements = $scope.elements.length;
		
		if (departmentId == 0) {
			$scope.elements = $scope.data.getCache('last_viewed');
			$scope.data.breadcrumb.totalElements = $scope.elements.length;
		}
		
		**/
		
		if (departmentId == 0) {
			$scope.elements = $scope.data.getCache('last_viewed');
			$scope.data.breadcrumb.totalElements = $scope.elements.length;
		} else {
			$scope.data.showLoader = true;
			var deferred = $q.defer();
			var LibraryService = $resource(
				"http://sap.mexusbio.org/DigitalLibraryServices/SharePointDataAccess.svc/Libraries?w=:w",
				{}
			).get(
				{
					w : departmentUrl
				},
				function (event) {
					deferred.resolve(event);
				},
				function (response) {
					deferred.reject(response);
				}
			);
			var LibraryService = deferred.promise;
			LibraryService.then(
				function(event) {
					$scope.elements = event.GetListsResult;
					$scope.data.breadcrumb.totalElements = $scope.elements.length;
					$scope.data.showLoader = false;
				},
				function(response) {
					alert('Error: Library couldn\'t be retrieved');
				}
			);
		}
	}
	
	$scope.searchDocuments = function(documentFolderId, documentFolderName) {
		$scope.data.hideMenu = true;
		$scope.data.breadcrumb.folderId = documentFolderId;
		$scope.data.breadcrumb.folderName = documentFolderName;
		
		$scope.elements = [];
		var pos = 0;
		for (var i = 0; i < 10; i++) {
			var random = Math.random() * 100;
			if (random >= 50) {
				$scope.elements[pos++] = {id:"" + random, name: "" + documentFolderName + random, type:"document-1"};
			}
		}
		$scope.data.breadcrumb.totalElements = $scope.elements.length;
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