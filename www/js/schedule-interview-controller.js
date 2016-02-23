angular.module('recruitX')
  .controller('scheduleInterviewController', ['$timeout', '$rootScope', '$state', 'MasterData', '$scope', '$stateParams', '$cordovaDatePicker', 'recruitFactory', '$filter', 'dialogService', function ($timeout, $rootScope, $state, MasterData, $scope, $stateParams, $cordovaDatePicker, recruitFactory, $filter, dialogService) {
    'use strict';

    // TODO: Inline later - currently not working - need to figure out why so.
    $scope.interviewRounds = MasterData.getInterviewTypes();

    $scope.dateTime = function (index) {
      var options = {
        date: new Date(),
        mode: 'datetime',
        allowOldDates: false,
        minDate: (new Date()).valueOf()
      };

      $cordovaDatePicker.show(options).then(function (dateTime) {
        var currentInterviewRound = $scope.interviewRounds[index];
        var currentPriority = currentInterviewRound.priority;

        var nextLowerPriorityInterviewRounds = ($filter('filter')($scope.interviewRounds, {
          priority: currentPriority - 1
        }));
        var previousInterviewRound = nextLowerPriorityInterviewRounds[0];

        var nextInterviewRounds = ($filter('filter')($scope.interviewRounds, {
          priority: currentPriority + 1,
          dateTime: '!!'
        }));

        var result1 = $scope.checkWithPreviousRound(dateTime, currentInterviewRound, previousInterviewRound);
        var result2 = $scope.checkWithNextRound(dateTime, currentInterviewRound, nextInterviewRounds);
        if (angular.equals({}, result1)) {
          if(angular.equals({}, result2)) {
            $scope.interviewRounds[index].dateTime = dateTime;
          }
          else {
            dialogService.showAlert('Invalid Selection', result2.message);
          }
        } else {
          dialogService.showAlert('Invalid Selection', result1.message);
        }
      });
    };

    $scope.checkWithPreviousRound = function(scheduleDateTime, currentInterviewRound, previousInterviewRound) {
      var error = {};
      var currentPriority = currentInterviewRound.priority;
      var previousInterviewTime = {};
      if (currentPriority > 1) {
        previousInterviewTime = previousInterviewRound.dateTime === undefined ? undefined : new Date(previousInterviewRound.dateTime);
        if(previousInterviewTime === undefined || scheduleDateTime < previousInterviewTime.setHours(previousInterviewTime.getHours() + 1)) {
          error.message = 'Please schedule this round atleast 1hr after  ' + previousInterviewRound.name;
        }
      }
      return error;
    };

    $scope.checkWithNextRound = function(scheduleDateTime, currentInterviewRound, nextInterviewRounds) {
      var error = {};
      if(nextInterviewRounds.length === 0) {
        return error;
      }
      var nextInterviewRound = $scope.getInterviewWithMinStartTime(nextInterviewRounds);
      var currentPriority = currentInterviewRound.priority;
      var nextInterviewTime = {};
      // TODO: @arun - what is the meaning being conveyed here to a new programmer?
      if (currentPriority < 4) {
        nextInterviewTime = new Date(nextInterviewRound.dateTime);
        if(scheduleDateTime > nextInterviewTime.setHours(nextInterviewTime.getHours() - 1)) {
          error.message = 'Please schedule this round atleast 1hr before  ' + nextInterviewRound.name;
        }
      }
      return error;
    };

    $scope.getInterviewWithMinStartTime = function(interviews) {
      var minInterview = interviews[0];
      for (var i = 0; i < interviews.length; i++) {
        var minDate = minInterview.dateTime;
        if(interviews[i].dateTime < minDate) {
          minInterview = interviews[i];
        }
      }
      return minInterview;
    };

    $scope.isFormInvalid = function () {
      // TODO: Use some built-in functionality from angular for this
      for (var interviewRoundIndex in $scope.interviewRounds) {
        if ($scope.interviewRounds[interviewRoundIndex].dateTime !== undefined) {
          return false;
        }
      }

      return true;
    };

    $scope.postCandidate = function () {
      $stateParams.candidate.interview_rounds = [];
      for (var interviewRoundIndex in $scope.interviewRounds) {
        if ($scope.interviewRounds[interviewRoundIndex].dateTime !== undefined) {
          var dateTime = $scope.interviewRounds[interviewRoundIndex].dateTime;
          $stateParams.candidate.interview_rounds[interviewRoundIndex] = ({
            'interview_type_id': $scope.interviewRounds[interviewRoundIndex].id,
            'start_time': dateTime
          });
        }
      }

      var redirectToHomePage = function () {
        $timeout(function () {
          for (var interviewIndex in $scope.interviewRounds) {
            $scope.interviewRounds[interviewIndex].dateTime = undefined;
          }
          $rootScope.$broadcast('clearFormData');
          $rootScope.$broadcast('loaded:masterData');
        });
        $state.go('panelist-signup');
      };

      recruitFactory.saveCandidate($stateParams, function (response) {
        // console.log(response);
        dialogService.showAlertWithDismissHandler('Success', 'Candidate Interview successfully added!!', redirectToHomePage);
      }, function (response) {
        var errors = response.data.errors;
        // console.log(errors);
        dialogService.showAlertWithDismissHandler('Failed', errors[0].reason);
      });
    };
  }
]);
