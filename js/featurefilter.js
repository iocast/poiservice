var filterEncoding = null;
var examples = null;
var editor = null;

/**
 * Class for examples
 */
var Examples = Examples.extend({	
	
	loadExample : function(id) {
		$('#error_msg').hide(0);
		
		var mapSize = $('#osm_map').width() + ',' + $('#osm_map').height();
		var filter = this.examples[id]["filter"];
		
		editor.setValue(beautifyXml(filter));
		editor.refresh();
		
		var url = FeatureFilterURL + "?server="+FeatureFilterServer+"&size=" + mapSize + "&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=" + FeatureFilterLayer;
		var parser = new OpenLayers.Format.Filter.v1_1_0();
		var xml = new OpenLayers.Format.XML();
		var object = parser.read(xml.read(filter).documentElement);
		
		filterEncoding.load(this.examples[id]["id"], this.examples[id]["name"], url, object);
				
		filterEncoding.map.getControlsByClass('OpenLayers.Control.Permalink')[0].element.href = Navigation.prototype.updateParameter(filterEncoding.map.getControlsByClass('OpenLayers.Control.Permalink')[0].element.href, "filter", editor.getFormatedValue());
	}
	
});




/**
 * Extending FeatureFilter class
 */
var FeatureFilter = FeatureFilter.extend({
	load : function(id, name, url, object) {
		filterEncoding.removeLayer(id);
		filterEncoding.addLayer(
			new OpenLayers.Layer.VectorFilter(
				id,
				name,
				{
					strategies : [new OpenLayers.Strategy.BBOX({resFactor:1,ratio:1})],
					filter : object,
					protocol : new OpenLayers.Protocol.WFSFilter({
						version : "1.1.0",
						url : url,
						featureType : FeatureFilterLayer,
						featureNS : "http://example.com/featureserver", //FeatureFilterURL + "?server="+FeatureFilterServer,
						geometryName : "the_geog",
						srsName : "EPSG:4326",
						
						beforeSend : function() {
							//$('#loading').show(0);
							$('#error_msg').hide(0);
							$("body").css("cursor", "progress");
							
							if(filterEncoding.map.zoom == 18) {
								this.options.url += "&clustering=false";
							} else {
								this.options.url = this.url;
							}
							
							var pos = $('#osm_map').offset();
							$("#black_background").css({ "left": pos.left-15 + "px", "top":pos.top-10 + "px", "width":$('#osm_map').width() + 5 + "px", "height":$('#osm_map').height() + 5 + "px" }).show();
							
							for(index in filterEncoding.map.popups) {
								filterEncoding.map.removePopup(filterEncoding.map.popups[index]);
							}

						},
						afterReceive : function() {
							//$('#loading').hide(0);
							$("body").css("cursor", "auto")
							$.getScript(FeatureFilterBaseURL+'/js/Symbols.js', function(data, textStatus, jqxhr) {
								if(filterEncoding.imageHandler.setSymbolObject(new Symbols(FeatureFilterBaseURL))) {
									filterEncoding.refreshStyleMaps();
									filterEncoding.redrawLayers();
								}
							});
							$("#black_background").hide();
						},
						noFeature : function() {
							output = '<div class="ui-widget">';
							output += '<div class="ui-state-error ui-corner-all" style="padding: 0 .7em;">';
							output += '<p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>'
							output += 'Could not find any feature.'
							output += '</p>';
							output += '</div>';
							output += '</div>';
			
							$('#error_msg').html(output);
							$('#error_msg').show(0);
						},
						onError : function(request, errors) {
							row = '';
							for(var code in errors) {
								row += '<tr><td>' + code + ':</td><td>' + errors[code] + '</td></tr>';
							}
							
							output = '<div class="ui-widget">';
							output += '<div class="ui-state-error ui-corner-all" style="padding: 0 .7em;">';
							output += '<p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>';
							output += '<label class="errormsg">An error occured:</label><br/>';

							if(row.length > 0) {
								output += '<table><tbody>' + row + '</tbody></table>';
								output += '</p>';
								
							} else {
								output += 'Please try again later.';
							}
							output += '</div>';
							output += '</div>';
							$('#error_msg').html(output);
							$('#error_msg').show(0);
						}
						
						
					}),

					stylemap : new OpenLayers.StyleMap({
						backgroundXOffset : -2,
						backgroundYOffset : -20,
						graphicZIndex : 11,
						pointRadius : 10,
					}),

					projection : new OpenLayers.Projection("EPSG:4326")
					
				}
			),
			function(feature) {
				var filterValue = (object.CLASS_NAME == "OpenLayers.Filter.Comparison") ? "<br/>" + object.value : "";
				
				var name = (feature.attributes['name'] == 'None') ? "No name" + filterValue : feature.attributes['name'];
				var output = '<p style="white-space:nowrap;">';
				
				if(feature.attributes['url'] != 'None') {
					output += "<a href=\"";
					if(feature.attributes['url'].substring(0,7) != "http://") {
						output += "http://";
					}
					output += feature.attributes['url'] + "\" target=\"_blank\">" + name + "</a>";
				} else {
					if(feature.attributes['website'] != 'None') {
						output += "<a href=\"";
						if(feature.attributes['website'].substring(0,7) != "http://") {
							output += "http://";
						}
						output += feature.attributes['website'] + "\" target=\"_blank\">" + name + "</a>";
					} else {
						if(feature.attributes['contact_website'] != 'None') {
							output += "<a href=\"";
							if(feature.attributes['contact_website'].substring(0,7) != "http://") {
								output += "http://";
							}
							output += feature.attributes['contact_website'] + "\" target=\"_blank\">" + name + "</a>";
						} else {
							output += name;
						}
					}
				}

				if(feature.attributes['street'] != 'None' || feature.attributes['postcode'] != 'None' || feature.attributes['city'] != 'None') {
					output += "<br/>";
					if(feature.attributes['street'] != 'None') {
						output += feature.attributes['street'];
						if(feature.attributes['housenumber'] != 'None') {
							output += "&nbsp;" + feature.attributes['housenumber'];
						}
						if(feature.attributes['postcode'] != 'None' || feature.attributes['city'] != 'None') {
							output += "<br/>";
						}
					}
					if(feature.attributes['postcode'] != 'None') {
						output += feature.attributes['postcode'] + "&nbsp;";
					}
					if (feature.attributes['city'] != 'None') {
						output += feature.attributes['city'];
					}
				}
				
				if(feature.attributes['phone'] != 'None') {
					output += "<br/>" + feature.attributes['phone'];
				}
				
				if(feature.attributes['opening_hours'] != 'None') {
					output += "<br/>Opening hours:" + feature.attributes['opening_hours'];
				}
				
				output += '</p>';
				
				if(feature.attributes['wikipedia'] != 'None') {
					output += "<p style=\"white-space:nowrap;\"><a href=\"";
					if(feature.attributes['wikipedia'].substring(0,7) != "http://") {
						output += "http://";
					}
					output += feature.attributes['wikipedia'] + "\" target=\"_blank\">Wikipedia</a></p>";
				}
				if(feature.attributes['wikipedia_en'] != 'None') {
					output += "<p style=\"white-space:nowrap;\"><a href=\"http://en.wikipedia.org/wiki/" + feature.attributes['wikipedia_en'] + "\" target=\"_blank\">Wikipedia [en]</a></p>";
				}
				if(feature.attributes['wikipedia_de'] != 'None') {
					output += "<p style=\"white-space:nowrap;\"><a href=\"http://de.wikipedia.org/wiki/" + feature.attributes['wikipedia_de'] + "\" target=\"_blank\">Wikipedia [de]</a></p>";
				}

				return output + "</p>";
			},
			function(feature) {
				var regex = new RegExp(/\$\{([^}]+)\}/);
				var match = null;
				
				var html = "<p width=\"100%\" style=\"text-align:right;white-space:nowrap;\">";
				
				html += "<a onclick=\"javascript:filterEncoding.permalink('" + feature.layer.id + "', '" + feature.fid + "');\">Permalink</a>&nbsp;|&nbsp;";
				
				html += "<a href=\"http://www.openstreetmap.org/browse/";
				if(feature.attributes['gtype'] == "po") {
					html += "way/";
				} else {
					html += "node/";
				}
				html += "${feature.fid}\" target=\"_blank\">OSM</a>&nbsp;|&nbsp;<a onclick=\"javascript:filterEncoding.zoom(2);\">Zoom in</a></p>";
				
				while((match = regex.exec(html)) != null) {
					html = html.replace(match[0], eval(match[1]));
				}
				
				return html;
			},
			FeatureServerURL,
			FeatureServerLayer,
			"osm_id",
			"${feature.attributes.clusterlist}",
			"#",
			"<div><p style=\"white-space:no-wrap;\">${feature.attributes['name']}</p></div>",
			5,
			function(feature) {
				return "<p width=\"100%\" style=\"text-align:right;white-space:nowrap;\"><a onclick=\"javascript:filterEncoding.zoom(2);\">Zoom in</a></p>";
			},
			"${feature.attributes.clusteramount}"
		);
	},
	
	permalink : function(layerId, fid) {
		var feature = this.map.getLayer(layerId).getFeatureByFid(fid);
		var filter = Filter.prototype.getObjectIdentifier(fid)
		
		filter = filter.replace(new RegExp( "   ", "g" ), "").replace(new RegExp( "\\n", "g" ), "");
		
		var clone = feature.geometry.bounds.centerLonLat.clone().transform(this.map.projection, this.map.displayProjection);
		
		var url = basePath;
		
		Navigation.prototype.clear();
		
		url = Navigation.prototype.addParameter(url, "lon", clone.lon);
		url = Navigation.prototype.addParameter(url, "lat", clone.lat);
		url = Navigation.prototype.addParameter(url, "filter", filter);
		url = Navigation.prototype.addParameter(url, "zoom", this.map.getNumZoomLevels()-1);
		url = Navigation.prototype.addParameter(url, "func", "preview");
		
		Navigation.prototype.navigateTo(url);		
	},

	zoom : function(level) {
		if(this.map.zoom+level >= this.map.getNumZoomLevels()) {
			this.map.setCenter(this.map.popups[0].feature.geometry.bounds.centerLonLat, this.map.getNumZoomLevels()-1);
			return;
		}
		this.map.setCenter(this.map.popups[0].feature.geometry.bounds.centerLonLat, this.map.zoom+level);
	} 
});



