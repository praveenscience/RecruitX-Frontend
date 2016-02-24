angular.module('recruitX')
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($rootScope, $q) {
      var pendingRequests = 0;
      return {
        request: function (config) {
          config.timeout = 10000;
          if (pendingRequests === 0) {
            $rootScope.$broadcast('loading:show');
          }
          pendingRequests++;
          return config;
        },
        response: function (response) {
          pendingRequests--;
          if (pendingRequests === 0) {
            $rootScope.$broadcast('loading:hide');
          }
          return response;
        },
        responseError: function (response) {
          pendingRequests--;
          if (pendingRequests === 0) {
            $rootScope.$broadcast('loading:hide');
          }
          return $q.reject(response);
        }
      };
    });
  })

.run(function ($ionicPlatform, $ionicLoading, $rootScope) {
  $rootScope.$on('loading:show', function () {
    $ionicLoading.show({
      template: 'Loading...'
    });
  });

  $rootScope.$on('loading:hide', function () {
    $ionicLoading.hide();
  });
})

.run(function ($ionicPlatform, $rootScope, recruitFactory, MasterData) {
  'use strict';

  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      window.StatusBar.styleDefault();
    }

    var loadMasterData = function () {
      MasterData.load().then(function () {
        navigator.splashscreen.hide();
        $rootScope.$broadcast('loaded:masterData');
      }, function (err) {
        console.log('Failed dur to: ' + err.data);
        // TODO: Need to show this mesage as Toast
        alert('Something went wrong while contacting the server.');
      });
    };

    if (window.localStorage['LOGGEDIN_USER']) {
      loadMasterData();
    } else {
      navigator.splashscreen.hide();
    }

    $rootScope.$on('load:masterData', function () {
      loadMasterData();
    });
  });
});
