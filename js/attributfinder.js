function AttributeFinder() {
	this.baseURL = basePath + '/tagfinder/search';
	this.searchString = "";
	
	this.request = function(callback) {
		this.searchString = $('#search_string').val();
		window.location = this.baseURL + '?q=' + this.searchString;
	};
	
}

var attributeFinder = new AttributeFinder();

