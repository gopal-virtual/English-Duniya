(function() {
  'use strict';

  angular
    .module('common')
    .factory('ml', ml);

  ml.$inject = ['data', '$log', '$q'];

  /* @ngInject */
  function ml(data, $log, $q) {
    var ml = {
      MAX: 10,
      runDiagnostic: runDiagnostic,
      suggestBridge: suggestBridge,
      getUniqueArray: getUniqueArray,
      getSuggestedSr2: getSuggestedSr2,
      checkIfInsufficientSrs: checkIfInsufficientSrs,
      pushIfAbsent: pushIfAbsent,
      getRecommendationFromDiagnosticTest: getRecommendationFromDiagnosticTest,
      ifInsufficientSrs: ifInsufficientSrs,
      findSrInStudentLessonData: findSrInStudentLessonData,
      lastResort: lastResort,
      getNextQSr: getNextQSr,
      getChildren: getChildren,
      genTree: genTree,
      getRecPlaylist: getRecPlaylist,
      rankPlaylist: rankPlaylist,
      makeTree: makeTree,
      setMLDqJSON: setMLDqJSON(),
      setMLKmapsJSON: setMLKmapsJSON(),
      setMapping: setMapping(),
      // dqQuiz: [{"0":{"sr":"54ada475-ce87-411b-a075-60572a36a111","answered":"right","skill":"vocabulary","level":0},"1":{"sr":"4eb50a81-bbe8-49c4-8efb-e284008d5f7f","answered":"NA","skill":"vocabulary","level":1},"2":{"sr":"e7c18a27-457f-422e-975b-b28ddd62fb87","answered":"wrong","skill":"vocabulary","level":2},"3":{"sr":"6d116141-c026-408d-8320-4daf805887a9","answered":"NA","skill":"vocabulary","level":3}},{"0":{"sr":"111f3f9f-0726-4fe2-9f09-c897ba162b53","answered":"right","skill":"reading","level":0},"1":{"sr":"b06d642c-fe00-4ac0-ba05-c13617574b2b","answered":"NA","skill":"reading","level":1},"2":{"sr":"06a0fdc5-0ffd-416f-ab37-fe9fddecfda1","answered":"wrong","skill":"reading","level":2},"-1":{"sr":"b89fc070-d415-4949-854d-591bcaf4f8ab","answered":"NA","skill":"reading","level":0}},{"0":{"sr":"bf7648c4-4f20-4c91-aa7a-a412883317d7","answered":"wrong","skill":"listening","level":0},"1":{"sr":"f76a0a14-023c-4dad-a48c-580ee6e14af0","answered":"NA","skill":"listening","level":1},"2":{"sr":"b7ac6b9a-5423-41b9-8cfb-a4a9efa94ecc","answered":"NA","skill":"listening","level":2},"3":{"sr":"07fddf47-c997-478a-99ce-3a6d20c0dc04","answered":"NA","skill":"listening","level":3}}]
      dqQuiz : []
    };

    // function setMLDqJSON(){
    //   return data.getDQJSON()
    //   .then(function(res){
    //     ml.dqJSON = res;
    //     ;
    //     return ml.dqJSON;
    //   })
    //   .catch(function(err){
    //     ;
    //   })
    // }

    // function setMLKmapsJSON(){
    //   return data.getKmapsJSON()
    //   .then(function(res){
    //     ml.kmapsJSON = res;
    //     ;
    //     return ml.kmapsJSON;
    //   })
    //   .catch(function(err){
    //     ;
    //   })
    // }

    // function setMapping(){
    //   return data.getDiagnosisLitmusMapping()
    //   .then(function(res){
    //     ml.mapping = res;
    //     ;
    //     return ml.mapping;
    //   })
    //   .catch(function(err){
    //     ;
    //   })
    // }

    function setMLDqJSON(){
      return data.createDiagQJSON
      .then(function(){
        return data.getDQJSON()
      })
      .then(function(res){
        ml.dqJSON = res;
        ;
        return ml.dqJSON;
      })
      .catch(function(err){
        ;
      })
    }

    function setMLKmapsJSON(){
      return data.createKmapsJSON
      .then(function(){
        return data.getKmapsJSON();
      })
      .then(function(res){
        ml.kmapsJSON = res;
        ;
        return ml.kmapsJSON;
      })
      .catch(function(err){
        ;
      })
    }

    function setMapping(){
      return data.createDiagLitmusMappingDB
      .then(function(){
        return data.getDiagnosisLitmusMapping();
      })
      .then(function(res){
        ml.mapping = res;
        ;
        return ml.mapping;
      })
      .catch(function(err){
        ;
      })
    }

    // var q = $q.defer();
    // ;

    // var result = data.getKmapsJSON();
    // result.then(function(res) {
    //     ;
    // })

    // var result = data.getDiagnosisQuestionById(92423);
    // result.then(function(res) {
    //     ;
    // })

    // var result = data.getDiagnosisQuestionByLevelNSkill(0, "vocabulary");
    // result.then(function(res) {
    //     ;
    // });

    // var result = data.getDiagnosisLitmusMapping();
    // result.then(function(res) {
    //     ;
    // });

    // var result = data.getKmapsLevels();
    // result.then(function(res) {
    //     ;
    // });

    return ml;

    function runDiagnostic(quiz, studentName) {
      var recommendations = ml.getRecommendationFromDiagnosticTest(quiz, studentName);

      var insufficientSkillSrs = ml.checkIfInsufficientSrs(recommendations);


      if (insufficientSkillSrs.length > 0) {

        for (var i = 0; i < insufficientSkillSrs.length; i++) {
          var insufficientSkill = insufficientSkillSrs[i];
          var lastResortRecommendations = ml.lastResort(studentName, insufficientSkill);

          if (lastResortRecommendations.length > 0) {
            // recommendations = recommendations.concat(lastResortRecommendations.slice(0, 10 - recommendations.length));
            recommendations[insufficientSkill] = ml.pushIfAbsent(recommendations[insufficientSkill], lastResortRecommendations); // to add all the lastResortRecommendations
          }
        }
      }

      var rankedUniqueRecommendations = {};
      for (var skill in recommendations) {
        rankedUniqueRecommendations[skill] = ml.rankPlaylist({
          0: recommendations[skill]
        }, undefined, 1);
      }


      var recommendationsWithPrereqs = {};

      for (var skill in rankedUniqueRecommendations) {

        var srList = rankedUniqueRecommendations[skill];
        var rankedSrList = [];
        for (var i = 0; i < srList.length; i++) {
          var sr = srList[i];
          var prereqs = ml.makeTree(sr, undefined, undefined, 1);
          var srIndex = prereqs.indexOf(sr);
          if (srIndex > -1) {
            prereqs.splice(srIndex, 1);
          }

          var sr_name = null;
          var sr_data = ml.kmapsJSON[sr];
          // var sr_data = KnowledgeMapsData.findOne({
          //   "sr": sr
          // });
          if (sr_data != undefined) {
            sr_name = sr_data["name"];
          }

          var prereqs_names = [];
          var prereqs_skills = [];
          for (var j = 0; j < prereqs.length; j++) {
            var sr_data = ml.kmapsJSON[prereqs[j]];
            // var sr_data = KnowledgeMapsData.findOne({
            //   "sr": prereqs[j]
            // });
            if (sr_data != undefined) {
              prereqs_names.push(sr_data["name"]);
              prereqs_skills.push(sr_data["unit"]);
            } else {
              prereqs_names.push(null);
              prereqs_skills.push(null);
            }
          }

          rankedSrList.push({
            "sr": sr,
            "prereqs": prereqs,
            "sr_name": sr_name,
            "prereqs_names": prereqs_names,
            "prereqs_skills": prereqs_skills
          });
        }
        recommendationsWithPrereqs[skill] = rankedSrList;
      }



      return recommendationsWithPrereqs;
    }

    function suggestBridge(skill, sr, studentName, recommendationsWithPrereqs) {

      // for(var skill in recommendationsWithPrereqs){
      for (var i = 0; i < recommendationsWithPrereqs[skill].length; i++) {
        if (recommendationsWithPrereqs[skill][i]["sr"] == sr) { // find the sr in recommendationsWithPrereqs
          var prereqs = recommendationsWithPrereqs[skill][i]["prereqs"]; // get prereqs of all the input sr
          // get the student's lesson to result mapping from db
          var studentData = StudentLessonData.findOne({
            "studentName": studentName
          }, {
            "fields": {
              "lessonScores.sr": 1,
              "lessonScores.result": 1
            }
          });

          // change to - find all unseccessful srs
          var unsuccessfulPrereqs = [];
          for (var ind = 0; ind < prereqs.length; ind++) {
            // get the result of an input sr
            var result = ml.findSrInStudentLessonData(prereqs[ind], studentData);
            // if the result is not green/successful, push to unsuccessfulPrereqs
            if (result != "#00ff00") {
              unsuccessfulPrereqs.push(prereqs[ind]);
            }
          }

          // rank the unsuccessfulPrereqs
          var rankedPrereqList = ml.rankPlaylist({
            0: unsuccessfulPrereqs
          }, undefined, 1);
          // return the first from unsuccessfulPrereqs
          return rankedPrereqList[0];
        }
      }
      // }
      return null;
    }

    function getUniqueArray(array) {
      var uniqueArray = []; // find unique srs
      for (var i = 0; i < array.length; i++) {
        if (uniqueArray.indexOf(array[i]) == -1) {
          uniqueArray.push(array[i]);
        }
      }
      return uniqueArray;
    }

    function getSuggestedSr2(questionSet, getSuggestedLevel) {
      var suggestedSrs = [];
      var levelsOfSuggestedSrs = [];

      var levelArray = [];
      for (var level in questionSet) {
        levelArray.push(parseInt(level));
      }
      levelArray.sort();
      // var level_one = -1*parseInt(levelArray[0]);

      if (questionSet["0"]["answered"] == "wrong") {
        var pushSr = null;
        // var levelPushSr = null;
        var levelPushSr = null;
        var skillPushSr = null;
        var minWrong = null;
        for (var i = Math.min.apply(null, levelArray); i <= -1; i++) {
          if (questionSet[String(parseInt(i))]["answered"] == "right") {
            if (pushSr == null) {
              pushSr = questionSet[String(parseInt(i + 1))]["sr"];
              // levelPushSr = parseInt(i + 1);
              levelPushSr = questionSet[String(parseInt(i + 1))]["level"];
              skillPushSr = questionSet[String(parseInt(i + 1))]["skill"];
              break;
            }
          } else if (questionSet[String(parseInt(i))]["answered"] == "wrong" && minWrong == null) {
            minWrong = questionSet[String(parseInt(i))]["sr"];
          }
        }

        // if (pushSr == null) {
        //     pushSr = questionSet[String(Math.min.apply(null, levelArray))]["sr"];
        // }

        if (pushSr == null) {
          if (minWrong == null) {
            if (questionSet["-1"] != undefined) {
              pushSr = questionSet["-1"]["sr"];
              // levelPushSr = -1;
              levelPushSr = questionSet["-1"]["level"];
              skillPushSr = questionSet["-1"]["skill"];
            } else {
              pushSr = questionSet["0"]["sr"];
              // levelPushSr = 0;
              levelPushSr = questionSet["0"]["level"];
              skillPushSr = questionSet["0"]["skill"];
            }
          } else {
            var index = minWrong - 1;
            if (questionSet[String(index)] != undefined) {
              pushSr = questionSet[String(index)]["sr"];
              // levelPushSr = parseInt(index);
              levelPushSr = questionSet[String(index)]["level"];
              skillPushSr = questionSet[String(index)]["skill"];
            } else {
              pushSr = questionSet[String(Math.min.apply(null, levelArray))]["sr"];
              // levelPushSr = parseInt(Math.min.apply(null, levelArray));
              levelPushSr = questionSet[String(Math.min.apply(null, levelArray))]["level"];
              skillPushSr = questionSet[String(Math.min.apply(null, levelArray))]["skill"];
            }
          }
        }

        suggestedSrs.push(pushSr);
        // levelsOfSuggestedSrs.push(levelPushSr + level_one);
        // levelsOfSuggestedSrs.push(levelPushSr);
        levelsOfSuggestedSrs.push({
          "level": levelPushSr,
          "skill": skillPushSr
        });

      } else if (questionSet["0"]["answered"] == "right") {
        var pushSr = null;
        // var levelPushSr = null;
        var levelPushSr = null;
        var skillPushSr = null;
        for (var i = Math.max.apply(null, levelArray); i >= 0; i--) {
          if (questionSet[String(parseInt(i))]["answered"] == "right") {
            if (i == Math.max.apply(null, levelArray)) {
              break;
            } else if (pushSr == null && i < Math.max.apply(null, levelArray)) {
              pushSr = questionSet[String(parseInt(i + 1))]["sr"];
              // levelPushSr = parseInt(i + 1);
              levelPushSr = questionSet[String(parseInt(i + 1))]["level"];
              skillPushSr = questionSet[String(parseInt(i + 1))]["skill"];
              break;
            }
          }
        }

        if (pushSr != null) {
          suggestedSrs.push(pushSr);
          // levelsOfSuggestedSrs.push(levelPushSr + level_one);
          // levelsOfSuggestedSrs.push(levelPushSr);
          levelsOfSuggestedSrs.push({
            "level": levelPushSr,
            "skill": skillPushSr
          });
        }
      } else {
        suggestedSrs.push(questionSet["0"]["sr"]);
        // levelsOfSuggestedSrs.push(0 + level_one);
        // levelsOfSuggestedSrs.push(questionSet["0"]["level"]);
        levelsOfSuggestedSrs.push({
          "level": questionSet["0"]["level"],
          "skill": questionSet["0"]["skill"]
        });
      }

      if (levelsOfSuggestedSrs.length == 0) {
        levelsOfSuggestedSrs = [{
          "level": 3,
          "skill": questionSet["0"]["skill"]
        }];
      } else if (levelsOfSuggestedSrs[0].level < 0) {
        levelsOfSuggestedSrs = [{
          "level": 0,
          "skill": questionSet["0"]["skill"]
        }];
      }

      if (getSuggestedLevel != undefined) {
        return levelsOfSuggestedSrs;
      }

      return suggestedSrs;
    }

    function checkIfInsufficientSrs(skillBasedSuggestedSrs) {
      // var insufficientSkillSrs = ["grammar", "vocabulary", "listening", "reading"];
      var insufficientSkillSrs = Object.keys(skillBasedSuggestedSrs);
      for (var skill in skillBasedSuggestedSrs) {
        // skillBasedSuggestedSrs[skill].splice(0, skillBasedSuggestedSrs[skill].length - 4);
        if (skillBasedSuggestedSrs[skill].length >= ml.MAX) {
          var index = insufficientSkillSrs.indexOf(skill);
          if (index > -1) {
            insufficientSkillSrs.splice(index, 1);
          }
        }
      }
      return insufficientSkillSrs;
    }

    function pushIfAbsent(original, additions) {
      while (additions.length > 0) {
        if (original.length < ml.MAX) {
          var sr = additions.shift();
          if (original.indexOf(sr) == -1) {
            original.push(sr);
          }
        } else {
          break;
        }
      }
      return original;
    }

    function getDqsByLevelNSkill(level, skill){
      var srs = [];
      for(var q_id in ml.dqJSON){
        if(ml.dqJSON[q_id]["node"]["level"] == level && ml.dqJSON[q_id]["node"]["skill_area"] == skill){
          srs.push({"sr": ml.dqJSON[q_id]["node"]["sr"], "skill_area": skill});
        }
      }
      return srs;
    }


    function getRecommendationFromDiagnosticTest(quiz, studentName) {

      // for diagnostic recommendation, we will first find the suggested srs with the help of the student's performance in the test.
      // 1. if litmus 0 is correct, find the highest positive litmus number (i.e from 2 to 1) which was answered correct and assign the next level sr to the suggestedSrs list. if not found any wrong answer, do not assign anything to the suggestedSrs.
      // 2. if litmus 0 is wrong, find the lowest negative number (i.e starting from -2 then -1) which was answered correct  and assign the next level sr to the suggestedSrs list. if not found any wrong answer assign the 0 litmus number lesson to the suggestedSrs list.

      var suggestedRootSrs = [];
      for (var index = 0; index < quiz.length; index++) {
        var questionSet = quiz[index];
        var output = ml.getSuggestedSr2(questionSet, "getSuggestedLevel")[0];
        ;
        if (output == undefined) {
          continue;
        }

        var srs = getDqsByLevelNSkill(output.level, output.skill);
        for (var i = 0; i < srs.length; i++) {
          suggestedRootSrs.push({
            "sr": srs[i].sr,
            "skill": srs[i].skill_area
          });
        }
      }

      // var suggestedSrs = [];
      var skillBasedSuggestedSrs = {};
      for (var i = 0; i < suggestedRootSrs.length; i++) {
        var prereqSrs = ml.makeTree(suggestedRootSrs[i].sr, undefined, undefined, 1); // makeTree will return the recommendations for a given sr
        // suggestedSrs = suggestedSrs.concat(prereqSrs);
        if (skillBasedSuggestedSrs[suggestedRootSrs[i].skill] == undefined) {
          skillBasedSuggestedSrs[suggestedRootSrs[i].skill] = [];
        }
        skillBasedSuggestedSrs[suggestedRootSrs[i].skill] = ml.pushIfAbsent(skillBasedSuggestedSrs[suggestedRootSrs[i].skill], prereqSrs);
      }

      var insufficientSkillSrs = ml.checkIfInsufficientSrs(skillBasedSuggestedSrs);

      if (insufficientSkillSrs.length == 0) {
        return skillBasedSuggestedSrs;
      }

      for (var i = 0; i < insufficientSkillSrs.length; i++) {
        var rootSuggestedSrs = skillBasedSuggestedSrs[insufficientSkillSrs[i]];
        var prereqsRecommendations = ml.ifInsufficientSrs(rootSuggestedSrs, studentName);
        // skillBasedSuggestedSrs[insufficientSkillSrs[i]] = rootSuggestedSrs.concat(prereqsRecommendations.slice(0, ml.MAX - rootSuggestedSrs.length));
        skillBasedSuggestedSrs[insufficientSkillSrs[i]] = ml.pushIfAbsent(rootSuggestedSrs, prereqsRecommendations);
      }

      return skillBasedSuggestedSrs;

    }


    function ifInsufficientSrs(uniqueSuggestedSrs, studentName) {
      if (uniqueSuggestedSrs == undefined || uniqueSuggestedSrs.length == 0) {
        return [];
      }
      var prereqList = [];
      for (var i = 0; i < uniqueSuggestedSrs.length; i++) {
        // hard code
        // if(uniqueSuggestedSrs[i] == "902c1cf0-82b9-483c-bdbd-84f750c05d90" || uniqueSuggestedSrs[i] == "ff894695-842b-4932-88ee-4509f779d4bc"){
        //     continue;
        // }
        var prereqSr = ml.makeTree(uniqueSuggestedSrs[i], undefined, undefined, 1); // makeTree will return the recommendations for a given sr
        prereqList = ml.pushIfAbsent(prereqList, prereqSr);
      }

      var rankedPrereqList = ml.rankPlaylist({
        0: prereqList
      }, undefined, 1);

      // change to - check if student exist in db
      var studentData;

      if (studentName != undefined && studentName != ""){
        studentData= StudentLessonData.findOne({
          "studentName": studentName
        }, {
          "fields": {
            "lessonScores.sr": 1,
            "lessonScores.result": 1
          }
        });
      }

      if (studentData == undefined) {
        var recommendations = [];
        // return rankedPrereqList.slice(0, ml.MAX - uniqueSuggestedSrs.length).concat(uniqueSuggestedSrs);
        return rankedPrereqList;
      }

      var recommendations = [];
      // push only the rankedPrereqList lessons in which the student is successful
      for (var i = 0; i < rankedPrereqList.length; i++) {
        var result = ml.findSrInStudentLessonData(rankedPrereqList[i], studentData);
        // change to - find result of srs not in uniqueSuggestedSrs and result != "#00ff00"
        if (result != "#00ff00" && uniqueSuggestedSrs.indexOf(rankedPrereqList[i]) == -1) {
          recommendations.push(rankedPrereqList[i]);
        }
        if (recommendations.length >= 10 - uniqueSuggestedSrs.length) {
          break;
        }
      }

      // recommendations = recommendations.concat(uniqueSuggestedSrs);
      return recommendations;
    }


    function findSrInStudentLessonData(sr, studentData) {
      // return the result of the input sr from studentdata
      for (var i = 0; i < studentData["lessonScores"].length; i++) {
        if (studentData["lessonScores"][i]["sr"] == sr) {
          return studentData["lessonScores"][i]["result"];
        }
      }
      return "red";
    }

    function getKmapsSRNParents(){
      var srs = [];
      for(var sr in ml.kmapsJSON){
        srs.push({"sr": sr, "parent": ml.kmapsJSON[sr]["parent"]});
      }
      return srs;
    }

    function lastResort(studentName, insufficientSkill) {
      // StudentLessonData has the mapping of student to lessons result
      var studentData;

      if (studentName != undefined && studentName != ""){
        studentData = StudentLessonData.findOne({
          "studentName": studentName
        }, {
          "fields": {
            "lessonScores.sr": 1,
            "lessonScores.result": 1,
            "lessonScores.unit": 1
          }
        });
      }

      var suggestedSrs = [];
      // if we have data of the student, else return []
      if (typeof(studentData) != "undefined") {
        var successfulSrs = []; // this has all the successful srs of the student
        // change to - find all srs with result "#00ff00"
        for (var i = 0; i < studentData["lessonScores"].length; i++) {
          if (studentData["lessonScores"][i]["unit"] != insufficientSkill) {
            continue;
          }
          if (studentData["lessonScores"][i]["result"] == "#00ff00") {
            successfulSrs.push(studentData["lessonScores"][i]["sr"]);
          }
        }

        // if there are successfulSrs, else return []
        if (successfulSrs.length > 0) {
          // fetch all the lesson from Kmaps DB
          var allKmaps = getKmapsSRNParents();
          // var allKmaps = KnowledgeMapsData.find({}, {
          //   "fields": {
          //     "sr": 1,
          //     "parent": 1
          //   }
          // }).fetch();
          srParentCount = {};

          for (var i = 0; i < allKmaps.length; i++) {
            // if the lesson is completed successfully, continue
            if (successfulSrs.indexOf(allKmaps[i]["sr"]) != -1) {
              continue;
            }

            var KmapParents = allKmaps[i]["parent"];

            // find successful matching percent for the lesson and dump to srParentCount dict with key as the percent and value as the arra of all the lessons having that percent
            var sameCount = 0;
            var unsuccessfulPrereqs = [];
            for (var index = 0; index < KmapParents.length; index++) {
              if (successfulSrs.indexOf(KmapParents[index]) != -1) {
                sameCount++;
              } else {
                unsuccessfulPrereqs.push(KmapParents[index]);
              }
            }

            // the percentage of lessons which do not have any prereq will equal to NaN, which is infinity, hence will automatically come on top
            if (typeof(srParentCount[sameCount / KmapParents.length]) == "undefined") {
              unsuccessfulPrereqs.push(allKmaps[i]["sr"]);
              srParentCount[sameCount / KmapParents.length] = unsuccessfulPrereqs;
            } else {
              unsuccessfulPrereqs.push(allKmaps[i]["sr"]);
              // srParentCount[sameCount / KmapParents.length] = srParentCount[sameCount / KmapParents.length].concat(unsuccessfulPrereqs);
              srParentCount[sameCount / KmapParents.length] = ml.pushIfAbsent(srParentCount[sameCount / KmapParents.length], unsuccessfulPrereqs);
            }
          }

          // sort the srParentCount wrt keys, most matches will be on top
          var keysSorted = Object.keys(srParentCount).sort().reverse();

          for (var i = 0; i < keysSorted.length; i++) {
            // rank all the lessons which have same percentage, and push to suggestedSrs
            var rankedLessons = ml.rankPlaylist({
              0: srParentCount[keysSorted[i]]
            }, undefined, 1);
            // suggestedSrs = suggestedSrs.concat(rankedLessons);
            suggestedSrs = ml.pushIfAbsent(suggestedSrs, rankedLessons);
          }

        }
      }

      return suggestedSrs;
    }

    function getNextQSr(test,diagLitmusMapping) {
      try{

        if (test.length > 0) {
          if (test[0]["count"] >= 2) {
            test = displaySuggestedSr(test, diagLitmusMapping);
            var newTest = test.slice(1, test.length);
            return getNextQSr(newTest, diagLitmusMapping);
          }
          if (test[0]["previousAnswer"] == null) {
            if (diagLitmusMapping[test[0]["skill"]][test[0]["level"]] != undefined) {
              var q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"]]["questions"];
              if(q_set.length == 0){

                  var newTest = test.slice(1, test.length);
                  return getNextQSr(newTest, diagLitmusMapping);
              }

              var suggestion = {
                "skill": test[0]["skill"],
                "qSr": q_set[Math.floor(Math.random() * (q_set.length)) + 0],
                "test": test,
                "actualLevel": test[0]["level"],
                "microstandard": diagLitmusMapping[test[0]["skill"]][test[0]["level"]]["microstandard"]
              };

              $log.debug('suggestion from ml 1', suggestion);
              return (suggestion);
            } else {
              test = displaySuggestedSr(test, diagLitmusMapping);
              var newTest = test.slice(1, test.length);
              return getNextQSr(newTest, diagLitmusMapping);
            }
          } else if (test[0]["previousAnswer"] == 0) {
            if (diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 2] != undefined) {
              var q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 2]["questions"];
              if(q_set.length == 0){

                  var newTest = test.slice(1, test.length);
                  return getNextQSr(newTest, diagLitmusMapping);
              }

              var intermediate_q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 1]["questions"];
              test[0]["qSet"][test[0]["level"] - 1] = {
                "qSr": intermediate_q_set[Math.floor(Math.random() * (intermediate_q_set.length)) + 0],
                "answered": "NA"
              };

              var suggestion = {
                "skill": test[0]["skill"],
                "qSr": q_set[Math.floor(Math.random() * (q_set.length)) + 0],
                "test": test,
                "actualLevel": test[0]["level"] - 2,
                "microstandard": diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 2]["microstandard"]
              };

              $log.debug('suggestion from ml 2', suggestion);
              return (suggestion);
            } else {
              test = displaySuggestedSr(test, diagLitmusMapping);
              var newTest = test.slice(1, test.length);
              return getNextQSr(newTest, diagLitmusMapping);
            }
          } else if (test[0]["previousAnswer"] == 1) {
            if (diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 2] != undefined) {
              var q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 2]["questions"];
              if(q_set.length == 0){

                  var newTest = test.slice(1, test.length);
                  return getNextQSr(newTest, diagLitmusMapping);
              }

              var intermediate_q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 1]["questions"];
              test[0]["qSet"][test[0]["level"] + 1] = {
                "qSr": intermediate_q_set[Math.floor(Math.random() * (intermediate_q_set.length)) + 0],
                "answered": "NA"
              };

              var suggestion = {
                "skill": test[0]["skill"],
                "qSr": q_set[Math.floor(Math.random() * (q_set.length)) + 0],
                "test": test,
                "actualLevel": test[0]["level"] + 2,
                "microstandard": diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 2]["microstandard"]
              };

              $log.debug('suggestion from ml', suggestion);
              return (suggestion);
            } else {
              test = displaySuggestedSr(test, diagLitmusMapping);
              var newTest = test.slice(1, test.length);
              return getNextQSr(newTest, diagLitmusMapping);
            }
          }
        } else {
          return (null);
        }
      }catch(err){
        var newTest = test.slice(1, test.length);
        return getNextQSr(newTest, diagLitmusMapping);
      }
    }

    function displaySuggestedSr(test, diagLitmusMapping) {
      var level_one = test[0]["level"];
      var test_one = test[0];
      var oldqSet = test_one["qSet"];

      var qSet = {};
      for (var i in oldqSet) {
        qSet[i - level_one] = {
          "answered": oldqSet[i]["answered"]
        };
        if (oldqSet[i]["sr"] != undefined) {
          qSet[i - level_one]["sr"] = oldqSet[i]["sr"];
        } else {
          qSet[i - level_one]["sr"] = oldqSet[i]["qSr"];
        }
      }
      ;
      var newQSet = {};
      // array = [];
      var last = null;
      for (var i = 0; i <= 3; i++) {
        if (last == null) {
          last = parseInt(level_one) * -1;
        } else {
          last++;
        }
        // array.push(last);
        if (qSet[last] == undefined) {
          if (diagLitmusMapping[test_one["skill"]][last + level_one] != undefined){
            var srGroup = diagLitmusMapping[test_one["skill"]][last + level_one]["questions"];
            newQSet[last] = {
              "sr": srGroup[Math.floor(Math.random() * (srGroup.length)) + 0],
              "answered": "NA",
              "skill": test[0]["skill"],
              "level": last + level_one
            };
          }
        } else {
          newQSet[last] = {
            "sr": qSet[last]["sr"],
            "answered": qSet[last]["answered"],
            "skill": test[0]["skill"],
            "level": last
          }
        }
      }
      ml.dqQuiz.push(newQSet);
      ;
      var suggestedQ = ml.getSuggestedSr2(newQSet)[0];
      ;
      if (test.length > 1) {
        if (suggestedQ != undefined) {
          test[1]["level"] = parseInt(ml.dqJSON[suggestedQ]["node"].level);
        } else {
          test[1]["level"] = Object.keys(diagLitmusMapping[test[1]["skill"]]).length - 1;
        }
      }
      return test;
    }


    function getChildren(nodeData, gatheredNodeNumbers, gatheredNodeDict, classWiseScores, noColorRequired) {
      // ;

      var children = [];
      if (typeof(nodeData.parent) != "undefined") {
        for (var j = 0; j < nodeData.parent.length; j++) {
          var child = {};
          child.sr = nodeData.parent[j];
          child.parent = nodeData.sr;
          var childData = ml.kmapsJSON[child.sr];
          // var childData = KnowledgeMapsData.findOne({
          //   "sr": (child.sr)
          // });

          if (childData == undefined) {
            // ;
            continue;
          }
          child.name = childData.name;

          if (gatheredNodeNumbers.indexOf((child.sr)) != -1) {
            // ;
            continue;
          }
          gatheredNodeNumbers.push((child.sr));
          gatheredNodeDict[(child.sr)] = {
            "level": gatheredNodeDict[String((child.parent))]["level"] + 1
          };
          gatheredNodeDict[(child.sr)]["name"] = child.name;

          if (typeof(noColorRequired) == "undefined") {
            child.color = ml.getRecPlaylist((child.sr), classWiseScores).color;
            gatheredNodeDict[(child.sr)]["color"] = child.color;
          }

          var getChildrenOutput = ml.getChildren(childData, gatheredNodeNumbers, gatheredNodeDict, classWiseScores, noColorRequired);

          child.children = getChildrenOutput[0];
          gatheredNodeNumbers = getChildrenOutput[1];
          gatheredNodeDict = getChildrenOutput[2];

          children.push(child);
        }
      }
      return [children, gatheredNodeNumbers, gatheredNodeDict];
    }

    function genTree(nodeSr, classWiseScores, noColorRequired) {
      // ;

      var node = {};
      node.sr = nodeSr;
      node.parent = null;

      var nodeData = ml.kmapsJSON[node.sr];

      // var nodeData = KnowledgeMapsData.findOne({
      //   "sr": (node.sr)
      // });
      if (nodeData == undefined) {
        return null;
      }
      node.name = nodeData.name;

      var gatheredNodeNumbers = [(node.sr)];
      var gatheredNodeDict = {};
      gatheredNodeDict[(node.sr)] = {
        "level": 0
      };
      gatheredNodeDict[(node.sr)]["name"] = node.name;

      if (typeof(noColorRequired) == "undefined") {
        node.color = ml.getRecPlaylist((node.sr), classWiseScores).color;
        gatheredNodeDict[(node.sr)]["color"] = node.color;
      }

      var getChildrenOutput = ml.getChildren(nodeData, gatheredNodeNumbers, gatheredNodeDict, classWiseScores, noColorRequired);

      node.children = getChildrenOutput[0];
      gatheredNodeNumbers = getChildrenOutput[1];
      gatheredNodeDict = getChildrenOutput[2];

      return [node, gatheredNodeDict];
    }

    function getRecPlaylist(n, classWiseScores) {
      // ;

      // this will determine the color of a node depending on the score of the student in that lesson node

      if (typeof(classWiseScores) == "undefined") {
        // ;
        return {
          "color": "blue"
        };
      }
    }

    function rankPlaylist(playlistUnordered, playlistSrName, recommendationsOnly) {
      // ;

      // this will rank all the prerequisites according to the KnowledgeMapsLevels in sucha way that the nodes which are of level smaller that the others gets added to the playlist before

      var rankedPlaylistLevels = {};

      for (var level in playlistUnordered) {
        rankedPlaylistLevels[level] = {};
        for (var srIndex = 0; srIndex < playlistUnordered[level].length; srIndex++) {
          // rankedPlaylistLevels[level][(playlistUnordered[level][srIndex])] = KnowledgeMapsLevelsJSON[playlistUnordered[level][srIndex]];
          rankedPlaylistLevels[level][(playlistUnordered[level][srIndex])] = ml.kmapsJSON[playlistUnordered[level][srIndex]]["kmap_level"];
        }
      }

      var descendingLevel = Object.keys(rankedPlaylistLevels).sort().reverse();

      var rankedPlaylist = [];

      for (var i = 0; i < descendingLevel.length; i++) {
        var rankedPlaylistLevel = rankedPlaylistLevels[descendingLevel[i]];
        var sortedPlaylistLevel = Object.keys(rankedPlaylistLevel).sort(function(a, b) {
          return rankedPlaylistLevel[a] - rankedPlaylistLevel[b]
        });
        rankedPlaylist = rankedPlaylist.concat(sortedPlaylistLevel);
      }

      if (typeof(recommendationsOnly) != "undefined") {
        return rankedPlaylist;
      }
    }

    function makeTree(node, classWiseScores, appendAll, recommendationsOnly) {
      // ;
      // ;

      var genTreeOutput = ml.genTree(node, classWiseScores);
      var tempTree = genTreeOutput[0];
      var gatheredNodeDict = genTreeOutput[1];

      if (typeof(appendAll) == "undefined") {

        var playlistUnordered = {};
        var playlistSrName = {};

        for (var sr in gatheredNodeDict) {
          if (playlistUnordered[gatheredNodeDict[sr]["level"]] == undefined) {
            if (gatheredNodeDict[sr]["color"] != "#00ff00") {
              playlistUnordered[gatheredNodeDict[sr]["level"]] = [sr];
              playlistSrName[sr] = gatheredNodeDict[sr]["name"];
            }
          } else {
            if (gatheredNodeDict[sr]["color"] != "#00ff00") {
              playlistUnordered[gatheredNodeDict[sr]["level"]].push(sr);
              playlistSrName[sr] = gatheredNodeDict[sr]["name"];
            }
          }
        }

        var recommendations = ml.rankPlaylist(playlistUnordered, playlistSrName, recommendationsOnly);

        if (typeof(recommendationsOnly) != "undefined") {
          return recommendations;
        }
      }
    }


  }
})();
