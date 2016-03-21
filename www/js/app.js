
angular.module('Onlinemandi', ['ionic', 'ngCordova', 'Onlinemandi.controllers', 'Onlinemandi.factory', 'Onlinemandi.directives'])
    .run(function($ionicPlatform, $cordovaDevice) {
      $ionicPlatform.ready(function() {
          if(window.Connection) {
              if (navigator.connection.type == Connection.NONE) {
                  $ionicPopup.confirm({
                      title: 'No Internet Connection',
                      content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
                  })
                      .then(function (result) {
                          if (!result) {
                              ionic.Platform.exitApp();
                          }
                      });
              }
          }

              // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }

		alert('Platform : ' + $cordovaDevice.getPlatform() + '\nModel: ' + $cordovaDevice.getModel());
      });
    })
    .run(['$rootScope', 'AuthFactory', 'MsgFactory', 'CartFactory', function($rootScope, AuthFactory, MsgFactory, CartFactory) {

        $rootScope.isAuthenticated = AuthFactory.isLoggedIn();
      // utility method to convert number to an array of elements
        if(!MsgFactory.isMsgArray()){
             MsgFactory.setMessages([
                 'The selected grade is not available',
                 'The selected quantity is not available',
                 'The selected productis not available',
                 'The selected grade cannot be served',
                 'Product cannot be added to cart'
             ])
        }

      }
    ])
.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
  $httpProvider.interceptors.push('TokenInterceptor');
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
		controller: 'SearchCtrl'
      }
    }
  })
      .state('app.takepic', {
          url: '/takepic',
          views: {
              'menuContent': {
                  templateUrl: 'templates/takepic.html',
                  controller: 'CameraCtrl'
              }
          }
      })
  .state('app.home', {
      url: '/home',
      cache: false,
      views: {
        'menuContent': {
            templateUrl: 'templates/home.html',
            controller: 'HomeCtrl'
        }
      }
    })
     .state('app.offline', {
         url: '/offline',
         views: {
             'menuContent': {
                 templateUrl: 'templates/offline.html',
                 controller: 'OfflineCtrl'
             }
         }
     })
     .state('app.test', {
          url: '/test',
          views: {
              'menuContent': {
                  templateUrl: 'templates/test.html',
                  controller: 'TestCtrl'
              }
          }
      })
      .state('app.fruits', {
        url: '/fruits',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/fruits.html',
            controller: 'FruitsCtrl'
          }
        }
      })
      .state('app.testfruits', {
        url: '/testfruits',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/testfruits.html',
            controller: 'TestfruitsCtrl'
          }
        }
      })
      .state('app.vegetables', {
          url: '/vegetables',
          cache: false,
          views: {
              'menuContent': {
                  templateUrl: 'templates/vegetables.html',
                  controller: 'VegetablesCtrl'
              }
          }
      })
      .state('app.cart', {
          url: '/cart',
          cache: false,
          views: {
              'menuContent': {
                  templateUrl: 'templates/cart.html',
                  controller: 'CartCtrl'
              }
          }
      })
      .state('app.checkout', {
          url: '/checkout',
          cache: false,
          views: {
              'menuContent': {
                  templateUrl: 'templates/checkout.html',
                  controller: 'CheckoutCtrl'
              }
          }
      })
      .state('app.account', {
          url: '/account',
          cache: false,
          views: {
              'menuContent': {
                  templateUrl: 'templates/account.html',
                  controller: 'AccountCtrl'
              }
          }
      });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
}]);