(function( $ ) {
	$.widget( "ui.combobox", {
		_create: function() {
			var self = this,
				select = this.element.hide(),
				selected = select.children( ":selected" ),
				value = selected.val() ? selected.text() : "";
			var input = this.input = $( "<input>" )
				.insertAfter( select )
				.val( value )
				.autocomplete({
					delay: 0,
					minLength: 0,
					source: function( request, response ) {
						var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
						response( select.children( "option" ).map(function() {
							var text = $( this ).text();
							if ( this.value && ( !request.term || matcher.test(text) ) )
								return {
									label: text.replace(
										new RegExp(
											"(?![^&;]+;)(?!<[^<>]*)(" +
											$.ui.autocomplete.escapeRegex(request.term) +
											")(?![^<>]*>)(?![^&;]+;)", "gi"
										), "<strong>$1</strong>" ),
									value: text,
									option: this,
								};
						}) );
					},
					select: function( event, ui ) {
						ui.item.option.selected = true;
						self._trigger( "selected", event, {
							item: ui.item.option
						});
						
						examples.loadExample(ui.item.option.value);
					},
					change: function( event, ui ) {
						if ( !ui.item ) {
							var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
								valid = false;
							select.children( "option" ).each(function() {
								if ( $( this ).text().match( matcher ) ) {
									this.selected = valid = true;
									return false;
								}
							});
							if ( !valid ) {
								// remove invalid value, as it didn't match anything
								$( this ).val( "" );
								select.val( "" );
								input.data( "autocomplete" ).term = "";
								return false;
							}
						}
					}
				})
				.addClass( "ui-widget ui-widget-content ui-corner-left" );
	
			input.data( "autocomplete" )._renderItem = function( ul, item ) {
				return $( "<li></li>" )
					.data( "item.autocomplete", item )
					.append( "<a>" + item.label + "</a>" )
					.appendTo( ul );
			};
	
			this.button = $( "<button type='button'>&nbsp;</button>" )
				.attr( "tabIndex", -1 )
				.attr( "title", "Show All Items" )
				.insertAfter( input )
				.button({
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				})
				.removeClass( "ui-corner-all" )
				.addClass( "ui-corner-right ui-button-icon" )
				.click(function() {
					// close if already visible
					if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
						input.autocomplete( "close" );
						return;
					}
	
					// work around a bug (likely same cause as #5265)
					$( this ).blur();
	
					// pass empty string as value to search for, displaying all results
					input.autocomplete( "search", "" );
					input.focus();
				});
		},
	
		destroy: function() {
			this.input.remove();
			this.button.remove();
			this.element.show();
			$.Widget.prototype.destroy.call( this );
		}
	});
})( jQuery );
/**
 * Initialization
 */
