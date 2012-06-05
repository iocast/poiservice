
OpenLayers.MyMap = OpenLayers.Class(OpenLayers.Map, {
	boundsCH : new OpenLayers.Bounds(662963,5751192,1168000,6075059),
	zoomToMaxExtent: function(options) {
		this.zoomToExtent(this.boundsCH);
    }
});


OpenLayers.Layer.MyGML = OpenLayers.Class(OpenLayers.Layer.GML, {
	callback : '',
	noFeature : '',
	afterReceive : '',
	requestSuccess : function(request) {
		if(request.responseXML != null) {
			if(request.responseXML.firstChild.nodeName == 'ExceptionReport') {
				errors = {};
				for(var i = 0; i < request.responseXML.firstChild.childNodes.length; i++) {
					child = request.responseXML.firstChild.childNodes[i];
					if(child.nodeType == 1) {
						for(var a = 0; a < child.childNodes.length; a++) {
							element = child.childNodes[a];
							if(element.nodeType == 1) {
								if(element.nodeName == 'ExceptionText') {
									errors[child.getAttribute('exceptionCode')] = element.textContent;
								}
							}
						}
					}
					
				}
				if(typeof(this.callback) == "function") {
					this.callback(errors);
				}
			} else {
				if(request.responseXML.lastChild.childNodes.length > 1) {
					OpenLayers.Layer.GML.prototype.requestSuccess.apply(this, arguments);
				} else {
					if(typeof(this.noFeature) == "function") {
						this.noFeature();
					}
				}
			}
		} else {
			alert(request.responseText);
		}
		if(typeof(this.afterReceive) == "function") {
			this.afterReceive();
		}
	},
	requestFailure: function(request) {
		if(typeof(this.afterReceive) == "function") {
			this.afterReceive();
		}
	}
});

var MapHander = Class.extend({
	map : null,
	EPSG4326 : new OpenLayers.Projection("EPSG:4326"),
	EPSG900913 : new OpenLayers.Projection("EPSG:900913"),
	layers: new Array(),
	
	createMap : function() {
		this.map = new OpenLayers.MyMap("osm_map", {
			controls: [
						new OpenLayers.Control.Navigation({handleRightClicks:true}),
						new OpenLayers.Control.PanZoomBar({zoomWorldIcon:true, zoomStart:8,forceFixedZoomLevel:true}),
						new OpenLayers.Control.LayerSwitcher(),
						new OpenLayers.Control.Permalink(),
						new OpenLayers.Control.ScaleLine(),
						new OpenLayers.Control.Scale(),
						new OpenLayers.Control.MousePosition(),
						new OpenLayers.Control.OverviewMap()
					],
			units : 'm',
			projection : this.EPSG900913,
			displayProjection : this.EPSG4326
		});
	},

	addMapnik : function(name) {
		var mapnik = new OpenLayers.Layer.OSM(name);
		this.addLayer(name, mapnik);
	},
	
	addLayer : function(name, layer, url) {
		this.map.addLayer(layer);
		this.layers[name] = layer;
	},
	
	removeLayer : function(name) {
		if(name in this.layers)
			this.map.removeLayer(this.layers[name]);
	},
	
	removeAllLayers : function() {
		var layers = this.map.getLayersByClass('OpenLayers.Layer.Vector');
		for(index in layers) {
			layers[index].destroy();
		}
		layers = this.map.getLayersByClass('OpenLayers.Layer.GML');
		for(index in layers) {
			layers[index].destroy();
		}
	},
	
	processQuery : function() {
		if(arguments.length == 8) {
			return(
					this.processQueryFeatureFilter.apply(this, arguments)
			);
		} else {
			return(
					this.processQueryFeatureServer.apply(this, arguments)
			);
		}
	},
	
	processQueryFeatureFilter : function(name, filter, bbox, size, callback, noFeature, beforeSend, afterReceive) {
		var url = this.getFeatureFilterURL(filter, bbox, size);
		
		return this.process(name, url, callback, noFeature, beforeSend, afterReceive);
	},
	
	processQueryFeatureServer : function(name, filter, bbox, callback, noFeature, beforeSend, afterReceive) {
		var url = this.getFeatureServerURL(filter, bbox);
		
		return this.process(name, url, callback, noFeature, beforeSend, afterReceive);
	},
	
	process : function(name, url, callback, noFeature, beforeSend, afterReceive) {
		if(typeof(beforeSend) == "function") {
			beforeSend();
		}
		
		var layer = new OpenLayers.Layer.MyGML(name, url, {
			projection : new OpenLayers.Projection("EPSG:4326"),
			callback : callback,
			noFeature : noFeature,
			afterReceive : afterReceive
		});
		return layer;
	},
	
	getFeatureServerURL : function(filter, bbox) {
		var fe = filter.replace(/\n/g, "");
		var url = FeatureServerURL;
		url += '?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME='+FeatureServerLayer;
		url += '&FILTER=' + encodeURI(fe);
		if(typeof(bbox) !== 'undefined') {
			if(bbox.length > 0) {
				url += '&BBOX=' + bbox;
			}
		}
		return url;
	},
	
	getFeatureFilterURL : function(filter, bbox, size) {
		var fe = filter.replace(/\n/g, "");
		var url = FeatureFilterURL;
		url += '?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME='+FeatureFilterLayer;
		url += '&FILTER=' + encodeURI(fe);
		if(typeof(bbox) !== 'undefined') {
			if(bbox.length > 0) {
				url += '&BBOX=' + bbox;
			}
		}
		if(typeof(size) !== 'undefined') {
			if(size.length > 0) {
				url += '&SIZE=' + size;
			}
		}
		
		return url;
	}

});
