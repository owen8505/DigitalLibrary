angular.module('App.controllers', ['ngResource'])
.factory('data', [function() {
	var data = {};
	data.hideMenu = true;
    data.showLoader = false;
	data.filter = "";
	data.resultFilter = "";
	
	// Breadcrumbs
	data.breadcrumb = {
		departmentId : 0,
		departmentName : "",
		folderId : 0,
		folderName : "",
		totalElements : 0
	}
	data.currentDepartmentUrl = '';
	
	// Scroll functions
	data.scrollListen = false;
	data.scrollHandler = function(data) {
	}
	data.scrollLastId = 64000;
	window.onscroll = function() {
    	if (data.scrollListen && ((window.pageYOffset + window.innerHeight) >= document.body.offsetHeight)) {
			data.scrollHandler(data);
    	}
	}
	
	// Cache functions
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
	
	// Return data
	return data;
}])
.controller('LoginCtrl', ['$scope', '$location', 'data', function ($scope, $location, data) {
	// Funciones
	$scope.data = data;
	$scope.newPin = false;
	if ($scope.data.isCache('pin')) {
		$scope.message = "Input the pin for the app.";
	} else {
		$scope.message = "It's the first time you use the app. Input the pin for the app.";
		$scope.newPin = true;
	}
	$scope.save = function(pin) {
		if (pin.length == 4) {
			$scope.data.setCache('pin', pin);
			$location.path('/library');
		} else {
			alert("The pin must have 4 digits.");
		}
	}
	$scope.login = function(pin) {
		var compare = $scope.data.getCache('pin');
		if (compare == pin) {
			$location.path('/library');
		} else {
			alert('Wrong pin. Try again.');
		}
	};
}])
.controller('ConnectionCtrl', ['$scope', '$location', 'data', function ($scope, $location, data) {
	// Funciones
	$scope.data = data;
	$scope.reconnect = function() {
		$location.path('/');
	}
}])
.controller('MenuCtrl', ['$scope', '$location', '$resource', '$q','data', function ($scope, $location, $resource, $q, data) {
	// Se guarda la variable data.
	$scope.data = data;
    $scope.data.showLoader = true;
	
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
            $location.path('/connection');
        }
	);
}])
.controller('LibraryCtrl', ['$scope', '$resource', '$q', 'data', '$window', function ($scope, $resource, $q, data, $window) {
	// Se guarda la variable data.
	$scope.data = data;
	$scope.data.showScrollLoader = false;
	
	// Variables
	$scope.data.breadcrumb.departmentId = 0;
	$scope.data.breadcrumb.departmentName = "Last Viewed";
	$scope.elements = $scope.data.getCache('last_viewed');
	$scope.data.breadcrumb.totalElements = $scope.elements.length;
	$scope.clase = 'icons';
	
	// Funciones
	$scope.searchDocumentFolder = function(departmentId, departmentName, departmentUrl) {
		$scope.data.hideMenu = true;
		$scope.data.scrollListen = false;
		$scope.data.scrollHandler = function(data) {};
		$scope.data.showScrollLoader = false;
		$scope.data.breadcrumb.departmentId = departmentId;
		$scope.data.breadcrumb.departmentName = departmentName;
		$scope.data.breadcrumb.departmentUrl = departmentUrl;
		$scope.data.breadcrumb.folderId = 0;
		$scope.data.breadcrumb.folderName = "";
		
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
					$window.scrollTo(0, 0);
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
	
	$scope.searchDocuments = function(documentFolderId, documentFolderName, documentFolderUrl, departmentUrl, lastId) {
		$scope.data.hideMenu = true;
		$scope.data.breadcrumb.folderId = documentFolderId;
		$scope.data.breadcrumb.folderName = documentFolderName;
		$scope.data.breadcrumb.folderUrl = documentFolderUrl;
		$scope.data.currentDepartmentUrl = departmentUrl;
		
		if (!$scope.data.showLoader && !$scope.data.showScrollLoader) {
			if (lastId >= 64000) {
				$scope.elements = [];
				$window.scrollTo(0, 0);
				$scope.data.showLoader = true;
			} else {
				$scope.data.showScrollLoader = true;
			}
		
			var deferred = $q.defer();
			var LibraryService = $resource(
				"http://sap.mexusbio.org/DigitalLibraryServices/SharePointDataAccess.svc/Documents?w=:w&l=:l&b=:b&i=:i",
				{}
			).get(
				{
					w : documentFolderUrl,
					l : documentFolderId,
					b : 24,
					i : lastId
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
					if (event.GetDocumentsResult.items.length > 0) {
						$scope.elements = $scope.elements.concat(event.GetDocumentsResult.items);
						$scope.data.breadcrumb.totalElements = event.GetDocumentsResult.totalItems;
						$scope.data.scrollLastId = event.GetDocumentsResult.lastID;
						$scope.data.showLoader = false;
						$scope.data.showScrollLoader = false;
				
						$scope.data.scrollListen = true;
						$scope.data.scrollHandler = function(data) {
							$scope.searchDocuments(data.breadcrumb.folderId, data.breadcrumb.folderName, data.breadcrumb.folderUrl, data.currentDepartmentUrl, data.scrollLastId);
						};
					} else {
						if ($scope.elements.length == 0) {
							$scope.data.breadcrumb.totalElements = 0;
						}
						$scope.data.showLoader = false;
						$scope.data.showScrollLoader = false;
					
						$scope.data.scrollListen = false;
						$scope.data.scrollHandler = function(data) {};
					}
				},
				function(response) {
					$scope.data.showLoader = false;
					$scope.data.showScrollLoader = false;
					alert('Error: Library couldn\'t be retrieved');
				}
			);
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