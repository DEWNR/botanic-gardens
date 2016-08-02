var gulp         = require('gulp')
var config       = require('../../config')
var revReplace   = require('gulp-rev-replace')
var path         = require('path')
var inlinesource = require('gulp-inline-source')

// 5) Update asset references in HTML
gulp.task('update-html', function(){
  var manifest = gulp.src(path.join(config.root.dest, "/rev-manifest.json"))
  return gulp.src(path.join(config.root.dest, config.tasks.html.dest, '/**/*.html'))
    .pipe(revReplace({manifest: manifest}))
    .pipe(inlinesource())
    .pipe(gulp.dest(path.join(config.root.dest, config.tasks.html.dest)))
})
