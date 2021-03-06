angular.module('recruitX')
  .config(function ($httpProvider) {
    'use strict';

    $httpProvider.interceptors.push(function ($rootScope, $q, apiKey) {
      var pendingRequests = 0;
      return {
        request: function (config) {
          if (config.headers['Authorization'] === undefined) {
            config.timeout = 20000;
            config.headers = {
              'Authorization': apiKey,
              'Content-Type': 'application/json'
            };
          } else {
            config.timeout = 60000;
          }
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
  'use strict';

  $rootScope.$on('loading:show', function () {
    $ionicLoading.show({
      template: '<ion-spinner icon="lines" class="spinner spinner-calm"></ion-spinner>'
    });
  });

  $rootScope.$on('loading:hide', function () {
    $ionicLoading.hide();
  });
})

.run(function ($ionicPlatform, $rootScope, recruitFactory, MasterData, $state, $cordovaToast, $ionicAnalytics) {
  'use strict';

  $ionicPlatform.ready(function () {

    $ionicAnalytics.register();
    $ionicAnalytics.dispatchInterval = 300;

    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    navigator.splashscreen.show();

    if (window.StatusBar) {
      window.StatusBar.styleDefault();
    }

    var loadMasterData = function () {
      MasterData.load().then(function () {
        navigator.splashscreen.hide();
        $rootScope.$broadcast('loaded:masterData');
      }, function (err) {
        console.log('Failed to laod master data due to: ' + err.data);
        navigator.splashscreen.hide();
        if (window.cordova && window.cordova.plugins.cordovaToast) {
          cordova.plugins.cordovaToast.showShortBottom('Something went wrong while contacting the server.');
        }
      });
    };

    if (window.localStorage.LOGGEDIN_USER) {
      loadMasterData();
      $state.go('tabs.interviews');
    } else {
      if (typeof OktaSignIn === 'undefined') {
        $cordovaToast.showShortBottom('Please connect to internet and try again');
      } else {
        $state.go('login');
        navigator.splashscreen.hide();
      }
    }

    $rootScope.$on('load:masterData', function () {
      loadMasterData();
    });
  });
});
