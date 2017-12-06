const gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	babel = require('gulp-babel'),
	sourcemaps = require('gulp-sourcemaps'),
	del = require('del');

gulp.task('clean', () => {
	del(['build/*']);
});

gulp.task('build', ['clean'], () => {
	return gulp.src('src/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({presets: 'env'}))
		.pipe(uglify())
		.pipe(concat('bundle.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build'));
});

gulp.task('default', ['build']);