angular.module('App.controllers', ['ngResource'])
.factory('data', [function() {
	var data = {};
	data.hideMenu = true;
    data.showLoader = false;
    data.showDocumentOptions = false;
    data.showInfo = false;
	data.filter = "";
	data.resultFilter = "";
    data.selectedDocument = {};
	
	// Breadcrumbs
	data.breadcrumb = {
		departmentId : 0,
		departmentName : "",
		folderId : 0,
		folderName : "",
		totalElements : 0,
        lastId : 0
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
		$scope.message = "Enter your passcode:";
	} else {
		$scope.message = "Please, set a secure passcode:";
		$scope.newPin = true;
	}
	$scope.savePin = function() {
		if ($scope.pin.length == 4) {
            if ($scope.pin == $scope.pinConfirmation) {
                $scope.data.setCache('pin', $scope.pin);
                $location.path('/library');
            } else {
                $scope.errorMessage = "The passcode and the passcode confirmation don't match.";
                          window.scrollTo(0, 0);
            }
		} else {
			$scope.errorMessage = "The pin must have 4 digits.";
                          window.scrollTo(0, 0);
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
.controller('LibraryCtrl', ['$scope', '$rootScope', '$location', '$timeout', '$resource', '$q', 'data', '$window', function ($scope, $rootScope, $location, $timeout, $resource, $q, data, $window) {
	// Se guarda la variable data.
	$scope.data = data;
	$scope.data.showScrollLoader = false;
    $scope.data.showDocumentOptions = false;
	
	// Variables
	$scope.data.breadcrumb.departmentId = 0;
	$scope.data.breadcrumb.departmentName = "Last Viewed";
	$scope.elements = $scope.data.getCache('last_viewed');
	$scope.data.breadcrumb.totalElements = $scope.elements.length;
	$scope.clase = 'icons';
    $scope.selectedLayoutIcons = 'selected';
	$scope.selectedLayoutList = '';
                            
	// Funciones
	/** Actualiza el path y ejecuta una función después de actualizarlo **/
	$scope.updatePath = function (windowRef, funcionRef) {
		windowRef.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
			function onFileSystemSuccess(fileSystem) {
				fileSystem.root.getFile(
				"index.html", {create: true, exclusive: false}, 
				function gotFileEntry(fileEntry) {
					var sPath = fileEntry.fullPath.replace("/index.html","");
					$scope.data.setCache('file_path', sPath);
					fileEntry.remove();
				
					funcionRef();
				},
				function(e) {
					alert('DOWN1 error ' + e);
				});
			},
			function(e) {
				alert('DOWN0 error ' + e);
			});
	}
	/** Verifica ¿Qué documentos sí están locales? **/
	$scope.verifyLocalDocuments = function (windowRef, documentsToVerify) {
		var pathTemp = $scope.data.getCache('file_path');
		var documentsTemp = {};
		for (var i = 0; i < documentsToVerify.length; i++) {
			var tempId = 'document_' + documentsToVerify[i].id;
			var url = 'file://' + pathTemp + documentsToVerify[i].serverRelativeUrl;
			var name = url.replace(/^.*[\\\/]/, '');
			documentsTemp[name] = documentsToVerify[i].id;
			windowRef.resolveLocalFileSystemURI(
				url,
				function(fileEntry) {
					//alert('Encontrado local: ' +  documentsTemp[fileEntry.name] + ', fileEntry: ' + JSON.stringify(fileEntry));
					var documentId = documentsTemp[fileEntry.name];
					for (var j = 0; j < documentsToVerify.length; j++) {
						if (documentsToVerify[j].id == documentId) {
							documentsToVerify[j].cssClass = 'local';
							break;
						}
					}
				},
				function(error) {});
		}
	}
	/** Verifica documentos locales **/
	$scope.verifyDocuments = function (windowRef, documentsToVerify) {
		if ($scope.data.isCache('file_path')) {
			$scope.verifyLocalDocuments(windowRef, documentsToVerify);
		} else {
			$scope.updatePath(windowRef, function () {
				$scope.verifyLocalDocuments(windowRef, documentsToVerify);
			});
		}
	}
	$scope.verifyDocuments($window, $scope.elements);
	
	/** Busca folders **/
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
			
			$scope.verifyDocuments($window, $scope.elements);
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
	
	/** Busca documentos **/
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
                        $scope.verifyDocuments($window, $scope.elements);

				
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
	
	/** Descarga archivo **/
	$scope.downloadFile = function (path, serverUrl, documentHTML) {
        var fileTransfer = new FileTransfer();
		fileTransfer.download(
			"http://sap.mexusbio.org/DigitalLibraryServices/SharePointDataAccess.svc/Document?d=" + serverUrl,
			path + serverUrl,
			function(theFile) {
				documentHTML.removeClass('downloading');
				documentHTML.addClass('local');
                $scope.verifyDocuments($window, $scope.elements);
			},
			function(error) {
				alert("Download error: " + JSON.stringify(error));
				documentHTML.removeClass('downloading');
				console.log("download error source " + error.source);
				console.log("download error target " + error.target);
				console.log("upload error code: " + error.code);
			}
		);
	}
	
	/** Acción que se ejecuta para descargar un documento **/
	$scope.downloadDocument = function(document) {
		documentHTML = angular.element($window.document.getElementById('document_' + document.id));
		if (documentHTML.hasClass('downloading')) {
			// Ignores click
		} else if (documentHTML.hasClass('local')) {
			if ($scope.data.isCache('file_path')) {
				//alert('Opening file: ' + $scope.data.getCache('file_path') + document.serverRelativeUrl);
				//$window.open($scope.data.getCache('file_path') + document.serverRelativeUrl, '_blank');
				//$window.location.href = $scope.data.getCache('file_path') + document.serverRelativeUrl;
                $window.open(document.url, '_system');
			} else {
				$scope.updatePath($window, function () {
					//alert('Opening file: ' + $scope.data.getCache('file_path') + document.serverRelativeUrl);
					//$window.open($scope.data.getCache('file_path') + document.serverRelativeUrl, '_blank');
					//$window.location.href = $scope.data.getCache('file_path') + document.serverRelativeUrl;
                    $window.open(document.url, '_system');
				});
			}
			
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
		} else {
            $scope.hideOptions();
			documentHTML.addClass('downloading');
			if ($scope.data.isCache('file_path')) {
				$scope.downloadFile($scope.data.getCache('file_path'), document.serverRelativeUrl, documentHTML);
			} else {
				$scope.updatePath($window, function () {
					$scope.downloadFile($scope.data.getCache('file_path'), document.serverRelativeUrl, documentHTML);
				});
			}
		}
	}
	
	$scope.filterFolders = function () {
		alert('Filtrando folders por ' + $scope.data.folderFilter.text);
	}
	$scope.filterDocuments = function () {
		alert('Filtrando documentos por ' + $scope.data.documentFilter.type + ', ' + $scope.data.documentFilter.text);
	}
                            
    $scope.changeLayout = function (pressedButton) {
        if(pressedButton == 'icons'){
            $scope.clase = 'icons';
            $scope.selectedLayoutIcons = 'selected';
            $scope.selectedLayoutList = '';
        } else {
            $scope.clase = 'list';
            $scope.selectedLayoutIcons = '';
            $scope.selectedLayoutList = 'selected';
        }
    }
                            
    $scope.showOptions = function (document) {
        $scope.data.showDocumentOptions = true;
        $scope.data.selectedDocument = document;
    }
               
    $scope.showDocument = function() {
        $scope.downloadDocument($scope.data.selectedDocument);
    }
                            
    $scope.showDocumentInfo = function () {
        $scope.data.showInfo = true;
    }
                            
    $scope.hideOptions = function () {
        $scope.data.showDocumentOptions = false;
    }
            
    $scope.sendMail = function() {
        window.plugins.emailComposer.showEmailComposerWithCallback(function(result){console.log(result);},"Document shared - " + $scope.data.selectedDocument.name,"I would like to share a document with you",[],[],[],false,[$scope.data.getCache('file_path') + $scope.data.selectedDocument.serverRelativeUrl]);
    }
                            
    $scope.back = function(){
        $scope.data.showInfo = false;
    }
                    
}]);