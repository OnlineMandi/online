var base = 'http://beta.onlinemandi.com/v1';
angular.module('Onlinemandi.factory', [])
.factory('Loader', ['$ionicLoading', '$timeout',
function($ionicLoading, $timeout) {
	var LOADERAPI = {
		showLoading: function(text) {
			text = text || 'Loading...';
			$ionicLoading.show({
				template: text
			});
		},
		hideLoading: function() {
			$ionicLoading.hide();
		},
		toggleLoadingWithMessage: function(text, timeout) {
			this.showLoading(text);
			$timeout(function() {
				$ionicLoading.hide();
			}, timeout || 1000);
		}
	};
	return LOADERAPI;
}])
.factory('LSFactory', [function() {
	var LSAPI = {
		clear: function() {
			return localStorage.clear();
		},
		get: function(key) {
			return JSON.parse(localStorage.getItem(key));
		},
        getNum: function(key) {
            return localStorage.getItem(key);
        },
		set: function(key, data) {
			return localStorage.setItem(key, JSON.stringify(data));
		},
        setNum: function(key, data) {
            return localStorage.setItem(key,data);
        },
		delete: function(key) {
			return localStorage.removeItem(key);
		},
		getAll: function() {
			var books = [];
			var items = Object.keys(localStorage);
			for (var i = 0; i < items.length; i++) {
				if (items[i] !== 'user' || items[i] != 'token') {
					books.push(JSON.parse(localStorage[items[i]]));
				}
			}
			return books;
		}
	};
	return LSAPI;
}])
.factory('AuthFactory', ['LSFactory', function(LSFactory) {
	var userKey = 'user';
	var detailsKey = 'details';
	var tokenKey = 'token';
	var currenttimeKey = 'currenttime';
    var resetKeys = [
       'fruits','favouritefruits','topsellingfruits','vegetables','favouritevegetables','topsellingvegetables','selected'
    ];
	var AuthAPI = {
		isLoggedIn: function() {
			return this.getUser() === null ? false : true;
		},
		getUser: function() {
			return LSFactory.get(userKey);
		},
		setUser: function(user) {
			return LSFactory.set(userKey, user);
		},
		getDetails: function() {
			return LSFactory.get(detailsKey);
		},
		setDetails: function(details) {
			return LSFactory.set(detailsKey, details);
		},
		getToken: function() {
			return LSFactory.get(tokenKey);
		},
		setToken: function(token) {
			return LSFactory.set(tokenKey, token);
		},
		deleteAuth: function() {
			LSFactory.delete(userKey);
			LSFactory.delete(tokenKey);
		},
		getCurrentTime: function() {
			return LSFactory.getNum(currenttimeKey);
		},
		setCurrentTime: function(ctime) {
			return LSFactory.setNum(currenttimeKey, ctime);
		},
        deleteCurrentTime: function() {
            LSFactory.delete(currenttimeKey);
        },
        getProductStatus: function(key) {
            return LSFactory.getNum(key);
        },
        setProductStatus: function(key,status) {
            return LSFactory.setNum(key,status);
        },
        resetProductStatus: function(status) {
            for (var i = 0; i < resetKeys.length; i++) {
                LSFactory.setNum(resetKeys[i], status);
            }
            return;
        },
	};
	return AuthAPI;
}])
.factory('TokenInterceptor', ['$q', 'AuthFactory', function($q, AuthFactory) {
	return {
		request: function(config) {
			config.headers = config.headers || {};
			var token = AuthFactory.getToken();
			var user = AuthFactory.getUser();
			if (token && user) {
				config.headers['X-Access-Token'] = token.token;
				config.headers['Authorization'] = "Bearer " + token.token;
				config.headers['Content-Type'] = "application/json";
			}
			var currenttime = AuthFactory.getCurrentTime();
			if(currenttime){
				config.headers['X-Current-Time'] = currenttime;
			}
			return config || $q.when(config);
		},
		response: function(response) {
			return response || $q.when(response);
		}
	};
}])
.factory('BooksFactory', ['$http', function($http) {
	var perPage = 30;
	var API = {
		get: function(page) {
			return $http.get(base + '/api/v1/books/' + page + '/' + perPage);
		}
	};
	return API;
}])
.factory('ProductsFactory', ['$rootScope', 'LSFactory', '$http', 'AuthFactory', 'UserFactory', function($rootScope, LSFactory, $http, AuthFactory, UserFactory) {
	var perPage = 30;
	var isloggedin  = AuthFactory.isLoggedIn();
	var API = {
	selectedfruits:function(){
		if ($rootScope.isAuthenticated){
			return $http.get(base + '/index/selected-products?status=' + AuthFactory.getProductStatus('selected'));
		} else {
            var city = UserFactory.getCity();
            return $http.get(base + '/index/guest-selected-products/?city=' + city.id + '&status=' + AuthFactory.getProductStatus('selected'));
		}
		},
	fruits:function(totalitems){
			if ($rootScope.isAuthenticated){
				return $http.get(base + '/fruits/index?totalitems=' + totalitems + '&status=' + AuthFactory.getProductStatus('fruits'));
			} else {
				var city = UserFactory.getCity();
				return $http.get(base + '/fruits/guest-fruits?city=' + city.id + '&totalitems=' +totalitems + '&status=' + AuthFactory.getProductStatus('fruits'));
			}
	},
	favouritefruits:function(totalitems){
			return $http.get(base + '/fruits/favourite-fruits?totalitems=' +totalitems + '&status=' + AuthFactory.getProductStatus('favouritefruits'));
	},
	bestsellingfruits:function(){
		if ($rootScope.isAuthenticated){
			return $http.get(base + '/fruits/bestselling-fruits?status=' + AuthFactory.getProductStatus('topsellingfruits'));
		} else {
			var city = UserFactory.getCity();
			return $http.get(base + '/fruits/guest-bestselling-fruits?city=' + city.id + '&status=' + AuthFactory.getProductStatus('topsellingfruits'));
		}
	},
	vegetables:function(totalitems){
			if ($rootScope.isAuthenticated){
				return $http.get(base + '/vegetables/index?totalitems=' + totalitems + '&status=' + AuthFactory.getProductStatus('vegetables'));
			} else {
				var city = UserFactory.getCity();
				return $http.get(base + '/vegetables/guest-vegetables?city=' + city.id + '&totalitems=' +totalitems + '&status=' + AuthFactory.getProductStatus('vegetables'));
			}
	},
	favouritevegetables:function(totalitems){
			return $http.get(base + '/vegetables/favourite-vegetables?totalitems=' +totalitems + '&status=' + AuthFactory.getProductStatus('favouritevegetables'));
	},
	bestsellingvegetables:function(){
			if ($rootScope.isAuthenticated){
				return $http.get(base + '/vegetables/bestselling-vegetables?status=' + AuthFactory.getProductStatus('topsellingvegetables'));
			} else {
				var city = UserFactory.getCity();
				return $http.get(base + '/vegetables/guest-bestselling-vegetables?city=' + city.id + '&status=' + AuthFactory.getProductStatus('topsellingvegetables'));
			}
	},
	addfav:function(id,category){
		if(category==1){
			var favproducts = this.getProducts('allfavouritefruits');
			favproducts.push(id);
			this. setProducts('allfavouritefruits',favproducts);
		} else {
			var favproducts = this.getProducts('allfavouritevegetables');
			favproducts.push(id);
			this. setProducts('allfavouritevegetables',favproducts);
		}
	},
	removefav:function(id,category){
		if(category==1){
			var favproducts = this.getProducts('allfavouritefruits');
			favproducts.splice(favproducts.indexOf(id), 1);
			this. setProducts('allfavouritefruits',favproducts);
		} else {
			var favproducts = this.getProducts('allfavouritevegetables');
			favproducts.splice(favproducts.indexOf(id), 1);
			this. setProducts('allfavouritevegetables',favproducts);
		}
	},

    getProducts: function(key) {
        return LSFactory.get(key);
    },
    setProducts: function(key,value) {
        return LSFactory.set(key, value);
    },
	addToWishlist: function(product){
        return $http.post(base + '/index/addtowishlist', product);
	}
	};return API;
}])
.factory('UserFactory', ['$http', 'AuthFactory', 'LSFactory', function($http, AuthFactory, LSFactory) {
	var cityKey = 'city';
	var UserAPI = {
		login: function(user) {
				return $http.post(base + '/index/login', user);
		},
		register: function(user) {
				return $http.post(base + '/index/register', user);
		},
		setProfilepic: function(pic) {
				return $http.post(base + '/index/changepic', pic);
		},
		logout: function() {
				AuthFactory.deleteAuth();
		},
		isCurrentCity: function() {
				return this.getCity() === null ? false : true;
		},
		getCity: function() {
				return LSFactory.get(cityKey);
		},
		setCity: function(city) {
				return LSFactory.set(cityKey, city);
			},
		getCities: function(item) {
				return $http.get(base + '/index/cities?state_id=' + item);
			},
		getindex: function() {
				return $http.get(base + '/index/index');
			},
		getCartItems: function() {
				var userId = AuthFactory.getUser()._id;
				return $http.get(base + '/users/' + userId + '/cart');
		},
		addToCart: function(book) {
				var userId = AuthFactory.getUser()._id;
				return $http.post(base + '/users/' + userId + '/cart', book);
		},
		getPurchases: function() {
				var userId = AuthFactory.getUser()._id;
				return $http.get(base + '/users/' + userId + '/purchases');
		},
		addPurchase: function(cart) {
				var userId = AuthFactory.getUser()._id;
				return $http.post(base + '/users/' + userId + '/purchases', cart);
		}
	};
	return UserAPI;
}])
.factory('CartFactory', ['$filter', '$http', 'AuthFactory', 'LSFactory', 'ProductsFactory', function($filter, $http, AuthFactory, LSFactory, ProductsFactory) {
	    var cartKey = 'mandi_cart';
		var added = 1;
        var CartAPI = {
		addtocart: function (product) {
			return $http.post(base + '/cart/addproduct', product);
		},
		addToLocalCart: function(product){
			var cart = LSFactory.get(cartKey);
			var result = $filter('filter')(cart,{id:product.id},true);
			if(result.length){
				for(var i=0;i<cart.length;i++) {
					if (cart[i].id == product.id) {
						if(cart[i].g != product.g || cart[i].w != product.w){
							cart[i].g = product.g;
							cart[i].w = product.w;
							added = 0;
						} else {
							added = -1;
						}
						break;
					}
				}

			} else {
				added = 1;
				cart.push(product);
			}

			LSFactory.set(cartKey, cart);
			return added;
		},
		deleteItem: function(itemid) {
			var cart = LSFactory.get(cartKey);
			var result = $filter('filter')(cart,function(value, index) {return value.id !== itemid;});

			LSFactory.set(cartKey, result);
		},
        getCart: function() {
			if (LSFactory.get(cartKey)===null) {
                this. setCart();
			}
            return LSFactory.get(cartKey);
        },
        setCart: function() {
			if(AuthFactory.isLoggedIn()){
				return LSFactory.set(cartKey, []);
				/*this.getRemoteCart().success(function(data) {
					return LSFactory.set(cartKey, data);
				}).error(function(err, statusCode) {
					return LSFactory.set(cartKey, {});
				});*/
			} else {
				return LSFactory.set(cartKey, []);
			}
		},
        renewCart: function(cartdata){
            return LSFactory.set(cartKey, cartdata);
        },
        clearCart: function() {
            return LSFactory.set(cartKey, []);
        },
        getRemoteCart:function() {
            return $http.get(base + '/cart/cart-products');
        },
		checkoutTotal: function() {
            var local_cart = this.getCart();
            var cart = [];
            var allfruits = ProductsFactory.getProducts('allfruits');
            var allvegetables = ProductsFactory.getProducts('allvegetables');
            angular.extend(allfruits, allvegetables);
            var cartTotal = 0;
            var shipping = 0;
            var grandTotal = 0;
            var status = 0;

            for(var i=0;i< local_cart.length;i++) {

                var fruit = allfruits[local_cart[i].id];
                var cartfruit = local_cart[i];
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
               cartTotal += item_price;
            }
            if(cartTotal<200){
                shipping = 20.00;
            }
            grandTotal = cartTotal + shipping;
            return {
                total: cartTotal,
                ship: shipping,
                gtotal: grandTotal,
            };
		},
	};
	return CartAPI;
}])
.factory('MsgFactory', ['LSFactory', function(LSFactory) {
    var msgsKey = 'alertmessages';
    var MsgAPI = {
       isMsgArray: function() {
           return this.getMessages() === null ? false : true;
       },
       getMessages: function(){
           return LSFactory.get(msgsKey);
       },
       setMessages: function(msgs) {
           return LSFactory.set(msgsKey, msgs);
       },
   };
   return MsgAPI;
}])
.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork, $state){
	return {
		isOnline: function(){
			if(ionic.Platform.isWebView()){
				return $cordovaNetwork.isOnline();
			} else {
					return navigator.onLine;
				}
		},
			isOffline: function(){
				if(ionic.Platform.isWebView()){
					return !$cordovaNetwork.isOnline();
				} else {
					return !navigator.onLine;
				}
			},
			startWatching: function(){
				if(ionic.Platform.isWebView()){

					$rootScope.$on('$cordovaNetwork:online', function(event, networkState){
						console.log("went online");
					});

					$rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
						console.log("went offline");
					});

				}
				else {

					window.addEventListener("online", function(e) {
						console.log("went online");
					}, false);

					window.addEventListener("offline", function(e) {
                        alert("hello");
						console.log("went offline");
					}, false);
				}
			}
		}
})