$(function() {
	examples = new Examples();
	
	/**
	 * UI autocomplete handling
	 * Needed for examples dropdown
	 */
	$.widget( "custom.catcomplete", $.ui.autocomplete, {
		_renderMenu: function(ul, items) {
			var self = this;
			ul.append("<li class='ui-autocomplete-category'>Locations</li>");
			$.each( items, function( index, item ) {
				self._renderItem( ul, item );
			});
		},
		
		_renderItem: function(ul, item) {
			return $( "<li></li>" )
				.data( "item.autocomplete", item )
				.append( "<a><img src=\"" + basePath + "/img/zoom_in.png\" />&nbsp;" + item.value + "</a>" )
				.appendTo( ul );
		}
	});
	$('#sLocation').autocomplete({
		position : {my: "left top", at: "left bottom", collision: "none" },
		minLength : 2,
		source :  function(request, response) {
			//http://open.mapquestapi.com/nominatim/v1/search?format=json&callback=renderBasicSearchNarrative&q=zurich
			//http://nominatim.openstreetmap.org/search
			var result = [];
			$.ajax({
				url : 'http://open.mapquestapi.com/nominatim/v1/search',
				dataType : 'json',
				jsonp : "json_callback",
				data : {
					format : 'json',
					limit : 10,
					q : request.term,
					//json_callback : "nominatim_callback"
				},
				success : function(data) {
					$.merge(result, $.map(data, function(item) {
						for(var index in item) {
							return {
								label : item["display_name"],
								key : item["place_id"],
								value : item["display_name"],
								boundingbox : item["boundingbox"],
								lat : item["lat"],
								lon : item["lon"],
							}
						}
					}));
					response(result);
				},
				error : function(jqXHR, textStatus, errorThrown) {
					//alert(textStatus);
				} 
			});
		},
		select: function(event, ui){
			filterEncoding.map.setCenter(new OpenLayers.LonLat(parseFloat(ui.item.lon), parseFloat(ui.item.lat)).transform(new OpenLayers.Projection("EPSG:4326"), filterEncoding.map.getProjectionObject()), 14);
		},
	});
	$("#exampleList").combobox();
	
	
	/**
	 * Global UI handling
	 */
	$('#error_msg').hide(0);
	$(window).resize(function() {
		$('#osm_map').height($(window).height()-$('#header').height()-106);
		
		var pos = $('#osm_map').offset();
		$("#black_background").css({ "left": pos.left-15 + "px", "top":pos.top-10 + "px", "width":$('#osm_map').width() + 5 + "px", "height":$('#osm_map').height() + 5 + "px" });
		$("#sidebar_close").css({ "left": pos.left-13 + "px", "top":pos.top-8 + "px"});
		$('#sidebar').height($('#osm_map').height());
		$("#sLocation").width($("#sidebar").width() - 40);
	});
	$('#osm_map').height($(window).height()-$('#header').height()-106);
	$('#sidebar').height($('#osm_map').height());
	
	var pos = $('#osm_map').offset();
	$("#sidebar_close").css({ "left": pos.left-13 + "px", "top":pos.top-8 + "px" });
	$("#sLocation").width($("#sidebar").width() - 40);
	
	if(dbOnline) { $('button').button(); } else { $('button').button('disable'); }
	
	$("#sidebar_close").bind('click', function() {
		$(".ui-resizable-e").dblclick();
	});

	$("#sidebar").resizable({
		autoHide : true,
		ghost : true,
		handles : 'e',
		//helper: 'ui-state-highlight'
		minWidth: 100,
		maxWidth: $('#content').width(),
		stop: function (event, ui) {
			ui.element.css({ height: '100%' });
			
			$('#osm_map').height($(window).height()-$('#header').height()-106);
			var pos = $('#osm_map').offset();
			$("#sidebar_close").css({ "left": pos.left-13 + "px", "top":pos.top-8 + "px"});
		},
	});
	
	$(".ui-resizable-e").dblclick(function() {
		$("#sidebar_close").hide();

		$('#sidebar').hide('slow', function() {
			$('#content').append('<a id="sidebarOpen"><div class="sidebarIcon" style="position:relative;top:23px;left:1px;z-index:2000;"><img src="'+
					basePath+'/img/arrow_right.png'
					+'" style="position:absolute;top:2px;left:7px;"></div></a>')
			$('section.right').css({'padding-left':'0px'});

			$("#sidebarOpen").bind('click', function() {
				$('#sidebarOpen').remove();
				$('#sidebar').show();
				$('section.right').css({'padding-left':'10px'});
				
				var pos = $('#osm_map').offset();
				$("#sidebar_close").css({ "left": pos.left-13 + "px", "top":pos.top-8 + "px"});
				$("#sidebar_close").show();
			});
		});
	});
	
	/*
	$('#osm_map').bind('contextmenu', function(event) {
		var $cmenu = $('#context_map');
		$('<div class="overlay"></div>').css({left : '0px', top : '0px',position: 'absolute', width: '100%', height: '100%', zIndex: '999999998' }).click(function() {
			$(this).remove();
			$cmenu.hide();
		}).bind('contextmenu' , function(){return false;}).appendTo(document.body);
		$('#context_map').css({ left: event.pageX, top: event.pageY, zIndex: '999999999' }).show();
		return false;
	});
	
	 $('.context_menu .first_li').live('click',function() {
			if( $(this).children().size() == 1 ) {
				alert($(this).children().text());
				$('.context_menu').hide();
				$('.overlay').hide();
			}
		 });

		 $('.context_menu .inner_li span').live('click',function() {
				alert($(this).text());
				$('.context_menu').hide();
				$('.overlay').hide();
		 });
	
	$(".first_li , .sec_li, .inner_li span").hover(function () {
		$(this).css({backgroundColor : '#E0EDFE' , cursor : 'pointer'});
		if ( $(this).children().size() >0 )
				$(this).find('.inner_li').show();	
				$(this).css({cursor : 'default'});
		}, 
		function () {
			$(this).css('background-color' , '#fff' );
			$(this).find('.inner_li').hide();
		});
	*/
	
	/**
	 * Button handling
	 */
	$('#preview').bind('click', function() {
		$('#error_msg').hide(0);
		
		var mapSize = $('#osm_map').width() + ',' + $('#osm_map').height();
		var filter = editor.getFormatedValue();
		
		var url = FeatureFilterURL + "?server="+FeatureFilterServer+"&size=" + mapSize + "&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=" + FeatureFilterLayer;
		
		var parser = new OpenLayers.Format.Filter.v1_1_0();
		var xml = new OpenLayers.Format.XML();
		var object = parser.read(xml.read(filter).documentElement);
		
		if(typeof(object) == 'object') {
			filterEncoding.load('preview', "Preview", url, object);
			filterEncoding.map.getControlsByClass('OpenLayers.Control.Permalink')[0].element.href = Navigation.prototype.updateParameter(filterEncoding.map.getControlsByClass('OpenLayers.Control.Permalink')[0].element.href, "filter", editor.getFormatedValue());
		} else {
			var output = '<div class="ui-widget">';
			output += '<div class="ui-state-error ui-corner-all" style="padding: 0 .7em;">';
			output += '<p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>';
			output += '<label class="errormsg">Your query is not valid. Please correct it.</label>';
			output += '</div>';
			output += '</div>';
			
			$('#error_msg').html(output);
			$('#error_msg').show(0);
		}
	});
	
	$('#clear').bind('click', function() {
		editor.setValue("");
		filterEncoding.removeAllLayers();
		$('#error_msg').hide(0);
		$("#black_background").hide();
	});
	
	$('#bGeoLocate').bind('click', function() {
		var geolocation = new GeoLocation({
			onSuccess : function() {
				filterEncoding.map.setCenter(new OpenLayers.LonLat(parseFloat(this.longitude), parseFloat(this.latitude)).transform(new OpenLayers.Projection("EPSG:4326"), filterEncoding.map.getProjectionObject()), 14);
			},
			onNotSupported : function() {
				$('#bGeoLocate').hide(0);
			},
			onUnkownError : function() {
				$('#bGeoLocate').hide(0);
			}
		});
		geolocation.locate();
	});
	$('#bGeoLocate').hover(
		function() {
			var tooltipDiv = document.createElement('div');
			
			var style = document.createAttribute('style');
			style.nodeValue = 'z-index: 100000;position:absolute;left:'+(mouseX+10)+'px;top:'+(mouseY+10)+'px;background-color:#FFFFCC;border:1px solid #BBBBBB;padding:1px;';
			tooltipDiv.setAttributeNode(style);
			
			var id = document.createAttribute('id');
			id.nodeValue = "bGeoLocateTooltip";
			tooltipDiv.setAttributeNode(id);
			
			tooltipDiv.innerHTML = "<p>Use current location</p>";
			
			document.body.appendChild(tooltipDiv);
		},
		function() {
			var tooltipDiv = document.getElementById("bGeoLocateTooltip");
			document.body.removeChild(tooltipDiv);
		}
	);
	
	
	/**
	 * Map and Layer creation
	 */
	var imgHandler = new ImageHandler();
	imgHandler.setSymbolObject(new Symbols(FeatureFilterBaseURL));
	
	var map = new OpenLayers.Map("osm_map", {
		controls: [
			new OpenLayers.Control.Navigation({handleRightClicks:false}),
			new OpenLayers.Control.PanZoomBar({zoomWorldIcon:true, zoomStart:8,forceFixedZoomLevel:true}),
			new OpenLayers.Control.LayerSwitcher(),
			new OpenLayers.Control.Permalink(), //{anchor: true}
			new OpenLayers.Control.ScaleLine(),
			new OpenLayers.Control.Scale(),
			new OpenLayers.Control.MousePosition(),
			new OpenLayers.Control.OverviewMap()
		],
		units : 'm',
		maxExtent: new OpenLayers.Bounds(662963,5751192,1168000,6075059),
		restrictedExtent: new OpenLayers.Bounds(662963,5751192,1168000,6075059),
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
	});
	map.addLayer(new OpenLayers.Layer.OSM("OpenStreetMap"));

	filterEncoding = new FeatureFilter(map, imgHandler);
	
	if(lon && lat && zoom) {
		var center = new OpenLayers.LonLat(parseFloat(lon), parseFloat(lat)).transform(filterEncoding.map.displayProjection, filterEncoding.map.getProjectionObject())
	    filterEncoding.map.setCenter(center, zoom);
	} else {
		filterEncoding.map.zoomToMaxExtent(new OpenLayers.Bounds(662963,5751192,1168000,6075059), true);
	}

	
	/**
	 * FeatureFilter Editor handling
	 */
	editor = CodeMirror.fromTextArea(document.getElementById("filter"), {
		mode: {name: "xml", htmlMode: true}
	});
	editor = Class.Util.extend(editor, Editor.prototype);
	editor.setValue(beautifyXml(editor.getFormatedValue()));
	
	
	/**
	 * Navigation handling
	 */
	Navigation.prototype.register('filter', editor, 'getFormatedValue');
	Navigation.prototype.registerCallback('zoom', function() {
		return filterEncoding.map.zoom;
	});
	Navigation.prototype.registerCallback('lat', function() {
		var clone = filterEncoding.map.center.clone().transform(filterEncoding.map.projection, filterEncoding.map.displayProjection);
		return clone.lat;
	});
	Navigation.prototype.registerCallback('lon', function() {
		var clone = filterEncoding.map.center.clone().transform(filterEncoding.map.projection, filterEncoding.map.displayProjection);
		return clone.lon;
	});
	
});

