angular.module('Onlinemandi.controllers', ['ngImgCrop'])
    .run(function($rootScope, AuthFactory, UserFactory, $ionicHistory, $location, ConnectivityMonitor){

        $rootScope.$on('$stateChangeSuccess',function(){
            if(ConnectivityMonitor.isOffline()){
                $ionicHistory.nextViewOptions({
                    disableBack: true,
                    historyRoot: true
                });
                $location.path('/app/offline');
            }
            $rootScope.isAuthenticated = AuthFactory.isLoggedIn();
            if(UserFactory.isCurrentCity() === false){
                UserFactory.setCity({
                    id: 1096,
                    name: "Ambala City"
                });
            }
        });
    })
.controller('AppCtrl', ['$rootScope', '$state', '$window', '$ionicModal', '$ionicHistory', '$ionicPopup', 'AuthFactory', '$location', 'UserFactory', 'CartFactory', 'LSFactory', '$scope', 'Loader',
function($rootScope, $state, $window, $ionicModal, $ionicHistory, $ionicPopup, AuthFactory, $location, UserFactory, CartFactory, LSFactory, $scope, Loader) {
	$rootScope.$on('showLoginModal', function($event, scope, cancelCallback, callback) {
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
                    AuthFactory.resetProductStatus(0);
                    AuthFactory.setUser(data.username);
                    AuthFactory.setDetails(data.details);
                    AuthFactory.setToken({
                        token: data.access_token,
                        expires: data.expires
                    });
                    $rootScope.isAuthenticated = true;
                    CartFactory.setCart();
                    $scope.modal.hide();
                    $state.go($state.current, {}, {reload: true});

                    if (typeof callback === 'function') {
                        callback();
                    }
				}).error(function(err, statusCode) {
					Loader.hideLoading();
                    $scope.errormsg = true;
				});
			}
          $scope.getCities = function(item) {
            Loader.showLoading('Loading Cities...');
            UserFactory.getCities(item).success(function(data) {
              Loader.hideLoading();
              $scope.cities = data;

            }).error(function(err, statusCode) {
              Loader.hideLoading();
                alert(err.message+"got it");
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
	$rootScope.loginFromMenu = function() {
		$rootScope.$broadcast('showLoginModal', $scope, null, null);
	}


	$rootScope.changeUserCity = function() {
		$rootScope.$broadcast('showChangeCityModal', $scope);
	}
	$rootScope.settings = function() {
		$rootScope.$broadcast('settingsModal', $scope);
	}
    $rootScope.viewallfruits = function() {
		/*$ionicViewService.nextViewOptions({
			disableBack: true
		});
		*/
        $ionicHistory.nextViewOptions({
            disableBack: true,
            historyRoot: true
        });


        $location.path('/app/fruits');
    }
	$rootScope.$on('settingsModal', function($event, scope) {
		$ionicModal.fromTemplateUrl('templates/settings.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modal = modal;
			$scope.modal.show();
			$scope.hide = function() {
				$scope.modal.hide();
			}
			$scope.showClearCacheConfirm = function () {
				var confirmPopup = $ionicPopup.confirm({
					title: 'Confirm Clear Cache',
					template: 'Are you sure you want to clear application cache?'
				});
				confirmPopup.then(function (res) {
					if (res) {
						LSFactory.clear();
					} else {
						console.log('You are not sure');
					}
				});
			};
		});
	});
	$rootScope.$on('showChangeCityModal', function($event, scope) {
		$scope.newuser = {
			state: '',
			city: ''
		};
		$ionicModal.fromTemplateUrl('templates/changecity.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modal = modal;
			$scope.modal.show();
			$scope.hide = function() {
				$scope.modal.hide();

			}
			$scope.getCities = function(item) {
				Loader.showLoading('Loading Cities...');
				UserFactory.getCities(item).success(function(data) {
					Loader.hideLoading();
					$scope.cities = data;

				}).error(function(err, statusCode) {
					Loader.hideLoading();
					Loader.toggleLoadingWithMessage(err.message);
				});
			}
			$scope.changecity = function(){
				for(var city in $scope.cities){
					if(city.value==$scope.newuser.city){
						$scope.selectedcity = city.title;
					}
				}
				UserFactory.setCity({
					id: $scope.newuser.city,
					name: $scope.selectedcity,
				});
			}
		});
	});
    $rootScope.$on('showWelcomeModal', function($event, type) {
        $scope.type = type;
        $ionicModal.fromTemplateUrl('templates/welcome.html', {
            scope: $scope
        }).then(function(modal) {
            if($scope.type=="active"){
                $scope.msgtype = true;
            } else {
                $scope.msgtype = false;
            }
            $scope.modal = modal;
            $scope.modal.show();
            $scope.hide = function() {
                $scope.modal.hide();
            }
        });
    });
    $rootScope.$on('showErrorModal', function($event) {
    });
	$rootScope.logout = function() {
        $rootScope.isAuthenticated = false;
		UserFactory.logout();
        AuthFactory.setCurrentTime(0);
        AuthFactory.resetProductStatus(0);
        CartFactory.clearCart();
        Loader.toggleLoadingWithMessage('Successfully Logged Out!', 2000);
        $state.go($state.current, {}, {reload: true});

	}
}])
.controller('HomeCtrl', ['$rootScope', '$scope', '$ionicPopup', 'Loader', 'AuthFactory', 'UserFactory', 'ProductsFactory',function($rootScope, $scope, $ionicPopup, Loader, AuthFactory, UserFactory, ProductsFactory) {
		$scope.products_got = false;
		if(UserFactory.isCurrentCity()=== false){
			UserFactory.setCity({
				id: 1096,
				name: "Ambala City"
			});
		}
		$scope.currentcity = UserFactory.getCity();
		$scope.showCityChangeAlert = function() {
			var alertPopup = $ionicPopup.alert({
				title: 'Change City',
				template: 'Currently service is available only in Ambala City. Please contact us for more details.'
			});

			alertPopup.then(function(res) {

			});
		};

		$scope.getindex = function(){
            UserFactory.getindex().success(function(data) {
                Loader.hideLoading();
                $scope.result = data;

            }).error(function(err, statusCode) {
                Loader.hideLoading();
                Loader.toggleLoadingWithMessage(err.message);
            });
		};
}])
    .controller('FruitsCtrl', ['$rootScope', '$ionicPopover', '$ionicScrollDelegate', '$scope', '$ionicPopup', 'Loader', 'AuthFactory', 'UserFactory', 'ProductsFactory', 'WeightFactory',function($rootScope, $ionicPopover, $ionicScrollDelegate, $scope, $ionicPopup, Loader, AuthFactory, UserFactory, ProductsFactory, WeightFactory) {
        Loader.showLoading('Loading....');
        $scope.viewAll = true;
        $scope.viewFavourite = false;
        $scope.viewBestSelling = false;
        $scope.totalitems = null;
        $scope.totalfavouriteitems = null;
        /*getting fruits data from server*/
        ProductsFactory.fruits($scope.totalitems).success(function(data) {
            if(data.update==1){
                AuthFactory.setProductStatus('fruits',data.updateKey);
                AuthFactory.setProductStatus('favouritefruits',data.updateKey);
                AuthFactory.setProductStatus('topsellingfruits',data.updateKey);
                for (var index in data.fruits) {
                    data.fruits[index].weights = WeightFactory.getWeights(data.fruits[index]);
                }
                $scope.data = data;
                $scope.fruits = data.fruits;
                ProductsFactory.setProducts('allfruits',data.fruits);
                ProductsFactory.setProducts('allfavouritefruits',data.fav);
                ProductsFactory.setProducts('allbestsellingfruits',data.topselling);
                Loader.hideLoading();

            } else {
                $scope.fruits = ProductsFactory.getProducts('allfruits');
                Loader.hideLoading();
            }
        }).error(function(err, statusCode) {
            Loader.hideLoading();
            Loader.toggleLoadingWithMessage(err.message);
        });
        $scope.viewfavourite = function(){
            $ionicScrollDelegate.scrollTop();
            $scope.viewAll = false;
            $scope.viewBestSelling = false;
            if($scope.viewFavourite){
                return;

            } else {
                $scope.viewFavourite = true;
                if($rootScope.isAuthenticated){
                    Loader.showLoading('Loading.....');
                    $scope.favouritefruits = [];
                    var fav_fruits = ProductsFactory.getProducts('allfavouritefruits');
                    for(var j=0; j<fav_fruits.length; j++){
                        if($scope.fruits[fav_fruits[j]] !== undefined) {
                            $scope.favouritefruits.push($scope.fruits[fav_fruits[j]]);
                        }
                    }
                    Loader.hideLoading();
                } else {
                    $scope.notLoggedIn = true;
                    return;
                }
            }
        };
        $scope.viewbestselling = function(){
            $ionicScrollDelegate.scrollTop();
            $scope.viewAll = false;
            $scope.viewFavourite = false;
            if($scope.viewBestSelling){
                return;
            } else {
                $scope.viewBestSelling = true;
                Loader.showLoading('Loading.....');
                $scope.bestsellingfruits = [];
                var best_fruits = ProductsFactory.getProducts('allbestsellingfruits');
                for(var j=0; j<best_fruits.length; j++){
                    if($scope.fruits[best_fruits[j]] !== undefined) {
                        $scope.bestsellingfruits.push($scope.fruits[best_fruits[j]]);
                    }
                }
                Loader.hideLoading();
            }
        };
        $scope.viewall = function(){
            $ionicScrollDelegate.scrollTop();
            $scope.viewFavourite = false;
            $scope.viewBestSelling = false;
            if($scope.viewAll){
                return;
            } else {
                $scope.viewAll = true;
                return;
            }
        };

    }])
    .controller('VegetablesCtrl', ['$rootScope', '$ionicPopover', '$ionicScrollDelegate', '$scope', '$ionicPopup', 'Loader', 'AuthFactory', 'UserFactory', 'ProductsFactory', 'WeightFactory', function($rootScope, $ionicPopover, $ionicScrollDelegate, $scope, $ionicPopup, Loader, AuthFactory, UserFactory, ProductsFactory, WeightFactory) {
        Loader.showLoading('Loading....');
        $scope.viewAll = true;
        $scope.viewFavourite = false;
        $scope.viewBestSelling = false;
        $scope.totalitems = null;
        $scope.totalfavouriteitems = null;
        ProductsFactory.vegetables($scope.totalitems).success(function(data) {
            if(data.update==1){
                AuthFactory.setProductStatus('vegetables',data.updateKey);
                AuthFactory.setProductStatus('favouritevegetables',data.updateKey);
                AuthFactory.setProductStatus('topsellingvegetables',data.updateKey);
                for (var index in data.vegetables) {
                    data.vegetables[index].weights = WeightFactory.getWeights(data.vegetables[index]);
                }
                $scope.data = data;
                $scope.vegetables = data.vegetables;
                ProductsFactory.setProducts('allvegetables',data.vegetables);
                ProductsFactory.setProducts('allfavouritevegetables',data.fav);
                ProductsFactory.setProducts('allbestsellingvegetables',data.topselling);
                Loader.hideLoading();
            } else {
                $scope.vegetables = ProductsFactory.getProducts('allvegetables');
                Loader.hideLoading();
            }
        }).error(function(err, statusCode) {
            Loader.hideLoading();
            Loader.toggleLoadingWithMessage(err.message);
        });
        $scope.viewfavourite = function(){
            $ionicScrollDelegate.scrollTop();
            $scope.viewAll = false;
            $scope.viewBestSelling = false;
            if($scope.viewFavourite){
                return;
            } else {
                $scope.viewFavourite = true;
                if($rootScope.isAuthenticated){
                    Loader.showLoading('Loading.....');
                    $scope.favouritevegetables = [];
                    var fav_vegetables = ProductsFactory.getProducts('allfavouritevegetables');
                    for(var j=0; j<fav_vegetables.length; j++){
                        if($scope.vegetables[fav_vegetables[j]] !== undefined) {
                            $scope.favouritevegetables.push($scope.vegetables[fav_vegetables[j]]);
                        }
                    }
                    Loader.hideLoading();
                } else {
                    $scope.notLoggedIn = true;
                    return;
                }

            }
        };
        $scope.viewbestselling = function(){
            $ionicScrollDelegate.scrollTop();
            $scope.viewAll = false;
            $scope.viewFavourite = false;
            if($scope.viewBestSelling){
                return;
            } else {
                $scope.viewBestSelling = true;
                Loader.showLoading('Loading.....');
                $scope.bestsellingvegetables = [];
                var best_vegetables = ProductsFactory.getProducts('allbestsellingvegetables');
                for(var j=0; j<best_vegetables.length; j++){
                    if($scope.vegetables[best_vegetables[j]] !== undefined) {
                        $scope.bestsellingvegetables.push($scope.vegetables[best_vegetables[j]]);
                    }
                }
                Loader.hideLoading();
            }
        };
        $scope.viewall = function(){
            $ionicScrollDelegate.scrollTop();
            $scope.viewFavourite = false;
            $scope.viewBestSelling = false;
            if($scope.viewAll){
                return;
            } else {
                $scope.viewAll = true;
                return;
            }
        };

    }])
    .controller('CartCtrl', ['$rootScope','$state', '$ionicHistory', '$location', '$ionicPopover', '$ionicScrollDelegate', '$scope', '$ionicPopup', 'Loader', 'AuthFactory', 'UserFactory', 'ProductsFactory', 'CartFactory', '$filter' ,function($rootScope, $state, $ionicHistory, $location, $ionicPopover, $ionicScrollDelegate, $scope, $ionicPopup, Loader, AuthFactory, UserFactory, ProductsFactory, CartFactory, $filter) {


            $scope.localcart = CartFactory.getCart();
            $scope.cart = [];
            var allfruits = ProductsFactory.getProducts('allfruits');
            var allvegetables = ProductsFactory.getProducts('allvegetables');
            angular.extend(allfruits, allvegetables);
            $scope.cartTotal = 0;
            $scope.shipping = 0;
            $scope.grandTotal = 0;
            $scope.status = 0;

                for(var i=0;i< $scope.localcart.length;i++) {

                var fruit = allfruits[$scope.localcart[i].id];
                var cartfruit = $scope.localcart[i];
                    var grades=[];
                    if(fruit.rate_a)
                    {
                        grades.push({name: 'A', value: 0});
                    }
                    if(fruit.rate_b)
                    {
                        grades.push({name: 'B', value: 1});
                    }
                var weight_result = $filter('filter')(fruit.weights,{value:cartfruit.w},true);
                var item_price = cartfruit.g == 0?weight_result[0].p.pa:weight_result[0].p.pb;
                $scope.cart.push({id: cartfruit.id, img: fruit.img, name: fruit.name, grade: cartfruit.g==0?{name: 'A', value: 0}:{name: 'B', value: 1},weight: weight_result[0], price: item_price, cartitem:cartfruit, item:fruit, grades: grades, weightid:weight_result[0].value, status:0})
        $scope.cartTotal += item_price;
            }
            if($scope.cartTotal<200){
                $scope.shipping = 20.00;
            }
            $scope.grandTotal = $scope.cartTotal + $scope.shipping;
        $scope.inactivateStatus = function() {
            if($scope.status == 0)
                $scope.status = 1;
            else
                $scope.status = 0;

        };
        $scope.delete = function(item){
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirm Delete',
                template: 'Delete ' + item.name + ' from cart?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    CartFactory.deleteItem(item.id);
                    var deletedItem = $filter('filter')($scope.cart,function(value, index) {return value.id == item.id;});
                    $scope.cartTotal -= deletedItem[0].price;
                    if($scope.cartTotal<200){
                        $rootScope.checkoutShipping = $scope.shipping = 20;
                    } else {
                        $rootScope.checkoutShipping = $scope.shipping = 0;
                    }
                    $rootScope.checkoutTotal = $scope.cartTotal;
                    $rootScope.checkoutGrandTotal = $scope.grandTotal = $scope.cartTotal + $scope.shipping;
                    $scope.cart = $filter('filter')($scope.cart,function(value, index) {return value.id !== item.id;});
                } else {
                    return;
                }
            });
        };
        $scope.emptycart = function(){
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirm Empty Cart',
                template: 'Are you sure you want to enpty cart?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    CartFactory.clearCart();
                    Loader.toggleLoadingWithMessage('Cart is Successfully Cleared!', 2000);
                    $state.go($state.current, {}, {reload: true});
                } else {
                   return;
                }
            });
        };
        $scope.checkout = function(){
            $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
            });
            $location.path('/app/checkout');
        };
        $scope.shopping = function(){
            $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
            });
            $location.path('/app/fruits');
        }
        $scope.updateCartTotal = function(){
            $scope.localcart = CartFactory.getCart();
            $scope.updatedCartTotal = 0;
            for(var i=0;i< $scope.localcart.length;i++) {
                var cartfruit = $scope.localcart[i];
                var fruit = allfruits[$scope.localcart[i].id];
                var weight_result = $filter('filter')(fruit.weights,{value:cartfruit.w},true);
                $scope.updatedCartTotal += cartfruit.g == 0?weight_result[0].p.pa:weight_result[0].p.pb;
            }
            if($scope.updatedCartTotal<200){
                $rootScope.checkoutShipping = $scope.shipping = 20;
            } else {
                $rootScope.checkoutShipping = $scope.shipping = 0;
            }
            $rootScope.checkoutTotal = $scope.cartTotal = $scope.updatedCartTotal;
            $rootScope.checkoutGrandTotal = $scope.grandTotal = $scope.cartTotal + $scope.shipping;
        };
    }])
    .controller('OfflineCtrl', ['$scope', '$ionicPopover', 'UserFactory', function($scope, $ionicPopover, UserFactory) {

    }])
    .controller('AccountCtrl', ['$scope', '$ionicPopover', 'UserFactory', function($scope, $ionicPopover, UserFactory) {

    }])
    .controller('CheckoutCtrl', ['$rootScope','$scope', '$ionicHistory', 'CartFactory', 'AuthFactory', '$ionicPopover', '$location', 'UserFactory', function($rootScope, $scope, $ionicHistory, CartFactory, AuthFactory, $ionicPopover, $location, UserFactory) {
       $scope.details = AuthFactory.getDetails();
        $scope.clientSideList = [
            { text: "Backbone", value: "bb" },
            { text: "Angular", value: "ng" },
            { text: "Ember", value: "em" },
            { text: "Knockout", value: "ko" }
        ];
        $scope.cartDetails = CartFactory.checkoutTotal();
       $scope.subTotal = $scope.cartDetails.total;
        $scope.gotoCart = function(){
            $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
            });
            $location.path('/app/cart');
        };
        $scope.placeOrder = function(){

        };
    }])
    .controller('TestCtrl', ['$scope', '$ionicPopover', 'UserFactory', function($scope, $ionicPopover, UserFactory) {

// .fromTemplate() method
        var template = '<ion-popover-view><ion-header-bar> <h1 class="title">My Popover Title</h1> </ion-header-bar> <ion-content>{{test}}</ion-content></ion-popover-view>';
        $scope.hello = "Custom Hello";
        $scope.popover = $ionicPopover.fromTemplate(template, {
            scope: $scope
        });

// .fromTemplateUrl() method


        $scope.openPopover = function($event,hello) {
            $scope.test = hello;
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
//Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });
// Execute action on hide popover
        $scope.$on('popover.hidden', function() {
// Execute action
        });
// Execute action on remove popover
        $scope.$on('popover.removed', function() {
// Execute action
        });
    }])
	.controller('SearchCtrl', ['$scope','Loader', 'UserFactory', function($scope,Loader,UserFactory) {
		$scope.myImage='';
    $scope.myCroppedImage='';

    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.myImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };
      angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
    $scope.usecropped = function(myCroppedImage) {
        alert(myCroppedImage);
        Loader.showLoading('Loading.....');
        UserFactory.setProfilepic(myCroppedImage).success(function (data) {

               Loader.hideLoading();
        }).error(function (err, statusCode) {
            Loader.hideLoading();
            Loader.toggleLoadingWithMessage(err.message);
        });
    }
	}])
    .controller('CameraCtrl', function ($scope, $cordovaCamera, $ionicLoading) {
        $scope.data = { "ImageURI" :  "Select Image" };
        $scope.takePicture = function() {
            $ionicLoading.show();
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URL,
                sourceType: Camera.PictureSourceType.CAMERA
            };
            $cordovaCamera.getPicture(options).then(
                function(imageData) {
                    $scope.picData = imageData;
                    $scope.ftLoad = true;
                    localStorage.setItem('fotoUp', imageData);
                    $ionicLoading.show({template: 'Foto acquisita...', duration:500});
                },
                function(err){
                    $ionicLoading.show({template: 'Errore di caricamento...', duration:500});
                })
        }

        $scope.selectPicture = function() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            };

            $cordovaCamera.getPicture(options).then(
                function(imageURI) {
                    window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
                        $scope.picData = fileEntry.nativeURL;
                        $scope.ftLoad = true;
                        var image = document.getElementById('myImage');
                        image.src = fileEntry.nativeURL;
                    });
                    $ionicLoading.show({template: 'Foto acquisita...', duration:500});
                },
                function(err){
                    $ionicLoading.show({template: 'Errore di caricamento...', duration:500});
                })
        };

        $scope.uploadPicture = function() {
            $ionicLoading.show({template: 'Sto inviando la foto...'});
            var fileURL = $scope.picData;
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";
            options.chunkedMode = true;

            var params = {};
            params.value1 = "someparams";
            params.value2 = "otherparams";

            options.params = params;

            var ft = new FileTransfer();
            ft.upload(fileURL, encodeURI("http://www.yourdomain.com/upload.php"), viewUploadedPictures, function(error) {$ionicLoading.show({template: 'Errore di connessione...'});
                $ionicLoading.hide();}, options);
        }

        var viewUploadedPictures = function() {
            $ionicLoading.show({template: 'Sto cercando le tue foto...'});
            server = "http://www.yourdomain.com/upload.php";
            if (server) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange=function(){
                    if(xmlhttp.readyState === 4){
                        if (xmlhttp.status === 200) {
                            document.getElementById('server_images').innerHTML = xmlhttp.responseText;
                        }
                        else { $ionicLoading.show({template: 'Errore durante il caricamento...', duration: 1000});
                            return false;
                        }
                    }
                };
                xmlhttp.open("GET", server , true);
                xmlhttp.send()}	;
            $ionicLoading.hide();
        }

        $scope.viewPictures = function() {
            $ionicLoading.show({template: 'Sto cercando le tue foto...'});
            server = "http://www.yourdomain.com/upload.php";
            if (server) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange=function(){
                    if(xmlhttp.readyState === 4){
                        if (xmlhttp.status === 200) {
                            document.getElementById('server_images').innerHTML = xmlhttp.responseText;
                        }
                        else { $ionicLoading.show({template: 'Errore durante il caricamento...', duration: 1000});
                            return false;
                        }
                    }
                };
                xmlhttp.open("GET", server , true);
                xmlhttp.send()}	;
            $ionicLoading.hide();
        }
    });