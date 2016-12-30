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
  main: './www/main.html'
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
var env = argument.argv.env ? environments[argument.argv.env] : environments.default;
var app_type = argument.argv.app_type ? argument.argv.app_type : 'na';
var is_bundled = argument.argv.is_bundled ? argument.argv.is_bundled : false;
var app_version = 'na';
var constants = JSON.parse(file.readFileSync(paths.constants.environment, 'utf8'));
var lock = argument.argv.lock ? argument.argv.lock : constants[env]['LOCK'];
var fake_id_device = constants[env]['FAKE_ID_DEVICE'] || 'na';
var lesson_db_version = 'na';
var diagnosis_media = [];
var lessonsdb_couch_server = env == environments.production ? 'https://ed-couch.zaya.in/lessonsdb' : 'https://ci-couch.zaya.in/lessonsdb';
//Get app version
var xml = file.readFileSync('./config.xml');
var content = cheerio.load(xml, {
  xmlMode: true
});
app_version = content('widget')[0].attribs.version;
console.log("VERSION", app_version);
console.log("envi", raven_key[argument.argv.env])
gulp.task('default', function(callback) {
  // runSequence('generate-lessondb','get-diagnosis-media','make-main','generate-constants', 'sass', 'html', 'scripts',callback);
  runSequence('get-diagnosis-media', 'make-main', 'generate-constants', 'sass', 'html', 'scripts', callback);
});
gulp.task('generate-lessondb', shell.task(
  (env !== environments.dev) ? [
    'rm www/data/lessons.db',
    'pouchdb-dump ' + lessonsdb_couch_server + ' > www/data/lessons.db'
  ] : []
));
gulp.task('get-lessondb-version', function() {
  var res = request('GET', 'http://ci-couch.zaya.in/lessonsdb/version');
  lesson_db_version = JSON.parse(res.getBody().toString()).version;
});
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
  gulp.src(paths.main)
    .pipe(replace_task({
      patterns: [{
        match: /\/\*raven_release_start\*\/[\'\'\.0-9a-z]+\/\*raven_release_end\*\//g,
        replacement: '/*raven_release_start*/\'' + app_version + '\'/*raven_release_end*/'
      }, {
        match: /\/\*raven_environment_start\*\/[\'\'\.0-9a-zA-Z]+\/\*raven_environment_end\*\//g,
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
        replacement: constants[env]['LESSONS_DB_SERVER']
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
    // .pipe(gulpif(env !== environments.dev && env !== environments.content,uglify()))
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
  var docs_list = JSON.parse(request('GET', 'http://ci-couch.zaya.in/diagnosis_translations/_all_docs').getBody().toString())
    // console.log("docs list",docs_list)
  for (var i = 0; i < docs_list.rows.length; i++) {
    // console.log("Value", docs_list.rows[i].id);
    var id = docs_list.rows[i].id;
    var doc = JSON.parse(request('GET', 'http://ci-couch.zaya.in/diagnosis_translations/' + id).getBody().toString());
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
});
gulp.task('watch', ['default'], function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.script, ['scripts']);
  gulp.watch(paths.html, ['html']);
  gulp.watch();
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