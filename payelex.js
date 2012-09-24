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
        _depCheckList:{
        	jquery:!!(window.jQuery),
        	colorbox:!!(window.jQuery&&jQuery().colorbox)
        },
        /**
         * Generates a weak random ID.
         */
        guid: function () {
            return 'p' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
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
        checkDependency:function(){
        	var cl = this._depCheckList,
        		unload = true;
        	for (var check in cl) {				
				if(cl.hasOwnProperty(check) && !cl[check]){
					unload = false;
					this.log('Dependency error, can\'t find @'+cl[check]);
				}
			}
        	return unload;
        },
        
        _renderTemplate:function(src, data, callback, node, debug){
        	var cache = {};
        	var _tmpl = function(str, d){
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
			return (function(){
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
						if(node && node.nodeType) $(node).html(result);
						callback && callback(result);
					}
				});
			})();
        },
        
        //default to find 'payelex-root'
        render:function(node){
        	//渲染模板
        	var root = (node && node.nodeType) ? node : document.getElementById('payelex-root')
				tmpl = this._renderTemplate;
			var loadChannels = function(data){
				tmpl("templates/payment_methods.htm",data.payment_methods, function(h){$('#payment_methods').html(h);})
				if(data.country_app_map) {
					tmpl("templates/country_list.htm",data, function(h){$('#country_list').html(h);});
				}
				if(!data.tip_customer_service_email || data.tip_customer_service_email=='payment@elex-tech.com') {
					$('#tip_customer_service_email').html('<a href="javascript:call_customer_service(\''+data.cs_form_title+'\')">Customer Service</a>');
				} else {
					$('#tip_customer_service_email').html('<a href="mailto:'+data.tip_customer_service_email+'">Customer Service</a>');
				}
				if(data.offer) {
					tmpl("templates/offer.htm",data, function(h){$('#offer_tab_display').html(h);});
					//$("#offerTabs").tabs();
				}
				$('#payment_methods .payListLi').click(function(){
					loadPackage($(this));
				});
				//loadPackage($('.payListLi:first'));
			};
        	tmpl("templates/body.htm", window.list_channels_data, function(){loadChannels(window.list_channels_data);}, root);
        	
        },
        /**
         * 安装一个渠道
         */
        _addChannel:function(channel){
        	
        },
        addChannels:function(channel){
			
        	if(Object.prototype.toString.call(channel) === '[object Array]'){
        		for(var i=0,l=channel.length;i<l;i++){
        			this._addChannel(channel[i]);
        		}
        	}else{
        		this._addChannel(channel);
        	}
        }
    }
}
//callback function
if(window.PayelexLoaded){window.PayelexLoaded();}



