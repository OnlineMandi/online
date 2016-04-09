angular.module('Onlinemandi.directives', [])
    .directive('fallbackSrc', function () {
        var fallbackSrc = {
            link: function postLink(scope, iElement, iAttrs) {
                iElement.bind('error', function() {
                    angular.element(this).attr("src", iAttrs.fallbackSrc);
                });
            }
        }
        return fallbackSrc;
    })
    .directive('product', function($filter, $ionicPopup, $ionicModal, $state, $rootScope, UserFactory, AuthFactory, CartFactory, ProductsFactory, Loader, WeightFactory) {
        return {
            restrict: 'E',
            scope: {
                product:'=productAttr',
                category:'=productCat',
            }, // isolated scope introduced here
            templateUrl: 'templates/product.html',
            link: function(scope, elem, attrs) {
                if($rootScope.isAuthenticated){
                    scope.cart = CartFactory.getCart();
                    if(scope.category==1){
                        scope.favourite = ProductsFactory.getProducts('allfavouritefruits');
                    } else {
                        scope.favourite = ProductsFactory.getProducts('allfavouritevegetables');
                    }
                    var result = $filter('filter')( scope.cart,{id:scope.product.id},true);
                    if(result.length){
                        //alert(scope.cart.id)
                        scope.addedToCart = true;
                        scope.buttonTxt = "update";
                        scope.buttonClass = 'button-balanced';
                    } else {
                        scope.addedToCart = false;
                        scope.buttonTxt = "add";
                        scope.buttonClass = 'icon-left ion-android-cart button-assertive';
                    }
                    if(scope.favourite.indexOf(scope.product.id) > -1){
                        scope.favClass = 'ion-android-favorite';
                    } else {
                        scope.favClass = 'ion-android-favorite-outline';
                    }
                } else {
                    scope.addedToCart = false;
                    scope.buttonTxt = "add";
                    scope.buttonClass = 'icon-left ion-android-cart button-assertive';
                    scope.favClass = 'ion-android-favorite-outline';
                }
                scope.unit = WeightFactory.getUnit(scope.product.unit);
                if( scope.addedToCart){
                    scope.weightid = result[0].w;
                } else {
                    scope.weightid = scope.product.selectedweight;
                }

                if(scope.addedToCart){
                    scope.grade = result[0].g;
                } else if(scope.product.selectedgrade!=undefined){
                    scope.grade = scope.product.selectedgrade;
                } else {
                    if(scope.product.rate_a){
                        scope.grade = 0;
                    } else {
                        scope.grade = 1;
                    }
                }
                scope.grades=[];
                if(scope.product.rate_a)
                {
                    scope.grades.push({name: 'A', value: 0});
                }
                if(scope.product.rate_b)
                {
                    scope.grades.push({name: 'B', value: 1});
                }
                scope.$watch('message', function(value) {
                    console.log('Message Changed!');
                });
                scope.clearMessage = function() {
                    scope.message = '';
                }
                scope.showOffers = function(product) {
                    scope.popupfruit = product;
                    scope.rates_a = WeightFactory.getOffers(product,0);
                    scope.rates_b = WeightFactory.getOffers(product,1);
                    var alertPopup = $ionicPopup.alert({
                        title: "Offers on " + scope.popupfruit.name,
                        templateUrl: 'templates/offers.html',
                        cssClass: 'custom-popup',
                        scope:scope
                    });
                    alertPopup.then(function(res) {
                    });
                };
                scope.$on('showLoginModalProduct', function($event, scope, cancelCallback, callback) {
                    $scope = scope || $scope;
                    $scope.user = {
                        username: '',
                        password: ''
                    };
                    $scope.newuser = {
                        fname: '',
                        lname: '',
                        contact: '',
                        email: '',
                        state: '',
                        city: ''
                    };
                    $scope.errormsg = false;
                    $scope.cities = [];

                    $scope.viewLogin = true;
                    $ionicModal.fromTemplateUrl('templates/login.html', {
                        scope: $scope
                    }).then(function(modal) {
                        $scope.modal = modal;
                        $scope.modal.show();
                        $scope.switchTab = function(tab) {
                            if (tab === 'login') {
                                $scope.viewLogin = true;
                            } else {
                                $scope.viewLogin = false;
                            }
                        }
                        $scope.clearerror = function(){
                            $scope.errormsg = false;
                        }
                        $scope.hide = function() {
                            $scope.modal.hide();
                        }
                        $scope.login = function() {
                            Loader.showLoading('Authenticating...');
                            UserFactory.login($scope.user).success(function(data) {
                                Loader.hideLoading();
                                AuthFactory.setCurrentTime(0);
                                AuthFactory.resetProductStatus(0);
                                AuthFactory.setUser(data.username);
                                AuthFactory.setDetails(data.details);
                                AuthFactory.setToken({
                                    token: data.access_token,
                                    expires: data.expires
                                });
                                $rootScope.isAuthenticated = true;
                                $scope.modal.hide();
                                if (typeof callback === 'function') {
                                    callback();
                                } else {
                                    $state.go($state.current, {}, {reload: true});
                                }

                            }).error(function(err, statusCode) {
                                Loader.hideLoading();
                                $scope.errormsg = true;
                            });
                        }
                        $scope.register = function() {
                            Loader.showLoading('Registering...');
                            UserFactory.register($scope.newuser).success(function(data) {

                                Loader.hideLoading();
                                $scope.modal.hide();
                                if (data.result == 'success') {
                                    $rootScope.$broadcast('showWelcomeModal',data.type);
                                } else {
                                    $rootScope.$broadcast('showErrorModal');
                                }
                            }).error(function(err, statusCode) {
                                Loader.hideLoading();
                                Loader.toggleLoadingWithMessage(err.message);
                            });
                        }
                    });
                });
                scope.$on('addToCart', function($event,$scope,element) {

                    scope.added = CartFactory.addToLocalCart({id: scope.product.id, w: scope.weightid, g: scope.grade});
                            if(scope.added==1){
                                Loader.toggleLoadingWithMessage(scope.product.name + " successfully added to cart");
                               scope.buttonTxt = 'update';
                               scope.buttonClass = 'button-balanced';
                            } else if(scope.added==0) {
                                Loader.toggleLoadingWithMessage(scope.product.name + " successfully updated to cart");
                            } else {
                                Loader.toggleLoadingWithMessage("Change weight or grade to updated cart");
                            }
                });
                scope.addToCart = function($event) {
                    var element = $event.target;
                    if (!AuthFactory.isLoggedIn()) {
                        scope.$broadcast('showLoginModalProduct', scope, null,null, function() {
                            // user is now logged in
                            //scope.$broadcast('addToCart');
                        });
                        return;
                    }
                    scope.$broadcast('addToCart',scope,angular.element(element));
                };
                scope.$on('addToWishlist', function($event,$scope,element) {
                    ProductsFactory.addToWishlist({id: scope.product.id}).success(function(data) {
                        if(data.result==1){

                            Loader.toggleLoadingWithMessage(scope.product.name + " is added to your favourite list");
                            ProductsFactory.addfav(scope.product.id,scope.category);
                            scope.favClass = 'ion-android-favorite';
                        } else {
                            Loader.toggleLoadingWithMessage(scope.product.name + " is removed from your favourite list");
                            ProductsFactory.removefav(scope.product.id,scope.category);
                            scope.favClass = 'ion-android-favorite-outline';
                        }
                    }).error(function(err, statusCode) {
                        Loader.hideLoading();
                        Loader.toggleLoadingWithMessage(err.message);
                    });
                });
                scope.addToFav = function($event){
                    var element = $event.target;
                    if (!AuthFactory.isLoggedIn()) {
                        scope.$broadcast('showLoginModalProduct', scope, null, null, function() {
                            // user is now logged in
                            //scope.$broadcast('addToCart');
                        });
                        return;
                    }
                    scope.$broadcast('addToWishlist',scope,angular.element(element));
                };
                scope.addToFavourite = function(){
                    scope.$broadcast('addToWishlist',scope,angular.element(element));
                }
                elem.bind('mouseover', function() {
                    elem.css('cursor', 'pointer');
                });
            }
        }

    })
    .directive('cartitem', function($filter, $ionicPopup, $ionicModal, $timeout, $state, $rootScope, UserFactory, AuthFactory, CartFactory, Loader) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                item:'=cartitemAttr',
                delete:'&deleteAttr',
                updateTotal:'&updateCartAttr',
                update:'&updateAttr',
                changestatus:'=statusAttr',
            },
            templateUrl: 'templates/cartitem.html',
            link: function(scope, elem, attrs) {
                scope.status = 0;
                scope.self = 0;
                scope.$watch('changestatus', function(value){
                    if(scope.status==1 && scope.self !=1){
                        scope.status = 0;
                    }
                    scope.self = 0;
                });
                scope.status = scope.item.status;
                scope.deleteitem = function(){
                    scope.delete()
                };
                scope.hide = function(){
                    scope.update();
                }
                scope.show = function(timeout){
                    scope.self = 1;
                    scope.update();
                    if (scope.status == 0) {
                        $timeout(function() {
                            scope.status = 1;
                        }, timeout || 200);
                    }  else{

                        scope.status = 0;
                    }
                };
                scope.updateCart = function() {
                    scope.added = CartFactory.addToLocalCart({id: scope.item.id, w: scope.item.weightid, g: scope.item.grade.value});
                    if(scope.added == 0){
                        scope.item.grade.name = scope.item.grade.value==0?'A':'B';
                        var weight_result = $filter('filter')(scope.item.item.weights,{value:scope.item.weightid},true);
                        scope.item.weight = weight_result[0];
                        scope.item.price = scope.item.grade.value==0 ? scope.item.weight.p.pa : scope.item.weight.p.pb;
                        Loader.toggleLoadingWithMessage(scope.item.name + " successfully updated to cart");
                    }
                    scope.status = 0;
                    scope.updateTotal();
                };
            }
        }
    })
