describe('interviewDetailsController', function () {
  'use strict';

  beforeEach(module('recruitX'));

  var $scope = {};

  beforeEach(inject(function ($controller, loggedinUserStore) {
    spyOn(loggedinUserStore, 'userId').and.returnValue('userId');

    $controller('interviewDetailsController', {
      $scope: $scope
    });
  }));

  describe('methods', function () {
    describe('extractFeedback', function () {
      $scope.feedBackResult = {};
      var result = 'Pursue';
      it('should extract the feed back result', function () {
        $scope.extractFeedback(result);
        expect(angular.equals($scope.feedBackResult, result)).toBe(true);
      });
    });

    describe('formatPanelists', function () {
      it('should return empty string when there is no panelists', function () {
        $scope.interview.panelists = [];
        var actualValue = $scope.formatPanelists($scope.interview.panelists);
        expect(actualValue).toEqual('');
      });

      it('should return one panelist when there is a panelist', function () {
        $scope.interview.panelists = ['recruitx'];
        var actualValue = $scope.formatPanelists($scope.interview.panelists);
        expect(actualValue).toEqual('recruitx');
      });

      it('should return concatinated string when there are panelists', function () {
        $scope.interview.panelists = ['recruitx', 'test'];
        var actualValue = $scope.formatPanelists($scope.interview.panelists);
        expect(actualValue).toEqual('recruitx, test');
      });
    });

    describe('canNotEnterFeedBack', function () {
      var currentDate = {};
      var futureDate = {};
      var minutes = {};

      it('should return true if the interview start time is in the future and panelist is logged in user', function () {
        // $scope.interview.start_time = '2016-02-05T09:17:00Z';
        currentDate = new Date();
        minutes = 30;
        futureDate = new Date(currentDate.setMinutes(currentDate.getMinutes() + minutes));
        $scope.interview.start_time = futureDate;
        $scope.interview.panelists = ['userId'];

        expect($scope.canNotEnterFeedBack()).toEqual(true);
      });

      it('should return false if the interview start time is now and panelist is logged in user', function () {
        $scope.interview.start_time = new Date();
        $scope.interview.panelists = ['userId'];

        expect($scope.canNotEnterFeedBack()).toEqual(false);
      });

      it('should return true if the interview start time is in the future and panelist is not logged in user', function () {
        // $scope.interview.start_time = '2016-02-05T09:17:00Z';
        currentDate = new Date();
        minutes = 30;
        futureDate = new Date(currentDate.setMinutes(currentDate.getMinutes() + minutes));
        $scope.interview.start_time = futureDate;
        $scope.interview.panelists = ['test'];

        expect($scope.canNotEnterFeedBack()).toEqual(true);
      });

      it('should return false if the interview start time is in the past and panelist is logged in user', function () {
        currentDate = new Date();
        minutes = 1;
        $scope.interview.start_time = new Date(currentDate.getYear(), currentDate.getMonth(), currentDate.getDay() - 1);
        $scope.interview.panelists = ['userId'];

        expect($scope.canNotEnterFeedBack()).toEqual(false);
      });

      it('should return true if the interview start time is in the past and panelist is not logged in user', function () {
        currentDate = new Date();
        minutes = 1;
        futureDate = new Date(currentDate.setMinutes(currentDate.getMinutes() - minutes));
        $scope.interview.start_time = futureDate;
        $scope.interview.panelists = ['test'];

        expect($scope.canNotEnterFeedBack()).toEqual(true);
      });
    });
  });
});
