var queryMap = null;

QueryBuilderMap = MapHander.extend({
	
	examples : {
		'bus_stops_vbz' :	{
			'name' : 'All Bus Stops (VBZ)',
			'filter' :	'<Filter>\n' +
							'   <And>\n' +
							'      <PropertyIsEqualTo>\n'+
								'         <PropertyName>highway</PropertyName>\n' +
								'         <Literal>bus_stop</Literal>\n' +
							'      </PropertyIsEqualTo>\n' +
							'      <PropertyIsEqualTo>\n' +
								'         <PropertyName>operator</PropertyName>\n' +
								'         <Literal>VBZ</Literal>\n' +
							'      </PropertyIsEqualTo>\n' +
							'   </And>\n' +
						'</Filter>'
		},
		'banks_not_ubs' : {
			'name' : 'All Banks except UBS',
			'filter' :	'<Filter>\n' +
						'   <And>\n' +
							'      <PropertyIsEqualTo>\n' +
								'         <PropertyName>amenity</PropertyName>\n' +
								'         <Literal>bank</Literal>\n' +
							'      </PropertyIsEqualTo>\n' +
							'      <PropertyIsNotEqualTo>\n' +
								'         <PropertyName>operator</PropertyName>\n' +
								'         <Literal>UBS</Literal>\n' +
							'      </PropertyIsNotEqualTo>\n' +
							'   </And>\n' +
						'</Filter>'
		},
		'between' : {
			'name' : 'IDs Between 1 and 500000',
			'filter' : '<Filter>\n' +
							'   <PropertyIsBetween>\n' +
								'      <PropertyName>osm_id</PropertyName>\n' +
								'      <LowerBoundary>\n' +
									'         <Literal>1</Literal>\n' +
								'      </LowerBoundary>\n' +
								'      <UpperBoundary>\n' +
									'         <Literal>500000</Literal>\n' +
								'      </UpperBoundary>\n' +
							'   </PropertyIsBetween>\n' +
						'</Filter>'
		},
		'like' : {
			'name' : 'like',
			'filter' :	'<Filter>\n' +
							'   <And>\n' +
							'      <PropertyIsLike wildCard="*" singleChar="?" escapeChar="!">\n' +
								'         <PropertyName>highway</PropertyName>\n' +
								'         <Literal>b?s_sto*</Literal>\n' +
							'      </PropertyIsLike>\n' +
							'      <PropertyIsEqualTo>\n' +
								'         <PropertyName>operator</PropertyName>\n' +
								'         <Literal>BVB</Literal>\n' +
							'      </PropertyIsEqualTo>\n' +
							'   </And>\n' +
						'</Filter>'
		}
		
	},
	
	queryExample : function(id) {
		//var url = Navigation.prototype.addParameter(basePath + '/download/', 'func', 'preview');
		var url = basePath + '/download';
		url = Navigation.prototype.addParameter(url, 'filter', this.examples[id]['filter'].replace(new RegExp( "   ", "g" ), "").replace(new RegExp( "\\n", "g" ), ""));
		Navigation.prototype.navigateTo(url);
		
		/*
		layer = this.processQuery(this.examples[id]['name'], this.examples[id]['filter'], '', null, null,
				function() {
					//$('#loading').show(0);
					$("body").css("cursor", "progress");
				},
				function() {
					//$('#loading').hide(0);
					$("body").css("cursor", "auto")
				});
		this.addLayer(this.examples[id]['name'], layer);
		
		//$('#filter').val(this.examples[id]['filter']);
		editor.setValue(beautifyXml(this.examples[id]['filter']));
		editor.refresh();
		queryBuilder.parseToUI();
		*/
	}
	
});

