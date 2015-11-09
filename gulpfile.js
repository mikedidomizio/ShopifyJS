"use strict";

var gulp = require('gulp'),
    ts = require('gulp-typescript');

// define tasks here
gulp.task('default', function(){
    // run tasks here
    // set up watch handlers here
});

gulp.task('watch', function() {
    return gulp.src('js/*.ts')
        .pipe(ts({
            noImplicitAny: false,
            out: '*.js',
            target: 'ES2015'
        }))
            .pipe(gulp.dest('js/'));
})