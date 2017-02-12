var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concate = require('gulp-concat');
var plumber = require('gulp-plumber');
var print = require('gulp-print');
var ngAnnotate = require('gulp-ng-annotate');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sh = require('shelljs');
var stripDebug = require('gulp-strip-debug');
var templateCache = require('gulp-angular-templatecache');
var optimization = require('gulp-imagemin');
var preen = require('preen');
var strip = require('gulp-strip-comments');
var argument = require('yargs');
var file = require('fs');
var replace_task = require('gulp-replace-task');
var gulpif = require('gulp-if');
var cheerio = require('cheerio');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');
var request = require('sync-request');
var grades = require('./grades');
var jeditor = require("gulp-json-editor");
var paths = {
  sass: [
    './scss/**/*.scss',
    './scss/*.scss'
  ],
  diagnosis: 'www/data/diagnosisQJSON.json',
  script: [
    './www/templates/templates.js',
    './app_modules/common/common.module.js',
    './app_modules/map/map.module.js',
    './app_modules/content/content.module.js',
    './app_modules/intro/intro.module.js',
    './app_modules/search/search.module.js',
    './app_modules/auth/auth.module.js',
    './app_modules/user/user.module.js',
    './app_modules/profile/profile.module.js',
    './app_modules/quiz/quiz.module.js',
    './app_modules/group/group.module.js',
    './app_modules/app.module.js',
    './app_modules/**/*.js'
  ],
  html: [
    './app_modules/**/*.html'
  ],
  image: [
    './www/img/**/*.png',
    './www/img/**/*.jpg',
    './www/img/**/*.jpeg',
    './www/img/*.png',
    './www/img/*.jpg',
    './www/img/*.jpeg'
  ],
  constants: {
    environment: './www/constant.json',
    template: './constant.template.txt',
    destination: './app_modules/common/',
    destination_filename: 'common.constant.js'
  },
  localizationFactory: {
    template: './localizationFactory.template.txt',
    destination: './app_modules/common/',
    destination_filename: 'common.localization.factory.js'
  },
  main: './www/main.html',
  main_template: './main.template.txt'
};
var environments = {
  default: 'PRODUCTION',
  production: 'PRODUCTION',
  dev: 'DEVELOPMENT',
  test: 'TESTING',
  content: 'CONTENT'
};
var raven_key = {
  default: 'http://d52f1916c41a41e9b6506dddf7e805fa@zsentry.zaya.in/4',
  production: 'http://886f9ba54ac1453c9fcf2e2bdae62831@zsentry.zaya.in/6',
  dev: 'http://d52f1916c41a41e9b6506dddf7e805fa@zsentry.zaya.in/4',
  test: 'http://d52f1916c41a41e9b6506dddf7e805fa@zsentry.zaya.in/4',
  content: 'http://d52f1916c41a41e9b6506dddf7e805fa@zsentry.zaya.in/4'
};
var languages_list = [{
  name: 'hindi',
  code: 'hi'
}, {
  name: 'tamil',
  code: 'ta'
}, {
  name: 'gujarati',
  code: 'gu'
}, {
  name: 'telugu',
  code: 'te'
}, {
  name: 'bengali',
  code: 'bn'
}, {
  name: 'marathi',
  code: 'mr'
}, {
  name: 'kannada',
  code: 'kn'
}];
var env = argument.argv.env ? environments[argument.argv.env] : environments.default;
var app_type = argument.argv.app_type ? argument.argv.app_type : 'na';
var campaign_name = argument.argv.campaign_name ? argument.argv.campaign_name : 'playstore';
var is_bundled = argument.argv.is_bundled ? argument.argv.is_bundled : false;
var allowed_languages = argument.argv.languages ? argument.argv.languages : 'hi';
var app_version = 'na';
var constants = JSON.parse(file.readFileSync(paths.constants.environment, 'utf8'));
var lock = argument.argv.lock ? argument.argv.lock : constants[env]['LOCK'];
var fake_id_device = constants[env]['FAKE_ID_DEVICE'] || 'na';
var notifications_couch_db_server = constants[env]['NOTIFICATION_DB_SERVER'];
var lesson_db_version = 'na';
var diagnosis_media = [];
var allowed_languages_list = [];
var tasks_for_download_localized_audio = ['rm www/sound/localized/*',
  'rm localizedSounds*.zip'
];
for (i in languages_list) {
  if (allowed_languages.indexOf(languages_list[i].code) !== -1) {
    allowed_languages_list.push(languages_list[i]);
    tasks_for_download_localized_audio.push('wget -O localizedSounds_' + languages_list[i].code + '.zip http://localization.englishduniya.in/download?lang=' + languages_list[i].code,
      'unzip localizedSounds_' + languages_list[i].code + '.zip -d www/sound/localized/');
  }
}
console.log(tasks_for_download_localized_audio);
var lessonsdb_couch_server = argument.argv.lessonsdb;
var diagnosis_couch_db_server = argument.argv.diagnosisdb;
//Get app version
// var xml = file.readFileSync('./config.xml');
// var content = cheerio.load(xml, {
//   xmlMode: true
// });
// app_version = content('widget')[0].attribs.version;
// console.log("VERSION", app_version);
console.log("envi", raven_key[argument.argv.env])
gulp.task('default', function(callback) {
  // runSequence('generate-lessondb','get-diagnosis-media','make-main','generate-constants', 'sass', 'html', 'scripts',callback);
  runSequence('generate-lessondb', 'get-diagnosis-media', 'makeLocalizationFactory', 'downloadLocalizedAudio', 'make-main', 'generate-constants', 'sass', 'html', 'scripts', 'editPackageJson', callback);
});
gulp.task('generate-lessondb', shell.task(
  (env !== environments.dev) ? [
    // 'rm www/data/lessons.db',
    // 'rm www/data/diagnosis_translations.db',
    'pouchdb-dump ' + lessonsdb_couch_server + ' > www/data/lessons.db',
    'pouchdb-dump ' + diagnosis_couch_db_server + ' > www/data/diagnosis_translations.db',
    'pouchdb-dump ' + notifications_couch_db_server + ' > www/data/notifications.db'
  ] : []
));
// gulp.task('optimize', function(cb) {
//   gulp.src(paths.image)
//     .pipe(optimization())
//     .pipe(gulp.dest('www/img'))
// });
gulp.task('preen', function(cb) {
  preen.preen({}, cb);
});
console.log('raven key', raven_key[argument.argv.env]);
gulp.task('make-main', function() {
  gulp.src(paths.main_template)
    .pipe(replace_task({
      patterns: [{
        match: /\/\*raven_release_start\*\/[\'\'\.0-9a-z]+\/\*raven_release_end\*\//g,
        replacement: '/*raven_release_start*/\'' + app_version + '\'/*raven_release_end*/'
      }, {
        match: /\/\*rtaven_environment_start\*\/[\'\'\.0-9a-zA-Z]+\/\*raven_environment_end\*\//g,
        replacement: '/*raven_environment_start*/\'' + env + '\'/*raven_environment_end*/'
      }, {
        match: /\/\*raven_key_start\*\/'https?:\/\/[:a-zA-Z0-9@.\/']+\/\*raven_key_end\*\//g,
        replacement: '/*raven_key_start*/\'' + raven_key[argument.argv.env] + '\'/*raven_key_end*/'
      }]
    }))
    .pipe(rename('main.html'))
    .pipe(gulp.dest('./www/', {
      overwrite: true
    }))
});
gulp.task('generate-constants', function() {
  gulp.src(paths.constants.template)
    .pipe(replace_task({
      patterns: [{
        match: 'BACKEND_SERVICE_DOMAIN',
        replacement: constants[env]['BACKEND_SERVICE_DOMAIN']
      }, {
        match: 'LOCK',
        replacement: lock
      }, {
        match: 'FAKE_LOGIN',
        replacement: constants[env]['FAKE_LOGIN']
      }, {
        match: 'FAKE_DEVICE',
        replacement: constants[env]['FAKE_DEVICE']
      }, {
        match: 'RESOURCE_SERVER',
        replacement: constants[env]['RESOURCE_SERVER']
      }, {
        match: 'ANALYTICS',
        replacement: constants[env]['ANALYTICS']
      }, {
        match: 'APP_TYPE',
        replacement: app_type
      }, {
        match: 'APP_VERSION',
        replacement: app_version
      }, {
        match: 'DEBUG',
        replacement: constants[env]['DEBUG']
      }, {
        match: 'LESSON_DB_VERSION',
        replacement: lesson_db_version
      }, {
        match: 'LESSONS_DB_SERVER',
        replacement: lessonsdb_couch_server
      }, {
        match: 'PROFILES_DB_SERVER',
        replacement: constants[env]['PROFILES_DB_SERVER']
      }, {
        match: 'FAKE_ID_DEVICE',
        replacement: fake_id_device
      }, {
        match: 'BUNDLED',
        replacement: is_bundled
      }, {
        match: 'DIAGNOSIS_MEDIA',
        replacement: JSON.stringify(diagnosis_media)
      }, {
        match: 'GRADE',
        replacement: grades.getGrades(paths.diagnosis)
      }, {
        match: 'QUESTION_DEMO',
        replacement: constants[env]['QUESTION_DEMO']
      }, {
        match: 'CONTENT_TEST',
        replacement: constants[env]['CONTENT_TEST']
      }, {
        match: 'NOTIFICATION_DURATION_DISCOVERED',
        replacement: constants[env]['NOTIFICATION_DURATION_DISCOVERED']
      }, {
        match: 'NOTIFICATION_DURATION_UNDISCOVERED',
        replacement: constants[env]['NOTIFICATION_DURATION_UNDISCOVERED']
      }, {
        match: 'NOTIFICATION_DB_SERVER',
        replacement: constants[env]['NOTIFICATION_DB_SERVER']
      }, {
        match: 'ALLOWED_LANGUAGES',
        replacement: allowed_languages_list
      }, {
        match: 'CAMPAIGN_NAME',
        replacement: campaign_name
      }, {
        match: 'CHALLENGE_START',
        replacement: constants[env]['CHALLENGE_START']
      }, {
        match: 'CHALLENGE_END',
        replacement: constants[env]['CHALLENGE_END']
      }]
    }))
    .pipe(rename(paths.constants.destination_filename))
    .pipe(gulp.dest(paths.constants.destination))
});
gulp.task('scripts', function() {
  gulp.src(paths.script)
    .pipe(print(function(filepath) {
      // return filepath;
    }))
    .pipe(ngAnnotate())
    .pipe(stripDebug())
    .pipe(strip())
    .pipe(concate('mobile.app.js'))
    .pipe(gulpif(env !== environments.dev && env !== environments.content && env !== environments.test, uglify()))
    .pipe(gulp.dest('www/build'))
    // .on('end',cb)
    // .pipe(broswerSync.stream())
});
gulp.task('sass', function() {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    }))
    .on('error', sass.logError)
    // .pipe(autoprefixer({
    //  browsers: ['last 2 versions'],
    //  cascade: false
    // }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 1
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('./www/css/'))
    // .on('end', done);
});
gulp.task('html', function() {
  return gulp.src(paths.html)
    .pipe(print(function(filepath) {
      return filepath;
    }))
    .pipe(strip())
    .pipe(templateCache({
      base: function(file) {
        var filename = file.relative.replace('www/', '');
        return 'templates/' + filename;
      },
      standalone: true,
      moduleSystem: 'IIFE'
    }))
    .pipe(gulp.dest('./www/templates/'))
});
gulp.task('get-diagnosis-media', function() {
  if (env !== environments.dev) {
    var docs_list = JSON.parse(request('GET', diagnosis_couch_db_server + '/_all_docs').getBody().toString());
    // console.log("docs list",docs_list)
    for (var i = 0; i < docs_list.rows.length; i++) {
      // console.log("Value", docs_list.rows[i].id);
      var id = docs_list.rows[i].id;
      var doc = JSON.parse(request('GET', diagnosis_couch_db_server + '/' + id).getBody().toString());
      // console.log("Doc", doc.question);
      for (var media_type in doc.question.node.type.content.widgets) {
        if (doc.question.node.type.content.widgets.hasOwnProperty(media_type)) {
          for (var media_file in doc.question.node.type.content.widgets[media_type]) {
            console.log(doc.question.node.type.content.widgets[media_type][media_file])
            diagnosis_media.push(doc.question.node.type.content.widgets[media_type][media_file]);
          }
        }
      }
      // break;
    }
  }
});
gulp.task('makeLocalizationFactory', function() {
  var localizedAudio = JSON.parse(request('GET', 'http://localization.englishduniya.in/get/json').getBody().toString());
  var localizedText = JSON.parse(request('GET', 'http://localization.englishduniya.in/get/textjson').getBody().toString());
  gulp.src(paths.localizationFactory.template)
    .pipe(replace_task({
      patterns: [{
        match: 'LOCALIZED_AUDIO',
        replacement: localizedAudio
      }, {
        match: 'LOCALIZED_TEXT',
        replacement: localizedText
      }]
    }))
    .pipe(rename(paths.localizationFactory.destination_filename))
    .pipe(gulp.dest(paths.localizationFactory.destination));
});
gulp.task('downloadLocalizedAudio', shell.task(
  (env !== environments.dev) ? [
    'rm www/sound/localized/*',
    'rm localizedSounds*.zip',
    'wget -O localizedSounds.zip http://localization.englishduniya.in/download',
    'unzip localizedSounds.zip -d www/sound/localized'
  ] : []
));
gulp.task('watch', ['default'], function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.script, ['scripts']);
  gulp.watch(paths.html, ['html']);
  // gulp.watch([paths.constants.template, paths.consants.destination_filename, paths.consants.environment], ['default']);
});
// gulp.task('install', ['git-check'], function() {
//   return bower.commands.install()
//     .on('log', function(data) {
//       gutil.log('bower', gutil.colors.cyan(data.id), data.message);
//     });
// });
// gulp.task('git-check', function(done) {
//   if (!sh.which('git')) {
//     console.log(
//       '  ' + gutil.colors.red('Git is not installed.'),
//       '\n  Git, the version control system, is required to download Ionic.',
//       '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
//       '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
//     );
//     process.exit(1);
//   }
//   done();
// });
//Rudra wrote this foolish code
gulp.task('editPackageJson', function() {
  return gulp.src("./package.json")
    .pipe(jeditor(function(json) {
      // json.version = "1.2.3";
      // var cleverTapPlugin = json.cordovaPlugins.find(function(elem){
      //   return elem.id == "com.clevertap.cordova.CleverTapPlugin";
      // })
      for (var i = 0; i < json.cordovaPlugins.length; i++) {
        if (json.cordovaPlugins[i].id == "com.clevertap.cordova.CleverTapPlugin") {
          json.cordovaPlugins[i].variables = constants[env]['CLEVERTAP_VARS'];
        }
      }
      console.log('cordova - plugins - available', json.cordovaPlugins);
      // cleverTapPlugin.variables = constants
      return json; // must return JSON object. 
    }))
    .pipe(gulp.dest("."));
})