$(function() {
	$('button').button();
	
	$("#sidebar").resizable({
		autoHide : true,
		ghost : true,
		handles : 'w',
		minWidth: 100,
		maxWidth: $('#content').width(),
	});
	
	$(window).resize(function() {
		$('#sidebar').resizable('option', 'maxWidth', $('#content').width());
		
		$('#builder').css({"overflow-y":"auto"});
		$('#builder').height($(window).height()-$('#header').height()-$('#footer').height());		
		$('#sidebar').height($('#builder').height());
	});
	
	$('#builder').height($(window).height()-$('#header').height()-$('#footer').height());
	$('#builder').css({"overflow-y":"auto"});
	$('#sidebar').height($('#builder').height());
	
	
	$(".ui-resizable-w").dblclick(function() {
		$('#sidebar').hide('slow', function() {
			$('#content').append('<a id="sidebarOpen"><div class="sidebarIcon" style="position:relative;top:30px;left:'+($('#content').width()-31)+'px;z-index:2000;"><img src="'+
					basePath+'/img/arrow_left.png'
					+'" style="position:absolute;top:2px;left:7px;"></div></a>')
			$('section.left').css({'padding-right':'0px'});

			$("#sidebarOpen").bind('click', function() {
				$('#sidebarOpen').remove();
				$('#sidebar').show();
				$('section.left').css({'padding-right':'20px'});
			});

		});
	});

	$('#bShow').bind('click', function() {
		$('#error_msg').hide(0);
		
		//Navigation.prototype.navigateTo(Navigation.prototype.addParameter(basePath, 'func', 'preview'));
		Navigation.prototype.navigateTo(basePath + "/");
	});
	
	$('#bDownload').bind('click', function() {
		$('#error_msg').hide(0);
		
		Navigation.prototype.navigateTo(basePath + "/download");
		
		/*
		layer = queryMap.processQuery('Serach', editor.getValue(), '', function(errors) {
			row = '';
			for(var code in errors) {
				row += '<tr><td>' + code + ':</td><td>' + errors[code] + '</td></tr>';
			}
			
			
			if(row.length > 0) {
				output = '<div class="ui-widget">';
				output += '<div class="ui-state-error ui-corner-all" style="padding: 0 .7em;">';
				output += '<p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>'
				output += '<label class="errormsg">An error occured:</label><br/>'
				output += '<table><tbody>' + row + '</tbody></table>';
				output += '</p>';
				output += '</div>';
				output += '</div>';
				
				$('#error_msg').html(output);
				$('#error_msg').show(0);
			}
		}, function() {
			output = '<div class="ui-widget">';
			output += '<div class="ui-state-error ui-corner-all" style="padding: 0 .7em;">';
			output += '<p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>'
			output += 'Could not find any feature.'
			output += '</p>';
			output += '</div>';
			output += '</div>';

			$('#error_msg').html(output);
			$('#error_msg').show(0);
		}, function() {
			//$('#loading').show(0);
			$("body").css("cursor", "progress");
		}, function() { 
			//$('#loading').hide(0);
			$("body").css("cursor", "auto")
		});
		queryMap.addLayer('Serach', layer);
		*/
	});
	
	$('#error_msg').hide(0);
	
	queryMap = new QueryBuilderMap();
	queryMap.createMap();
	queryMap.addMapnik("OpenStreetMap");
	
	if(lon && lat && zoom) {
		var center = new OpenLayers.LonLat(parseFloat(lon), parseFloat(lat)).transform(queryMap.map.displayProjection, queryMap.map.getProjectionObject())
	    queryMap.map.setCenter(center, zoom);
	} else {
		queryMap.map.zoomToMaxExtent();
	}
	
	editor.setValue(beautifyXml(editor.getFormatedValue()));
	
	Navigation.prototype.registerCallback('zoom', function() {
		return queryMap.map.zoom;
	});
	Navigation.prototype.registerCallback('lat', function() {
		var clone = queryMap.map.center.clone().transform(queryMap.map.projection, queryMap.map.displayProjection);
		return clone.lat;
	});
	Navigation.prototype.registerCallback('lon', function() {
		var clone = queryMap.map.center.clone().transform(queryMap.map.projection, queryMap.map.displayProjection);
		return clone.lon;
	});

});



