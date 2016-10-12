(function() {
  'use strict';

  angular
    .module('common')
    .factory('ml', ml);

  ml.$inject = ['data', '$log', '$q', 'User'];

  /* @ngInject */
  function ml(data, $log, $q, User) {
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
      findSrInLessonResultMapping: findSrInLessonResultMapping,
      lastResort: lastResort,
      getNextQSr: getNextQSr,
      getChildren: getChildren,
      genTree: genTree,
      getRecPlaylist: getRecPlaylist,
      rankPlaylist: rankPlaylist,
      makeTree: makeTree,
      getLevelRecommendation: getLevelRecommendation,
      setMLDqJSON: setMLDqJSON(),
      setMLKmapsJSON: setMLKmapsJSON(),
      setMapping: setMapping(),
      setLessonResultMapping: setLessonResultMapping(),
      dqQuiz : []
      // dqQuiz: [{"0":{"sr":"99991928-a3f7-49ee-b922-7dd37eb524bb","answered":"right","skill":"vocabulary","level":0},"1":{"sr":"56a3d5ec-ad5a-4917-9d9e-79221a956e88","answered":"NA","skill":"vocabulary","level":1},"2":{"sr":"874738b1-762c-47da-ae3e-a968c6145aa5","answered":"wrong","skill":"vocabulary","level":2},"3":{"sr":"1ef9334b-9d01-4a08-83b9-44e920983a06","answered":"NA","skill":"vocabulary","level":3}},{"0":{"sr":"2651f54b-dfcc-4f37-8560-5ed32965e37b","answered":"right","skill":"reading","level":0},"1":{"sr":"00b2a501-bd8b-4ff8-970e-18b3014f009d","answered":"NA","skill":"reading","level":1},"2":{"sr":"7b5a7976-55ed-4394-8c2d-6682e0670895","answered":"wrong","skill":"reading","level":2},"-1":{"sr":"c4e76df0-e881-4a87-9aab-93779b9eb173","answered":"NA","skill":"reading","level":0}},{"0":{"sr":"da08df75-f90b-4d17-9063-9c0529d8e29e","answered":"right","skill":"grammar","level":0},"1":{"sr":"6a0d68bb-9a0d-4f94-8b7c-0b8126f1d3ee","answered":"NA","skill":"grammar","level":3},"-2":{"sr":"09164dd8-9342-4877-94c9-150b760fb6db","answered":"NA","skill":"grammar","level":0},"-1":{"sr":"48fecd1e-7131-4063-a7ed-7585da8772b0","answered":"NA","skill":"grammar","level":1}},{"0":{"sr":"20d4b188-28e3-4803-b52d-7a52a5c4f4c9","answered":"wrong","skill":"listening","level":0},"-3":{"sr":"a00689f3-055a-4be0-b891-9f949e204f4d","answered":"NA","skill":"listening","level":0},"-2":{"sr":"b7681f96-c544-448e-952f-f0dda0c33b97","answered":"right","skill":"listening","level":-2},"-1":{"sr":"8c21ca7c-b0d4-4c54-9e6c-3aa18772b9df","answered":"NA","skill":"listening","level":-1}}]
    };

    $log.debug('User here', User);

    function getLessonResultMapping(){
      var student_id = User.getActiveProfileSync()._id;
      return User.scores.getScoreList(student_id)
      .then(function(res){
        $log.debug('res lessonResultMapping', res);
        var lessonResultMapping = {};
        for (var sr in res){
          for (var type in res[sr]){
            if(res[sr][type]["type"] == "assessment"){
              lessonResultMapping[sr] = {
                "result": res[sr][type]["score"]/res[sr][type]["totalScore"],
                "unit": res[sr][type]["skill"].toLowerCase().replace(/ /g, ''),
              };
              break;
            }
          }
        }
        $log.debug('lessonResultMapping', lessonResultMapping);
        return lessonResultMapping;
      })
      .catch(function(err){
        $log.debug('err generating lessonResultMapping', err);
      });
    }


    function setLessonResultMapping(){
      return getLessonResultMapping()
      .then(function(res){
        $log.debug('setLessonResultMapping', res);
        ml.lessonResultMapping = res;
      });
    }


    function setMLDqJSON(){
      return data.createDiagQJSON
      .then(function(){
        return data.getDQJSON()
      })
      .then(function(res){
        ml.dqJSON = res;
        return ml.dqJSON;
      })
      .catch(function(err){
        $log.debug('err in setMLDqJSON', setMLDqJSON);
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


    function runDiagnostic(quiz) {
        var [recommendations, skillLevels] = ml.getRecommendationFromDiagnosticTest(quiz);
        console.log('diagnosticRecommendations', recommendations);

        recommendations = useLastResort(recommendations);

        var recommendationsWithPrereqs = structureRecommendations(recommendations);

        return [recommendationsWithPrereqs, skillLevels];
    }


    function useLastResort(recommendations){
        if (recommendations == undefined){
            recommendations = {"vocabulary": [], "reading": [], "grammar": [], "listening": []};
        }

        var insufficientSkillSrs = checkIfInsufficientSrs(recommendations);
        console.log('insufficientSkillSrs', insufficientSkillSrs);

        if (insufficientSkillSrs.length > 0) {
            console.log('running lastResort');

            for (var i = 0; i < insufficientSkillSrs.length; i++) {
                var insufficientSkill = insufficientSkillSrs[i];
                var lastResortRecommendations = lastResort(insufficientSkill);

                if (lastResortRecommendations.length > 0) {
                    // recommendations = recommendations.concat(lastResortRecommendations.slice(0, 10 - recommendations.length));
                    recommendations[insufficientSkill] = pushIfAbsent(recommendations[insufficientSkill], lastResortRecommendations); // to add all the lastResortRecommendations
                }
                // break;// last resort should now run only once.
            }
            console.log('lastResortRecommendations', recommendations);
        }
        return recommendations;
    }


    function getNewBatchNodes(){
        var recommendations = useLastResort();
        var recommendationsWithPrereqs = structureRecommendations(recommendations);
        var skillLevels = {"vocabulary": null, "reading": null, "grammar": null, "listening": null};
        return [recommendationsWithPrereqs, skillLevels];
    }


    function structureRecommendations(recommendations){
        // console.log('in structureRecommendations', recommendations);
        var rankedUniqueRecommendations = {};
        for (var skill in recommendations) {
            rankedUniqueRecommendations[skill] = rankPlaylist({ 0: recommendations[skill] }, undefined, 1);
        }
        // var rankedUniqueRecommendations = rankPlaylist({0: uniqueRecommendations}, undefined, 1);
        // console.log('rankedUniqueRecommendations', rankedUniqueRecommendations);
        var recommendationsWithPrereqs = {};

        var lessonResultMapping = ml.lessonResultMapping;

        for (var skill in rankedUniqueRecommendations) {

            var srList = rankedUniqueRecommendations[skill];
            var rankedSrList = [];
            for (var i = 0; i < srList.length; i++) {
                var sr = srList[i];

                var prereqs = makeTree(sr, undefined, undefined, 1);
                var srIndex = prereqs.indexOf(sr);
                if (srIndex > -1) {
                    prereqs.splice(srIndex, 1);
                }

                var sr_name = null;
                var sr_skill = null;
                var sr_micstd = null;
                var sr_result = null;
                var sr_data = ml.kmapsJSON[sr];
                if (sr_data != undefined) {
                    sr_name = sr_data["name"];
                    sr_skill = sr_data["unit"];
                    sr_micstd = sr_data["microstandard"];
                    var result = null;
                    if(lessonResultMapping[sr] != undefined){
                      if(lessonResultMapping[sr]["result"] == "red"){
                          result = "Failed";
                      }else if(lessonResultMapping[sr]["result"] == "#00ff00"){
                          result = "Passed";
                      }else{
                          result = "Unattempted";
                      }                      
                    }else{
                        result = "Unattempted";
                    } 
                    sr_result = result;
                }

                var prereqs_names = [];
                var prereqs_skills = [];
                var prereqs_micstd = [];
                var prereqs_result = [];
                for (var j = 0; j < prereqs.length; j++) {
                    var sr_data = ml.kmapsJSON[prereqs[j]];
                    if (sr_data != undefined) {
                        prereqs_names.push(sr_data["name"]);
                        prereqs_skills.push(sr_data["unit"]);
                        prereqs_micstd.push(sr_data["microstandard"]);
                        var result = null;
                        if(lessonResultMapping[prereqs[j]] != undefined){
                          if(lessonResultMapping[prereqs[j]]["result"] == "red"){
                              result = "Failed";
                          }else if(lessonResultMapping[prereqs[j]]["result"] == "#00ff00"){
                              result = "Passed";
                          }else{
                              result = "Unattempted";
                          }                          
                        }else{
                            result = "Unattempted";
                        } 
                        prereqs_result.push(result);
                    } else {
                        prereqs_names.push(null);
                        prereqs_skills.push(null);
                        prereqs_micstd.push(null);
                        prereqs_result.push(null);
                    }
                }
                rankedSrList.push({ "sr": sr, "prereqs": prereqs, "sr_name": sr_name, "sr_skill": sr_skill, "prereqs_names": prereqs_names, "prereqs_skills": prereqs_skills, "sr_micstd": sr_micstd, "prereqs_micstd": prereqs_micstd, "sr_result": sr_result, "prereqs_result": prereqs_result });
            }
            recommendationsWithPrereqs[skill] = rankedSrList;
        }
        return recommendationsWithPrereqs;
    }


    function suggestBridge(skill, sr, recommendationsWithPrereqs) {
        if (recommendationsWithPrereqs) {
            for (var i = 0; i < recommendationsWithPrereqs[skill].length; i++) {
                if (recommendationsWithPrereqs[skill][i]["sr"] == sr) { // find the sr in recommendationsWithPrereqs
                    var prereqs = recommendationsWithPrereqs[skill][i]["prereqs"]; // get prereqs of all the input sr
                    // get the student's lesson to result mapping from db
                    var lessonResultMapping = ml.lessonResultMapping;
                    // change to - find all unseccessful srs
                    var unsuccessfulPrereqs = [];
                    for (var ind = 0; ind < prereqs.length; ind++) {
                        // get the result of an input sr
                        var result = findSrInLessonResultMapping(prereqs[ind], lessonResultMapping);
                        // if the result is not green/successful, push to unsuccessfulPrereqs
                        if (result != "#00ff00") {
                            unsuccessfulPrereqs.push(prereqs[ind]);
                        }
                    }

                    // rank the unsuccessfulPrereqs
                    // if(unsuccessfulPrereqs.length == 0){
                    //     return null;
                    // }
                    // jugaad
                    if (unsuccessfulPrereqs.length == 0) {
                        break;
                    }
                    var rankedPrereqList = rankPlaylist({ 0: unsuccessfulPrereqs }, undefined, 1);
                    // return the first from unsuccessfulPrereqs
                    var suggestion = ml.kmapsJSON[rankedPrereqList[0]]
                    var suggestionPerSkill = {};
                    suggestionPerSkill[skill] = [suggestion["sr"]];

                    var recommendationsWithPrereqs = structureRecommendations(suggestionPerSkill);

                    return recommendationsWithPrereqs;
                }
            }
        }

        // if suggestion is null; marisa's jugaad
        console.log('suggestBridge suggestion is null');
        var lessonResultMapping = ml.lessonResultMapping;
        var kmLesson = ml.kmapsJSON[sr];
        var level = kmLesson["level"];
        var contentSr = kmLesson["content_sr"];
        var allLessons = ml.kmapsJSON;
        var lessonsPerLevel = {};
        var contentSrSuggestedLesson;
        var contentSrSuggested = 0;

        for (var i in allLessons) {
            var lesson = allLessons[i];
            if (lessonResultMapping[lesson["sr"]] == undefined || lessonResultMapping[lesson["sr"]]["result"] != "#00ff00") {
                if (lesson["content_sr"] < contentSr && lesson["content_sr"] > contentSrSuggested && level == lesson["level"]) {
                    contentSrSuggested = lesson["content_sr"];
                    contentSrSuggestedLesson = lesson["sr"];
                }
                if (lessonsPerLevel[lesson["level"]] == undefined) {
                    lessonsPerLevel[lesson["level"]] = [];
                }
                lessonsPerLevel[lesson["level"]].push(lesson["sr"]);
            }
        }

        if (contentSrSuggestedLesson) {
            var suggestion = ml.kmapsJSON[contentSrSuggestedLesson];
            console.log('contentSrSuggestedLesson suggestion', suggestion);
            var suggestionPerSkill = {};
            suggestionPerSkill[skill] = [suggestion["sr"]];

            var recommendationsWithPrereqs = structureRecommendations(suggestionPerSkill);

            return recommendationsWithPrereqs;
        } else if (Object.keys(lessonsPerLevel).length > 0) {
            var closestLevel = closest(Object.keys(lessonsPerLevel), level);
            var rankedLessons = rankPlaylist({ 0: lessonsPerLevel[closestLevel] }, undefined, 1);
            var suggestion = ml.kmapsJSON[rankedLessons[0]];
            console.log('lessonsPerLevel suggestion', suggestion);

            var suggestionPerSkill = {};
            suggestionPerSkill[skill] = [suggestion["sr"]];

            var recommendationsWithPrereqs = structureRecommendations(suggestionPerSkill);

            return recommendationsWithPrereqs;
        }

        var suggestionPerSkill = {};
        suggestionPerSkill[skill] = [null];

        return suggestionPerSkill;
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

      if (questionSet["0"]["answered"] == "wrong") {
          var pushSr = null;
          var skillPushSr = null;
          var minWrong = null;
          for (var i = Math.min.apply(null, levelArray); i <= -1; i++) {
              if (questionSet[String(parseInt(i))]["answered"] == "right") {
                  if (pushSr == null) {
                      pushSr = questionSet[String(parseInt(i + 1))]["sr"];
                      skillPushSr = questionSet[String(parseInt(i + 1))]["skill"];
                      break;
                  }
              } else if (questionSet[String(parseInt(i))]["answered"] == "wrong" && minWrong == null) {
                  minWrong = questionSet[String(parseInt(i))]["sr"];
              }
          }

          if (pushSr == null) {
              if (minWrong == null) {
                  if (questionSet["-1"] != undefined) {
                      pushSr = questionSet["-1"]["sr"];
                      skillPushSr = questionSet["-1"]["skill"];
                  } else {
                      pushSr = questionSet["0"]["sr"];
                      skillPushSr = questionSet["0"]["skill"];
                  }
              } else {
                  var index = minWrong - 1;
                  if (questionSet[String(index)] != undefined) {
                      pushSr = questionSet[String(index)]["sr"];
                      skillPushSr = questionSet[String(index)]["skill"];
                  } else {
                      pushSr = questionSet[String(Math.min.apply(null, levelArray))]["sr"];
                      skillPushSr = questionSet[String(Math.min.apply(null, levelArray))]["skill"];
                  }
              }
          }

          suggestedSrs.push(pushSr);
          $log.debug('pushing 1');
          levelsOfSuggestedSrs.push({"level": ml.dqJSON[pushSr]["node"]["type"]["level"], "skill": ml.dqJSON[pushSr]["node"]["tag"]});

      } else if (questionSet["0"]["answered"] == "right") {
          var pushSr = null;
          var skillPushSr = null;
          for (var i = Math.max.apply(null, levelArray); i >= 0; i--) {
              if (questionSet[String(parseInt(i))]["answered"] == "right") {
                  if (i == Math.max.apply(null, levelArray)) {
                      break;
                  } else if (pushSr == null && i < Math.max.apply(null, levelArray)) {
                      pushSr = questionSet[String(parseInt(i + 1))]["sr"];
                      skillPushSr = questionSet[String(parseInt(i + 1))]["skill"];
                      break;
                  }
              }
          }

          if (pushSr != null) {
              suggestedSrs.push(pushSr);
              $log.debug('pushing 2');
              levelsOfSuggestedSrs.push({"level": ml.dqJSON[pushSr]["node"]["type"]["level"], "skill": ml.dqJSON[pushSr]["node"]["tag"]});
          }
          else{
            var maxLevel = Math.max.apply(null, Object.keys(questionSet));
            var pushSr = questionSet[maxLevel]["sr"];
            $log.debug('pushing 3');
            levelsOfSuggestedSrs.push({"level": ml.dqJSON[pushSr]["node"]["type"]["level"], "skill": ml.dqJSON[pushSr]["node"]["tag"]});
          }
      } else {
          var pushSr = questionSet["0"]["sr"];
          suggestedSrs.push(pushSr);
          $log.debug('pushing 4');
          levelsOfSuggestedSrs.push({"level": ml.dqJSON[pushSr]["node"]["type"]["level"], "skill": ml.dqJSON[pushSr]["node"]["tag"]});
      }

      if (getSuggestedLevel != undefined) {
          return levelsOfSuggestedSrs;
      }

      $log.debug('levelsOfSuggestedSrs', levelsOfSuggestedSrs);
      // $log.debug('suggestedSrs', suggestedSrs);

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
        // if(ml.dqJSON[q_id]["node"]["level"] == level && ml.dqJSON[q_id]["node"]["skill_area"] == skill){ // Ayush -> beware, the structure of ported dqJSON changes quite often
        if(ml.dqJSON[q_id]["node"]["type"]["level"] == level && ml.dqJSON[q_id]["node"]["tag"] == skill){
          srs.push({"sr": ml.dqJSON[q_id]["node"]["sr"], "skill_area": skill});
          // Ayush -> check <ml.dqJSON[q_id]["node"]["sr"]> is not undefined
        }
      }
      return srs;
    }


    function getLevelRecommendation() {
      var levelRec = {"avgLevel": 0, "skillLevel": {}};
      var quiz = ml.dqQuiz;
      for (var index = 0; index < quiz.length; index++) {
          var questionSet = quiz[index];
          var output = ml.getSuggestedSr2(questionSet, "getSuggestedLevel")[0];
          if (output != undefined) {
              levelRec["avgLevel"] += parseInt(output["level"]);
              levelRec["skillLevel"][output["skill"]] = output["level"];
          }
      }
      levelRec["avgLevel"] = Math.round(levelRec["avgLevel"]/quiz.length);
      return levelRec;
    }


    function getRecommendationFromDiagnosticTest(quiz) {

        // for diagnostic recommendation, we will first find the suggested srs with the help of the student's performance in the test.
        // 1. if litmus 0 is correct, find the highest positive litmus number (i.e from 2 to 1) which was answered correct and assign the next level sr to the suggestedSrs list. if not found any wrong answer, do not assign anything to the suggestedSrs.
        // 2. if litmus 0 is wrong, find the lowest negative number (i.e starting from -2 then -1) which was answered correct  and assign the next level sr to the suggestedSrs list. if not found any wrong answer assign the 0 litmus number lesson to the suggestedSrs list.

        var suggestedRootSrs = [];
        var skillLevels = {};
        for (var index = 0; index < quiz.length; index++) {
            var questionSet = quiz[index];
            var output = getSuggestedSr2(questionSet, "getSuggestedLevel")[0];
            console.log('output', output);
            if (output == undefined) {
                continue;
            }
            skillLevels[output.skill] = output.level;
            suggestedRootSrs = getSuggestedRootSrs(output.level, output.skill, suggestedRootSrs);
        }

        console.log('suggestedRootSrs', suggestedRootSrs);
        console.log('skillLevels', skillLevels);

        // var suggestedSrs = [];
        var skillBasedSuggestedSrs = {};
        for (var i = 0; i < suggestedRootSrs.length; i++) {
            var prereqSrs = makeTree(suggestedRootSrs[i].sr, undefined, undefined, 1); // makeTree will return the recommendations for a given sr
            // suggestedSrs = suggestedSrs.concat(prereqSrs);
            if (skillBasedSuggestedSrs[suggestedRootSrs[i].skill] == undefined) {
                skillBasedSuggestedSrs[suggestedRootSrs[i].skill] = [];
            }
            skillBasedSuggestedSrs[suggestedRootSrs[i].skill] = pushIfAbsent(skillBasedSuggestedSrs[suggestedRootSrs[i].skill], prereqSrs);
        }

        console.log('skillBasedSuggestedSrs', skillBasedSuggestedSrs);

        var insufficientSkillSrs = checkIfInsufficientSrs(skillBasedSuggestedSrs);

        if (insufficientSkillSrs.length == 0) {
            console.log('insufficientSkillSrs 0');
            return skillBasedSuggestedSrs;
        }

        console.log('insufficientSkillSrs', insufficientSkillSrs);
        for (var i = 0; i < insufficientSkillSrs.length; i++) {
            var rootSuggestedSrs = skillBasedSuggestedSrs[insufficientSkillSrs[i]];
            var prereqsRecommendations = ifInsufficientSrs(rootSuggestedSrs);
            // skillBasedSuggestedSrs[insufficientSkillSrs[i]] = rootSuggestedSrs.concat(prereqsRecommendations.slice(0, ml.MAX - rootSuggestedSrs.length));
            skillBasedSuggestedSrs[insufficientSkillSrs[i]] = pushIfAbsent(rootSuggestedSrs, prereqsRecommendations);
        }

        return [skillBasedSuggestedSrs, skillLevels];

    }


    function ifInsufficientSrs(uniqueSuggestedSrs) {
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
      var lessonResultMapping = ml.lessonResultMapping;

      if (Object.keys(lessonResultMapping).length == 0) {
        // return rankedPrereqList.slice(0, ml.MAX - uniqueSuggestedSrs.length).concat(uniqueSuggestedSrs);
        return rankedPrereqList;
      }

      var recommendations = [];
      // push only the rankedPrereqList lessons in which the student is successful
      for (var i = 0; i < rankedPrereqList.length; i++) {
        var result = ml.findSrInLessonResultMapping(rankedPrereqList[i], lessonResultMapping);
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


    function findSrInLessonResultMapping(sr, lessonResultMapping) {
      // return the result of the input sr from lessonResultMapping
      if(lessonResultMapping[sr] != undefined){
        return lessonResultMapping[sr]["result"];
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

    function getKmapsFiltered(skill, level){
        var srs = [];
        for(var sr in ml.kmapsJSON){
            if(skill){
                if(ml.kmapsJSON[sr]["unit"] != skill){
                    continue;
                }
            }
            if(level){
                if(ml.kmapsJSON[sr]["level"] != level){
                    continue;
                }
            }
            srs.push(ml.kmapsJSON[sr]);
        }
    }

    function closest(arr, closestTo){
        var highDifference = Infinity;
        var highClosestElement;
        var lowDifference = Infinity;
        var lowClosestElement;
        for(var i = 0;i < arr.length;i++){
            if(arr[i] <= closestTo){
                var difference = closestTo - arr[i];
                if(difference < lowDifference){
                    lowDifference = difference;
                    lowClosestElement = arr[i];
                }
            }else{
                var difference = arr[i] - closestTo;
                if(difference < highDifference){
                    highDifference = difference;
                    highClosestElement = arr[i];
                }
            }
        }
        if(lowClosestElement){
            return lowClosestElement;
        }else{
            return highClosestElement;
        }
    }


    function getSuggestedRootSrs(level, skill, suggestedRootSrs){
        var srs = getDqsByLevelNSkill(output.level, output.skill);
        // console.log('srs', srs);
        var suggestedRootSrsPerSkill = [];
        for (var i = 0; i < srs.length; i++) {
            if(srs[i]["skill_area"] == srs[i]["lesson_skill"]){
                suggestedRootSrsPerSkill.push({ "sr": srs[i].sr, "skill": srs[i].skill_area });
            }
        }
        if(suggestedRootSrsPerSkill.length > 0){
            suggestedRootSrs = suggestedRootSrs.concat(suggestedRootSrsPerSkill);
        }else{
            var specificLessons = getKmapsFiltered(skill, level);
            var specificSrs = [];
            for(var i = 0; i < specificLessons.length; i++){
                specificSrs.push(specificLessons[i]["sr"]);
            }
            if(specificSrs.length > 0){
                for(var i=0;i<specificSrs.length;i++){
                    suggestedRootSrs.push({"sr": specificSrs[i], "skill": skill});
                }
            }else{
                var lessons = getKmapsFiltered(skill);
                var avaiableLessons = [];
                for(var i = 0;i < lessons.length; i++){
                    avaiableLessons.push(lessons[i]["level"]);
                }
                level = closest(avaiableLessons, level);
                suggestedRootSrs = getSuggestedRootSrs(level, skill, suggestedRootSrs);
            }
        }
        return suggestedRootSrs;
    }


    function lastResort(insufficientSkill) {
        console.log('in LR', insufficientSkill);
        // StudentLessonData has the mapping of student to lessons result
        var lessonResultMapping = ml.lessonResultMapping;
        var suggestedSrs = [];

        // if we have data of the student, else return []
        var allSuccessfulSrs = [];
        var successfulSrs = []; // this has all the successful srs of the student
        // change to - find all srs with result "#00ff00"
        for (var i in lessonResultMapping) {
            if (lessonResultMapping[i]["result"] == "#00ff00") {
                allSuccessfulSrs.push(i);
            }
            if (lessonResultMapping[i]["unit"] != insufficientSkill) {
                continue;
            }
            if (lessonResultMapping[i]["result"] == "#00ff00") {
                successfulSrs.push(i);
            }
        }

        // if there are successfulSrs, else return []
        if (successfulSrs.length > 0) {
            // fetch all the lesson from Kmaps DB
            var allKmaps = ml.kmapsJSON;
            var srParentCount = {};

            for (var i in allKmaps) {
                // if the lesson is completed successfully, continue
                if (allSuccessfulSrs.indexOf(allKmaps[i]["sr"]) != -1) {
                    continue;
                }

                var KmapParents = allKmaps[i]["parent"];

                // find successful matching percent for the lesson and dump to srParentCount dict with key as the percent and value as the arra of all the lessons having that percent
                var sameCount = 0;
                var unsuccessfulPrereqs = [];
                for (var index = 0; index < KmapParents.length; index++) {
                    if (allSuccessfulSrs.indexOf(KmapParents[index]) != -1) {
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
                    srParentCount[sameCount / KmapParents.length] = pushIfAbsent(srParentCount[sameCount / KmapParents.length], unsuccessfulPrereqs);
                }
            }

            // sort the srParentCount wrt keys, most matches will be on top
            var keysSorted = Object.keys(srParentCount).sort().reverse();

            for (var i = 0; i < keysSorted.length; i++) {
                // rank all the lessons which have same percentage, and push to suggestedSrs
                var rankedLessons = rankPlaylist({ 0: srParentCount[keysSorted[i]] }, undefined, 1);
                // suggestedSrs = suggestedSrs.concat(rankedLessons);
                suggestedSrs = pushIfAbsent(suggestedSrs, rankedLessons);
            }

          }

        console.log('lastResort additions', suggestedSrs);

        return suggestedSrs;
    }


    function getNextQSr(test, diagLitmusMapping) {
      
      try {
          if (test.length > 0) {
              if (test[0]["count"] >= 2) {
                  test = displaySuggestedSr(test[0]["level"], test, diagLitmusMapping);
                  var newTest = test.slice(1, test.length);
                  return getNextQSr(newTest, diagLitmusMapping);
              }
              if (test[0]["previousAnswer"] == null) {
                  if (diagLitmusMapping[test[0]["skill"]][test[0]["level"]] != undefined) {
                      var q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"]]["questions"];
                      if (q_set.length == 0) {

                          var newTest = test.slice(1, test.length);
                          return getNextQSr(newTest, diagLitmusMapping);
                      }
                      var suggestion = { "skill": test[0]["skill"], "qSr": q_set[Math.floor(Math.random() * (q_set.length)) + 0], "test": test, "actualLevel": test[0]["level"], "microstandard": diagLitmusMapping[test[0]["skill"]][test[0]["level"]]["microstandard"] };
                      $log.debug('suggestion from ml', suggestion);
                      return suggestion;
                  } else {
                      test = displaySuggestedSr(test[0]["level"], test, diagLitmusMapping);
                      var newTest = test.slice(1, test.length);
                      return getNextQSr(newTest, diagLitmusMapping);
                  }
              } else if (test[0]["previousAnswer"] == false) {
                  if (diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 2] != undefined) {
                      var q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 2]["questions"];
                      if (q_set.length == 0) {

                          var newTest = test.slice(1, test.length);
                          return getNextQSr(newTest, diagLitmusMapping);
                      }
                      var intermediate_q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 1]["questions"];
                      test[0]["qSet"][test[0]["level"] - 1] = { "qSr": intermediate_q_set[Math.floor(Math.random() * (intermediate_q_set.length)) + 0], "answered": "NA" };
                      var suggestion = { "skill": test[0]["skill"], "qSr": q_set[Math.floor(Math.random() * (q_set.length)) + 0], "test": test, "actualLevel": test[0]["level"] - 2, "microstandard": diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 2]["microstandard"] };
                      $log.debug('suggestion from ml', suggestion);
                      return suggestion;
                  } else {
                      test = displaySuggestedSr(test[0]["level"], test, diagLitmusMapping);
                      var newTest = test.slice(1, test.length);
                      return getNextQSr(newTest, diagLitmusMapping);
                  }
              } else if (test[0]["previousAnswer"] == true) {
                  if (diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 2] != undefined) {
                      var q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 2]["questions"];
                      if (q_set.length == 0) {

                          var newTest = test.slice(1, test.length);
                          return getNextQSr(newTest, diagLitmusMapping);
                      }
                      var intermediate_q_set = diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 1]["questions"];
                      test[0]["qSet"][test[0]["level"] + 1] = { "qSr": intermediate_q_set[Math.floor(Math.random() * (intermediate_q_set.length)) + 0], "answered": "NA" };
                      var suggestion = { "skill": test[0]["skill"], "qSr": q_set[Math.floor(Math.random() * (q_set.length)) + 0], "test": test, "actualLevel": test[0]["level"] + 2, "microstandard": diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 2]["microstandard"] };
                      $log.debug('suggestion from ml', suggestion);
                      return suggestion;
                  } else {
                      test = displaySuggestedSr(test[0]["level"], test, diagLitmusMapping);
                      var newTest = test.slice(1, test.length);
                      return getNextQSr(newTest, diagLitmusMapping);
                  }
              }
          } else {
              return null;
          }
      } catch (err) {
          
          var newTest = test.slice(1, test.length);
          return getNextQSr(newTest, diagLitmusMapping);
      }
    }


    function displaySuggestedSr(level_one, test, diagLitmusMapping) {
        
        var test_one = test[0];
        var oldqSet = test_one["qSet"];
        
        var qSet = {};
        for (var i in oldqSet) {
            qSet[i - level_one] = { "answered": oldqSet[i]["answered"] };
            if (oldqSet[i]["sr"] != undefined) {
                qSet[i - level_one]["sr"] = oldqSet[i]["sr"];
            } else {
                qSet[i - level_one]["sr"] = oldqSet[i]["qSr"];
            }
        }
        
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
                if (diagLitmusMapping[test_one["skill"]][last + level_one] != undefined) {
                    var srGroup = diagLitmusMapping[test_one["skill"]][last + level_one]["questions"];
                    newQSet[last] = { "sr": srGroup[Math.floor(Math.random() * (srGroup.length)) + 0], "answered": "NA", "skill": test[0]["skill"], "level": last + level_one };
                }
            } else {
                newQSet[last] = { "sr": qSet[last]["sr"], "answered": qSet[last]["answered"], "skill": test[0]["skill"], "level": last }
            }
        }
        
        ml.dqQuiz.push(newQSet);
        var suggestedQ = ml.getSuggestedSr2(newQSet)[0];
        if (test.length > 1) {
            if (suggestedQ != undefined) {
                test[1]["level"] = parseInt(ml.dqJSON[suggestedQ]["node"]["type"].level);
            } else {
                test[1]["level"] = Object.keys(diagLitmusMapping[test[1]["skill"]]).length - 1;
            }
        }
        return test;
    }


    function getChildren(nodeData, gatheredNodeNumbers, gatheredNodeDict, classWiseScores, noColorRequired) {

      var children = [];
      if (typeof(nodeData.parent) != "undefined") {
        for (var j = 0; j < nodeData.parent.length; j++) {
          var child = {};
          child.sr = nodeData.parent[j];
          child.parent = nodeData.sr;
          var childData = ml.kmapsJSON[child.sr];

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
