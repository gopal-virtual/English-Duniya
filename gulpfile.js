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
var paths = {
  sass: [
    './scss/**/*.scss',
    './scss/*.scss'
  ],
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
  constants : {
    environment : './www/constant.json',
    template : './constant.template.txt',
    destination : './app_modules/common/',
    destination_filename : 'common.constant.js'
  }

};
var environments = {
  default: 'PRODUCTION',
  production: 'PRODUCTION',
  dev: 'DEVELOPMENT',
  test: 'TESTING'
};
var env = argument.argv.env ? environments[argument.argv.env] : environments.default;
var app_type = argument.argv.app_type ? argument.argv.app_type : 'na';
var app_version = 'na';
var constants = JSON.parse(file.readFileSync(paths.constants.environment, 'utf8'));
var lock = argument.argv.lock ? argument.argv.lock : constants[env]['LOCK'];
var lesson_db_version = 'na';
gulp.task('default', function(callback){
  runSequence(/*'generate-lessondb','get-lessondb-version',*/'get-version','generate-constants', 'sass', 'html', 'scripts',callback);
});

gulp.task('generate-lessondb',shell.task([
  'rm www/data/lessons.db',
  'pouchdb-dump http://127.0.0.1:5984/lessonsdb > www/data/lessons.db'
]));
gulp.task('get-lessondb-version',function(){
  var res = request('GET', 'http://ci-couch.zaya.in/lessonsdb/version');
  lesson_db_version = JSON.parse(res.getBody().toString()).version;
});
// gulp.task('optimize', function(cb) {
//   gulp.src(paths.image)
//     .pipe(optimization())
//     .pipe(gulp.dest('www/img'))
// });

gulp.task('preen', function (cb) {
  preen.preen({}, cb);
});

gulp.task('generate-constants', function () {


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
        match: 'FAKE_DEVICE_ID',
        replacement: constants[env]['FAKE_DEVICE_ID']
      },{
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
        }
      ]
    }))
    .pipe(rename(paths.constants.destination_filename))
    .pipe(gulp.dest(paths.constants.destination))

});

gulp.task('get-version',function(){
  var xml       = file.readFileSync('./config.xml');
  var content         = cheerio.load(xml, { xmlMode: true });
  app_version   = content('widget')[0].attribs.version;

});

gulp.task('scripts', function () {

  gulp.src(paths.script)
    .pipe(print(function (filepath) {
      // return filepath;
    }))
    .pipe(ngAnnotate())
    .pipe(stripDebug())
    .pipe(strip())
    .pipe(concate('mobile.app.js'))
    .pipe(gulpif(env !== environments.dev,uglify()))
    .pipe(gulp.dest('www/build'))
    // .on('end',cb)
  // .pipe(broswerSync.stream())
});

gulp.task('sass', function () {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    }))
    .on('error', sass.logError)
    // .pipe(autoprefixer({
    // 	browsers: ['last 2 versions'],
    // 	cascade: false
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

gulp.task('html', function () {
        return gulp.src(paths.html)
          .pipe(print(function (filepath) {
            return filepath;
          }))
          .pipe(strip())
          .pipe(templateCache({
            base: function (file) {
              var filename = file.relative.replace('www/', '');
              return 'templates/' + filename;
            },
            standalone: true,
            moduleSystem: 'IIFE'
          }))
          .pipe(gulp.dest('./www/templates/'))



});

gulp.task('watch',['default'], function () {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.script, ['scripts']);
  gulp.watch(paths.html, ['html']);
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
