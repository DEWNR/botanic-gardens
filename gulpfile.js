/*jshint node:true*/
'use strict';

var argv = require('yargs').argv,   // Pass agruments using the command line
    autoprefixer = require('gulp-autoprefixer'),    // Add vendor prefixes to CSS
    autoprefixerOptions,
    browserSync = require('browser-sync').create(),     // Automatically refresh the browser
    concat = require('gulp-concat'),    // Combine simple JavaScript files
    del = require('del'),   // Delete unwanted files and folders (eg public before production build)
    fingerprint = require('gulp-fingerprint'),  // Update asset paths to include fingerprint. Used in conjuction with gulp-rev
    fingerprintOptions,
    fs = require('fs'), // File system; used to check if files exist
    jsonfile = require('jsonfile'), // Read JSON data
    gulp = require('gulp'),
    gUtil = require('gulp-util'), // Logging and errors
    htmlmin = require('gulp-html-minifier'),
    htmlminOptions,
    imagemin = require('gulp-imagemin'),    // Optimise images
    imageminOptions,
    jsList,   // List of JavaScripts to combine
    minifyCss = require('gulp-minify-css'),     // Minify CSS
    minifyCssOptions,
    mustache = require('gulp-mustache-plus'),
    mustacheData,
    mustachePartials,
    passthrough = require('gulp-empty'),    // Pass through an unaltered stream; useful for conditional processing
    paths,  // Frequently used file paths
    rename = require('gulp-rename'), // Rename output files
    rev = require('gulp-rev'),      // Add a hash-based fingerprint to the output filename
    revManifestOptions,
    runSequence = require('run-sequence'),   // Run tasks in specific order. Not required in Gulp v4
    sass = require('gulp-sass'),    // Compile CSS from Sass/sass
    sassOptions,
    uglify = require('gulp-uglify');    // Mangle and compress JavaScript


// Set the commonly used folder paths

(function () {

    // Set the variables for the root folders

    var dest = argv.production ? "dist/" : "temp/",    // Use the public folder for a "production" build or the temp folder for all other builds
        src = "./";


    // Set paths as an object

    paths = {};


    // Set the destination path

    paths.dest = dest;


    // Set the manifest path for gulp-rev and gulp-fingerprint

    paths.manifest = dest + "rev-manifest.json";


    // Set the source paths

    paths.src = {};

    paths.src.root = src;

    paths.src.html = src + "html/";

    paths.src.images = src + "images/";

    paths.src.js = src + "js/";

    paths.src.sass = src + "sass/";

    paths.src.templates = "./node_modules/dewnr-series-three/templates/";

}());


// Set options

autoprefixerOptions = {
    browsers: [
        "Android 2.3",
        "Android >= 4",
        "Chrome >= 20",
        "Firefox >= 24",
        "Explorer >= 8",
        "iOS >= 6",
        "Opera >= 12",
        "Safari >= 6"
    ]
};


fingerprintOptions = {};


htmlminOptions = {
    removeComments: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: true,
    minifyCSS: true
};


imageminOptions = {
    multipass: true,
    progressive: true,
    svgoPlugins: [
        {removeViewBox: false}
    ]
};


minifyCssOptions = {
    compatibility: 'ie7,' +
        '-units.ch,' +
        '-units.in,' +
        '-units.pc,' +
        '-units.pt,' +
        '-units.rem,' +
        '-units.vh,' +
        '-units.vm,' +
        '-units.vmax,' +
        '-units.vmin'
};


revManifestOptions = {
    base: paths.dest,  // Necessary to allow merging;
    merge: true
};


sassOptions = {
    includePaths: ['./node_modules']
};





// Define JavaScript bundles

/**
 * Use an array of objects with the following properties:
 *
 *      source - an array of source files
 *      destination - the output folder
 *      filename - the output filename
 *
 * For example:
 *
 *  jsList = [
 *      {
 *          source: [
 *              paths.src.includes + "fancybox/source/jquery.fancybox.js",
 *              paths.src.includes + "fancybox/source/helpers/jquery.fancybox-thumbs.js"
 *          ],
 *          destination: paths.dest.js,
 *          filename: "fancybox.custom.js"
 *      }
 *  ];
 **/

jsList = [
    {
        source: [
            paths.src.js + "ui-toggle.js",
            paths.src.js + "sticky-navigation.js"
        ],
        filename: "main.js"
    }
];





