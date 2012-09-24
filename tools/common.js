if (!window.Common){
	window.Common = {};
}
if (!window.Common.QS){
	window.Common.QS = {
	  encode: function(params, sep, encode) {
	    sep    = sep === undefined ? '&' : sep;
	    encode = encode === false ? function(s) { return s; } : encodeURIComponent;
	
	    var pairs = [];
	    window.Common.Array.forEach(params, function(val, key) {
	      if (val !== null && typeof val != 'undefined') {
	        pairs.push(encode(key) + '=' + encode(val));
	      }
	    });
	    pairs.sort();
	    return pairs.join(sep);
	  },
	
	  decode: function(str) {
	    var
	      decode = decodeURIComponent,
	      params = {},
	      parts  = str.split('&'),
	      i,
	      pair;
	
	    for (i=0; i<parts.length; i++) {
	      pair = parts[i].split('=', 2);
	      if (pair && pair[0]) {
	        params[decode(pair[0])] = decode(pair[1]);
	      }
	    }
	
	    return params;
	  }
	}
}
if (!window.Common.Array){
	window.Common.Array = {};
}
window.Common.Array = {

  indexOf: function (arr, item) {
    if (arr.indexOf) {
      return arr.indexOf(item);
    }
    var length = arr.length;
    if (length) {
      for (var index = 0; index < length; index++) {
        if (arr[index] === item) {
          return index;
        }
      }
    }
    return -1;
  },

  merge: function(target, source) {
    for (var i=0; i < source.length; i++) {
      if (XC.Array.indexOf(target, source[i]) < 0) {
        target.push(source[i]);
      }
    }
    return target;
  },

  filter: function(arr, fn) {
    var b = [];
    for (var i=0; i < arr.length; i++) {
      if (fn(arr[i])) {
        b.push(arr[i]);
      }
    }
    return b;
  },

  keys: function(obj, proto) {
    var arr = [];
    for (var key in obj) {
      if (proto || obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  },

  map: function(arr, transform) {
    var ret = [];
    for (var i=0; i < arr.length; i++) {
      ret.push(transform(arr[i]));
    }
    return ret;
  },
  
  forEach: function(item, fn, proto) {
    if (!item) {
      return;
    }

    if (Object.prototype.toString.apply(item) === '[object Array]' ||
        (!(item instanceof Function) && typeof item.length == 'number')) {
      if (item.forEach) {
        item.forEach(fn);
      } else {
        for (var i=0, l=item.length; i<l; i++) {
          fn(item[i], i, item);
        }
      }
    } else {
      for (var key in item) {
        if (proto || item.hasOwnProperty(key)) {
          fn(item[key], key, item);
        }
      }
    }
  },

  isArray: function(arg){
	  return Object.prototype.toString.call(arg) === '[object Array]';
  }
};
