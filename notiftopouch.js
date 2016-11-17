var jsonfile=require('jsonfile'),
	request=require('request');

var src = 'notif.json';

(function(){
	// var db = new PouchDB('notificationDB');
	// db.put({
	//   _id: 'dave@gmail.com',
	//   name: 'David',
	//   age: 69
	// });

	jsonfile.readFile(src, function(err, obj) {
		for (key in obj){
			// request({
			// 	method: 'GET',
			// 	uri: 'http://52.187.70.243:5984/notifications/'+key
			// },function(err,req,body){
			// 	// console.log(JSON.parse(body)._rev);
			// 	// obj[key]["_rev"] = JSON.parse(body)._rev;
			// 	// console.log(obj[key]._rev);
			// 	// return;
			// 	// request({
			// 	// 	method: 'PUT',
			// 	// 	uri: 'http://52.187.70.243:5984/notifications/'+key,
			// 	// 	json: obj[key],
			// 	// }
			// 	// ,function(err,req,body){
			// 	// 	// console.log(body)
			// 	// })
			// })
			request({
				method: 'PUT',
				uri: 'http://52.187.70.243:5984/notifications/'+key,
				json: obj[key],
			}
			,function(err,req,body){
				console.log(body)
			})
			// break;
		}
	  // console.log(obj);
	})
	
})()
