
var Navigation = Class.extend({
	parameters : new Array(),
	callbacks : new Array(),
	navigateTo : function(url) {
		for(var index in this.parameters) {
			value = this.parameters[index]['obj'][this.parameters[index]['method']]();
			url = this.addParameter(url, index, value);
		}
		
		for(var name in this.callbacks) {
			if(typeof(this.callbacks[name]) == "function") {
				var value = this.callbacks[name]();
				url = this.addParameter(url, name, value);
			}
		}
		
		window.location = url;
	},
	register : function(name, obj, method) {
		this.parameters[name] = new Array();
		this.parameters[name]['obj'] = obj;
		this.parameters[name]['method'] = method;
	},
	registerCallback : function(name, callback) {
		this.callbacks[name] = callback;
	},
	addParameter : function(url, name, value) {
		url += (url.split('?')[1] ? '&':'?') + name + '=' + encodeURI(value);
		return url;
	},
	updateParameter : function(url, name, value) {
		var tempArray = url.split("?");
		var baseURL = tempArray[0];
		var aditionalURL = tempArray[1]; 
		var temp = "";
		var newAdditionalURL = "";
		
		if(aditionalURL) {
			var tempArray = aditionalURL.split("&");
			for(var i in tempArray) {
				if(tempArray[i].indexOf(name) == -1) {
					newAdditionalURL += temp+tempArray[i];
					temp = "&";
				}
			}
		}
		var rows_txt = temp+name+"="+encodeURI(value);
		return baseURL+"?"+newAdditionalURL+rows_txt;
	},
	clear : function() {
		this.parameters = new Array();
		this.callbacks = new Array();
	}
});
