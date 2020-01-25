module.exports = ["$scope", "$rootScope", function ($scope, $rootScope) {

    $rootScope.location = '/help';
    $rootScope.isWaiting = false;

    $scope.clickMoreInfo = ()=>{
        // event.preventDefault();
        shell.openExternal("http://spyhunter272.in/#contact");
    }

}];