angular.module('recruitX')
  // TODO: If we need to preload, please implement the same for the other controllers as well. If not, then remove from here
  .controller('createCandidateProfileController', ['$rootScope', '$scope', '$http', 'recruitFactory', function ($rootScope, $scope, $http, recruitFactory) {
    'use strict';

    $scope.candidate = {};

    $scope.isAtleastOnePredefinedSkillSelected = function () {
      var validity = false;
      angular.forEach($rootScope.skills, function (value) {
        if ($scope.getOtherCheckbox().name !== value.name) {
          validity = value.checked || validity;
        }
      });

      return validity;
    };

    $scope.getOtherCheckbox = function () {
      var otherSkill;
      angular.forEach($rootScope.skills, function (value) {
        if (value.name === 'Other') {
          otherSkill = value;
        }
      });

      return otherSkill;
    };

    $scope.isSkillFieldsValid = function () {
      if (Object.keys($rootScope.skills).length > 0) {
        var otherCheckBox = $scope.getOtherCheckbox();
        if (otherCheckBox.checked) {
          return $scope.candidate.other_skills !== undefined;
        } else {
          return $scope.isAtleastOnePredefinedSkillSelected();
        }
      }
    };

    $scope.isFormInvalid = function () {
      if (Object.keys($rootScope.skills).length > 0) {
        var validity = ($scope.isSkillFieldsValid() && !$scope.candidateForm.$invalid);
        return !validity;
      } else {
        return false;
      }
    };

    $scope.processCandidateData = function () {
      $scope.candidate.skill_ids = [];
      $scope.candidate.name = $scope.firstName + ' ' + $scope.lastName;
      // TODO: There should be a better way in underscore to extract with a certain parameter
      for (var skill in $rootScope.skills) {
        if ($rootScope.skills[skill].checked) {
          $scope.candidate.skill_ids.push($rootScope.skills[skill].id);
        }
      }
    };
  }
]);
