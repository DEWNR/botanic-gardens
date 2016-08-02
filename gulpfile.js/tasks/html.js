var config       = require('../config')
if(!config.tasks.html) return

var browserSync  = require('browser-sync')
var data         = require('gulp-data')
var gulp         = require('gulp')
var gulpif       = require('gulp-if')
var handleErrors = require('../lib/handleErrors')
var htmlmin      = require('gulp-htmlmin')
var path         = require('path')
var render       = require('gulp-nunjucks-render')
var fs           = require('fs')
var jsoncombine  = require("gulp-jsoncombine")
var gulpSequence = require('gulp-sequence')

var exclude = path.normalize('!**/{' + config.tasks.html.excludeFolders.join(',') + '}/**')

var paths = {
    src: [path.join(config.root.src, config.tasks.html.src, '/**/*.html'), exclude],
    dest: path.join(config.root.dest, config.tasks.html.dest),
}





var getData = function(file) {
    var dataPath = path.resolve(config.root.src, config.tasks.html.src, 'data/global.json')

    return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
}





var htmlTask = function(cb) {

    return gulp.src(config.tasks.html.templateFiles)
        .pipe(data(getData))
        .on('error', handleErrors)
        .pipe(render({
          path: config.tasks.html.templatePaths,
          envOptions: {
            watch: false
          }
        }))
        .on('error', handleErrors)
        .pipe(gulpif(global.production, htmlmin(config.tasks.html.htmlmin)))
        .pipe(gulp.dest(paths.dest))
        .pipe(browserSync.stream())
}

gulp.task('html', htmlTask)

module.exports = htmlTask
