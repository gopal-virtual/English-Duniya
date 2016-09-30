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
var paths = {
  sass: [
    './scss/**/*.scss',
    './scss/*.scss'
  ],
  script: [
    './www/templates/templates.js',
    './www/templates/common/common.module.js',
    './www/templates/map/map.module.js',
    './www/templates/content/content.module.js',
    './www/templates/intro/intro.module.js',
    './www/templates/search/search.module.js',
    './www/templates/auth/auth.module.js',
    './www/templates/user/user.module.js',
    './www/templates/profile/profile.module.js',
    './www/templates/quiz/quiz.module.js',
    './www/templates/group/group.module.js',
    './www/templates/app.module.js',
    './www/templates/**/*.js'
  ],
  html: [
    './www/templates/**/*.html'
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
    destination : './www/templates/common/',
    destination_filename : 'common.constant.js'
  }

};
var environments = {
  default: 'PRODUCTION',
  prod: 'PRODUCTION',
  dev: 'DEVELOPMENT',
  test: 'TESTING'
};
var env = argument.argv.env ? environments[argument.argv.env] : environments.default;
var app_type = argument.argv.app_type ? argument.argv.app_type : 'na';
var app_version = argument.argv.app_version? argument.argv.app_version : 'na';
var constants = JSON.parse(file.readFileSync(paths.constants.environment, 'utf8'));

gulp.task('default', ['generate-constants', 'sass', 'html', 'scripts']);

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
        replacement: constants[env]['LOCK']
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
        }
      ]
    }))
    .pipe(rename(paths.constants.destination_filename))
    .pipe(gulp.dest(paths.constants.destination))

});


gulp.task('scripts', function () {

  gulp.src(paths.script)
    .pipe(print(function (filepath) {
      // return "MrGopal modified : " + filepath;
    }))
    .pipe(ngAnnotate())
    .pipe(stripDebug())
    .pipe(strip())
    .pipe(concate('mobile.app.js'))
    .pipe(gulpif(env !== environments.dev,uglify()))
    .pipe(gulp.dest('www/build'));
  // .pipe(broswerSync.stream())
});

gulp.task('sass', function (done) {
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
    .on('end', done);
});

gulp.task('html', function () {
  return gulp.src(paths.html)
    .pipe(print(function (filepath) {
      // return "html modified : " + filepath;
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
    .pipe(gulp.dest('./www/templates/'));
});

gulp.task('watch',['generate-constants','sass','html','scripts'], function () {
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
