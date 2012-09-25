/**
 * Payelex JS library
 * 
 * Rending View,
 * @Required
 * Jquery,colorBox,
 * 
 *  
 */
if (!window.Payelex) {
    Payelex = {
        appid: '',
        uid: '',
        logging: true,
        _channels: [],
        _depCheckList: {
            jquery: !! (window.jQuery),
            colorbox: (window.jQuery && jQuery()
                .colorbox)
        },
        /**
         * Generates a weak random ID.
         */
        guid: function () {
            return 'p' + (Math.random() * (1 << 30)).toString(16)
                .replace('.', '');
        },
        /**
         * Get current time in second
         */
        time: function () {
            return Math.round(new Date().getTime() / 1000);
        },
        /**
         * Logs a message for the developer if logging is on.
         */
        log: function (args) {
            if (Payelex.logging) {
                var wcs = window.console;
                if (wcs) {
                    if (wcs.debug) {
                        wcs.debug(args);
                    } else {
                        wcs.log(args);
                    }
                }
            }
        },
        /**
         * 检查依赖
         */
        checkDependency: function () {
            var cl = this._depCheckList,
                unload = true;
            for (var check in cl) {
                if (cl.hasOwnProperty(check) && !cl[check]) {
                    unload = false;
                    this.log('Dependency error, can\'t find @' + cl[check]);
                }
            }
            return unload;
        },
        
        _renderTemplate:(function(){
        	var cache = {};
        		_tmpl = function(str, d){
				  var fn =  new Function("obj",
				        "var p=[];" +
						"obj = obj || {}," + 
				        "p.push('" +    
				        // Convert the template into pure JavaScript
				        str
				          .replace(/[\r\t\n]/g, " ")
				          .split("<%").join("\t")
				          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
				          .replace(/\t=(.*?)%>/g, "',$1,'")
				          .split("\t").join("');")
				          .split("%>").join("p.push('")
				          .split("\r").join("\\'")
				        + "');return p.join('');");
				      // Provide some basic currying to the user
				  return fn(d);
			};
			return function(src, data, callback, node, debug){
				if(cache[src]){
					var result = _tmpl(cache[src], data);
					if(node && node.nodeType) $(node).html(result);
					callback && callback(result);
					return result;
				}
				$.ajax({
					url : src,
					success : function(resp){
						var result = _tmpl(resp, data);
						cache[src] = resp;
						if(node && node.nodeType) $(node).html(result);
						callback && callback(result);
					}
				});
			};
        })(),

        //default to find 'payelex-root'
        render:function(node){
        	//渲染模板
        	var root = (node && node.nodeType) ? node : document.getElementById('payelex-root'),
				that = this;
        	this._renderTemplate("templates/body.htm", window.list_channels_data, function(){that.addChannels(window.list_channels_data);}, root);
        },
        /**
         * 安装一个渠道
         */
        loadChannel:function(li){
			var id = li.find('.payImg img').attr('id'),
				splits = id.split('_'),
				that = Payelex,
				tmpl = that._renderTemplate,
				popup_dialogue = that.popupDialog;
			if(splits.size < 2) return;
			var channel = splits[0],
			    paymentMethod = splits[1];
			for(var i=2; i<splits.length-1; i++)
				paymentMethod += '_'+splits[i];
			if (channel == 'ultimatepay' && paymentMethod == 'PK') {
				popup_dialogue(710,425,channel,paymentMethod,tip_select_package,null,appId);
				return false;
			}
			if (channel == 'mozca') {
				popup_dialogue(492,282,channel,paymentMethod,tip_select_package,null,appId);
				return false;
			}
			$('#payment_methods .active').removeClass('active');
			li.addClass('active');
			
			// prepare data for rendering template
			var amount_width = function amount_width(data) {
				var max_width = 0;
				for(var i=0; i<data.length; i++) {
					var width = data[i].show_amount.length*10;
					if(data[i].extra_amount)
						width += data[i].extra_amount.length*10 + 5;
					if(max_width < width)
						max_width = width; 
				}
				return max_width;
			};
			var data = list_packages_data[channel+'_'+paymentMethod];
			data.appid = that.addid;
			data.uid = that.uid;
			data.amount_width = amount_width(data.list_packages);
			
			//render
			tmpl('templates/packages.htm', list_packages_data[channel+'_'+paymentMethod], function(h){
				$('.payListContWarp').html(h);
				$('.payListContWarp .submit a').html(data.label_continue+' >');
				if(!data.tip_customer_service_email || data.tip_customer_service_email=='payment@elex-tech.com') {
					$('.customer_service_link').attr('href', 'javascript:call_customer_service(\''+data.cs_form_title+'\')');
				} else {
					$('.customer_service_link').attr('href', 'mailto:'+data.customer_service_email);
				}
				$('.customer_service_link').html(data.tip_customer_support);
				
				// bind event listener
				var post_data = function post_data(containerTitle, width, height){
					var channel = $('#channel').val();
					var paymentMethod = $('#payment_method').val();
					if (channel == 'paypal' || channel == 'moneybookers' || channel == 'pagseguro' || channel == 'mol' || channel=='dineromail' || channel=='infin' || (channel=='mycard' && paymentMethod=='points') || (channel=='gash' && paymentMethod=='h') || channel=='mikro' || channel=='tutudo' || channel=='dotpay' || channel=='mynet' || channel== 'gashplus' || channel== 'eprepag') {
						$('#payelex').submit();
						return;
					}
					var vamount = $('input:radio[name=vamount]:checked').val();
					var amount = $('#gross_'+vamount).val();
					var showVamount = $('#show_vamount_'+vamount).val();
					containerTitle = containerTitle.replace("<vamount>", showVamount);
					$('#payelex').attr('target', '_self');						
					switch (channel){
						case 'zaypay':
							x = 580; y = 500; break;
						case 'ultimatepay':
							x = 710; y = 425; break;
						case 'adyen':
							x = 580; y = 590; break;
						default:
							x = 580; y = 520; break;
					}
					if(width && height) {
						x = width; y=height;
					}
					popup_dialogue(x,y,channel,paymentMethod,containerTitle,vamount,$('#app_id').val());
				};
				$('.payListContWarp .submit').click(function(){
					post_data(data.container_title, data.width, data.height);
					return false;
				});
				$('#inputclick').on('click', 'li', function(event){
					$(this).addClass("active").siblings(".active").removeClass("active");
					var radio = $(this).find('input');
					if(!radio.attr('disabled')){
						radio.attr('checked',true);
					}					
				});
			});        	
        },
        addChannels:function(data){
        	var tmpl = this._renderTemplate, 
        		loadChannel = this.loadChannel;
			tmpl("templates/payment_methods.htm",data.payment_methods, function(h){
				$('#payment_methods').html(h);
				if(data.country_app_map) {
					tmpl("templates/country_list.htm",data, function(h){$('#country_list').html(h);});
				}
				if(!data.tip_customer_service_email || data.tip_customer_service_email=='payment@elex-tech.com') {
					$('#tip_customer_service_email').html('<a href="javascript:call_customer_service(\''+data.cs_form_title+'\')">Customer Service</a>');
				} else {
					$('#tip_customer_service_email').html('<a href="mailto:'+data.tip_customer_service_email+'">Customer Service</a>');
				}
				if(data.offer) {
					tmpl("templates/offer.htm",data, function(h){
						$('#offer_tab_display').html(h);
						$('#offerTabs ul li:first').addClass('active');
					});
				}
				$('#payment_methods .payListLi').click(function(){
					loadChannel($(this));
				});
				loadChannel($('.payListLi:first')); 
			})   
        },

        popupDialog:function(x,y,channel,paymentMethod,title,vamount,appId){
			var query_str = 'app_id='+appId+'&uid='+uid+'&channel='+channel+'&payment_method='+paymentMethod+'&width='+x+'&height='+y;
			if (vamount) query_str += '&vamount='+vamount;
        	$.colorbox({
        		iframe:true, 
        		href:'http://payelex.appspot.com/popup_iframe?' + query_str,
        		width : x + 55,
        		height : y + 100,
        		innerWidth : x,
        		innerHeight : y,
        		fastIframe : false,
        		overlayClose : false,
        		title : title 
        	});
        },

        /**
         * 分发点击事件
         */
        dispatch: function (event) {

        },

        /**
         * Copies things from source into target.
         *
         * @access private
         * @param target    {Object}  the target object where things will be copied
         *                            into
         * @param source    {Object}  the source object where things will be copied
         *                            from
         * @param overwrite {Boolean} indicate if existing items should be
         *                            overwritten
         * @param tranform  {function} [Optional], transformation function for
         *        each item
         */
        copy: function (target, source, overwrite, transform) {
            for (var key in source) {
                if (overwrite || typeof target[key] === 'undefined') {
                    target[key] = transform ? transform(source[key]) : source[key];
                }
            }
            return target;
        },
        /**
         * Create a namespaced object.
         *
         * @access private
         * @param name {String} full qualified name ('Util.foo', etc.)
         * @param value {Object} value to set. Default value is {}. [Optional]
         * @return {Object} The created object
         */
        create: function (name, value) {
            var node = window.Payelex, // We will use 'FB' as root namespace
                nameParts = name ? name.split('.') : [],
                c = nameParts.length;
            for (var i = 0; i < c; i++) {
                var part = nameParts[i];
                var nso = node[part];
                if (!nso) {
                    nso = (value && i + 1 == c) ? value : {};
                    node[part] = nso;
                }
                node = nso;
            }
            return node;
        },
        /**
         * Bind a function to a given context and arguments.
         *
         * @static
         * @access private
         * @param fn {Function} the function to bind
         * @param context {Object} object used as context for function execution
         * @param {...} arguments additional arguments to be bound to the function
         * @returns {Function} the bound function
         */
        bind: function () {
            var
            args = Array.prototype
                .slice
                .call(arguments),
                fn = args.shift(),
                context = args.shift();
            return function () {
                return fn.apply(
                context,
                args.concat(Array.prototype
                    .slice
                    .call(arguments)));
            };
        },
        /**
         * Create a new class.
         *
         * Note: I have to use 'Class' instead of 'class' because 'class' is
         * a reserved (but unused) keyword.
         *
         * @access private
         * @param name {string} class name
         * @param constructor {function} class constructor
         * @param proto {object} instance methods for class
         */
        Class: function (name, constructor, proto) {
            if (Payelex.CLASSES[name]) {
                return Payelex.CLASSES[name];
            }

            var newClass = constructor || function () {};

            newClass.prototype = proto;
            newClass.prototype
                .bind = function (fn) {
                return Payelex.bind(fn, this);
            };

            newClass.prototype
                .constructor = newClass;
            Payelex.create(name, newClass);
            Payelex.CLASSES[name] = newClass;
            return newClass;
        },

        /**
         * Create a subclass
         *
         * Note: To call base class constructor, use this._base(...).
         * If you override a method 'foo' but still want to call
         * the base class's method 'foo', use this._callBase('foo', ...)
         *
         * @access private
         * @param {string} name class name
         * @param {string} baseName,
         * @param {function} constructor class constructor
         * @param {object} proto instance methods for class
         */
        subclass: function (name, baseName, constructor, proto) {
            if (Payelex.CLASSES[name]) {
                return Payelex.CLASSES[name];
            }
            var base = Payelex.create(baseName);
            Payelex.copy(proto, base.prototype);
            proto._base = base;
            proto._callBase = function (method) {
                var args = Array.prototype
                    .slice
                    .call(arguments, 1);
                return base.prototype[method]
                    .apply(this, args);
            };

            return Payelex.Class(
            name,
            constructor ? constructor : function () {
                if (base.apply) {
                    base.apply(this, arguments);
                }
            },
            proto);
        },
        CLASSES: {}
    }
}
/**
 * Create a new Channel.
 *
 * @access private
 * @constructor
 * @param name {String} the name of the channel
 */
Payelex.Class('Channel.Base',
function (name,lang) {
    this.name = name;
},
Payelex.copy({
    getName: function () {
        return this.name;
    },
    excute:function(){
    	
    }
}));



Payelex.subclass('Channel.Iframe', 'Channel.Base', function (name) {
    this.name = name;
},
Payelex.copy({
    get2Name: function () {
        return this.name + '2222';
    }
}));

var c = new Payelex.Channel.Base('sss');
var b = new Payelex.Channel.Iframe('bbb');
//callback function
if (window.PayelexLoaded) {
    window.PayelexLoaded();
}