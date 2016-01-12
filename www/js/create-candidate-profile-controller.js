angular.module('starter')

.controller('createCandidateProfileController', function ($scope) {
  'use strict';

  $scope.candidate = {};

  $scope.candidate.skills =[
    {name: "Java"},
    {name: "Ruby"},
    {name: "C#"},
    {name: "Python"},
    {name: "Other"}
  ];

  $scope.roles= ["Dev", "QA", "BA"];

  $scope.isAtleastOneSkillSelected = function(){
      var validity = false;
      angular.forEach( $scope.candidate.skills, function(value, key){
        validity = value.checked || validity;
      });
      return validity;
  }

  $scope.hasOtherSkills = function(){
    var otherSkills = false;
    angular.forEach( $scope.candidate.skills, function(value, key){
      if( value.name == "Other"){
        otherSkills = value.checked || false;
      }
    });
    return otherSkills;
  }

  $scope.isFormInvalid = function () {
    return !$scope.isAtleastOneSkillSelected() || $scope.candidateForm.$invalid;
  }
});
