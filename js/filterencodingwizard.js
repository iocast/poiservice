function QueryBuilder() {
	this.comparisonOperators = new Array();
	this.logicalOperators = new Array();
	this.selectedInputField = null;
	
	this.addRow = function(obj) {
		table = $(obj).parent().parent().parent().parent();
		index = $(table).children().last().children().length;
		
		tbody = $(table).children('tbody');
		for(var r = 0; r < $(tbody).children().length; r++) {
			tr = $(tbody).children().get(r);
			for(var d = 0; d < $(tr).children('td').length; d ++) {
				td = $(tr).children('td').get(d)
				if($(td).children('table').length > 0) {
					std = $(td).children('table').children('tbody').children('tr').children('td');
					for(b = 0; b < $(std).children('input').length; b++) {
						if($($(std).children('input').get(b)).val().length == 0) {
							return;
						}
					}
				}
				
				for(i = 0; i < $(td).children('input').length; i++) {
					if($($(td).children('input').get(i)).val().length == 0) {
						return;
					}
				}
			}
		}
		
		if(index == 1 && $(table).parent().children().length <= 3) {
			$('#operatorGroupTmpl').tmpl().insertAfter($(table).parent().children().first());
		}

		if(index == 0) {
			$('#subgroupTmpl').tmpl().insertAfter($(table).parent().children().last());
			$('button').button();
		}
		
		$('#rowTmpl').tmpl().appendTo($(table).children().last());
		inputs = $(table).children().last().children().last().find('input');
		for(var i = 0; i < $(inputs).length; i++) {
			$($(inputs).get(i)).autocomplete({
				minLength : 2,
				source : function(request, response) {
					$.ajax({
						url : basePath + '/tagfinder/api/search',
						dataType : 'jsonp',
						data : {
							q : request.term
						},
						success : function(data) {
							response($.map(data.data, function(item) {
								for(var index in item) {
									if($(QueryBuilder.selectedInputField).attr('data-id') == 'key') {
										return {
											label : index + " -> " + item[index],
											value : index,
											key : item[index]
										}
									} else {
										return {
											label : index + " -> " + item[index],
											value : item[index],
											key : index
										}
									}
								}
							}));
						},
						error : function(jqXHR, textStatus, errorThrown) {
							alert(textStatus);
						} 
					});
				},
				select : function(event, ui) {
					if($(this).attr('data-id') == 'key') {
						$(this).parent().next().next().children('input').val(ui.item.key);
					} else {
						$(this).parent().prev().prev().children('input').val(ui.item.key);
					}
				}
			});
		}
	};
	
	this.removeRow = function(obj) {
		table = $(obj).parent().parent().parent().parent();
		index = $(table).children().last().children().length;
		
		$(obj).parent().parent().remove();
		
		if(index < 2) {
			$(table).parent().children().last().remove();
		} else if(index == 2) {
			$(table).parent().children().first().next().remove();
		}
	};
	
	this.checkInput = function(obj) {
		QueryBuilder.selectedInputField = obj;
	};
	
	this.addGroup = function() {
		if($('#filter_set').children('fieldset').length == 1) {
			$('#operatorGroupTmpl').tmpl().insertBefore($('#filter_set').children().first());
		}
		script = [{'script':'javascript:queryBuilder.addRow(this);'}]
		$('#groupTmpl').tmpl(script).insertBefore($('#filter_set').children().last());
	};
	
	this.addSubgroup = function(obj) {
		if($(obj).parent().parent().children().length <= 3) {
			$('#operatorGroupTmpl').tmpl().insertAfter($(obj).parent().parent().children().first());
		}
		script = [{'script':'javascript:queryBuilder.addRow(this);'}]
		$('#groupTmpl').tmpl(script).insertBefore($(obj).parent());
	};
	
	this.removeSubgroup = function(obj) {
		switch($(obj).parent().parent().parent().find('fieldset').length) {
			case 1:
				if($(obj).parent().parent().parent().children().length > 2) {
					$($(obj).parent().parent().parent().children().get(1)).remove();
				}
				break;
			case 2:
				$($(obj).parent().parent().parent().children().get(0)).remove();
				break
		}

		$(obj).parent().parent().remove();
	};
	
	this.operatorChanged = function(obj) {
		html = '';
		tr = $(obj).parent().parent();
		$(tr).children().last().prev().empty();
		
		if($(obj).val() == 'PropertyIsBetween' || $(obj).val() == 'PropertyIsLike' || $(obj).val() == 'PropertyIsNull') {
			
			if($(obj).val() == 'PropertyIsBetween') {
				$('#betweenTmpl').tmpl().appendTo($(tr).children().last().prev());
				return;
			}
			
			if($(obj).val() == 'PropertyIsLike') {
				$('#likeTmpl').tmpl().appendTo($(tr).children().last().prev());
				return;
			}
			
			if($(obj).val() == 'PropertyIsNull') {
				return;
			}
		}
		
		$('#cellTmpl').tmpl().appendTo($(tr).children().last().prev());
	};
	
	this.parse = function() {
		xml = '<Filter>';
		xml += this.getGroupValue('', $('#filter_set'))
		xml += '</Filter>'
		
		editor.setValue(beautifyXml(xml));
	};
	
	this.getGroupValue = function(xml, node) {
		
		output = ''
		
		for(var i = 0; i < $(node).children('table').children('tbody').children().length; i++) {
			dropdown = $(node).children('table').children('tbody').children()[i].children[1].children[0];
			
			xmlTmpl = this.comparisonOperators[$(dropdown).attr('selectedIndex')]['xml'];
			xmlTmpl = xmlTmpl.replace('${value}', $(node).children('table').children('tbody').children()[i].children[0].children[0].value);
			output += xmlTmpl.replace('${literal}', $(node).children('table').children('tbody').children()[i].children[2].children[0].value);
		}
		
		
		if($($(node).children('fieldset')).length > 0) {
			for(var i = 0; i < $($(node).children('fieldset')).length; i++) {
				output += this.getGroupValue('', $(node).children('fieldset')[i]);
			}
		}

		
		if($(node).children('span').children('select').length > 0) {
			tmpl = this.logicalOperators[$(node).children('span').children('select').attr('selectedIndex')]['xml'];
			output = tmpl.replace('${statement}', output);
		}
		
		xml += output;
		
		return xml;
	};
	
	this.setDyn = function(key, value) {
		cmd = 'this.' + key + ' = ' + '(' + value + ')' + ';';
		eval(cmd);
	};
	
	this.clear = function() {
		$('#filter_set>fieldset').remove()
		$('#filter_set>span').remove();
	};
	
	this.parseToUI = function() {
		var xmlDoc = null;
		if(window.DOMParser) {
			xmlDoc = new DOMParser().parseFromString(beautifyXml(editor.getValue()), 'text/xml');
		} else {
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = 'false';
			xmlDoc.loadXML(beautifyXml(editor.getValue()));
		}
		
		this.addGroup();
		var fieldset = $('#filter_set').children('fieldset').first();
		var node = xmlDoc.firstChild.childNodes[1];
		
		if(!this.isLogicalOperator(node.nodeName)) {
			node = xmlDoc.firstChild;
		}
		
		this.parseNode(node, fieldset);
	};
	
	this.parseNode = function(node, fieldset) {
		var a = fieldset.find('a');
		var operator = false;
		
		for(var i = 0; i < node.childNodes.length; i++) {
			if(node.childNodes[i].nodeName != '#text') {
				if(!this.isLogicalOperator(node.childNodes[i].nodeName)) {
					this.addRow(a);
					$(fieldset).find('tbody').first().children().last().find("select option[value='"+node.childNodes[i].nodeName+"']").attr('selected', true);
					var inputs = $(fieldset).find('tbody').first().children().last().find('input');
					$($(inputs).get(0)).val(node.childNodes[i].getElementsByTagName('PropertyName')[0].firstChild.nodeValue);
					$($(inputs).get(1)).val(node.childNodes[i].getElementsByTagName('Literal')[0].firstChild.nodeValue);
				} else {
					this.addSubgroup(fieldset.find('button').first());
					$(fieldset).find("select option[value='"+node.parentNode.childNodes[1].nodeName+"']").attr('selected', true);
					operator = true;
					this.parseNode(node.childNodes[i], fieldset.find('fieldset').first());
				}
			}
		}

		if(!operator) {
			$(fieldset).find("select option[value='"+node.parentNode.childNodes[1].nodeName+"']").attr('selected', true);
		}
	};
	
	this.isLogicalOperator = function(value) {
		for(var index in this.logicalOperators) {
			if(this.logicalOperators[index].value == value) {
				return true;
			}
		}
		return false;
	};
	
}

