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
        
        _renderTemplate:function(node, src, data, callback, debug){
        	if(!node || !node.nodeType) return;
        	var cache = {};
        	var _tmpl = function(str, d){
				  var fn =  new Function("obj",
				        "var p=[];" +
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
				  return d ? fn(d) : fn;
			};
			return (function(){
				if(cache[src]){
					$(node).html(_tmpl(cache[src], data));
					callback && callback();
					return;
				}
				$.ajax({
					url : src,
					success : function(resp){
						$(node).html(_tmpl(resp, data));
						callback && callback();
					}
				});
			})();
        },
        
        //default to find 'payelex-root'
        render:function(node){
        	//渲染模板
        	var root = (node && node.nodeType) ? node : document.getElementById('payelex-root');
        	this._renderTemplate(root, "templates/body.htm");
        	
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



