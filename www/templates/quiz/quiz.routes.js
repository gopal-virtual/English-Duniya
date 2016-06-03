(function() {
  'use strict';

  angular
    .module('zaya-quiz')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('quiz', {
        url: '/quiz/:type/:id',
        abstract: true,
        cache: false,
        template: '<ion-nav-view name="state-quiz"></ion-nav-view>',
        onEnter: ['orientation', 'audio', function(orientation, audio) {
          orientation.setPortrait();
          audio.stop('background');
        }],
        resolve: {
          quiz: ['$stateParams', 'Rest','$log','data','ml','$q', function($stateParams, Rest, $log, data,ml, $q) {
            if ($stateParams.type == 'litmus') {

              // var q = $q.defer();

              function tryMe(){
                // try{
                  var grade = JSON.parse(localStorage.profile).grade;
                  $log.debug('grade', grade);
                  var params = data.getTestParams(grade);
                  // var mapping = res;

                  $log.debug('params', params);
                  $log.debug('mapping', ml.mapping);
                  $log.debug('ml.dqQuiz', ml.dqQuiz);

                  var result = ml.getNextQSr(params, ml.mapping);
                  $log.debug('result', result);
                  result.test[0]['setPreviousAnswer'] = 1;
                  result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "right" };
                  $log.debug('changed result', result);

                  result = ml.getNextQSr(result.test, ml.mapping);
                  $log.debug('result', result);
                  result.test[0]['setPreviousAnswer'] = 0;
                  result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "wrong" };
                  $log.debug('changed result', result);

                  result = ml.getNextQSr(result.test, ml.mapping);
                  $log.debug('result', result);
                  result.test[0]['setPreviousAnswer'] = 1;
                  result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "right" };
                  $log.debug('changed result', result);

                  result = ml.getNextQSr(result.test, ml.mapping);
                  $log.debug('result', result);
                  result.test[0]['setPreviousAnswer'] = 0;
                  result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "wrong" };
                  $log.debug('changed result', result);

                  var rec = ml.runDiagnostic(ml.dqQuiz);
                  $log.debug('rec', rec);
                // }catch(err){
                //   console.log('err big quiz', err);
                // }
              }

              // $log.debug('unready ml.kmapsJSON', ml.kmapsJSON);
              // $log.debug('unready ml.dqJSON', ml.dqJSON);

              // $log.debug('q here', $q);

              var all_promises = [];
              if(ml.kmapsJSON == undefined){
                var promise = ml.setMLKmapsJSON;
                all_promises.push(promise);
              }
              if(ml.dqJSON == undefined){
                var promise = ml.setMLDqJSON;
                all_promises.push(promise);
              }
              if(ml.mapping == undefined){
                var promise = ml.setMapping;
                all_promises.push(promise);
              }

              $log.debug('all_promises', all_promises);

              if(all_promises.length == 0){
                tryMe();
              }else{
                $log.debug('here in else $q');
                $q.all(all_promises).then(function(){$log.debug('all promises returned');tryMe();})
              }

              // data.getDiagnosisLitmusMapping().then(function(res) {
              //   var grade = JSON.parse(localStorage.profile).grade;
              //   $log.debug('grade', grade);
              //   var params = data.getTestParams(grade);
              //   var mapping = res;

              //   $log.debug('params', params);
              //   $log.debug('mapping', mapping);
              //   $log.debug('ml.dqQuiz', ml.dqQuiz);

              //   var result = ml.getNextQSr(params, mapping);
              //   $log.debug('result', result);
              //   result.test[0]['setPreviousAnswer'] = 1;
              //   result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "right" };
              //   $log.debug('changed result', result);

              //   result = ml.getNextQSr(result.test, mapping);
              //   $log.debug('result', result);
              //   result.test[0]['setPreviousAnswer'] = 0;
              //   result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "wrong" };
              //   $log.debug('changed result', result);

              //   result = ml.getNextQSr(result.test, mapping);
              //   $log.debug('result', result);
              //   result.test[0]['setPreviousAnswer'] = 1;
              //   result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "right" };
              //   $log.debug('changed result', result);

              //   result = ml.getNextQSr(result.test, mapping);
              //   $log.debug('result', result);
              //   result.test[0]['setPreviousAnswer'] = 0;
              //   result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "wrong" };
              //   $log.debug('changed result', result);

              //   var rec = ml.runDiagnostic(ml.dqQuiz);
              //   $log.debug('rec', rec);
              // })




                // var result = {"skill":"vocabulary","qSr":65559,"test":[{"skill":"vocabulary","qSet":{"1":{"sr":65559,"answered":"right"}},"level":1,"previousAnswer":1,"actualLevel":0,"count":1},{"skill":"reading","qSet":{},"level":1,"previousAnswer":null,"actualLevel":0,"count":0},{"skill":"grammar","qSet":{},"level":1,"previousAnswer":null,"actualLevel":0,"count":0},{"skill":"listening","qSet":{},"level":1,"previousAnswer":null,"actualLevel":0,"count":0}],"actualLevel":1,"microstandard":"ELL.1.RE.V.80"};
                // var result = {"skill":"vocabulary","qSr":71369,"test":[{"skill":"vocabulary","qSet":{"1":{"sr":65559,"answered":"right"},"2":{"qSr":89971,"answered":"NA"},"3":{"sr":71369,"answered":"wrong"}},"level":1,"previousAnswer":0,"actualLevel":0,"count":2},{"skill":"reading","qSet":{},"level":1,"previousAnswer":null,"actualLevel":0,"count":0},{"skill":"grammar","qSet":{},"level":1,"previousAnswer":null,"actualLevel":0,"count":0},{"skill":"listening","qSet":{},"level":1,"previousAnswer":null,"actualLevel":0,"count":0}],"actualLevel":3,"microstandard":"ELL.1.MAL.V.09"};
                
                // $log.debug('ml.kmapsJSON', ml.kmapsJSON);
                // $log.debug('ml.dqJSON', ml.dqJSON);

                // $log.debug('result', JSON.stringify(result));
                // ml.getNextQSr(result.test, mapping)
                // .then(function(result1){
                //   $log.debug('mapping',JSON.stringify(result1));
                //   $log.debug('ml.dqQuiz', ml.dqQuiz)


                  // result1.test[0]['setPreviousAnswer'] = 0;
                  // result1.test[0]["previousAnswer"] = 0;
                  // result1.test[0]["count"]++;
                  // result1.test[0]["qSet"][result1["actualLevel"]] = { "sr": result1.qSr, "answered": "wrong" };
                  // $log.debug('after changing',JSON.stringify(result1));
                // })



                // $log.debug('params', JSON.stringify(params));
                // ml.getNextQSr(params, mapping)
                // .then(function(result){
                //   $log.debug('mapping',JSON.stringify(result));
                //   // result.test[0]['setPreviousAnswer'] = 1;
                //   result.test[0]["previousAnswer"] = 1;
                //   result.test[0]["count"]++;
                //   result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "right" };
                //   $log.debug('after changing',JSON.stringify(result));
                //   ml.getNextQSr(result.test, mapping)
                //   .then(function(result1){
                //     $log.debug('mapping',JSON.stringify(result1));
                //     // result1.test[0]['setPreviousAnswer'] = 0;
                //     result1.test[0]["previousAnswer"] = 0;
                //     result1.test[0]["count"]++;
                //     result1.test[0]["qSet"][result1["actualLevel"]] = { "sr": result1.qSr, "answered": "wrong" };
                //     $log.debug('after changing',JSON.stringify(result1));
                //     ml.getNextQSr(result1.test, mapping)
                //     .then(function(result2){
                //       $log.debug('mapping',JSON.stringify(result2));
                //     })
                //   })
                // })


                // $log.debug('params', JSON.stringify(params));
                // var get1 = ml.getNextQSr(params, mapping)
                // .then(function(result){
                //   $log.debug('mapping',JSON.stringify(result));
                //   result.test[0]['setPreviousAnswer'] = 1;
                //   result.test[0]["qSet"][result["actualLevel"]] = { "sr": result.qSr, "answered": "right" };
                //   $log.debug('after changing',JSON.stringify(result));
                //   return result;
                // }).catch(function(err){console.log('err here 1', err);});

                // var get2 = get1.then(function(result1){
                //   $log.debug('result1',JSON.stringify(result1));
                //   return ml.getNextQSr(result1.test, mapping);
                // }).catch(function(err){console.log('err here 2', err);});

                // var get3 = get2.then(function(result2){
                //   $log.debug('mapping',JSON.stringify(result2));
                //   result2.test[0]['setPreviousAnswer'] = 0;
                //   result2.test[0]["qSet"][result2["actualLevel"]] = { "sr": result2.qSr, "answered": "wrong" };
                //   $log.debug('after changing',JSON.stringify(result2));
                //   return result2;
                // }).catch(function(err){console.log('err here 3', err);});

                // var get4 = get3.then(function(result3){
                //   $log.debug('result3',JSON.stringify(result3));
                //   return ml.getNextQSr(result3.test, mapping);
                // }).catch(function(err){console.log('err here 4', err);});

                // var get5 = get4.then(function(result4){
                //   $log.debug('mapping',JSON.stringify(result4));
                // }).catch(function(err){console.log('err here 5', err);});
                  

                  // q = ml.getNextQSr(q.test, mapping);
                  // $log.debug('mapping',q);
                  // q.test[0]['setPreviousAnswer'] = [0, q];

                  // q = ml.getNextQSr(q.test, mapping);
                  // $log.debug('mapping',q);

                  // $log.debug('next bn',ml.getNextQSr(q.test, mapping));
                  // $log.debug('next bn',ml.getNextQSr(q.test, mapping));
                // });
              return {
                "node": {
                  "id": "001",
                  "content_type_name": "litmus",
                  "type": {
                    "id": "001",
                    "type": "litmus",
                  },
                  "tag": "litmus",
                  "title": "Litmus test",
                },
                "objects": [{
                  "node": {
                    "id": "106152d7-9beb-4049-8d1b-75b065e3f4cf",
                    "content_type_name": "json question",
                    "type": {
                      "id": "1ae080aa-6642-41c7-baf3-ffa50e97b942",
                      "created": "2016-05-23T08:19:51.269643Z",
                      "updated": "2016-05-23T10:07:14.240195Z",
                      "microstandard": "ELL.1.RE.V.105",
                      "is_critical_thinking": false,
                      "level": 1,
                      "answer": [1],
                      "score": 10,
                      "content": {
                        "is_multiple": false,
                        "widgets": {
                          "images": {
                            "1": "/media/ell/images/i_CN7RRZ.png"
                          },
                          "sounds": {
                            "1": "/media/ell/sounds/i-mein_885SAB.mp3",
                            "2": "/media/ell/sounds/you-aap_IO7AUZ.mp3"
                          },
                          "videos": {}
                        },
                        "tags": ["pictoaudio"],
                        "instruction": null,
                        "options": [{
                          "key": 1,
                          "option": " [[sound id=1]] "
                        }, {
                          "key": 2,
                          "option": " [[sound id=2]] "
                        }],
                        "hints": "[]"
                      },
                      "type": "choicequestion"
                    },
                    "tag": null,
                    "created": "2016-05-23T08:19:51.279304Z",
                    "updated": "2016-05-23T08:19:51.279337Z",
                    "title": "I [[img id=1]]",
                    "description": "",
                    "object_id": "1ae080aa-6642-41c7-baf3-ffa50e97b942",
                    "status": "PUBLISHED",
                    "lft": 31,
                    "rght": 32,
                    "tree_id": 31,
                    "level": 2,
                    "parent": "e0c43aa4-c661-4151-bf18-8cafd77692b9",
                    "content_type": 22,
                    "account": "1e7aa89f-3f50-433a-90ca-e485a92bbda6"
                  },
                  "objects": []
                }]
              };
            } else {
              return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('assessments', $stateParams.id).get().then(function(quiz) {
                return quiz.plain();
              });
            }
          }]
        }
      })
      .state('quiz.start', {
        url: '/start',
        views: {
          'state-quiz': {
            templateUrl: CONSTANT.PATH.QUIZ + '/quiz.start' + CONSTANT.VIEW,
            controller: 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.questions', {
        url: '/questions',
        // nativeTransitions: null,
        views: {
          'state-quiz': {
            // templateUrl : CONSTANT.PATH.QUIZ+'/quiz.questions'+CONSTANT.VIEW,
            templateUrl: function($stateParams) {
              return CONSTANT.PATH.QUIZ + '/quiz.' + $stateParams.type + '.questions' + CONSTANT.VIEW;
            },
            controller: 'QuizController as quizCtrl'
          }
        }
      })

    .state('quiz.summary', {
      url: '/summary',
      params: {
        report: null,
        quiz: null,
        summary: null
      },
      views: {
        'state-quiz': {
          templateUrl: CONSTANT.PATH.QUIZ + '/quiz.summary' + CONSTANT.VIEW,
          controller: 'QuizController as quizCtrl'
        }
      }
    })
  }
})();
