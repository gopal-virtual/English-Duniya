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
  ]
};

gulp.task('default', ['sass','scripts','html','watch']);

gulp.task('optimize', function(cb) {
  gulp.src(paths.image)
    .pipe(optimization())
    .pipe(gulp.dest('www/img'))
});

gulp.task('preen', function(cb) {
  preen.preen({}, cb);
});

gulp.task('scripts', function() {
  gulp.src(paths.script)
    .pipe(plumber({
      handleError: function(err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(print(function(filepath) {
      return "MrGopal modified : " + filepath;
    }))
    .pipe(ngAnnotate())
    .pipe(stripDebug())
    .pipe(strip())
    .pipe(concate('mobile.app.js'))
    .pipe(gulp.dest('www/build'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('www/build'))
    // .pipe(broswerSync.stream())
})

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
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

gulp.task('html', function() {
  return gulp.src(paths.html)
    .pipe(print(function(filepath) {
      return "html modified : " + filepath;
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
    .pipe(gulp.dest('./www/templates/'));
});

gulp.task('watch', function() {
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