// Define Mustache data and partials

mustacheData = {
  "file_path": "http://www.environment.sa.gov.au/files/templates/00000000-0000-0000-0000-000000000000/f88a7f3c-df7e-430a-825c-24cfa8dec9a8",
  "site_url": "http://www.environment.sa.gov.au",
  "feature-modules": [
    {
      "feature-module-url": "#",
      "feature-module-title": "Feature Title 1"
    },{
      "feature-module-url": "#",
      "feature-module-title": "Feature Title 2"
    },{
      "feature-module-url": "#",
      "feature-module-title": "Feature Title 3"
    }
],
  "navigation-tiles": [
    {
      "navigation-tile-url": "#",
      "navigation-tile-title": "Navigation Title 1",
      "navigation-tile-teaser": "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
    },{
      "navigation-tile-url": "#",
      "navigation-tile-title": "Navigation Title 2",
      "navigation-tile-teaser": "Nam id nibh ac lacus molestie consequat. Nunc vel arcu at nisl volutpat mollis a id sem."
    },{
      "navigation-tile-url": "#",
      "navigation-tile-title": "Navigation Title 3",
      "navigation-tile-teaser": "Donec ante justo, scelerisque eget mauris id"
    },{
      "navigation-tile-url": "#",
      "navigation-tile-title": "Navigation Title 4",
      "navigation-tile-teaser": "Nunc vel arcu at nisl volutpat mollis a id sem."
    }
  ]
};

mustachePartials = {
  "_header": paths.src.templates + "partials/_header.mustache",
  "_footer": paths.src.templates + "partials/_footer.mustache",
  "feature-modules": paths.src.templates + "partials/feature-module.mustache",
  "navigation-tiles": paths.src.templates + "partials/navigation-tile.mustache",
  "site-header": paths.src.templates + "partials/site-header.mustache",
  "primary-navigation": paths.src.templates + "partials/primary-navigation.mustache",
  "secondary-navigation": paths.src.templates + "partials/secondary-navigation.mustache",
  "site-footer": paths.src.templates + "partials/site-footer.mustache",
  "social": paths.src.templates + "partials/social.mustache",
  "site-search": paths.src.templates + "partials/site-search.mustache",
  "sitemap": paths.src.templates + "partials/sitemap.mustache"
};






// Redefine some optimisation processes so they're not used in development

if (!argv.production) {
    fingerprint = passthrough;
    htmlmin = passthrough;
    minifyCss = passthrough;
    rev = passthrough;
    rev.manifest = passthrough;
    uglify = passthrough;
}





// Remove destination folder in production mode

gulp.task('clean', function () {
    if (argv.production) {
        del.sync([paths.dest]);
        fs.mkdirSync(paths.dest);
        fs.writeFileSync(paths.manifest, '{}', 'utf8'); // Create empty manifest
    }
});



// Create Mustache template files

gulp.task('mustache', function () {
  gulp.src(paths.src.templates + "*.mustache")
      .pipe(mustache(
        mustacheData,
        {},
        mustachePartials
      )).pipe(gulp.dest(paths.dest));
});



// Copy and minify HTML

gulp.task('html', function () {

    // Load the manifest. (If we use gulp-fingerprint's loading mechanism the
    // results will be cached.

    var manifest = fs.existsSync(paths.manifest) ? jsonfile.readFileSync(paths.manifest, {throws: false}) : null;

    if (manifest === null && argv.production) {
        throw new gUtil.PluginError({
            plugin: 'html',
            message: 'Error: a manifest must be present when running this task in production mode'
        });
    } else {
        return gulp.src(paths.src.html + '**/*.html')
            .pipe(mustache(mustacheData, {}, mustachePartials))
            .pipe(fingerprint(manifest, fingerprintOptions))
            .pipe(htmlmin(htmlminOptions))
            .pipe(gulp.dest(paths.dest));
    }
});

// Watch for changes to the HTML and/or mustache partials

gulp.task('html:watch', function () {
    if (!argv.production) {
        gulp.watch(paths.src.html + '**/*.{html,mustache}', ['html']);
    } else {
        throw new gUtil.PluginError({
            plugin: 'html:watch',
            message: 'This task should not be run in production mode as it may cause problems with fingerprinting.'
        });
    }
});





// Optimise images

