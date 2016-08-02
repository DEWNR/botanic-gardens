var config       = require('../config')
var gulp         = require('gulp')
var jsoncombine  = require("gulp-jsoncombine")
var path         = require('path')

var htmlDataTask = function(cb) {

    return gulp.src(config.tasks.html.dataFiles)

        .pipe(jsoncombine("global.json",function(data){
            var sData = JSON.stringify(data)
            var sDataCC = sData.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); })

            return new Buffer(sDataCC)
        }))
        .pipe(gulp.dest("./src/html/data"));

}

gulp.task('htmlData', htmlDataTask)

module.exports = htmlDataTask
