
/**
 * Placehodler replacement
 * jQuery required
 */
$('[placeholder]').focus(function() {
	var input = $(this);
	if (input.val() == input.attr('placeholder')) {
		input.val('');
		input.removeClass('placeholder');
	}
}).blur(function() {
	var input = $(this);
	if (input.val() == '' || input.val() == input.attr('placeholder')) {
		input.addClass('placeholder');
		input.val(input.attr('placeholder'));
	}
}).blur(); 


/**
 * CodeMirror Editor extension
 */
var Editor = Class.extend({
	getFormatedValue : function() {
		return this.getValue().replace(new RegExp( "   ", "g" ), "").replace(new RegExp( "\\n", "g" ), "");
	}
});

/**
 * GeoLocation
 */
var _geolocationwrapper = null;

var _GeoLocationWrapper = Class.extend({
	geolocation : null,
	construct : function(geolocation) {
		this.geolocation = geolocation;
	},
	success : function(position) {
		_geolocationwrapper.geolocation.latitude = position.coords.latitude;
		_geolocationwrapper.geolocation.longitude = position.coords.longitude;
		_geolocationwrapper.geolocation.onSuccess();
	},
	error : function(error) {
		switch(error.code) {
			case error.TIMEOUT:
				_geolocationwrapper.geolocation.onTimeout();
				break;
			case error.POSITION_UNAVAILABLE:
				_geolocationwrapper.geolocation.onUnavailable();
				break;
			case error.PERMISSION_DENIED:
				_geolocationwrapper.geolocation.onPermissonDenied()
				break;
			case error.UNKNOWN_ERROR:
				_geolocationwrapper.geolocation.onUnkownError();
				break;
		}
	},
});

var GeoLocation = Class.extend({
	latitude : "",
	longitude : "",
	construct: function(options) {
		if (options == undefined) { options = {}; } 
		Class.Util.extend(this, options);
		
		_geolocationwrapper = new _GeoLocationWrapper(this);
	},
	locate : function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(_geolocationwrapper.success, _geolocationwrapper.error);
		} else {
			this.onUnavailable();
		}
	},
	getLatitude : function() {
		return this.latitude;
	},
	getLongitude : function () {
		return this.longitude;
	},
	onSuccess : function() {},
	onTimeout : function() {},
	onUnavailable : function() {},
	onPermissonDenied : function() {},
	onUnkownError : function() {},
	onNotSupported : function() {},
});