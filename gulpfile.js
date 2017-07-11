var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var uglifycss = require('gulp-uglifycss');
var gulpFilter = require('gulp-filter');
var header = require('gulp-header');

/* Template for version comment in files */
var pkg = require('./package.json');
var banner = ['/**',
  ' * @version v<%= pkg.version %>',
  ' * @author <%= pkg.author %>',
  ' * @license <%= pkg.license %>',
  ' */\n',
  ''
].join('\n');

//Concatenate & Minify CSS
gulp.task('minify-css', function () {
  gulp.src(['./css/**', './node_modules/angular-material/angular-material.min.css'])
    .pipe(uglifycss({
      "maxLineLen": 120,
      "uglyComments": true
    }))
    .pipe(concat('all.min.css'))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest('public/dist'));
});


// Concatenate & Minify JS
gulp.task('minify-js', function() {    

    var localFiles = [
      'js/modules.js',
      'js/factories/*.js',
      'js/controllers/*.js',
      'js/services/*.js',
      'js/app.js'
    ];

    var externalLibraries = [
      'node_modules/angular/angular.min.js',
      'node_modules/angular-ui-router/release/angular-ui-router.min.js',
      'node_modules/angular-route/angular-route.min.js',
      'node_modules/angular-animate/angular-animate.min.js',
      'node_modules/angular-aria/angular-aria.min.js',
      'node_modules/angular-messages/angular-messages.min.js',
      'node_modules/angular-material/angular-material.min.js',
      'node_modules/angular-paging/dist/paging.min.js',
      'node_modules/moment/min/moment.min.js',
      'js/backtop.min.js'
    ];

    var paths = externalLibraries.concat(localFiles);
    
    // Minify ONLY these files.
    var filter = gulpFilter(localFiles,
    {
      restore: true
    });

    // search errors on own files
    gulp.src(localFiles)
      .pipe(jshint())
      .pipe(jshint.reporter('default'));

    return gulp.src(paths)
      .pipe(filter)
      .pipe(uglify())
      .pipe(filter.restore)
      .pipe(concat('all.min.js'))
      .pipe(header(banner, { pkg : pkg } ))
      .pipe(gulp.dest('public/dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(['js/**'], ['minify-js']);
    gulp.watch(['css/**'], ['minify-css']);
});

// Lint Task
gulp.task('lint', function() {
    return gulp.src(['js/controllers/*.js','js/factories/*.js','js/services/*.js','js/app.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Default Task
gulp.task('default', ['lint', 'minify-js', 'minify-css']);