/**
 * Class for examples
 */

var Examples = Class.extend({
	examples : {
		1 : {
			id : "bus_stations",
			name : "Bus stations",
			filter : '<Filter>' +
							'<And>' +
								'<PropertyIsEqualTo>' +
									'<PropertyName>highway</PropertyName>' +
									'<Literal>bus_stop</Literal>' +
								'</PropertyIsEqualTo>' +
								'<PropertyIsEqualTo>' +
									'<PropertyName>operator</PropertyName>' +
									'<Literal>VBZ</Literal>' +
								'</PropertyIsEqualTo>' +
							'</And>' +
						'</Filter>'
		},
		2 : {
			id : "hospitals",
			name : "Hospitals",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>amenity</PropertyName>' +
								'<Literal>hospital</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		3 : {
			id : "memorials",
			name : "Memorials",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>historic</PropertyName>' +
								'<Literal>memorial</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		401 : {
			id : "camp_site",
			name : "Camping Sites",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>tourism</PropertyName>' +
								'<Literal>camp_site</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		402 : {
			id : "hotel",
			name : "Hotels",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>tourism</PropertyName>' +
								'<Literal>hotel</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		403 : {
			id : "hostel",
			name : "Hostels",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>tourism</PropertyName>' +
								'<Literal>hostel</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		404 : {
			id : "guest_house",
			name : "Guest Houses",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>tourism</PropertyName>' +
								'<Literal>guest_house</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		405 : {
			id : "chalet",
			name : "Chalet",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>tourism</PropertyName>' +
								'<Literal>chalet</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		406 : {
			id : "motel",
			name : "Motel",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>tourism</PropertyName>' +
								'<Literal>motel</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		407 : {
			id : "caravan_site",
			name : "Caravan Site",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>tourism</PropertyName>' +
								'<Literal>caravan_site</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		501 : {
			id : "mountain_4000",
			name : "Mountain higher than 4000",
			filter : '<Filter>' +
							'<And>' +
								'<PropertyIsEqualTo>' +
									'<PropertyName>natural</PropertyName>' +
									'<Literal>peak</Literal>' +
								'</PropertyIsEqualTo>' +
								'<PropertyIsGreaterThan>' +
									'<PropertyName>ele</PropertyName>' +
									'<Literal>4000</Literal>' +
								'</PropertyIsGreaterThan>' +
							'</And>' +
						'</Filter>'
		},
		601 : {
			id : "supermarket",
			name : "Supermarkets",
			filter : '<Filter>' +
							'<Or>' +
								'<PropertyIsEqualTo>' +
									'<PropertyName>shop</PropertyName>' +
									'<Literal>supermarket</Literal>' +
								'</PropertyIsEqualTo>' +
								'<PropertyIsEqualTo>' +
									'<PropertyName>shop</PropertyName>' +
									'<Literal>convenience</Literal>' +
								'</PropertyIsEqualTo>' +
							'</Or>' +
						'</Filter>'
		},
		602 : {
			id : "restaurants",
			name : "Restaurants",
			filter : '<Filter>' +
							'<PropertyIsEqualTo>' +
								'<PropertyName>amenity</PropertyName>' +
								'<Literal>restaurant</Literal>' +
							'</PropertyIsEqualTo>' +
						'</Filter>'
		},
		603 : {
			id : "bar_pub",
			name : "Bars and Pubs",
			filter : '<Filter>' +
							'<Or>' +
								'<PropertyIsEqualTo>' +
									'<PropertyName>amenity</PropertyName>' +
									'<Literal>bar</Literal>' +
								'</PropertyIsEqualTo>' +
								'<PropertyIsEqualTo>' +
									'<PropertyName>amenity</PropertyName>' +
									'<Literal>pub</Literal>' +
								'</PropertyIsEqualTo>' +
							'</Or>' +
						'</Filter>'
		},
	}
});


