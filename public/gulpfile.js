var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var uglifycss = require('gulp-uglifycss');
var gulpFilter = require('gulp-filter');

//Concatenate & Minify CSS
gulp.task('minify-css', function () {
  gulp.src(['./css/**', './node_modules/angular-material/angular-material.min.css'])
    .pipe(uglifycss({
      "maxLineLen": 120,
      "uglyComments": true
    }))
    .pipe(concat('all.min.css'))
    .pipe(gulp.dest('dist'));
});


// Concatenate & Minify JS
gulp.task('minify-js', function() {

    var paths = [
      'node_modules/angular/angular.min.js',
      'node_modules/angular-ui-router/release/angular-ui-router.min.js',
      'node_modules/angular-route/angular-route.min.js',
      'node_modules/angular-animate/angular-animate.min.js',
      'node_modules/angular-aria/angular-aria.min.js',
      'node_modules/angular-material/angular-material.min.js',
      'node_modules/angular-paging/dist/paging.min.js',
      'node_modules/moment/min/moment.min.js',
      'js/perros/*.js',
      'js/controllers/*.js',
      'js/services/*.js',
      'js/app.js',
      'js/backtop.min.js'
    ];

    // Minify ONLY these files.
    var filter = gulpFilter([
      'js/perros/*.js',
      'js/services/*.js',
      'js/controllers/*.js',
      'js/app.js'
    ],
    {
      restore: true
    });

    return gulp.src(paths)
      .pipe(filter)
      .pipe(uglify())
      .pipe(filter.restore)
      .pipe(concat('all.min.js'))
      .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(['js/**'], ['minify-js']);
    gulp.watch(['css/**'], ['minify-css']);
});

// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Default Task
gulp.task('default', ['minify-js', 'minify-css']);