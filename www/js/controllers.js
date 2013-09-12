angular.module('App.controllers', [])
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
.controller('MenuCtrl', ['$scope', 'data', function ($scope, data) {
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
}])
.controller('LibraryCtrl', ['$scope', 'data', function ($scope, data) {
	// Se guarda la variable data.
	$scope.data = data;
	
	// Variables
	$scope.data.breadcrumb.departmentId = 0;
	$scope.data.breadcrumb.departmentName = "Last Reviewed";
	$scope.elements = [
		{id:"1", name:"LR1.pdf", type:"folder"},
		{id:"2", name:"LR2.xls", type:"folder"},
		{id:"3", name:"LR3.otro", type:"folder"},
		{id:"4", name:"LR4.pdf", type:"folder"}
	];
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
	
	$scope.filterFolders = function () {
		alert('Filtrando folders por ' + $scope.data.folderFilter.text);
	}
	$scope.filterDocuments = function () {
		alert('Filtrando documentos por ' + $scope.data.documentFilter.type + ', ' + $scope.data.documentFilter.text);
	}
}]);