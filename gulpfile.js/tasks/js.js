var config       = require('../config')
if(!config.tasks.js) return

var gulp         = require('gulp')
var browserSync  = require('browser-sync')
var uglify       = require('gulp-uglify')
var path         = require('path')
var concat       = require('gulp-concat')

var paths = {
  src: path.join(config.root.src, config.tasks.js.src),
  dest: path.join(config.root.dest, config.tasks.js.dest)
}

var jsTask = function () {

    // Loop through each bundle.

    config.tasks.js.files.forEach(function (bundle) {
        return gulp.src(bundle.source)
          .pipe(concat(bundle.filename))
          .pipe(gulp.dest(paths.dest))
    });
}

gulp.task('js', jsTask)
module.exports = jsTask
