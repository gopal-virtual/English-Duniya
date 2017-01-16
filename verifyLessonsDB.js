var request = require('sync-request');
var server = 'http://ci-couch.zaya.in/lessonsdb/';
var q_server = 'http://ci-couch.zaya.in/diagnosis_translations/';
var localized_mapping = JSON.parse(request('GET', server + 'localized_mapping').getBody()).mapping;
count = 0;
// console.log(localized_mapping.length)
for (var i in localized_mapping) {
	if (localized_mapping.hasOwnProperty(i)) {
		for (var j in localized_mapping[i]) {
			if (localized_mapping[i].hasOwnProperty(j)) {
				try {
					var lesson = JSON.parse(request('GET', server + localized_mapping[i][j]).getBody());
				} catch (e) {
					try {
						var question = JSON.parse(request('GET', q_server + localized_mapping[i][j]).getBody());
					} catch (e) {
						count++;
						console.log(count, localized_mapping[i][j])
					}
				}
			}
		}
	}
}