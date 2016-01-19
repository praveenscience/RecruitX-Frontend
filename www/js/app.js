// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

angular.module('starter', ['ionic','ui.router', 'ngCordova', 'ngResource'])
  .run(function ($ionicPlatform) {
    'use strict';

    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        window.StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider

        .state('candidate-index', {
            url: '/candidates',
            templateUrl: 'templates/candidate-index.html',
<<<<<<< HEAD
            controller: 'createCandidateProfileController',
			onEnter: function() {
				var body = document.querySelector('body');
				body.className += ' hide-header-bar';
			},
			onExit: function() {
				document.querySelector('body').classList.remove('hide-header-bar');
			}
=======
            controller: 'createCandidateProfileController'
>>>>>>> Panelist device UI fixes
        })

        .state('create-candidate-profile', {
            url: '/candidates/new',
            templateUrl: 'templates/create-candidate-profile.html',
            controller: 'createCandidateProfileController'
        })

        .state('schedule-interview',{
          url: '/candidates/interviews/new',
          templateUrl: 'templates/schedule-interview.html',
          controller: 'scheduleInterviewController',
            params:{
              candidate: null
            }
        })
		.state('panelist-signup', {
            url: '/panelist-signup',
            templateUrl: 'templates/panelist-signup.html',
<<<<<<< HEAD
            controller: 'panelistSignupController' //,
			/*onEnter: function() {
				var body = document.querySelector('body');
				body.className += ' hide-header-bar';
			},
			onExit: function() {
				document.querySelector('body').classList.remove('hide-header-bar');
			}*/
=======
>>>>>>> Panelist device UI fixes
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/candidates');
});
