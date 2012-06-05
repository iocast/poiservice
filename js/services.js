var editor = null;

$(function() {
	$('button').button();
	
	$(window).resize(function() {
		$('section>div').css({"overflow-y":"auto"});
		$('section>div').height($(window).height()-$('#header').height()-$('#footer').height()-106);
		$('aside').height($('section>div').height());
	});
	
	$('section>div').css({"overflow-y":"auto"});
	$('section>div').height($(window).height()-$('#header').height()-$('#footer').height()-106);
	$('aside').height($('section>div').height());
	
	editor = CodeMirror.fromTextArea(document.getElementById("filter"), {
		mode: {name: "xml", htmlMode: true},
		onChange: function() {
			if(editor == null) {
				$("#bWorkspace").attr("disabled", "true");
			} else {
				if(editor.getFormatedValue().length == 0) {
					$("#bWorkspace").attr("disabled", "true");
				} else {
					$("#bWorkspace").removeAttr("disabled");
				}
			}
		}
	});
	editor = Class.Util.extend(editor, Editor.prototype);
	editor.setValue(beautifyXml(editor.getFormatedValue()));
	
	Navigation.prototype.register('filter', editor, 'getFormatedValue');
	Navigation.prototype.registerCallback('zoom', function() {
		return zoom;
	});
	Navigation.prototype.registerCallback('lat', function() {
		return lat;
	});
	Navigation.prototype.registerCallback('lon', function() {
		return lon;
	});


	
	$("aside>p").click(function () {
		$("section>div>div").hide("fade", {}, 1000);
		$('#'+$(this).attr('data-id')).delay(1000).show("fade", function() {
		
			if($(this).attr('id') == "workspace") {
				editor.refresh();				
			}
		
		}, 1000);
	});
	
	$('#bWorkspace').bind('click', function() {
		$('#message').empty();
		
		$.ajax({
			type : "GET",
			dataType : "jsonp",
			url : FeatureServerWorkspaceURL,
			data : {
				'base' : FeatureServerLayer,
				'request' : editor.getFormatedValue(),
				'id' : $('#cid').val()
			},
			success : function(data, textStatus, jqXHR) {
				var info = {
					'key' : data['key'],
					'url' : FeatureServerWorkspaceURL + '?key=' + data['key']
				};
				$('#message').html($('#workspaceSuccessTmpl').tmpl(info));
			},
			error : function(jqXHR, textStatus, errorThrown) {
				$('#message').html('<div class="error">An error occured. Please try again later.</div>');
			}
		});
	});
	
	$('#bCheck').bind('click', function() {
		$('#availability').empty();
		
		params = {};
		if($('#skey').val().length > 0) {
			params['skey'] = $('#skey').val();
		} else if($('#sid').val().length > 0) {
			params['sid'] = $('#sid').val();
		}
		
		$.ajax({
			type : "GET",
			dataType : "jsonp",
			url : FeatureServerWorkspaceURL,
			data : params,
			success : function(data, textStatus, jqXHR) {
				var workspaces = data.workspaces;
				for(var i = 0; i < workspaces.length; i++) {
					workspaces[i].url = FeatureServerWorkspaceURL + '?key=' + workspaces[i].Workspace
				}
				$('#availability').html($('#availabilityTmpl').tmpl(workspaces));
			},
			error : function(jqXHR, textStatus, errorThrown) {
				$('#availability').html('<div class="error">An error occured. Please try again later.</div>');
			}
		});
	});

});
