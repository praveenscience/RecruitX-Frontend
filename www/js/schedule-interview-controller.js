angular.module('starter')
.controller('scheduleInterviewController', function($scope, $stateParams, $cordovaDatePicker, recruitFactory,  $filter) {
  'use strict';

  $stateParams.candidate.interview_rounds = [];
  /* Get Interview Rounds */
  recruitFactory.getInterviewRounds(function(interviewRounds) {
    $scope.interviewRounds = $filter('orderBy')(interviewRounds, 'priority');
  });

  $scope.dateTime = function(index) {
    var options = {
      date: new Date(),
      mode: 'datetime',
      allowOldDates: false,
      minDate: (new Date()).valueOf(),
    };

    $cordovaDatePicker.show(options).then(function(dateTime) {
      var currentInterviewRound = $scope.interviewRounds[index];
      var currentPriority = currentInterviewRound.priority;

      var nextLowerPriorityInterviewRounds = ($filter('filter')($scope.interviewRounds, {priority: currentPriority - 1}));
      var previousInterviewRound = nextLowerPriorityInterviewRounds[0];

      if ($scope.isInterviewScheduleValid(dateTime , currentInterviewRound, previousInterviewRound)) {
        $scope.interviewRounds[index].dateTime = dateTime;
      } else {
        alert('Please schedule this round after ' + previousInterviewRound.name);
      }
    });
  };

  $scope.isInterviewScheduleValid = function(scheduleDateTime, currentInterviewRound, previousInterviewRound){
    var currentPriority = currentInterviewRound.priority;

    if (currentPriority > 1 && (previousInterviewRound.dateTime === undefined || scheduleDateTime <= previousInterviewRound.dateTime)) {
        return false;
    } else {
      return true;
    }
  };

  $scope.isFormInvalid = function() {
    for (var interviewRoundIndex in $scope.interviewRounds) {
      if ($scope.interviewRounds[interviewRoundIndex].dateTime !== undefined) {
        return false;
      }
    }

    return true;
  };

  $scope.postCandidate = function() {
    for (var interviewRoundIndex in $scope.interviewRounds) {
      if ($scope.interviewRounds[interviewRoundIndex].dateTime !== undefined) {
        var formattedDateTime = $filter('date')($scope.interviewRounds[interviewRoundIndex].dateTime, 'yyyy-MM-dd HH:mm:ss');
        $stateParams.candidate.interview_rounds.push({ 'interview_id': $scope.interviewRounds[interviewRoundIndex].id,
        'interview_date_time': formattedDateTime, });
      }
    }
    $scope.stateParamsObj = $stateParams;

    recruitFactory.saveCandidate($stateParams, function(res) {
      console.log(res);
    });
  };
});
