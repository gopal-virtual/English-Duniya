window.createGame = function(scope, lessons, audio, injector, log, lessonutils, loading, analytics,demoAudio) {
    'use strict';

    var Demo = scope.demo;
    var showInfoIcon = false;
    //log.debug("LESSONS ARE AMAZING",lessons);

    var DEBUG = false;
    var DEBUG2 = false;

    if(DEBUG){
        lessons = [];
        var lessonNumber = 400,
        // var lesson_data = {
            content_type = [{
                                name: "resource",
                                type: 19
                            },{
                                name: "assessment",
                                type: 26}],
            tag = ["Vocabulary","Listening","Grammar","Reading"];
        // }
        //log.debug("demoNode",demoNode);
        for (var i = 0; i < lessonNumber; i++) {
        // var content_type2 = content_type[Math.floor(Math.random() * content_type.length)]
        var content_type2 = content_type[0]
        var demoNode = {
                "node": {
                    "id": "57493ccc-b320-47c7-83ea-c2e0d9fe794f",
                    "content_type_name": content_type2.name,
                    "type": {
                        "id": "1164be82-a52f-49b0-96cf-304f64024f20",
                        "deleted": null,
                        "created": "2016-10-13T10:36:48.410655Z",
                        "updated": "2016-10-13T10:36:48.410685Z",
                        "path": "/media/ell/videos/vocabulary-nouns-person-place-animal-thing_2TKFBO.mp4",
                        "file_type": "mp4",
                        "size": 565746,
                        "score": 50
                    },
                    "tag": (function(tag){
                        return tag[Math.floor(Math.random() * tag.length)];
                    })(tag),
                    "meta": {},
                    "deleted": null,
                    "created": "2016-10-13T11:44:48.569753Z",
                    "updated": "2016-10-13T11:44:48.629761Z",
                    "title": "Vocabulary  - Nouns - person, place, animal, thing.mp4",
                    "description": "",
                    "object_id": "1164be82-a52f-49b0-96cf-304f64024f20",
                    "status": "PUBLISHED",
                    "lft": 633,
                    "rght": 634,
                    "tree_id": 1,
                    "level": 2,
                    "parent": "8e23c275-09a2-40bb-870b-76ca373a2500",
                    "content_type": content_type2.type,
                    "account": "0429fb91-4f3c-47de-9adb-609996962188",
                    "intro_sound": "/media/ell/intros/1-14.mp3",
                    "playlist_index": 0
                },
                "objects": [],
                "locked": false,
                "stars": 3
            }
            // demoNode.node["tag"] = "";
            lessons[i] = demoNode;
            //log.debug(Math.floor(Math.random() * content_type.length),tag[Math.floor(Math.random() * tag.length)])
            // lessons[i].node["content_type_name"] = content_type[Math.floor(Math.random() * content_type.length)];
            // lessons[i].node["tag"] = tag[Math.floor(Math.random() * tag.length)];
        }
        // lessons =
    }

    var game = new Phaser.Game("100", "100", Phaser.CANVAS, 'map_canvas', null, true, true, null);
    var gameSprites;
    var sprites = {};
    var temp = {};
    // var desertRegion, regionGroups.tundra, regionGroups.forest;
    var origRegions = ["desert1","desert2","ice1","ice2","forest1","forest2","peru1"];
        

    var regions = [];

    var groups = {
        "region" : {},
        "nonRegion" : {},
        "regionBg" : {},
    }
    var regionHeight = {
        "desert1" : 2201,
        "desert2" : 3165,
        "ice1" : 2930,
        "ice2" : 3070,
        "forest1" : 2873,
        "forest2" : 2768,
        "peru1" : 3747,
        // "region5" : 392,
    }
    var totalRegionHeight = 0;
    var svgPathHeight = 10000;
    var regionOffset = {};
    var tresholdOffset = 200;
    var regionRange = {};
    var points = {
        "x" : [],
        "y" : []
    };
    var regionNodes = {
        "desert1" : 17,
        "desert2" : 24,
        "ice1" : 22,
        "ice2" : 19,
        "forest1" : 20,
        "forest2" : 18,
        "peru1" : 26
    }

    // var regionNodes = {
    //     "desert1" : 2,
    //     "desert2" : 2,
    //     "ice1" : 2,
    //     "ice2" : 2,
    //     "forest1" : 2,
    //     "forest2" : 2,
    //     "peru1" : 2
    // }
    var regionPathOffset = {
        "desert1" : 320,
        "desert2" : 625,
        "ice1" : 400,
        "ice2" : 550,
        "forest1" : 250,
        "forest2" : 600,
        "peru1" : 350
    }
    var nodeColors = {
        "vocabulary" : "blue",
        "grammar" : "green",
        "listening" : "darkblue",
        "reading" : "orange"
    }
    var totalLesson = lessons.length;
    var renderedRegion = [];


        var count = 0;
        var tempTotalLesson = totalLesson;
        do{
            var index = count%origRegions.length;
            regions.push(origRegions[index]);
            tempTotalLesson -= regionNodes[origRegions[index]];
            count++;
        }while(tempTotalLesson > 0)
        log.warn('REGION needed',regions,count,tempTotalLesson);

    // var renderedRegion = [];
    // for (var key in regionNodes) {
    //     if (totalLesson > regionNodes[key]) {
    //         totalLesson -= regionNodes[key];
    //         renderedRegion.push(key);
    //     }else{
    //         renderedRegion.push(key);
    //         break;
    //     }
    // }

    var playState = {
        preload: function() {
            // crisp image rendering
            this.game.renderer.renderSession.roundPixels = true;
            //   Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);  //for Canvas, modern approach
            Phaser.Canvas.setSmoothingEnabled(this.game.context, true); //also for Canvas, legacy approach
            //   PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; //for WebGL

            this.load.image('desert1', 'img/assets/region/desert1.png');
            this.load.image('desert2', 'img/assets/region/desert2.png');
            this.load.image('ice1', 'img/assets/region/ice1.png');
            this.load.image('ice2', 'img/assets/region/ice2.png');
            this.load.image('forest1', 'img/assets/region/rainforest1.png');
            this.load.image('forest2', 'img/assets/region/rainforest2.png');
            this.load.image('peru1', 'img/assets/region/peru1.png');
            // this.load.image('region5', 'img/assets/region5.png');

            this.load.image('ribbon-tag', 'img/assets/ribbon-tag.png');
            this.load.image('star', 'img/assets/star.png');
            this.load.image('star3d', 'img/assets/star3d.png');
            this.load.image('x', 'img/assets/x.png');
            this.load.image('finger', 'img/assets/finger_point.png');

            this.load.spritesheet('correct', 'img/assets/button-correct.png',88,90);
            this.load.spritesheet('wrong', 'img/assets/button-wrong.png',88,90);
            this.load.spritesheet('node-port', 'img/assets/port-node.png',118,187);
            this.load.spritesheet('node-blue-video', 'img/assets/button-blue-video.png',88,91);
            this.load.spritesheet('node-orange-video', 'img/assets/button-orange-video.png',88,91);
            this.load.spritesheet('node-green-video', 'img/assets/button-green-video.png',88,91);
            this.load.spritesheet('node-darkblue-video', 'img/assets/button-darkblue-video.png',88,91);
            this.load.spritesheet('node-blue-practice', 'img/assets/button-blue-practice.png',88,91);
            this.load.spritesheet('node-blue-vocabulary', 'img/assets/button-blue-vocabulary.png',88,91);
            this.load.spritesheet('node-orange-vocabulary', 'img/assets/button-orange-vocabulary.png',88,91);
            this.load.spritesheet('node-darkblue-vocabulary', 'img/assets/button-darkblue-vocabulary.png',88,91);
            this.load.spritesheet('node-green-vocabulary', 'img/assets/button-green-vocabulary.png',88,91);
            this.load.spritesheet('node-orange-practice', 'img/assets/button-orange-practice.png',88,91);
            this.load.spritesheet('node-green-practice', 'img/assets/button-green-practice.png',88,91);
            this.load.spritesheet('node-darkblue-practice', 'img/assets/button-darkblue-practice.png',88,91);
            this.load.spritesheet('icon-message', 'img/assets/message_icon.png',48,35);
            this.load.spritesheet('icon-info', 'img/assets/info_icon.png',26,26);

            audio.loop('background');
        },
        create: function() {
            var _this = this;
            var game_scale = game.world.width / 360;
            // gameSprites = [
            // {
            //     "name" : "tent_animation",
            //     "region" : "desert",
            //     "x" : 85,
            //     "y" : 168,
            //     "scale" : 0.5,
            //     "mirror" : true,
            //     "animation" : {
            //         "key" : "shake"
            //     }
            // }]
            for (var key in regionHeight) {
                totalRegionHeight += regionHeight[key];
            }

            var activeLessonsLength = lessons[lessons.length - 1].locked ? lessons.length - 1 : lessons.length; 
            // if(lessons[lessons.length - 1].locked) {
            //     activeLessonsLength = lessons.length - 1;
            // }else{
            //     activeLessonsLength = lessons.length;
            // }

            if (localStorage.getItem("regionPage")) {
                var regionPage = localStorage.getItem("regionPage");
            }else{
                for (var count = 0, residue = activeLessonsLength; count < regions.length; count++) {
                    if(residue <= regionNodes[regions[count]]){
                        localStorage.setItem("regionPage",count);
                        var regionPage = count;
                        break;
                    }
                    residue = residue - regionNodes[regions[count]]
                }
                // log.debug('regionPage')
            }
            renderedRegion[0] = regions[regionPage];

            var star = [];
            var starClone = [];
            var star_x = [-22, 0, 22];
            var star_y = [-27, -35, -27];

            var first_node_index = 0, last_node_index = 0;

            function defineIndex(){
                log.info("Defining region indices ...")
                for (var i = 0; i <= regionPage; i++) {

                    if (i==0) {
                        first_node_index = 0;
                    }else {
                        first_node_index += regionNodes[regions[i-1]] ;
                    }
                }
                last_node_index = first_node_index + regionNodes[regions[regionPage]] - 1;
                // if (regionPage != 0) {
                //     first_node_index = first_node_index+1;
                // }

            }

            function addGroups(region){
                log.info("Creating Groups ...")
                for (var i = renderedRegion.length - 1; i >= 0; i--) {
                    groups.regionBg[region[i]] = game.add.group();
                }
                groups.nonRegion["nodePath"] = game.add.group();
                for (var i = renderedRegion.length - 1; i >= 0; i--) {
                    groups.region[region[i]] = game.add.group();
                }

                if (Demo.getStep() == 1) {
                    groups.nonRegion["hud"] = game.add.group();
                    groups.nonRegion["demoOverlay"] = game.add.group();
                    groups.nonRegion["nodeTags"] = game.add.group();
                    groups.nonRegion["nodes"] = game.add.group();
                    groups.nonRegion["stars"] = game.add.group();
                    groups.nonRegion["demoNodeOverlay"] = game.add.group();
                }else  {
                    groups.nonRegion["demoOverlay"] = game.add.group();
                    groups.nonRegion["nodeTags"] = game.add.group();
                    groups.nonRegion["nodes"] = game.add.group();
                    groups.nonRegion["stars"] = game.add.group();
                    groups.nonRegion["hud"] = game.add.group();
                }
                groups.nonRegion["unlockAnim"] = game.add.group();
                groups.nonRegion["starClone"] = game.add.group();

            }


            function renderHud(totalStars){
                log.info("Rendering HUD ...",scope.mediaSyncStatus);
                // totalStars=108;
                // //log.debug("I am making HUD. Wohoooo");
                var hudWidth = 185;
                // //log.debug("Stars ",scope)
                switch(totalStars.toString().length) {
                    case 1:
                        hudWidth = 145;
                        break;
                    case 2:
                        hudWidth = 165;
                        break;
                    case 3:
                        hudWidth = 185;
                        break;
                }

                var graphics = game.add.graphics(0,0);
                graphics.beginFill(0x968B7B, 1);
                graphics.drawRoundedRect(-20,-14,hudWidth,84,10)
                graphics.endFill();
                graphics.beginFill(0xF9F2E8, 1);
                //shadow color #968B7B
                // //log.debug("Hakuna Matata",hudWidth);




                graphics.drawRoundedRect(-20,-20,hudWidth,84,10);
                graphics.endFill();
                // graphics.beginFill(0x968B7B, 1);
                // graphics.drawRoundedRect(game.camera.width - 86,-14,100,84,10);
                // graphics.endFill();
                // graphics.beginFill(0xF9F2E8, 1);
                // graphics.drawRoundedRect(game.camera.width - 86,-20,100,84,10);
                // graphics.endFill();




                var starSprite = groups.nonRegion.stars.create(10,55,'star3d');
                starSprite.anchor.setTo(0,1);
                var spriteX = groups.nonRegion.stars.create(62,55,'x');
                spriteX.anchor.setTo(0,1);
                var starText = game.add.text(90, 65, totalStars, { font: "48px kg_primary_penmanship_2Rg", fill: "#FDB724", wordWrap: false, align: "center"});
                starText.setShadow(0, 3, 'rgba(215,151,40,1)', 0);
                starText.anchor.setTo(0,1);
                // var messageIcon = groups.nonRegion.stars.create(game.camera.width - 18,55,'icon-message');
                // messageIcon.anchor.setTo(1,1);
                // var infoIcon = groups.nonRegion.stars.create(game.camera.width - 86,64,'icon-info');
                // infoIcon.anchor.setTo(0.5,0.5);
              // //log.debug("HRO",groups.nonRegion)
                groups.nonRegion.hud.add(graphics);
                groups.nonRegion.hud.add(starSprite);
                groups.nonRegion.hud.add(spriteX);
                groups.nonRegion.hud.add(starText);
                // groups.nonRegion.hud.add(messageIcon);
                // if(showInfoIcon){
                //   groups.nonRegion.hud.add(infoIcon);
                // }
                groups.nonRegion.hud.fixedToCamera = true;
                // //log.debug("This is my hud",graphics);


              //Render messages

            }

            function renderDemoOverlay(){
                log.info("Rendering Demo Overlay ...")
                //log.debug('graphics',game.camera.y)
                var graphics = game.add.graphics(0,0);
                graphics.beginFill(0x000000, 0.8);
                graphics.drawRect(0,0,game.camera.width,game.camera.height);
                graphics.endFill();
                groups.nonRegion.demoOverlay.add(graphics);
                temp['demoFinger'] = groups.nonRegion.demoNodeOverlay.create(0.5*game.camera.width, 0.3*game.camera.height, 'finger');
                temp.demoFinger.anchor.setTo(0.5);
                temp.demoFinger.scale.setTo(-0.5,0.5);
                temp.demoFinger.angle = 180;
                groups.nonRegion.demoOverlay.fixedToCamera = true;
                groups.nonRegion.demoNodeOverlay.fixedToCamera = true;
                // game.add.tween(demoFinger).from({alpha: 0}, 400, Phaser.Easing.Cubic.Out, true, 800).loop(true);

                // game.add.tween(demoFinger).to({x: [0.5*game.camera.width,0.5*game.camera.width], y: [0.6*game.camera.height,0.5*game.camera.height] }, 1000, Phaser.Easing.Back.Out, true).loop(true);
                // game.add.tween(demoFinger).to({angle: "270", x: [0.5*game.camera.width,0.8*game.camera.width], y: [0.6*game.camera.height,0.5*game.camera.height] }, 1000, Phaser.Easing.Linear.None, true).loop(true);
                //log.debug("SOUND",audio)
                log.debug("demoAudio",demoAudio);
                audio.player.play(demoAudio)
            }

            function renderWorld(region){
                log.info("Creating World ...")
                game.input.maxPointers = 1;
                var totalRegionHeight = 0;
                var tempRegionHeight = 0;
                for (var i = region.length - 1; i >= 0; i--) {
                    totalRegionHeight += regionHeight[region[i]];
                    regionRange[region[i]] = {};
                    regionRange[region[i]]["upperLimit"] = tempRegionHeight;
                    regionOffset[region[i]] = tempRegionHeight;
                    tempRegionHeight += regionHeight[region[i]];
                    regionRange[region[i]]["lowerLimit"] = tempRegionHeight;
                    regionRange[region[i]]["upperTreshold"] = regionRange[region[i]].upperLimit + game.camera.height + tresholdOffset;
                    regionRange[region[i]]["lowerTreshold"] = regionRange[region[i]].lowerLimit - game.camera.height - tresholdOffset;
                }
                game.world.setBounds(0, 0, game.width, totalRegionHeight);
                game.forceSingleUpdate = true;
            }

            function renderRegion(region){
                analytics.log({
                  name : 'MAP',
                  type : 'REGION',
                },{
                  time : new Date(),
                  region : regions[localStorage.getItem("regionPage")]
                },JSON.parse(localStorage.getItem('profile'))._id);
                log.info("Rendering Regions ...")
                for (var i = region.length - 1; i >= 0; i--) {
                    groups.regionBg[region[i]].position.set(0, 0 + regionOffset[region[i]]);
                    groups.region[region[i]].position.set(0, 0 + regionOffset[region[i]]);
                    var background = groups.regionBg[region[i]].create(0, 0, region[i]);
                    background.scale.setTo(game_scale, 1);
                }

            }

            function fetchMapPath (region,points){
                log.info("Fetching RAW path ...")
                var fetchMapRequest = $.get("img/assets/region/path/"+region[0]+"-path.svg", function(data) {
                    var x = [];
                    var y = [];
                    var path = data.getElementById("mappathid");
                    for (var i = path.getTotalLength() - 1; i >= 0 ; i-=75) {
                        var pathPoint = path.getPointAtLength(i);
                        x.push(parseInt(pathPoint.x*game_scale));
                        y.push(parseInt(pathPoint.y) + regionPathOffset[region]);
                    }
                    points.x = x.reverse();
                    points.y = y.reverse();
                    //log.debug("These are the points",points)
                    // log.debug("original points.x",points.x)
                    // log.debug("original points.y",points.y)
                });
                return fetchMapRequest;

            }

            function renderNodePath(region,points){
                log.info("Rendering traversal path ...")
                if (localStorage.demo_flag == 1) {
                    return;
                }
                var increment = 1 / game.world.height;
                var bmd = game.add.bitmapData(game.width, game.world.height);
                log.debug(temp.activeLessonPosY)
                for (var j = 0; j < 1; j += increment) {
                    var posx = game.math.catmullRomInterpolation(points.x, j);
                    var posy = game.math.catmullRomInterpolation(points.y, j);
                    if (temp.activeLessonPosY > posy) {
                        break;
                    }
                    bmd.rect(posx-4, posy, 8, 8, '#FFFFFF');
                }
                groups.nonRegion.nodePath.create(0,0,bmd);
            }


            // function renderSprites(region,gameSprites){
            //     log.info("Rendering Sprites ...")
            //     for (var i = 0; i < gameSprites.length; i++) {
            //         if (region.indexOf(gameSprites[i].region) == -1) {
            //             continue;
            //         }

            //         if (gameSprites[i].background == true) {
            //             var gameSprite = groups.regionBg[gameSprites[i].region].create(gameSprites[i].x * game_scale, gameSprites[i].y, gameSprites[i].name);
            //         }else{
            //             var gameSprite = groups.region[gameSprites[i].region].create(gameSprites[i].x * game_scale, gameSprites[i].y, gameSprites[i].name);
            //         }
            //         gameSprite.anchor.setTo(0.5);
            //         if (gameSprites[i].scale) {
            //             if (!Array.isArray(gameSprites[i].scale)){
            //                 gameSprite.scale.setTo(gameSprites[i].mirror?-gameSprites[i].scale:gameSprites[i].scale, gameSprites[i].scale);
            //             }else{
            //                 gameSprite.scale.setTo(gameSprites[i].mirror?-gameSprites[i].scale[0]:gameSprites[i].scale[0], gameSprites[i].scale[1]);
            //             }
            //         }else {
            //             gameSprite.scale.setTo(gameSprites[i].mirror?-1:1,1);
            //         }
            //         if (gameSprites[i].anchor) {
            //             if (!Array.isArray(gameSprites[i].anchor)){
            //                 gameSprite.anchor.setTo(gameSprites[i].anchor);
            //             }else{
            //                 gameSprite.anchor.setTo(gameSprites[i].anchor[0],gameSprites[i].anchor[1]);
            //             }
            //         }
            //         if (gameSprites[i].angle) {
            //             gameSprite.angle = gameSprites[i].angle;
            //         }
            //         if (gameSprites[i].animation) {
            //             gameSprite.animations.add(gameSprites[i].animation.key);
            //             gameSprite.animations.play(gameSprites[i].animation.key,gameSprites[i].animation.fps?gameSprites[i].animation.fps:20,gameSprites[i].animation.loop != false);
            //         }
            //         if (gameSprites[i].id) {
            //             sprites[gameSprites[i].id] = gameSprite;
            //         }
            //     }
            // }

            // sand particles
            // function renderParticles(){

            //     for (var i = 0; i < 100; i++) {
            //         var s = game.add.sprite(game.world.randomX, game.rnd.between(regionOffset.desert, game.world.height), 'particle' + game.rnd.between(1, 3));
            //         s.scale.setTo(game.rnd.between(1, 2) / 20);
            //         game.physics.arcade.enable(s);
            //         s.body.velocity.x = game.rnd.between(-200, -550);
            //         s.body.velocity.y = game.rnd.between(50, 70);
            //         s.autoCull = true;
            //         s.checkWorldBounds = true;
            //         s.events.onOutOfBounds.add(_this.resetSprite, _this);
            //     }
            //     // snow particles
            //     for (var i = 0; i < 100; i++) {
            //         var s = game.add.sprite(game.world.randomX, game.rnd.between(regionOffset.tundra, regionOffset.desert - 200), 'snow' + game.rnd.between(1, 2));
            //         s.scale.setTo(game.rnd.between(1, 2) / 10);
            //         game.physics.arcade.enable(s);
            //         s.body.velocity.x = game.rnd.between(-50, -200);
            //         s.body.velocity.y = game.rnd.between(50, 70);
            //         s.autoCull = true;
            //         s.checkWorldBounds = true;
            //         s.events.onOutOfBounds.add(_this.resetSnowSprite, _this);
            //     }
            // }

            // var stars = this.game.add.group();
            function createStars(count, x, y) {
                var star = [];
                for (var i = 0; i < count; i++) {
                    star[i] = groups.nonRegion.stars.create(x[0] + x[i + 1], y[0] + y[i + 1], 'star');
                    star[i].anchor.setTo(0.5, 0.5);
                    star[i].scale.setTo(0.7, 0.7);
                    if (i == 0) {
                        star[i].angle = -30;
                    }else if(i == 2){
                        star[i].angle = 30;
                    }
                }
                return star;
            }

            function lessonType(lesson, test) {
                if (!lesson.locked) {
                    return lesson.tag.toLowerCase() != 'no tag' ? lesson.tag.toLowerCase() : '';
                } else {
                    return ''
                }
            };


            function renderNodesByML(region){
                log.info("Rendering nodes ...")
                //log.debug("LESSONS",lessons);
                //log.debug("posx",points.x);
                //log.debug("posy",points.y);
                // var j = 0;
                // log.debug  ("FIRST_NODE",first_node_index,"LAST_NODE",last_node_index);
                for (var i = first_node_index, distance = 1 / (last_node_index-first_node_index), j =0; i < lessons.length; i++, j+=distance) {
                    //log.debug("J Lo",i.j)
                    if (lessons[i].locked) {
                        //log.debug("lesson locked")
                        continue;
                    }
                    //log.debug("BREAK DANCE FLAG MAHN",i, last_node_index+1)


                    if (i > last_node_index) {
                        if(lessons[lessons.length - 1].locked) {
                            temp["activeLessonKey"] = lessons.length - 2;
                        }else{
                            temp["activeLessonKey"] = lessons.length -1;
                        }
                        temp["activeLessonPosY"] = -1;
                        temp["activeLessonPosX"] = -1;
                        log.debug("Active node is out of bounds. It has been set to the las lesson in the array i.e. ",temp.activeLessonKey);
                        break;
                    }
                    // log.debug ("BABUSHKA")
                    // log.debug("node indeices",i,distance,j)
                    var posx = game.math.catmullRomInterpolation(points.x, j);
                    var posy = game.math.catmullRomInterpolation(points.y, j);
                    var currentLesson = lessons[i].node;
                    //log.debug("pos",posx,posy);

                    var nodeTag = groups.nonRegion.nodeTags.create(posx,posy+50,'ribbon-tag');
                    nodeTag.anchor.setTo(0.5);
                    nodeTag.scale.setTo(0.8);
                    var nodeTagText = game.add.text(posx, posy+50, i+1, { font: "18px kg_primary_penmanship_2Rg", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: nodeTag.width, align: "center"});
                    nodeTagText.anchor.set(0.5);
                    groups.nonRegion.nodeTags.add(nodeTagText);
  




                    var node = game.make.button(posx, posy, 'node-' +nodeColors[lessons[i].node.tag.toLowerCase()]+'-'+ lessonutils.resourceType(lessons[i]), false, this, 1,0,1,0);
                    
                    node.anchor.setTo(0.5);
                    node.scale.setTo(0.8);
                    node.inputEnabled = true;
                    node.currentLesson = currentLesson;
                    node.type = lessonType(currentLesson, i);
                    node.events.onInputUp.add(
                        function(currentLesson, game, posy, i, temp, currentObject) {
                            return function() {

                                if (Demo.getStep() == 1) {
                                    Demo.setStep(2);
                                }
                                audio.play('press');

                                var displacement = game.kineticScrolling.velocityY > -30 && game.kineticScrolling.velocityY < 30;
                                if (!currentLesson.locked && displacement) {
                                    log.debug('POSITION',posy,node.y+node.height)
                                    localStorage.setItem('currentPosition', node.y - node.height/2);
                                    var currentPosition = {
                                        "x": game.input._x,
                                        "y": game.input._y,
                                    }
                                    var animateStarFlag = {
                                        isCurrentNode : temp.activeLessonKey==i,
                                        clickedNodeStar : (function(){
                                            return typeof(lessons[i].stars) == "undefined"?0:lessons[i].stars;
                                        })(),
                                        clickedNode : i
                                    }
                                    //log.debug("hello animatestar",animateStarFlag)
                                    localStorage.setItem("animateStarFlag",JSON.stringify(animateStarFlag));
                                    scope.$emit('openNode', currentObject);
                                } else if (currentLesson.locked && displacement) {
                                    audio.play('locked');
                                } else {}
                            }
                        }(currentLesson, game, posy, i, temp, lessons[i])
                    );
                    node.type = lessonType(currentLesson, i);
                    groups.nonRegion.nodes.add(node);
                    if((i==lessons.length-2 && lessons[lessons.length-1].locked) || (i==lessons.length-1)){
                        temp["activeLessonKey"] = i;
                        temp["activeLessonPosY"] = posy;
                        temp["activeLessonPosX"] = posx;

                        log.debug('ACTIVE LESSON')
                        scrollTo(posy - game.height/2);
                        log.debug('ACTIVE LESSON')


                        if (DEBUG2 == true){
                            log.debug()
                            var nodeCorrect = game.make.button(posx+60,posy,'correct',stateRedraw,this,0,0,1,0);
                            nodeCorrect.anchor.setTo(0.5);
                            nodeCorrect.scale.setTo(0.4);
                            groups.nonRegion.nodeTags.add(nodeCorrect);
                            var nodeWrong = game.make.button(posx+100,posy,'wrong',stateRedraw,this,0,0,1,0);
                            nodeWrong.anchor.setTo(0.5);
                            nodeWrong.scale.setTo(0.4);
                            groups.nonRegion.nodeTags.add(nodeWrong);
                            log.debug("Hello ya ya")
                        }

                        if (Demo.getStep() != 1) {
                            temp["nodeWobbleTween"] = game.add.tween(node.scale).to({ x: [0.8,1,0.8], y: [0.8,1,0.8] }, 1500, Phaser.Easing.Back.Out, true, 400).loop(true);
                        }else{
                            var fingerTween = game.add.tween(temp.demoFinger).to({x: [0.5*game.camera.width,0.5*game.camera.width, 0.5*game.camera.width], y: [0.3*game.camera.height,0.5*game.camera.height, 0.3*game.camera.height] }, 1000, Phaser.Easing.Back.Out, true).loop(true);
                            log.debug("Not a demo I guess", fingerTween)
                            fingerTween.onStart.add(pressButton,this);
                            fingerTween.onLoop.add(pressButton,this);
                            function pressButton(){
                                // node.setFrames(0,1,1);
                                // log.debug("pressed");
                                // setTimeout(function(){
                                //     node.setFrames(0,0,1);
                                //     log.debug("not pressed")
                                // },100)
                                setTimeout(function(){
                                    node.setFrames(0,1,1);
                                    // log.debug("pressed");
                                    setTimeout(function(){
                                        node.setFrames(0,0,1);
                                        // log.debug("not pressed")
                                    },150)
                                },200)
                            }
                            // var flag = 0;
                                // flag++;
                                // if(flag%2 ==0) {
                                // }else{
                                // }
                        }
                    }

                    if (!lessons[i].locked && lessons[i].stars >= 0) {
                        if (lessons[i].stars == 0) {
                            createStars(0, $.merge([posx], star_x), $.merge([posy], star_y));
                        } else if (lessons[i].stars == 1) {
                            createStars(1, $.merge([posx], star_x), $.merge([posy], star_y));
                        } else if (lessons[i].stars == 2) {
                            createStars(2, $.merge([posx], star_x), $.merge([posy], star_y));
                        } else if (lessons[i].stars == 3) {
                            createStars(3, $.merge([posx], star_x), $.merge([posy], star_y));
                        } else {}
                    }
                }


                if(!localStorage.currentPosition){
                    localStorage.setItem('currentPosition', (posy - game.height / 2));
                    var currentPosition = {
                        "x": game.input._x,
                        "y": game.input._y,
                    }
                }
                // if(temp.activeLessonKey == undefined){
                //     temp["activeLessonKey"] = -1;
                // }

                //log.debug("show port node? ",regionPage, regions.length-1, temp["activeLessonKey"], regionPage < regions.length-1 && temp.activeLessonKey == -1);
            }

            function animateStar(lessonKey){
                log.info("Animating stars ...")
                //log.debug('animate star',lessons, lessonKey)
                var promise = new Promise(function(resolve,reject){
                    var lessonTag =  {
                        "vocabulary" : 1,
                        "reading" : 2,
                        "grammar" : 3,
                        "listening" : 4
                    }
                    //log.debug('i got stars', lessonKey)
                    //log.debug('J2',1-(lessonKey)/(last_node_index-first_node_index));
                    //log.debug("last",last_node_index,"first",first_node_index)
                    //log.debug('distance2',1/(last_node_index-first_node_index))
                    // log.debug("points.x",points.x)
                    // log.debug("points.y",points.y)

                    // log.debug("last_node_index",last_node_index)
                    // log.debug("first_node_index",first_node_index)
                    // log.debug("lessonKey",lessonKey)
                    // log.debug("lessonKey",lessonKey-first_node_index +1)
                    // log.debug("star index",(lessonKey-first_node_index+1),1/(last_node_index-first_node_index),(lessonKey-first_node_index+1)/(last_node_index-first_node_index))
                    var posx = game.math.catmullRomInterpolation(points.x, (lessonKey-first_node_index)/(last_node_index-first_node_index));
                    var posy = game.math.catmullRomInterpolation(points.y, (lessonKey-first_node_index)/(last_node_index-first_node_index));
                    // log.debug("posx",posx)
                    // log.debug("posy",posy)
                    //log.debug("LOG KYA KAHENGE",posx,posy)
                    var starCloneTween = [];
                    for (var i = 0; i < lessons[lessonKey].stars; i++) {
                            starClone[i] = groups.nonRegion.starClone.create((posx + star_x[i])*game_scale, posy + star_y[i], 'star3d');
                            starClone[i].anchor.setTo(0.5, 0.5);
                            starCloneTween[i] = {};
                            starCloneTween[i]["pos"] = game.add.tween(starClone[i]).to( { x: 20, y: parseInt(game.camera.y)-100}, 1000, Phaser.Easing.Exponential.InOut);
                            starCloneTween[i]["scale"] = game.add.tween(starClone[i].scale).from( { x: 0, y: 0 }, 800, Phaser.Easing.Bounce.Out,false,i*800);
                            starCloneTween[i]["scalePos"] = game.add.tween(starClone[i]).to( { x: "0", y: "0" }, 800, Phaser.Easing.Cubic.Out,false,i*800);
                            starCloneTween[i]["rotate"] = game.add.tween(starClone[i]).to( { angle: 450 }, 3000, Phaser.Easing.Quadratic.Out);
                            starCloneTween[i].scale.chain(starCloneTween[i].pos);
                            starCloneTween[i].scale.start();
                            starCloneTween[i].scalePos.start();
                            starCloneTween[i].rotate.start();
                            function playStarAudio() {
                                audio.play('star_hud');
                            }
                            if (i == lessons[lessonKey].stars - 1) {
                                starCloneTween[i].rotate.onComplete.add(destroyStar,this);
                                function destroyStar() {
                                    groups.nonRegion.starClone.callAll('kill');
                                    resolve(true);
                                }
                            }
                            starCloneTween[i].scale.onStart.add(playStarAudio,this);

                    }
                });
                return promise;

            }

            function renderPortNodes(portType){
                log.info('Rendering portal ...')

                if (portType != "prev" && portType != "next") {
                    log.warn("Not a valid port type. Taking 'prev' as default");
                    portType = "prev";
                }
                var port = game.add.button(game.world.centerX, portType=="prev"?game.world.height-80:150, 'node-port', function(){
                    loading.show();
                    analytics.log({
                      name : 'MAP',
                      type : portType == "prev"?"PORT_PREV":"PORT_NEXT",
                    },{
                      time : new Date(),
                    },JSON.parse(localStorage.getItem('profile'))._id);
                    if (portType =="next" && regionPage < regions.length) {
                        localStorage.setItem('regionPage',parseInt(regionPage)+1);
                        localStorage.setItem('currentPosition', 4000);
                    }else if (portType == "prev" && regionPage > 0) {
                        localStorage.setItem('regionPage',parseInt(regionPage)-1);
                        localStorage.setItem('currentPosition', 0);
                    }
                    // window.location.reload();
                    stateRedraw();

                }, this, 0,0,1,0);
                port.scale.setTo(portType=="prev"?0.6:0.8);
                port.anchor.setTo(0.5)
            }

            // function animateUnlock(lockedNode) {
            //     var randomX = 100;
            //     var randomY = 100;
            //     var unlockAnimTween = {};
            //     var lockVibrateArray = {
            //         "x" : [],
            //         "y" : []
            //     }
            //     for (var i = 0; i < 100; i++) {
            //         randomY = game.rnd.between(-1, 1);
            //         randomX = game.rnd.between(-1, 1);
            //         lockVibrateArray.x[i] = temp.activeLessonPosX + randomX;
            //         lockVibrateArray.y[i] = temp.activeLessonPosY + randomY;
            //     }
            //     unlockAnimTween["shakeLock"] = game.add.tween(lockedNode.lock).to({ x: lockVibrateArray.x, y: lockVibrateArray.y}, 1000, Phaser.Easing.Linear.None,true);
            //     unlockAnimTween["scaleLock2"] = game.add.tween(lockedNode.lock.scale).to({x:0.4, y: 0.4},1000,Phaser.Easing.Bounce.Out);
            //     unlockAnimTween["lockGlowScale"] = game.add.tween(lockedNode.glow.scale).to({x:1,y:1},400,Phaser.Easing.Exponential.Out,true,1000);
            //     unlockAnimTween["hideOverlay"] = game.add.tween(lockedNode.overlay).to({alpha: 0},400,Phaser.Easing.Exponential.In,true,1800);
            //     unlockAnimTween["shrinkLock"] = game.add.tween(lockedNode.lock.scale).to({x:0,y:0},100,Phaser.Easing.Exponential.In);
            //     unlockAnimTween["hideGlow"] = game.add.tween(lockedNode.glow).to({alpha: 0},800,Phaser.Easing.Exponential.In);
            //     unlockAnimTween.shakeLock.chain(unlockAnimTween.scaleLock2);
            //     unlockAnimTween.lockGlowScale.chain(unlockAnimTween.hideGlow, unlockAnimTween.shrinkLock, unlockAnimTween.hideOverlay);
            //     unlockAnimTween.shakeLock.onComplete.add(unlockIt,this);
            //     unlockAnimTween.shrinkLock.onComplete.add(unlockComplete,this);
            //     function unlockIt(){
            //         lockedNode.lock.animations.add("unlock");
            //         lockedNode.lock.animations.play("unlock",30);
            //         lockedNode.confetti.start(true,5000,null,20);
            //     }

            //     function unlockComplete() {
            //         temp.nodeWobbleTween.resume();
            //         setTimeout(function(){
            //             groups.nonRegion.unlockAnim.callAll("kill");
            //         },3000);
            //     }
            // }

            // function hideActiveNode(lockedNode){

            //     temp.nodeWobbleTween.pause();
            //     lockedNode["overlay"] = groups.nonRegion.unlockAnim.create(temp.activeLessonPosX,temp.activeLessonPosY,'node-vocabulary');
            //     lockedNode["glow"] = groups.nonRegion.unlockAnim.create(temp.activeLessonPosX,temp.activeLessonPosY,'lock-glow');
            //     lockedNode["confetti"] = game.add.emitter(temp.activeLessonPosX,temp.activeLessonPosY,50);
            //     lockedNode["lock"] = groups.nonRegion.unlockAnim.create(temp.activeLessonPosX,temp.activeLessonPosY,'lock-unlock');
            //     lockedNode.overlay.anchor.setTo(0.5,0.5);
            //     lockedNode.lock.anchor.setTo(0.5,0.5);
            //     lockedNode.lock.scale.setTo(0.2,0.2);
            //     lockedNode.glow.anchor.setTo(0.5,0.5);
            //     lockedNode.glow.scale.setTo(0,0);
            //     lockedNode.confetti.makeParticles('paper-confetti',[0,1,2,3,4],50);
            //     lockedNode.confetti.minParticleSpeed.set(-800, -800);
            //     lockedNode.confetti.maxParticleSpeed.set(800, 800);
            //     groups.nonRegion.unlockAnim.add(lockedNode.confetti);
            // }

            // function newNodeUnlock() {
            //     var lockedNode = {};
            //     hideActiveNode(lockedNode);
            //     animateStar(temp.lessonFromQuizKey)
            //     .then(function(){
            //         if (game.camera.y+game.height/2 > temp.activeLessonPosY) {
            //             scrollTo(temp.activeLessonPosY);
            //         }
            //         animateUnlock(lockedNode);
            //     });
            // }

            function scrollTo(limitY){
                log.info("ACTIVE Auto Scrolling ...",limitY)
                game.camera.y = limitY;
                // game.add.tween(game.camera).to({y:limitY},300,Phaser.Easing.Quadratic.InOut,true,800);
            }

            function cameraInit(){
                log.info("Initializing camera ...")
                game.kineticScrolling = game.plugins.add(Phaser.Plugin.KineticScrolling);
                game.kineticScrolling.configure({
                    kineticMovement: true,
                    timeConstantScroll: 325, //really mimic iOS
                    horizontalScroll: false,
                    verticalScroll: Demo.getStep()!=1,
                    horizontalWheel: false,
                    verticalWheel: true,
                    deltaWheel: 400
                });
                game.kineticScrolling.start();
            }

            // function scrollTo() {
            //     game.camera.y = localStorage.getItem('currentPosition') ? parseInt(localStorage.getItem('currentPosition')) : parseInt(((~~game.world.height / game.height) - 1) * game.height);
            // }

            function gameStart(){
                log.info("Powering Up PHASER BAM! BAM! ...")
                defineIndex();
                addGroups(renderedRegion);
                renderWorld(renderedRegion);
                cameraInit();
                // setTimeout(function() {
                // cameraInit();
                    // gameRestart();
                // }, 10000);
                renderRegion(renderedRegion);
                var fetchMapRequest = fetchMapPath(renderedRegion,points);
                fetchMapRequest.then(function(){
                    scope.$emit('removeLoader', true);
                    if (Demo.getStep() == 1) {
                        renderDemoOverlay();
                    }
                    renderNodesByML(renderedRegion);
                    renderNodePath(renderedRegion,points);
                    // scrollTo();
                    log.debug("Port Node Flag",regionPage,regions.length-1,temp.activeLessonKey,regionPage < regions.length-1,regionPage < regions.length-1 && temp.activeLessonKey == -1)
                    if(regionPage < regions.length-1 && temp.activeLessonKey > last_node_index){
                        renderPortNodes("next");
                    }
                    if(regionPage > 0){
                        renderPortNodes("prev");
                    }
                    //log.debug('graphics',game.camera)
                    // renderHud(scope.totalstars);
                    //log.debug("Stars Demo",scope.demo.getStep())
                    var animateStarFlag = JSON.parse(localStorage.getItem("animateStarFlag"));
                    if (animateStarFlag) {
                        //log.debug("star in lesson", lessons[animateStarFlag.clickedNode].stars);
                        //log.debug("animateStarFlag",animateStarFlag);
                        log.debug("animateStar condition 1");
                        if (lessons[animateStarFlag.clickedNode] && lessons[animateStarFlag.clickedNode].stars && lessons[animateStarFlag.clickedNode].stars > animateStarFlag.clickedNodeStar) {
                            //log.debug("Hey brother");
                            log.debug("animateStar condition 2");
                            scope.$emit('animateStar');
                            setTimeout(function(){
                                log.debug("animateStar condition timeout");
                                animateStar(animateStarFlag.clickedNode).then(function(){
                                    if (temp["activeLessonKey"] == -1) {
                                        log.debug('active lesson kry out of bounds');
                                        scrollTo(0);
                                    }
                                    localStorage.removeItem("animateStarFlag");
                                })
                            },800)
                        }
                    }
                },function(error){
                    log.error("Failed to fetchMapPath",error);
                })
            }
            gameStart();



            function stateRedraw(){
                game.state.restart(true,true);
                log.debug("state restarted")
            }


        },

        // init: function() {
        //     game.kineticScrolling = game.plugins.add(Phaser.Plugin.KineticScrolling);
        //     game.kineticScrolling.configure({
        //         kineticMovement: true,
        //         timeConstantScroll: 325, //really mimic iOS
        //         horizontalScroll: false,
        //         verticalScroll: Demo.getStep()!=1,
        //         horizontalWheel: false,
        //         verticalWheel: true,
        //         deltaWheel: 400
        //     });
        //     game.camera.y = localStorage.getItem('currentPosition') ? parseInt(localStorage.getItem('currentPosition')) : parseInt(((~~this.world.height / this.game.height) - 1) * this.game.height);

        // },
        // resetSprite: function(sprite) {
        //     sprite.x = this.game.world.bounds.right;
        //     if (sprite.y > this.world.height)
        //         sprite.y = regionOffset.desert;
        // },
        // resetSnowSprite: function(sprite) {
        //     sprite.x = this.game.world.bounds.right;
        //     if (sprite.y > regionOffset.desert)
        //         sprite.y = regionOffset.tundra;
        // },

        // optimize: function(camera,regionRange){
        //     var lowerCameraBoundary, upperCameraBoundary;
        //     // var i = 0;
        //     for (var i = 0; i < renderedRegion.length; i++) {
        //         if(regionRange[renderedRegion[i]].lowerLimit > camera.y && regionRange[renderedRegion[i]].upperLimit < camera.y ){
        //             if (camera.y < regionRange[renderedRegion[i]].upperTreshold && i < renderedRegion.length - 1) {
        //                 if (groups.region[renderedRegion[i+1]].countLiving() == 0){

        //                     groups.regionBg[renderedRegion[i + 1]].callAll('revive');
        //                     groups.region[renderedRegion[i + 1]].callAll('revive');
        //                 }

        //             } else if (camera.y > regionRange[renderedRegion[i]].upperTreshold && i < renderedRegion.length - 1){
        //                 if (groups.region[renderedRegion[i + 1]].countLiving() != 0){

        //                     groups.regionBg[renderedRegion[i + 1]].callAll('kill');
        //                     groups.region[renderedRegion[i + 1]].callAll('kill');
        //                 }
        //             }

        //             if ((camera.y + camera.height) > regionRange[renderedRegion[i]].lowerTreshold  && i > 0) {
        //                 if (groups.region[renderedRegion[i - 1]].countLiving() == 0){

        //                     groups.regionBg[renderedRegion[i - 1]].callAll('revive');
        //                     groups.region[renderedRegion[i - 1]].callAll('revive');
        //                 }
        //             } else if ((camera.y + camera.height) < regionRange[renderedRegion[i]].lowerTreshold  && i > 0){
        //                 if (groups.region[renderedRegion[i - 1]].countLiving() != 0){

        //                     groups.regionBg[renderedRegion[i - 1]].callAll('kill');
        //                     groups.region[renderedRegion[i - 1]].callAll('kill');
        //                 }
        //             }
        //         }

        //     }

        // },
        // interactiveAnimate : function() {
        //     if (game.camera.y + 200 < regionOffset.tundra && game.camera.y + 200 > regionOffset.tundra - 360) {
        //         // game.debug.spriteInfo(sprites.plantLeft, 20, 32);
        //         if (temp.plantLeftX == undefined && temp.plantRightX ==undefined) {
        //                 temp["plantLeftX"] = sprites.plantLeft.x;
        //                 temp["plantRightX"] = sprites.plantRight.x;
        //         }
        //        sprites.plantLeft.x = temp.plantLeftX - (180 * (regionOffset.tundra - game.camera.y - 200)/360);
        //        sprites.plantRight.x = temp.plantRightX + (180 * (regionOffset.tundra - game.camera.y - 200)/360);
        //     }

        //     if (game.camera.y + 100 < regionOffset.peru + 800 && game.camera.y + 100 > regionOffset.peru + 800 - 360) {
        //         // game.debug.spriteInfo(sprites.cloudLeft, 20, 32);
        //         var checkTempClouds = temp.cloudLeft==undefined && temp.cloudMiddle==undefined && temp.cloudRight==undefined && temp.cloudRightBehin==undefined;
        //         if (checkTempClouds) {
        //                 temp["cloudLeft"] = {
        //                     "x" : sprites.cloudLeft.x,
        //                     "y" : sprites.cloudLeft.y
        //                 };
        //                 temp["cloudRight"] = {
        //                     "x" : sprites.cloudRight.x,
        //                     "y" : sprites.cloudRight.y
        //                 };
        //                 temp["cloudMiddle"] = {
        //                     "x" : sprites.cloudMiddle.x,
        //                     "y" : sprites.cloudMiddle.y
        //                 };
        //                 temp["cloudRightBehind"] = {
        //                     "x" : sprites.cloudRightBehind.x,
        //                     "y" : sprites.cloudRightBehind.y
        //                 };
        //         }
        //         //
        //        sprites.cloudLeft.x = temp.cloudLeft.x + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
        //        sprites.cloudRight.x = temp.cloudRight.x + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
        //        sprites.cloudMiddle.x = temp.cloudMiddle.x - ((regionOffset.peru + 800 - game.camera.y - 100)/8);
        //        sprites.cloudRightBehind.x = temp.cloudRightBehind.x - ((regionOffset.peru + 800 - game.camera.y - 100)/8);
        //        sprites.cloudLeft.y = temp.cloudLeft.y + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
        //        sprites.cloudRight.y = temp.cloudRight.y + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
        //        sprites.cloudMiddle.y = temp.cloudMiddle.y + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
        //        sprites.cloudRightBehind.y = temp.cloudRightBehind.y + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
        //        sprites.cloudLeft.alpha = 1 - (regionOffset.peru + 800 - game.camera.y - 100)/720;
        //        sprites.cloudRight.alpha = 1 - (regionOffset.peru + 800 - game.camera.y - 100)/720;
        //        sprites.cloudMiddle.alpha = 1 - (regionOffset.peru + 800 - game.camera.y - 100)/720;
        //        sprites.cloudRightBehind.alpha = 1 - (regionOffset.peru + 800 - game.camera.y - 100)/720;

        //     }

        //     if (game.camera.y + 500 < regionOffset.tundra && game.camera.y + 500 > regionOffset.forest + 300) {
        //         // game.debug.spriteInfo(sprites.yellowButterfly,20,132);
        //         if (temp.yellowButterflyY == undefined) {
        //                 temp["yellowButterflyY"] = sprites.yellowButterfly.y;
        //         }
        //         sprites.yellowButterfly.y = temp.yellowButterflyY - (regionOffset.tundra - game.camera.y - 500);
        //     }
        // },

        update: function() {
            //
            // this.dragMap();
            // log.log("CAMERA",game.camera.y);
            // this.optimize(game.camera,regionRange);


        },
        render: function() {
            // game.debug.pointer(game.input.mousePointer);
            // game.debug.pointer(game.input.pointer1);
            // game.debug.pointer(game.input.pointer2);
            // game.debug.pointer(game.input.pointer3);
            // game.debug.pointer(game.input.pointer4);
            // game.debug.pointer(game.input.pointer5);
            // game.debug.pointer(game.input.pointer6);

            // function interactiveAnimate(){

            // }
            // this.interactiveAnimate();
            // game.camera.y-= 4;

        },
        shutdown: function() {
            log.debug("The world is going down down down down")
            game.world.removeAll();
        }

    }

    game.state.add('play', playState);
    game.state.start('play');

    // phaser destroy doesn't remove canvas element --> removed manually in app run
    scope.$on('$destroy', function() {
        game.destroy(); // Clean up the game when we leave this scope
        var canvas = document.querySelector('#map_canvas');
        canvas.parentNode.removeChild(canvas);
    });
  // scope.$on('showInfoIcon',function (flag) {
  //   log.debug("showInfoIcon event recieved",flag);
  //   showInfoIcon = flag;
  //   game.state.restart(true,true);
  // })


};
