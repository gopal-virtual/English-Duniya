var request = require('sync-request');
var requestAysync = require('request');
var couchdbserver = 'https://ci-couch.zaya.in';
var ellserver = 'http://cc-test.zaya.in';
// Find a list of all the devices in couch
var devicelist = [];
var totalprofiles = 0;
var skippedprofiles = 0;
var nonexistentprofiles = 0;
var existentprofiles = 0;
var nonexistentprofileslist = [];
var profileslist = [];

function update() {
	console.log("Nonexistent Profiles : ", nonexistentprofiles, "Existent profiles : ", existentprofiles, "Total Profiles : ", profileslist.length, "Skipped Profiles : ", skippedprofiles);
}

function createNewProfile(profile){
	token = getToken(profile);
	
	
}

var dblist = JSON.parse(request('GET', couchdbserver + '/_all_dbs').getBody().toString())
for (var i in dblist) {
	if (dblist[i].indexOf('device') >= 0) {
		devicelist.push(dblist[i]);
	}
}
for (var i in devicelist) {
	var docslist = JSON.parse(request('GET', couchdbserver + '/' + devicelist[i] + '/_all_docs?include_docs=true').getBody().toString())
	for (var j in docslist.rows) {
		profileslist.push({
			client_uid: docslist.rows[j].id,
			profile_data: docslist.rows[j].doc.data.profile,
			device_id: docslist.rows[j].doc.data.device_id
		})
	}
	// console.log(docslist.rows)
	update();
	if (profileslist.length > 5) {
		break;
	}
}
// for (var i in profileslist) {
// 	requestAysync({
// 		url: ellserver + '/api/v1/profiles?client_uid=' + profileslist[j],
// 		headers: {
// 			'Authorization': 'Token c8450c7bef3198a8f9ae6fdcffc472ecb5115190'
// 				// 'Authorization': 'Token 550bb2c0a1d2fa17ab40dda8eb7107a217b14cf4'
// 		}
// 	}, (function(profileId, error, response, body) {
// 		console.log("profile id ", profileId, error, body, response)
// 	})(profileslist[i]));
// }
for (var i in profileslist) {
	requestAysync({
			url: ellserver + '/api/v1/profiles?client_uid=' + profileslist[j].client_uid,
			headers: {
				'Authorization': 'Token c8450c7bef3198a8f9ae6fdcffc472ecb5115190'
					// 'Authorization': 'Token 550bb2c0a1d2fa17ab40dda8eb7107a217b14cf4'
			}
		},
		function(profile) {
			return function(error, response, body) {
				body = JSON.parse(body);
				console.log("profile id", profile.client_uid, error, body)
				if(body.length === 0){
					console.log("found ")
					// createNewProfile()
				}
			}
		}(profileslist[i])
	);
}
// request(couchdbserver + '/_all_dbs', function(error, response, body) {
// 	if (error) {
// 		console.log("Error occured");
// 		process.exit();
// 	}
// 	body = JSON.parse(body);
// 	for (i in body) {
// 		if (body[i].indexOf('device') >= 0) {
// 			devicelist.push(body[i]);
// 		}
// 	}
// 	console.log("Found devices", devicelist.length)
// 	for (i in devicelist) {
// 		// console.log()
// 		request({
// 			url: couchdbserver + '/' + devicelist[i] + '/_all_docs'
// 		}, function(error, response, body) {
// 			// console.log("BODY",body)
// 			// console.log("ERROR",error)
// 			console.log("RESPONSE", response)
// 			var profiles = JSON.parse(body).rows;
// 			// if (profiles) {
// 			totalprofiles = totalprofiles + profiles.length;
// 			for (j in profiles) {
// 				// console.log(profiles[j].id);
// 				request({
// 					url: ellserver + '/api/v1/profiles?client_uid=' + profiles[j].id,
// 					headers: {
// 						// 'Authorization': 'Token c8450c7bef3198a8f9ae6fdcffc472ecb5115190'
// 						'Authorization': 'Token 550bb2c0a1d2fa17ab40dda8eb7107a217b14cf4'
// 					}
// 				}, function(error, response, body) {
// 					if (error) {
// 						console.log(error)
// 						process.exit();
// 					}
// 					body = JSON.parse(body);
// 					if (body.length == 0) {
// 						nonexistentprofiles++;
// 					} else {
// 						existentprofiles++;
// 					}
// 					update();
// 				});
// 			}
// 			// }else{
// 			// 	skippedprofiles++;
// 			// }
// 			update()
// 				// console.log(JSON.parse(body))
// 		});
// 		if (i == 200) {
// 			// break;
// 		}
// 	}
// });
// // For every device find all the profiles
// // For each profile check if it is available on server or not