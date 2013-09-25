define(['backbone'], function(Backbone) {

	function baucisFetch(options, fetchOptions) {
		fetchOptions = _.clone(fetchOptions || {});
		fetchOptions.data = {};

		if (options) {
			Object.keys(options).forEach(function(key) {
				var value = options[key];
				if (typeof value === 'object') fetchOptions.data[key] = JSON.stringify(value);
				else fetchOptions.data[key] = value;
			});
		}

		return this.fetch(fetchOptions);
	};

	var baucisCollection = Backbone.Collection.extend({
		baucis: baucisFetch
	});

	var baucisModel = Backbone.Model.extend({
		baucis: baucisFetch,
		
		idAttribute: "_id"
	});

	return {
		Collection: baucisCollection,
		Model: baucisModel
	};

});