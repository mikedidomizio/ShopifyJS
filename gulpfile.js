"use strict";

var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload'),
    browserSync = require('browser-sync').create();

gulp.task('default', function(){
    gulp.start('typescript');
});

/**
 * Use this for development purposes
 */
gulp.task('watch', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch('js/*.ts', ['typescript']);
    gulp.watch("js/shopify.js").on('change', browserSync.reload);
});

/**
 * Compiles Typescript
 */
gulp.task('typescript', function() {
    return gulp.src('js/*.ts')
        .pipe(ts({
            noImplicitAny: false,
            outFile: 'shopify.js',
            target: 'ES2015',
            removeComments: true
        }))
        .pipe(gulp.dest('js/'));
});