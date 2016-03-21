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
				return $http.get(base + '/fruits/index?status=' + AuthFactory.getProductStatus('fruits'));
			} else {
				var city = UserFactory.getCity();
				return $http.get(base + '/fruits/guest-fruits?city=' + city.id + '&status=' + AuthFactory.getProductStatus('fruits'));
			}
	},
    testfruits:function(totalitems){
            if ($rootScope.isAuthenticated){
                return $http.get(base + '/fruits/index1?status=' + AuthFactory.getProductStatus('testfruits'));
            } else {
                var city = UserFactory.getCity();
                return $http.get(base + '/fruits/guest-fruits1?city=' + city.id + '&status=' + AuthFactory.getProductStatus('testfruits'));
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
	.factory('WeightFactory', ['$http', 'AuthFactory', 'LSFactory', function($http, AuthFactory, LSFactory) {
		var allweights = {"1":{"id":1,"name":"100","unit_id":1,"depends":0,"multiplier":0.1},"2":{"id":2,"name":"200","unit_id":1,"depends":1,"multiplier":0.2},"3":{"id":3,"name":"250","unit_id":1,"depends":2,"multiplier":0.25},"4":{"id":4,"name":"300","unit_id":1,"depends":3,"multiplier":0.3},"5":{"id":5,"name":"400","unit_id":1,"depends":4,"multiplier":0.4},"6":{"id":6,"name":"500","unit_id":1,"depends":5,"multiplier":0.5},"7":{"id":7,"name":"600","unit_id":1,"depends":6,"multiplier":0.6},"8":{"id":8,"name":"700","unit_id":1,"depends":7,"multiplier":0.7},"9":{"id":9,"name":"750","unit_id":1,"depends":8,"multiplier":0.75},"10":{"id":10,"name":"800","unit_id":1,"depends":9,"multiplier":0.8},"11":{"id":11,"name":"900","unit_id":1,"depends":10,"multiplier":0.9},"12":{"id":12,"name":"1","unit_id":2,"depends":11,"multiplier":1},"13":{"id":13,"name":"1.5","unit_id":2,"depends":12,"multiplier":1.5},"14":{"id":14,"name":"2","unit_id":2,"depends":13,"multiplier":2},"15":{"id":15,"name":"2.5","unit_id":2,"depends":14,"multiplier":2.5},"16":{"id":16,"name":"3","unit_id":2,"depends":15,"multiplier":3},"17":{"id":17,"name":"3.5","unit_id":2,"depends":16,"multiplier":3.5},"18":{"id":18,"name":"4","unit_id":2,"depends":17,"multiplier":4},"19":{"id":19,"name":"4.5","unit_id":2,"depends":18,"multiplier":4.5},"20":{"id":20,"name":"5","unit_id":2,"depends":19,"multiplier":5},"21":{"id":21,"name":"5.5","unit_id":2,"depends":20,"multiplier":5.5},"22":{"id":22,"name":"6","unit_id":2,"depends":21,"multiplier":6},"23":{"id":23,"name":"6.5","unit_id":2,"depends":22,"multiplier":6.5},"24":{"id":24,"name":"7","unit_id":2,"depends":23,"multiplier":7.5},"25":{"id":25,"name":"7.5","unit_id":2,"depends":24,"multiplier":7.5},"26":{"id":26,"name":"8","unit_id":2,"depends":25,"multiplier":8},"27":{"id":27,"name":"8.5","unit_id":2,"depends":26,"multiplier":8.5},"28":{"id":28,"name":"9","unit_id":2,"depends":27,"multiplier":9},"29":{"id":29,"name":"9.5","unit_id":2,"depends":28,"multiplier":9.5},"30":{"id":30,"name":"10","unit_id":2,"depends":29,"multiplier":10},"31":{"id":31,"name":"11","unit_id":2,"depends":30,"multiplier":11},"32":{"id":32,"name":"12","unit_id":2,"depends":31,"multiplier":12},"33":{"id":33,"name":"13","unit_id":2,"depends":32,"multiplier":13},"34":{"id":34,"name":"14","unit_id":2,"depends":33,"multiplier":14},"35":{"id":35,"name":"15","unit_id":2,"depends":34,"multiplier":15},"36":{"id":36,"name":"16","unit_id":2,"depends":35,"multiplier":16},"37":{"id":37,"name":"17","unit_id":2,"depends":36,"multiplier":17},"38":{"id":38,"name":"18","unit_id":2,"depends":37,"multiplier":18},"39":{"id":39,"name":"19","unit_id":2,"depends":38,"multiplier":19},"40":{"id":40,"name":"20","unit_id":2,"depends":39,"multiplier":20},"41":{"id":41,"name":"21","unit_id":2,"depends":40,"multiplier":21},"42":{"id":42,"name":"22","unit_id":2,"depends":41,"multiplier":22},"43":{"id":43,"name":"23","unit_id":2,"depends":42,"multiplier":23},"44":{"id":44,"name":"24","unit_id":2,"depends":43,"multiplier":24},"45":{"id":45,"name":"25","unit_id":2,"depends":44,"multiplier":25},"46":{"id":46,"name":"26","unit_id":2,"depends":45,"multiplier":26},"47":{"id":47,"name":"27","unit_id":2,"depends":46,"multiplier":27},"48":{"id":48,"name":"28","unit_id":2,"depends":47,"multiplier":28},"49":{"id":49,"name":"29","unit_id":2,"depends":48,"multiplier":29},"50":{"id":50,"name":"30","unit_id":2,"depends":49,"multiplier":30},"51":{"id":51,"name":"35","unit_id":2,"depends":50,"multiplier":35},"52":{"id":52,"name":"40","unit_id":2,"depends":51,"multiplier":40},"53":{"id":53,"name":"45","unit_id":2,"depends":52,"multiplier":45},"54":{"id":54,"name":"50","unit_id":2,"depends":53,"multiplier":50},"55":{"id":55,"name":"55","unit_id":2,"depends":54,"multiplier":55},"56":{"id":56,"name":"60","unit_id":2,"depends":55,"multiplier":60},"57":{"id":57,"name":"65","unit_id":2,"depends":56,"multiplier":65},"58":{"id":58,"name":"70","unit_id":2,"depends":57,"multiplier":70},"59":{"id":59,"name":"75","unit_id":2,"depends":58,"multiplier":75},"60":{"id":60,"name":"80","unit_id":2,"depends":59,"multiplier":80},"61":{"id":61,"name":"85","unit_id":2,"depends":60,"multiplier":85},"62":{"id":62,"name":"90","unit_id":2,"depends":61,"multiplier":90},"63":{"id":63,"name":"95","unit_id":2,"depends":62,"multiplier":95},"64":{"id":64,"name":"100","unit_id":2,"depends":63,"multiplier":100},"65":{"id":65,"name":"110","unit_id":2,"depends":64,"multiplier":110},"66":{"id":66,"name":"120","unit_id":2,"depends":65,"multiplier":120},"67":{"id":67,"name":"130","unit_id":2,"depends":66,"multiplier":130},"68":{"id":68,"name":"140","unit_id":2,"depends":67,"multiplier":140},"69":{"id":69,"name":"150","unit_id":2,"depends":68,"multiplier":150},"70":{"id":70,"name":"160","unit_id":2,"depends":69,"multiplier":160},"71":{"id":71,"name":"170","unit_id":2,"depends":70,"multiplier":170},"72":{"id":72,"name":"180","unit_id":2,"depends":71,"multiplier":180},"73":{"id":73,"name":"190","unit_id":2,"depends":72,"multiplier":190},"74":{"id":74,"name":"200","unit_id":2,"depends":73,"multiplier":200},"75":{"id":75,"name":"0.25","unit_id":3,"depends":0,"multiplier":0.25},"76":{"id":76,"name":"0.5","unit_id":3,"depends":75,"multiplier":0.5},"77":{"id":77,"name":"0.75","unit_id":3,"depends":76,"multiplier":0.75},"78":{"id":78,"name":"1","unit_id":3,"depends":77,"multiplier":1},"79":{"id":79,"name":"1.5","unit_id":3,"depends":78,"multiplier":1.5},"80":{"id":80,"name":"2","unit_id":3,"depends":79,"multiplier":2},"81":{"id":81,"name":"2.5","unit_id":3,"depends":80,"multiplier":2.5},"82":{"id":82,"name":"3","unit_id":3,"depends":81,"multiplier":3},"83":{"id":83,"name":"3.5","unit_id":3,"depends":82,"multiplier":3.5},"84":{"id":84,"name":"4","unit_id":3,"depends":83,"multiplier":4},"85":{"id":85,"name":"4.5","unit_id":3,"depends":84,"multiplier":4.5},"86":{"id":86,"name":"5","unit_id":3,"depends":85,"multiplier":5},"87":{"id":87,"name":"5.5","unit_id":3,"depends":86,"multiplier":5.5},"88":{"id":88,"name":"6","unit_id":3,"depends":87,"multiplier":6},"89":{"id":89,"name":"6.5","unit_id":3,"depends":88,"multiplier":6.5},"90":{"id":90,"name":"7","unit_id":3,"depends":89,"multiplier":7},"91":{"id":91,"name":"7.5","unit_id":3,"depends":90,"multiplier":7.5},"92":{"id":92,"name":"8","unit_id":3,"depends":91,"multiplier":8},"93":{"id":93,"name":"8.5","unit_id":3,"depends":92,"multiplier":8.5},"94":{"id":94,"name":"9","unit_id":3,"depends":93,"multiplier":9},"95":{"id":95,"name":"9.5","unit_id":3,"depends":94,"multiplier":9.5},"96":{"id":96,"name":"10","unit_id":3,"depends":95,"multiplier":10},"97":{"id":97,"name":"11","unit_id":3,"depends":96,"multiplier":11},"98":{"id":98,"name":"12","unit_id":3,"depends":97,"multiplier":12},"99":{"id":99,"name":"13","unit_id":3,"depends":98,"multiplier":13},"100":{"id":100,"name":"14","unit_id":3,"depends":99,"multiplier":14},"101":{"id":101,"name":"15","unit_id":3,"depends":100,"multiplier":15},"102":{"id":102,"name":"16","unit_id":3,"depends":101,"multiplier":16},"103":{"id":103,"name":"17","unit_id":3,"depends":102,"multiplier":17},"104":{"id":104,"name":"18","unit_id":3,"depends":103,"multiplier":18},"105":{"id":105,"name":"19","unit_id":3,"depends":104,"multiplier":19},"106":{"id":106,"name":"20","unit_id":3,"depends":105,"multiplier":20},"107":{"id":107,"name":"21","unit_id":3,"depends":106,"multiplier":21},"108":{"id":108,"name":"22","unit_id":3,"depends":107,"multiplier":22},"109":{"id":109,"name":"23","unit_id":3,"depends":108,"multiplier":23},"110":{"id":110,"name":"24","unit_id":3,"depends":109,"multiplier":24},"111":{"id":111,"name":"25","unit_id":3,"depends":110,"multiplier":25},"112":{"id":112,"name":"26","unit_id":3,"depends":111,"multiplier":26},"113":{"id":113,"name":"27","unit_id":3,"depends":112,"multiplier":27},"114":{"id":114,"name":"28","unit_id":3,"depends":113,"multiplier":28},"115":{"id":115,"name":"29","unit_id":3,"depends":114,"multiplier":29},"116":{"id":116,"name":"30","unit_id":3,"depends":115,"multiplier":30},"117":{"id":117,"name":"35","unit_id":3,"depends":116,"multiplier":35},"118":{"id":118,"name":"40","unit_id":3,"depends":117,"multiplier":40},"119":{"id":119,"name":"45","unit_id":3,"depends":118,"multiplier":45},"120":{"id":120,"name":"50","unit_id":3,"depends":119,"multiplier":50},"121":{"id":121,"name":"55","unit_id":3,"depends":120,"multiplier":55},"122":{"id":122,"name":"60","unit_id":3,"depends":121,"multiplier":60},"123":{"id":123,"name":"65","unit_id":3,"depends":122,"multiplier":65},"124":{"id":124,"name":"70","unit_id":3,"depends":123,"multiplier":70},"125":{"id":125,"name":"75","unit_id":3,"depends":124,"multiplier":75},"126":{"id":126,"name":"80","unit_id":3,"depends":125,"multiplier":80},"127":{"id":127,"name":"85","unit_id":3,"depends":126,"multiplier":85},"128":{"id":128,"name":"90","unit_id":3,"depends":127,"multiplier":90},"129":{"id":129,"name":"95","unit_id":3,"depends":128,"multiplier":95},"130":{"id":130,"name":"100","unit_id":3,"depends":129,"multiplier":100},"131":{"id":131,"name":"1","unit_id":4,"depends":0,"multiplier":1},"132":{"id":132,"name":"2","unit_id":4,"depends":131,"multiplier":2},"133":{"id":133,"name":"3","unit_id":4,"depends":132,"multiplier":3},"134":{"id":134,"name":"4","unit_id":4,"depends":133,"multiplier":4},"135":{"id":135,"name":"5","unit_id":4,"depends":134,"multiplier":5},"136":{"id":136,"name":"6","unit_id":4,"depends":135,"multiplier":6},"137":{"id":137,"name":"7","unit_id":4,"depends":136,"multiplier":7},"138":{"id":138,"name":"8","unit_id":4,"depends":137,"multiplier":8},"139":{"id":139,"name":"9","unit_id":4,"depends":138,"multiplier":9},"140":{"id":140,"name":"10","unit_id":4,"depends":139,"multiplier":10},"141":{"id":141,"name":"11","unit_id":4,"depends":140,"multiplier":11},"142":{"id":142,"name":"12","unit_id":4,"depends":141,"multiplier":12},"143":{"id":143,"name":"13","unit_id":4,"depends":142,"multiplier":13},"144":{"id":144,"name":"14","unit_id":4,"depends":143,"multiplier":14},"145":{"id":145,"name":"15","unit_id":4,"depends":144,"multiplier":15},"146":{"id":146,"name":"16","unit_id":4,"depends":145,"multiplier":16},"147":{"id":147,"name":"17","unit_id":4,"depends":146,"multiplier":17},"148":{"id":148,"name":"18","unit_id":4,"depends":147,"multiplier":18},"149":{"id":149,"name":"19","unit_id":4,"depends":148,"multiplier":19},"150":{"id":150,"name":"20","unit_id":4,"depends":149,"multiplier":20},"151":{"id":151,"name":"21","unit_id":4,"depends":150,"multiplier":21},"152":{"id":152,"name":"22","unit_id":4,"depends":152,"multiplier":22},"153":{"id":153,"name":"23","unit_id":4,"depends":152,"multiplier":23},"154":{"id":154,"name":"24","unit_id":4,"depends":153,"multiplier":24},"155":{"id":155,"name":"25","unit_id":4,"depends":154,"multiplier":25},"156":{"id":156,"name":"26","unit_id":4,"depends":155,"multiplier":26},"157":{"id":157,"name":"27","unit_id":4,"depends":156,"multiplier":27},"158":{"id":158,"name":"28","unit_id":4,"depends":157,"multiplier":28},"159":{"id":159,"name":"29","unit_id":4,"depends":158,"multiplier":29},"160":{"id":160,"name":"30","unit_id":4,"depends":159,"multiplier":30},"161":{"id":161,"name":"35","unit_id":4,"depends":160,"multiplier":35},"162":{"id":162,"name":"40","unit_id":4,"depends":161,"multiplier":40},"163":{"id":163,"name":"45","unit_id":4,"depends":162,"multiplier":45},"164":{"id":164,"name":"50","unit_id":4,"depends":163,"multiplier":50},"165":{"id":165,"name":"55","unit_id":4,"depends":164,"multiplier":55},"166":{"id":166,"name":"60","unit_id":4,"depends":165,"multiplier":60},"167":{"id":167,"name":"65","unit_id":4,"depends":166,"multiplier":65},"168":{"id":168,"name":"70","unit_id":4,"depends":167,"multiplier":70},"169":{"id":169,"name":"75","unit_id":4,"depends":168,"multiplier":75},"170":{"id":170,"name":"80","unit_id":4,"depends":169,"multiplier":80},"171":{"id":171,"name":"85","unit_id":4,"depends":170,"multiplier":85},"172":{"id":172,"name":"90","unit_id":4,"depends":171,"multiplier":90},"173":{"id":173,"name":"95","unit_id":4,"depends":172,"multiplier":95},"174":{"id":174,"name":"100","unit_id":4,"depends":173,"multiplier": 100}};
var units = {"1":{"id": 1,"name": "Gram","sname": "gm","status": 1}, "2":{"id": 2,"name": "Kilogram","sname": "kg","status": 1}, "3":{"id": 3,"name": "Dozen","sname": "dz","status": 1}, "4":{"id": 4,"name": "Piece","sname": "pcs","status": 1}};

        return {
            getWeights: function (product) {
                var weights = [];
                var weight;
                for(var j=0; j<product.weights.length; j++){
                   weight = allweights[product.weights[j]];
                    if(product.rate_a){
                        var price_a = weight.multiplier*product.rate_a;
                        if(product.rates_a!=undefined){
                            for (var index in product.rates_a) {
                                if (!product.rates_a.hasOwnProperty(index)) {
                                    continue;
                                } else {
                                    if(parseInt(index)<=weight.id){
                                        price_a = weight.multiplier*product.rates_a[index];
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        var price_a = 0;
                    }
                    if(product.rate_b){
                        var price_b = weight.multiplier*product.rate_b;
                        if(product.rates_b!=undefined){
                            for (var index in product.rates_b) {
                                if (!product.rates_b.hasOwnProperty(index)) {
                                    continue;
                                } else {
                                    if(parseInt(index)<=weight.id){
                                        price_b = weight.multiplier*product.rates_b[index];
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        var price_b = 0;
                    }
                   weights.push({'name':weight.name+units[weight.unit_id].sname,'value':weight.id,'p':{'pa':price_a,'pb'
                       :price_b}});
                }
                return weights;
            },

           /* foreach($weights as $weight){
            $query = Weight::findOne(['id'=>$weight]);
            $item['weights'][] = array('name' => $query->name.$query->unit->sname, 'value' => $query->id, 'p' => CartItems::getCartItemTotal_app($product->product->id, $query->id));
            if($product->productInCart){
                if($query->id==$product->productInCart->quantity){
                    $item['selectedgrade'] = $product->productInCart->grade;
                    $item['selectedweight'] = $query->id;
                }
            } else {
                if($query->id==$product->product->defaultweight){
                    $item['selectedweight'] = $query->id;
                }
            }
        }*/



    };
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