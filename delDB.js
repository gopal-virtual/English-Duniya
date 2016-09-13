
// pouchdb-dump http://localhost:5984/lessonDB > ../zaya-mobile/www/data/lessons.db
var fs = require('fs');
var json = [];

fs.readFile('lesson.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  json = JSON.parse(data);
  var PouchDB = require('pouchdb');
  var db = [];
  db[0] = new PouchDB('http://127.0.0.1:5984/lessonsGrade0');
  db[1] = new PouchDB('http://127.0.0.1:5984/lessonsGrade1');
  db[2] = new PouchDB('http://127.0.0.1:5984/lessonsGrade2');
  db[3] = new PouchDB('http://127.0.0.1:5984/lessonsGrade3');
  db[4] = new PouchDB('http://127.0.0.1:5984/lessonsGrade4');
  db[5] = new PouchDB('http://127.0.0.1:5984/lessonsGrade5');


  var promises = [];

  for(var i = 0; i < db.length ; i++){
    promises.push(db[i].destroy());
    console.log("destroying DB Grade",i)
  }
  // Promise.all(promises).then(function(){
  //   console.log("Deleted all db")
  //   var promises2 = [];
  //     var count = [0,0,0,0,0,0,0];
  // // var lessons = {};
  // var lessons = {0: [],  1: [] ,2 : [], 3 : [] , 4: [], 5 : [] };
  // for (var i = 0; i < json.length; i++) {
  //   if(
  //     // i == 38 || i == 56 ||
  //     json[i].node.tag == 'No tag'
  //     || isNaN(json[i].node.type.grade)
  //     || json[i].node.type.grade == null){
  //     continue;
  //   }
  //   count[json[i].node.type.grade]++;
  //   json[i].scores = {};
  //      for(var j = 0; j < json[i].objects.length; j++){
  //       for(var k = 0; k < json[i].objects[j].objects.length; k++){

  //       // console.log(i,j,k)
  //       if(json[i].node.type.grade == 0){
  //         // console.log(json[i].objects[j].node.title)
  //       // console.log(json[i].node.type.grade,json[i].objects[j].objects[k].node.meta);
  //       }
  //       }
  //      }
  //       json[i].key = i;
  //       promises2.push(  db[json[i].node.type.grade].put(
  //     {
  //       "_id" : json[i].node.id,
  //       "lesson" : json[i]
  //     }
  //     ))

  //       Promise.all(promises2)
  // .then(function(){
  //       console.log("Done")
  //     })
  //   // lessons[json[i].node.type.grade].push(json[i])

  //   }
  // })


    // for(var i = 0 ; i < 6 ; i++){
    //   console.log("here",i)
    //    db[i].put({
    //             "_id":  String(i),
    //             "lessons": lessons[i]
    //           }).then(function(){
    //             console.log("a")
    //           }).catch(function(e){
    //             console.log(e)
    //           })
    // }

})
