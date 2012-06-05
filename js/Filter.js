
var Filter = Class.extend({
	propertyName : '',
	literal : '',
	getStandardFilter : function() {
		if(this.propertyName.length <= 0) return '';
		return '<Filter>\n' +
				'  <PropertyIsEqualTo>\n' +
				'    <PropertyName>' + this.propertyName + '</PropertyName>\n' +
				'    <Literal>' + this.literal + '</Literal>\n' +
				'  </PropertyIsEqualTo>\n' +
				'</Filter>';
	},
	getObjectIdentifier : function(id) {
		return '<Filter><FeatureId fid="' + id + '"/></Filter>';
	},
	setPropertyName : function(propertyName) {
		this.propertyName = propertyName;
	},
	setLiteral : function(literal) {
		this.literal = literal;
	}
});
