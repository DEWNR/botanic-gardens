var config       = require('../config')
var gulp         = require('gulp')
var jsoncombine  = require("gulp-jsoncombine")
var path         = require('path')
var _            = require('lodash')

var htmlDataTask = function(cb) {

    return gulp.src(config.tasks.html.dataFiles)

        .pipe(jsoncombine("global.json",function(data){

            dataCC = _.mapKeys(data, function (v, k) {return _.camelCase(k);})

            var sData = JSON.stringify(dataCC)

            return new Buffer(sData)
        }))
        .pipe(gulp.dest("./src/html/data"));

}

gulp.task('htmlData', htmlDataTask)

module.exports = htmlDataTask
