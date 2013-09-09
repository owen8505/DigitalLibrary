angular.module('App.controllers', [])
.controller('LoginCtrl', ['$scope', '$location', function ($scope, $location) {
	// Variables
	$scope.title = 'Digital Library';
	$scope.connecting = 'Connecting to Device';
	$scope.ready = 'Device is Ready';
	
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
.controller('MenuCtrl', ['$scope', function ($scope) {
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
	]
}])
.controller('LibraryCtrl', ['$scope', function ($scope) {
	// Variables
	$scope.subtitle = "Last Reviewed";
	$scope.elements = [
		{id:"1", name:"LR1.pdf", type:"folder"},
		{id:"2", name:"LR2.xls", type:"folder"},
		{id:"3", name:"LR3.otro", type:"folder"},
		{id:"4", name:"LR4.pdf", type:"folder"}
	];
	
	// Funciones
	$scope.searchDocumentFolder = function(departmentId, departmentName) {
		$scope.subtitle = departmentName;
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
		$scope.subtitle = documentFolderName;
		$scope.elements = [];
		var pos = 0;
		for (var i = 0; i < 10; i++) {
			var random = Math.random() * 100;
			if (random >= 50) {
				$scope.elements[pos++] = {id:"" + random, name: "" + documentFolderName + random, type:"document-1"};
			}
		}
	}
}]);