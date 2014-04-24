'use strict';

angular
  .module('wgCheetahApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'restform'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