gulp.task('imagemin', function () {
    return gulp.src(paths.src.images + '*', {base: paths.src.root})  // Use root as base to get paths in rev-manifest.json
        .pipe(imagemin(imageminOptions))
        .pipe(rev())    // Add cache-busting fingerprint
        .pipe(gulp.dest(paths.dest))
        .pipe(browserSync.stream())
        .pipe(rev.manifest(paths.manifest, revManifestOptions))
        .pipe(gulp.dest(paths.dest));
});

gulp.task('imagemin:watch', function () {
    if (!argv.production) {
        gulp.watch(paths.src.images + '*', ['imagemin']);
    } else {
        throw new gUtil.PluginError({
            plugin: 'imagemin:watch',
            message: 'This task should not be run in production mode as it may cause problems with fingerprinting.'
        });
    }
});





// Concatenate JavaScript

/**
 * Note: this method is deprecated. User Browserify for all new script bundles.
 **/

gulp.task('js-concat', function () {

    // Loop through each bundle.

    jsList.forEach(function (bundle) {

        return gulp.src(bundle.source, {base: paths.src.root})  // Use root as base to get paths in rev-manifest.json
            .pipe(concat(bundle.filename))
            .pipe(rename(function (path) {
                path.dirname = "js";    // Set the destination directory
                return path;
             }))
            .pipe(rev())    // Add cache-busting fingerprint
            .pipe(uglify())    // Uglify and fingerprint if in production mode
            .pipe(gulp.dest(paths.dest))
            .pipe(browserSync.stream())
            .pipe(rev.manifest(paths.manifest, revManifestOptions))
            .pipe(gulp.dest(paths.dest));

    });

});

gulp.task('js-concat:watch', function () {
    if (!argv.production) {
        gulp.watch(paths.src.js + '**/*.js', ['js-concat']);
    } else {
        throw new gUtil.PluginError({
            plugin: 'js-concat:watch',
            message: 'This task should not be run in production mode as it may cause problems with fingerprinting.'
        });
    }
});





// Compile CSS from Sass/sass

gulp.task('sass', function () {

    // Load the manifest. (If we use gulp-fingerprint's loading mechanism the
    // results will be cached.

    var manifest = fs.existsSync(paths.manifest) ? jsonfile.readFileSync(paths.manifest, {throws: false}) : null;

    if (manifest === null && argv.production) {
        throw new gUtil.PluginError({
            plugin: 'sass',
            message: 'Error: a manifest must be present when running this task in production mode'
        });
    } else {
        return gulp.src(paths.src.sass + '**/*.scss', {base: paths.src.root})  // Use root as base to get paths in rev-manifest.json
            .pipe(sass(sassOptions)
                .on('error', sass.logError))
            .pipe(fingerprint(manifest, fingerprintOptions))  // Update asset paths
            .pipe(autoprefixer(autoprefixerOptions))
            .pipe(rename(function (path) {
                path.dirname = path.dirname.replace(/^sass/, "css");    // Replace the sass folder with css
                return path;
             }))
            .pipe(rev())    // Add cache-busting fingerprint
            .pipe(minifyCss(minifyCssOptions))  // Minify if in production mode
            .pipe(gulp.dest(paths.dest))
            .pipe(browserSync.stream())
            .pipe(rev.manifest(paths.manifest, revManifestOptions))
            .pipe(gulp.dest(paths.dest));
    }
});

gulp.task('sass:watch', function () {
    if (!argv.production) {
        gulp.watch(paths.src.sass + '**/*.scss', ['sass']);     // TODO consider changing to gulp-watch so new files are detected
    } else {
        throw new gUtil.PluginError({
            plugin: 'sass:watch',
            message: 'This task should not be run in production mode as it may cause problems with fingerprinting.'
        });
    }
});





// Serve local files using browserSync

gulp.task('serve', function() {

    browserSync.init({
        server: paths.dest
    });

    gulp.watch(paths.dest + './*.html').on('change', browserSync.reload);
});


// Run all build tasks (once)

gulp.task('build', function(callback) {
    runSequence('clean', ['imagemin', 'js-concat'], 'sass', 'html', callback);
});


// Run all watch tasks. (Note that this won't do anything in production mode
// as running these tasks out of sequence in production mode will cause errors)

gulp.task('build:watch', ['html:watch', 'imagemin:watch', 'js-concat:watch', 'sass:watch']);


// Build, serve and watch

gulp.task('default', function(callback) {
    runSequence('build', 'serve', 'build:watch', callback);
});
