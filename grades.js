var fs = require('fs');
var _ = require('underscore');

var getGrades = function(file){
	var data = fs.readFileSync(file)
	if(data) {
		var data = JSON.parse(data)[0];
		var grades = [];
		for (var property in data) {
			if (data.hasOwnProperty(property) && data[property]["ml"]["level"]>1) {
				grades.push(data[property]["ml"]["level"]);
			}
		}
		console.log('Grades found : ', _.uniq(grades).sort())
		return _.uniq(grades).sort();
	}
}

module.exports.getGrades = getGrades;
