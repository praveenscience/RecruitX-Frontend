angular.module('recruitX')
  .controller('TabsCtrl', ['$cordovaToast', '$scope', 'recruitFactory', 'skillHelperService', 'loggedinUserStore', 'dialogService', '$ionicHistory', '$state', '$filter', '$rootScope', '$ionicAnalytics', 'deployChannel', function ($cordovaToast, $scope, recruitFactory, skillHelperService, loggedinUserStore, dialogService, $ionicHistory, $state, $filter, $rootScope, $ionicAnalytics, deployChannel) {
    'use strict';

    var refreshing = false;
    var slot_or_interview = undefined;
    $scope.items = [];
    $scope.loggedinUserName = loggedinUserStore.userFirstName();
    $scope.isLoggedinUserRecruiter = loggedinUserStore.isRecruiter();
    $scope.isLoggedinUserSuperUser = loggedinUserStore.isSuperUser();
    $scope.all_candidates = [];
    $scope.next_requesting_page = 1;
    $scope.total_pages = 1;
    $scope.noMyInterviews = true;
    $scope.noItems = true;
    $scope.noCandidates = true;
    $scope.currentTab = $state.params.tab;

    $scope.finishRefreshing = function () {
      $scope.$broadcast('scroll.refreshComplete');
    };

    if(deployChannel === 'production') {
      $ionicAnalytics.track('Home Page', {
        is_recruiter: loggedinUserStore.isRecruiter()
      });
    }

    var isInterviewsTab = function() {
      return $scope.currentTab === 'interviews';
    };
    var isCandidatesTab = function() {
      return $scope.currentTab === 'candidates';
    };
    var isMyInterviewsTab = function() {
      return $scope.currentTab === 'myInterviews';
    };

    $scope.manuallyRefreshInterviews = function () {
      isInterviewsTab() && $scope.refreshInterviews();
      refreshing = true;
      if (loggedinUserStore.isSuperUser()) {
        isCandidatesTab() && $scope.refreshCandidates(1);
        isMyInterviewsTab() && $scope.refreshMyInterviews(1);
      }
      else if (!loggedinUserStore.isRecruiter()) {
        isMyInterviewsTab() && $scope.refreshMyInterviews(1);
      } else {
        isCandidatesTab() && $scope.refreshCandidates(1);
      }
    };

    $scope.refreshInterviews = function () {
      if (loggedinUserStore.isRecruiter()) {
        $scope.getSosStatus();
      }
      recruitFactory.getInterviews({
        panelist_login_name: loggedinUserStore.userId(),
        panelist_experience: loggedinUserStore.experience(),
        panelist_role: loggedinUserStore.role().name
      }, function (newItems) {
        $scope.items = newItems;
        $scope.noItems = $scope.items.length === 0 ? true : false;
        $scope.finishRefreshing();
        console.log('AM success' + $scope.items);
      }, function (error) {
        console.log('AM custom error' + error);
        $scope.finishRefreshing();
      });
    };

    $scope.refreshMyInterviews = function (page_number) {
      if(deployChannel === 'production') {
        $ionicAnalytics.track('MyInterviews');
      }
      var data = {
        'page': page_number
      };
      if (page_number === 1) {
        $scope.next_requesting_page = 1;
        $scope.myinterviews = [];
      }
      recruitFactory.getMyInterviews(data, function (myinterviews, total_pages) {
        $scope.myinterviews = $scope.myinterviews.concat(myinterviews);
        $scope.noMyInterviews = $scope.myinterviews.length === 0 ? true : false;
        $scope.total_pages = total_pages;
        $scope.next_requesting_page++;
        $scope.finishRefreshing();
        $scope.$broadcast('scroll.infiniteScrollComplete');
        refreshing = false;
      }, function (error) {
        console.log('AM custom error' + error);
        $scope.finishRefreshing();
      });
    };

    $scope.refreshCandidates = function (page_number) {
      var data = {
        'page': page_number
      };
      if (page_number === 1) {
        $scope.next_requesting_page = 1;
        $scope.all_candidates = [];
      }
      recruitFactory.getAllCandidates(data, function (candidates, total_pages) {
        $scope.all_candidates = $scope.all_candidates.concat(candidates);
        $scope.noCandidates = $scope.all_candidates.length === 0 ? true : false;
        $scope.total_pages = total_pages;
        $scope.next_requesting_page++;
        $scope.finishRefreshing();
        //TODO: Do this in a better way to avoid multiple calls to backend during pagination
        $scope.$broadcast('scroll.infiniteScrollComplete');
        refreshing = false;
      });
    };

    $rootScope.$on('sosChanged', function (event, args) {
      $scope.sosValidity = args.sosValidity;
    });

    $scope.getSosStatus = function () {
      recruitFactory.getSosStatus(function (response) {
        $rootScope.$broadcast('sosChanged', {sosValidity: response.data.sos_validity});
      });
    };

    $scope.loadMoreCandidates = function () {
      if (!refreshing && $scope.next_requesting_page <= $scope.total_pages) {
        $scope.refreshCandidates($scope.next_requesting_page);
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    };

    $scope.loadMoreMyInterviews = function () {
      if (!refreshing && $scope.next_requesting_page <= $scope.total_pages) {
        $scope.refreshMyInterviews($scope.next_requesting_page);
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    };

    $scope.signingUp = function ($event, item) {
      $event.stopPropagation();
      if (!item.signup) {
        $cordovaToast.showShortBottom(item.signup_error);
      } else {
        if (item.candidate.id) {
          slot_or_interview = 'interview';
          $scope.interview_panelist = {
            interview_panelist: {
              'panelist_login_name': loggedinUserStore.userId(),
              'interview_id': item.id,
              'panelist_experience': loggedinUserStore.experience(),
              'panelist_role': loggedinUserStore.role().name
            }
          };
        }
        else {
          slot_or_interview = 'slot';
          $scope.interview_panelist = {
            slot_panelist: {
              'panelist_login_name': loggedinUserStore.userId(),
              'slot_id': item.id,
              'panelist_experience': loggedinUserStore.experience(),
              'panelist_role': loggedinUserStore.role().name
            }
          };
        }
        dialogService.askConfirmation('Sign up', 'Are you sure you want to sign up for this ' + slot_or_interview + '?', $scope.signUp);
      }
    };

    $scope.decliningInterview = function ($event, myinterview) {
      $event.stopPropagation();
      $scope.interview_panelist_id = (($filter('filter')(myinterview.panelists, function (panelist) {
        return panelist.name === loggedinUserStore.userId();
      }))[0]).interview_panelist_id;
      if (myinterview.candidate.id) {
        slot_or_interview = 'interview';
        dialogService.askConfirmation('Decline', 'Are you sure you want to decline this interview?', $scope.declineInterview);
      }
      else {
        slot_or_interview = 'slot';
        dialogService.askConfirmation('Decline', 'Are you sure you want to decline this slot?', $scope.declineSlot);
      }
    };

    $scope.signUp = function () {
      if(deployChannel === 'production') {
        $ionicAnalytics.track('Sign up');
      }
      recruitFactory.signUp($scope.interview_panelist, $scope.signUpSuccessHandler, $scope.signUpUnprocessableEntityHandler, $scope.defaultErrorHandler);
    };

    $scope.declineInterview = function () {
      if(deployChannel === 'production') {
        $ionicAnalytics.track('Decline');
      }
      recruitFactory.deleteInterviewPanelist($scope.interview_panelist_id, $scope.declineInterviewSuccessHandler, $scope.declineUnprocessableEntityHandler, $scope.defaultErrorHandler);
    };

    $scope.declineSlot = function () {
      if(deployChannel === 'production') {
        $ionicAnalytics.track('Decline');
      }
      recruitFactory.deleteSlotPanelist($scope.interview_panelist_id, $scope.declineInterviewSuccessHandler, $scope.declineUnprocessableEntityHandler, $scope.defaultErrorHandler);
    };

    var successHandler = function (header, message) {
      $scope.finishRefreshing();
      dialogService.showAlertWithDismissHandler(header, message, function () {
        $scope.manuallyRefreshInterviews();
      });
    };

    var getFirstErrorInReadableForm = function (errors) {
      for (var error in errors) {
        return errors[error][0];
      }
    };

    var unprocessableEntityHandler = function (error, header) {
      $scope.finishRefreshing();
      dialogService.showAlert(header, getFirstErrorInReadableForm(error.errors)).then(function () {
        $scope.manuallyRefreshInterviews();
      });
    };

    $scope.signUpSuccessHandler = function () {
      successHandler('Sign up', 'Thanks for signing up for this ' + slot_or_interview + '!');
    };

    $scope.declineInterviewSuccessHandler = function () {
      successHandler('Decline', 'Successfully declined for this ' + slot_or_interview + '!');
    };

    $scope.signUpUnprocessableEntityHandler = function (error) {
      unprocessableEntityHandler(error, 'Sign up');
    };

    $scope.declineUnprocessableEntityHandler = function (error) {
      unprocessableEntityHandler(error, 'Decline');
    };

    $scope.defaultErrorHandler = function () {
      $scope.finishRefreshing();
    };

    $scope.logout = function () {
      dialogService.askConfirmation('Logout', 'Are you sure you want to logout?', function () {
        loggedinUserStore.clearDb();
        $ionicHistory.nextViewOptions({
          disableBack: true,
          disableAnimate: true
        });

        $state.go('login');
      });
    };

    $scope.triggerSos = function () {
      recruitFactory.sendSos(function(){
        dialogService.showAlert('SOS', 'SOS Email has been successfully sent');
      }, function() {
        dialogService.showAlertWithDismissHandler('SOS', 'SOS Email was not sent as there are no interviews requiring signups in the next 2 days', $scope.getSosStatus);
      }, function(){
        dialogService.showAlertWithDismissHandler('SOS', 'Something went wrong and SOS was not sent', $scope.getSosStatus);
      });
    };

    $scope.sendSos = function () {
      dialogService.askConfirmation('SOS', 'Are you sure you want to send SOS Email?', $scope.triggerSos);
    };

    $scope.isInPipeline = function (candidate) {
      return candidate !== undefined && candidate.pipelineStatus !== 'Closed';
    };

    $scope.isVaildInterview = function(candidate) {
      return $scope.isInPipeline(candidate) && candidate.id;
    };

    $scope.isInFuture = function (start_time) {
      return new Date() < new Date(start_time);
    };

    $scope.isActive = function (stateName) {
      return stateName === $state.current.name;
    };

    $scope.$on('loaded:masterData', function () {
      $scope.manuallyRefreshInterviews();
    });

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      // For Home Button
      $ionicHistory.clearHistory();
      viewData.enableBack = false;
    });

    (function () {
      $scope.manuallyRefreshInterviews();
    })();
  }
]);
