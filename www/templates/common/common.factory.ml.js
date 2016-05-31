(function() {
    'use strict';

    angular
        .module('common')
        .factory('ml', ml);

    ml.$inject = ['data', '$log'];

    /* @ngInject */
    function ml(data, $log) {
        var ml = {
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
            getNextQSrUI: getNextQSrUI,
            getChildren: getChildren,
            genTree: genTree,
            generateTree: generateTree,
            appendChildren: appendChildren,
            getRecPlaylist: getRecPlaylist,
            rankPlaylist: rankPlaylist,
            makeTree: makeTree
        };

        // var result = data.getDiagnosisQuestionById(92423);
        // result.then(function(res) {
        //     $log.debug('ml res', res);
        // })

        // var result = data.getDiagnosisQuestionByLevelNSkill(0, "vocabulary");
        // result.then(function(res) {
        //     $log.debug('ml res', res);
        // });

        // var result = data.getDiagnosisLitmusMapping();
        // result.then(function(res) {
        //     $log.debug('ml res', res);
        // });

        // var result = data.getKmapsLevels();
        // result.then(function(res) {
        //     $log.debug('ml res', res);
        // });


        return ml;

        function runDiagnostic(quiz, studentName) {
            var recommendations = ml.getRecommendationFromDiagnosticTest(quiz, studentName);
            console.log('diagnosticRecommendations', recommendations);

            var insufficientSkillSrs = ml.checkIfInsufficientSrs(recommendations);
            console.log('insufficientSkillSrs', insufficientSkillSrs);

            console.log('forced reductions in diagnosticRecommendations', recommendations);

            if (insufficientSkillSrs.length > 0) {
                console.log('running lastResort');

                for (var i = 0; i < insufficientSkillSrs.length; i++) {
                    var insufficientSkill = insufficientSkillSrs[i];
                    var lastResortRecommendations = ml.lastResort(studentName, insufficientSkill);

                    if (lastResortRecommendations.length > 0) {
                        // recommendations = recommendations.concat(lastResortRecommendations.slice(0, 10 - recommendations.length));
                        recommendations[insufficientSkill] = ml.pushIfAbsent(recommendations[insufficientSkill], lastResortRecommendations); // to add all the lastResortRecommendations
                    }
                }
                console.log('lastResortRecommendations', recommendations);
            }

            var rankedUniqueRecommendations = {};
            for (var skill in recommendations) {
                rankedUniqueRecommendations[skill] = rankPlaylist({ 0: recommendations[skill] }, undefined, 1);
            }

            // var rankedUniqueRecommendations = rankPlaylist({0: uniqueRecommendations}, undefined, 1);

            console.log('rankedUniqueRecommendations', rankedUniqueRecommendations);

            var recommendationsWithPrereqs = {};

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
                    var sr_data = KnowledgeMapsData.findOne({ "sr": sr });
                    if (sr_data != undefined) {
                        sr_name = sr_data["name"];
                    }

                    var prereqs_names = [];
                    var prereqs_skills = [];
                    for (var j = 0; j < prereqs.length; j++) {
                        var sr_data = KnowledgeMapsData.findOne({ "sr": prereqs[j] });
                        if (sr_data != undefined) {
                            prereqs_names.push(sr_data["name"]);
                            prereqs_skills.push(sr_data["unit"]);
                        } else {
                            prereqs_names.push(null);
                            prereqs_skills.push(null);
                        }
                    }

                    rankedSrList.push({ "sr": sr, "prereqs": prereqs, "sr_name": sr_name, "prereqs_names": prereqs_names, "prereqs_skills": prereqs_skills });
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
                    var studentData = StudentLessonData.findOne({ "studentName": studentName }, { "fields": { "lessonScores.sr": 1, "lessonScores.result": 1 } });

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
                    var rankedPrereqList = rankPlaylist({ 0: unsuccessfulPrereqs }, undefined, 1);
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
            console.log('levelArray', levelArray);
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
                    console.log('here1');
                    if (minWrong == null) {
                        console.log('here2');
                        if (questionSet["-1"] != undefined) {
                            console.log('here3');
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
                        console.log('here4');
                        var index = minWrong - 1;
                        if (questionSet[String(index)] != undefined) {
                            console.log('here5');
                            pushSr = questionSet[String(index)]["sr"];
                            // levelPushSr = parseInt(index);
                            levelPushSr = questionSet[String(index)]["level"];
                            skillPushSr = questionSet[String(index)]["skill"];
                        } else {
                            console.log('here6');
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
                levelsOfSuggestedSrs.push({ "level": levelPushSr, "skill": skillPushSr });

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
                    levelsOfSuggestedSrs.push({ "level": levelPushSr, "skill": skillPushSr });
                }
            } else {
                suggestedSrs.push(questionSet["0"]["sr"]);
                // levelsOfSuggestedSrs.push(0 + level_one);
                // levelsOfSuggestedSrs.push(questionSet["0"]["level"]);
                levelsOfSuggestedSrs.push({ "level": questionSet["0"]["level"], "skill": questionSet["0"]["skill"] });
            }

            if (levelsOfSuggestedSrs.length == 0) {
                levelsOfSuggestedSrs = [{ "level": 3, "skill": questionSet["0"]["skill"] }];
            } else if (levelsOfSuggestedSrs[0].level < 0) {
                levelsOfSuggestedSrs = [{ "level": 0, "skill": questionSet["0"]["skill"] }];
            }

            if (getSuggestedLevel != undefined) {
                return levelsOfSuggestedSrs;
            }

            console.log('levelsOfSuggestedSrs', levelsOfSuggestedSrs);
            console.log('suggestedSrs', suggestedSrs);

            return suggestedSrs;
        }

        function checkIfInsufficientSrs(skillBasedSuggestedSrs) {
            var insufficientSkillSrs = ["grammar", "vocabulary", "listening", "reading"];
            for (var skill in skillBasedSuggestedSrs) {
                // skillBasedSuggestedSrs[skill].splice(0, skillBasedSuggestedSrs[skill].length - 4);
                if (skillBasedSuggestedSrs[skill].length >= MAX) {
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
                if (original.length < MAX) {
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


        function getRecommendationFromDiagnosticTest(quiz, studentName) {

            // for diagnostic recommendation, we will first find the suggested srs with the help of the student's performance in the test.
            // 1. if litmus 0 is correct, find the highest positive litmus number (i.e from 2 to 1) which was answered correct and assign the next level sr to the suggestedSrs list. if not found any wrong answer, do not assign anything to the suggestedSrs.
            // 2. if litmus 0 is wrong, find the lowest negative number (i.e starting from -2 then -1) which was answered correct  and assign the next level sr to the suggestedSrs list. if not found any wrong answer assign the 0 litmus number lesson to the suggestedSrs list.

            var suggestedRootSrs = [];
            for (var index = 0; index < quiz.length; index++) {
                var questionSet = quiz[index];
                var output = ml.getSuggestedSr2(questionSet, "getSuggestedLevel")[0];
                console.log('output', output);
                if (output == undefined) {
                    continue;
                }
                var srs = DiagnosticQuestionsData.find({ "level": output.level, "skill_area": output.skill }, { "fields": { "sr": 1, "_id": 0, "skill_area": 1 } }).fetch();
                // console.log('srs', srs);
                for (var i = 0; i < srs.length; i++) {
                    suggestedRootSrs.push({ "sr": srs[i].sr, "skill": srs[i].skill_area });
                }
            }

            console.log('suggestedRootSrs', suggestedRootSrs);

            // var suggestedSrs = [];
            var skillBasedSuggestedSrs = {};
            for (var i = 0; i < suggestedRootSrs.length; i++) {
                var prereqSrs = makeTree(suggestedRootSrs[i].sr, undefined, undefined, 1); // makeTree will return the recommendations for a given sr
                // suggestedSrs = suggestedSrs.concat(prereqSrs);
                if (skillBasedSuggestedSrs[suggestedRootSrs[i].skill] == undefined) {
                    skillBasedSuggestedSrs[suggestedRootSrs[i].skill] = [];
                }
                skillBasedSuggestedSrs[suggestedRootSrs[i].skill] = ml.pushIfAbsent(skillBasedSuggestedSrs[suggestedRootSrs[i].skill], prereqSrs);
            }

            console.log('skillBasedSuggestedSrs', skillBasedSuggestedSrs);

            var insufficientSkillSrs = ml.checkIfInsufficientSrs(skillBasedSuggestedSrs);

            if (insufficientSkillSrs.length == 0) {
                console.log('insufficientSkillSrs 0');
                return skillBasedSuggestedSrs;
            }

            console.log('insufficientSkillSrs', insufficientSkillSrs);
            for (var i = 0; i < insufficientSkillSrs.length; i++) {
                var rootSuggestedSrs = skillBasedSuggestedSrs[insufficientSkillSrs[i]];
                var prereqsRecommendations = ml.ifInsufficientSrs(rootSuggestedSrs, studentName);
                // skillBasedSuggestedSrs[insufficientSkillSrs[i]] = rootSuggestedSrs.concat(prereqsRecommendations.slice(0, MAX - rootSuggestedSrs.length));
                skillBasedSuggestedSrs[insufficientSkillSrs[i]] = ml.pushIfAbsent(rootSuggestedSrs, prereqsRecommendations);
            }

            return skillBasedSuggestedSrs;

        }


        function ifInsufficientSrs(uniqueSuggestedSrs, studentName) {
            if (uniqueSuggestedSrs == undefined || uniqueSuggestedSrs.length == 0) {
                return [];
            }
            console.log('uniqueSuggestedSrs', uniqueSuggestedSrs);
            var prereqList = [];
            for (var i = 0; i < uniqueSuggestedSrs.length; i++) {
                // hard code
                // if(uniqueSuggestedSrs[i] == "902c1cf0-82b9-483c-bdbd-84f750c05d90" || uniqueSuggestedSrs[i] == "ff894695-842b-4932-88ee-4509f779d4bc"){
                //     continue;
                // }
                var prereqSr = makeTree(uniqueSuggestedSrs[i], undefined, undefined, 1); // makeTree will return the recommendations for a given sr
                prereqList = ml.pushIfAbsent(prereqList, prereqSr);
            }

            var rankedPrereqList = rankPlaylist({ 0: prereqList }, undefined, 1);
            console.log('rankedPrereqList', rankedPrereqList);

            // change to - check if student exist in db
            var studentData = StudentLessonData.findOne({ "studentName": studentName }, { "fields": { "lessonScores.sr": 1, "lessonScores.result": 1 } });

            if (studentData == undefined) {
                console.log('student not found in db');
                var recommendations = [];
                // return rankedPrereqList.slice(0, MAX - uniqueSuggestedSrs.length).concat(uniqueSuggestedSrs);
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

            console.log('trimmed recommendations', recommendations);
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

        function lastResort(studentName, insufficientSkill) {
            console.log('in LR', studentName, insufficientSkill);
            // StudentLessonData has the mapping of student to lessons result
            var studentData = StudentLessonData.findOne({ "studentName": studentName }, { "fields": { "lessonScores.sr": 1, "lessonScores.result": 1, "lessonScores.unit": 1 } });
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
                    var allKmaps = KnowledgeMapsData.find({}, { "fields": { "sr": 1, "parent": 1 } }).fetch();
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
                        var rankedLessons = rankPlaylist({ 0: srParentCount[keysSorted[i]] }, undefined, 1);
                        // suggestedSrs = suggestedSrs.concat(rankedLessons);
                        suggestedSrs = ml.pushIfAbsent(suggestedSrs, rankedLessons);
                    }

                }
            }

            console.log('lastResort additions', suggestedSrs);

            return suggestedSrs;
        }

        function getNextQSrUI(test) {
            console.log('in getNextQSr', test[0]);
            if (test.length > 0) {
                if (test[0]["count"] >= 2) {
                    console.log('slicing');
                    var newTest = test.slice(1, test.length);
                    return getNextQSr(newTest);
                }
                if (test[0]["previousAnswer"] == null) {
                    if (diagLitmusMapping[test[0]["skill"]][test[0]["level"]] != undefined) {
                        console.log('if 1');
                        return { "skill": test[0]["skill"], "qSr": diagLitmusMapping[test[0]["skill"]][test[0]["level"]]["sr"], "test": test };
                    } else {
                        console.log('else 1');
                        var newTest = test.slice(1, test.length);
                        return getNextQSr(newTest);
                    }
                } else if (test[0]["previousAnswer"] == 0) {
                    if (diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 2] != undefined) {
                        console.log('if 2');
                        return { "skill": test[0]["skill"], "qSr": diagLitmusMapping[test[0]["skill"]][test[0]["level"] - 2]["sr"], "test": test };
                    } else {
                        console.log('else 2');
                        var newTest = test.slice(1, test.length);
                        return getNextQSr(newTest);
                    }
                } else if (test[0]["previousAnswer"] == 1) {
                    if (diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 2] != undefined) {
                        console.log('if 3');
                        return { "skill": test[0]["skill"], "qSr": diagLitmusMapping[test[0]["skill"]][test[0]["level"] + 2]["sr"], "test": test };
                    } else {
                        console.log('else 3');
                        var newTest = test.slice(1, test.length);
                        return getNextQSr(newTest);
                    }
                }
            } else {
                console.log('diagnosis complete');
                return null;
            }
        }

        function displaySuggestedSr(level_one, test) {
            console.log('in function displaySuggestedSr');
            var test_one = test[0];
            var oldqSet = test_one["qSet"];
            console.log('oldqSet', oldqSet);
            var qSet = {};
            for (var i in oldqSet) {
                qSet[i - level_one] = { "answered": oldqSet[i]["answered"] };
                if (oldqSet[i]["sr"] != undefined) {
                    qSet[i - level_one]["sr"] = oldqSet[i]["sr"];
                } else {
                    qSet[i - level_one]["sr"] = oldqSet[i]["qSr"];
                }
            }
            console.log('qSet', qSet);
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
                    var srGroup = diagLitmusMapping[test_one["skill"]][last + level_one]["questions"];
                    newQSet[last] = { "sr": srGroup[Math.floor(Math.random() * (srGroup.length)) + 0], "answered": "NA", "skill": test[0]["skill"], "level": last + level_one };
                } else {
                    newQSet[last] = { "sr": qSet[last]["sr"], "answered": qSet[last]["answered"], "skill": test[0]["skill"], "level": last }
                }
            }
            console.log('newQSet', newQSet);
            var suggestedQ = getSuggestedSr2(newQSet)[0];
            console.log('suggestedQ', suggestedQ);
            var q_data = DiagnosticQuestionsData.findOne({ "_id": suggestedQ });
            if (q_data != undefined) {
                var suggestedSr = q_data["sr"];
                var suggestedLessonName = q_data["lesson_name"];
                console.log('suggestedSr', suggestedSr);
                // document.getElementById("dispQuestion").innerHTML += " - suggestedSr " + String(suggestedSr) + " suggestedLessonName "+ suggestedLessonName;
            }
            quiz.push(newQSet);
            if (test.length > 1) {
                if (suggestedQ != undefined) {
                    console.log('hereeeee');
                    test[1]["level"] = parseInt(DiagnosticQuestionsData.findOne({ "_id": suggestedQ })["level"]);
                    // test[1]["level"] = parseInt(srToQuestion[suggestedQ]["level"]);
                } else {
                    test[1]["level"] = Object.keys(diagLitmusMapping[test[1]["skill"]]).length - 1;
                }
            }
            return test;
        }












        function getChildren(nodeData, gatheredNodeNumbers, gatheredNodeDict, classWiseScores, noColorRequired) {
            console.log('in function getChildren');

            var children = [];
            if (typeof(nodeData.parent) != "undefined") {
                for (var j = 0; j < nodeData.parent.length; j++) {
                    var child = {};
                    child.sr = nodeData.parent[j];
                    child.parent = nodeData.sr;
                    var childData = KnowledgeMapsData.findOne({
                        "sr": (child.sr)
                    });

                    if (childData == undefined) {
                        // console.log('no map found with sr ', nodeSr);
                        continue;
                    }
                    child.name = childData.name;

                    if (gatheredNodeNumbers.indexOf((child.sr)) != -1) {
                        // console.log('here', child.sr);
                        continue;
                    }
                    gatheredNodeNumbers.push((child.sr));
                    gatheredNodeDict[(child.sr)] = { "level": gatheredNodeDict[String((child.parent))]["level"] + 1 };
                    gatheredNodeDict[(child.sr)]["name"] = child.name;

                    if (typeof(noColorRequired) == "undefined") {
                        child.color = getRecPlaylist((child.sr), classWiseScores).color;
                        gatheredNodeDict[(child.sr)]["color"] = child.color;
                    }

                    var getChildrenOutput = getChildren(childData, gatheredNodeNumbers, gatheredNodeDict, classWiseScores, noColorRequired);

                    child.children = getChildrenOutput[0];
                    gatheredNodeNumbers = getChildrenOutput[1];
                    gatheredNodeDict = getChildrenOutput[2];

                    children.push(child);
                }
            }
            return [children, gatheredNodeNumbers, gatheredNodeDict];
        }

        function genTree(nodeSr, classWiseScores, noColorRequired) {
            console.log('in function genTree');

            var node = {};
            node.sr = nodeSr;
            node.parent = null;

            var nodeData = KnowledgeMapsData.findOne({
                "sr": (node.sr)
            });
            if (nodeData == undefined) {
                return null;
            }
            node.name = nodeData.name;

            var gatheredNodeNumbers = [(node.sr)];
            var gatheredNodeDict = {};
            gatheredNodeDict[(node.sr)] = { "level": 0 };
            gatheredNodeDict[(node.sr)]["name"] = node.name;

            if (typeof(noColorRequired) == "undefined") {
                node.color = getRecPlaylist((node.sr), classWiseScores).color;
                gatheredNodeDict[(node.sr)]["color"] = node.color;
            }

            var getChildrenOutput = getChildren(nodeData, gatheredNodeNumbers, gatheredNodeDict, classWiseScores, noColorRequired);

            node.children = getChildrenOutput[0];
            gatheredNodeNumbers = getChildrenOutput[1];
            gatheredNodeDict = getChildrenOutput[2];

            return [node, gatheredNodeDict];
        }

        function generateTree(root, classWiseScores, noColorRequired) {
            console.log('in function generateTree');
            // this will generate the KnowledgeMap tree for a particular lesson given by root and the classWiseScores will provide the data to traverse

            var temp = KnowledgeMapsData.find({
                "sr": (root)
            }).fetch();
            if (temp.length > 0) {
                temp = temp[0];
            } else {
                // console.log('no map found with sr ', root);
                return 0;
            }

            // console.log("temp parent " + temp.parent);
            var tree = [];
            var rootNode = {};
            rootNode.name = temp.name;
            rootNode.sr = temp.sr;
            rootNode.parent = null;
            rootNode.children = [];
            // rootNode.parents = temp.parents;
            gatheredNodeNumbers = [(temp.sr)];

            if (typeof(noColorRequired) == "undefined") {
                rootNode.color = getRecPlaylist((root), classWiseScores).color;
            }

            if (typeof(temp.parent) != "undefined") {
                for (var j = 0; j < temp.parent.length; j++) {
                    // insideTemp = lookUpTest(temp.parent[j]);
                    insideTemp = KnowledgeMapsData.find({
                        "sr": (temp.parent[j])
                    }).fetch();
                    if (insideTemp.length > 0) {
                        insideTemp = insideTemp[0];
                    } else {
                        // console.log('no map found with sr in for loop ', temp.parent[j]);
                        continue;
                    }

                    gatheredNodeNumbers.push(temp.parent[j]);
                    var children = {};
                    children.parent = temp.parent[j];
                    children.name = insideTemp.name;
                    children.sr = insideTemp.sr;

                    if (typeof(noColorRequired) == "undefined") {
                        children.color = getRecPlaylist((temp.parent[j]), classWiseScores).color;
                    }

                    children.children = appendChildren(temp.parent[j], classWiseScores);
                    rootNode.children.push(children);
                }
            }
            tree.push(rootNode);

            if (typeof(noColorRequired) == "undefined") {
                return tree;
            } else {
                return [tree, gatheredNodeNumbers];
            }
        }

        function appendChildren(parent, classWiseScores) {
            console.log('in function appendChildren');

            // this will traverse through the whole tree of a root lesson, and find all the parents

            var root = [];
            insideParent = KnowledgeMapsData.find({
                "sr": (parent)
            }).fetch();
            if (insideParent.length > 0) {
                insideParent = insideParent[0];
            } else {
                return 0;
            }
            if (typeof(insideParent.parent) != "undefined") {
                for (var i = 0; i < insideParent.parent.length; i++) {
                    if (gatheredNodeNumbers.indexOf((insideParent.parent[i])) > -1) {
                        continue;
                    }
                    var child = {};
                    insideChild = KnowledgeMapsData.find({
                        "sr": (insideParent.parent[i])
                    }).fetch();
                    if (insideChild.length > 0) {
                        insideChild = insideChild[0];
                    } else {
                        return 0;
                    }
                    if (typeof(noColorRequired) == "undefined") {
                        child.color = getRecPlaylist((insideChild.sr), classWiseScores).color;
                    }
                    gatheredNodeNumbers.push((insideChild.sr));
                    child.parent = insideParent.name;
                    child.name = insideChild.name;
                    child.sr = insideChild.sr;
                    root.push(child);
                }
            }

            return root;
        }

        function getRecPlaylist(n, classWiseScores) {
            console.log('in function getRecPlaylist');

            // this will determine the color of a node depending on the score of the student in that lesson node

            if (typeof(classWiseScores) == "undefined") {
                console.log('classWiseScores empty');
                return {
                    "color": "blue"
                };
            }
        }

        function rankPlaylist(playlistUnordered, playlistSrName, recommendationsOnly) {
            console.log('in function rankPlaylist');

            // this will rank all the prerequisites according to the KnowledgeMapsLevels in sucha way that the nodes which are of level smaller that the others gets added to the playlist before

            var rankedPlaylistLevels = {};

            for (var level in playlistUnordered) {
                rankedPlaylistLevels[level] = {};
                for (var srIndex = 0; srIndex < playlistUnordered[level].length; srIndex++) {
                    rankedPlaylistLevels[level][(playlistUnordered[level][srIndex])] = KnowledgeMapsLevelsJSON[playlistUnordered[level][srIndex]];
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
            console.log('in function makeTree');
            console.log('from makeTree', node, classWiseScores, appendAll, recommendationsOnly);

            // tempTree = generateTree(node, classWiseScores);
            var genTreeOutput = genTree(node, classWiseScores);
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

                var recommendations = rankPlaylist(playlistUnordered, playlistSrName, recommendationsOnly);

                if (typeof(recommendationsOnly) != "undefined") {
                    return recommendations;
                }
            }
        }


    }
})();
