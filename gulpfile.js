const gulp = require('gulp'),
	pug = require('gulp-pug'),
	del = require('del'),

	rollup = require('rollup'),
	babel = require('rollup-plugin-babel'),
	commonjs = require('rollup-plugin-commonjs'),
	resolve = require('rollup-plugin-node-resolve'),
	uglify = require('rollup-plugin-uglify');

const babelConfig = {
	presets: [
		['env', {
			modules: false,
			useBuiltIns: 'usage',
			targets: {
				chrome: '40'
			}
		}]
	],
	plugins: ['external-helpers', 'transform-runtime'],
	runtimeHelpers: true,
	externalHelpers: true,
	exclude: 'node_modules/**'
};
	
gulp.task('clean', function(){
	return del(['index.html']);
});

gulp.task('js-dev', async function()
{
	const bundle = await rollup.rollup({
		input: 'src/js/index.js',
		plugins: [babel(babelConfig), commonjs(), resolve()]
	});

	await bundle.write({
		format: 'iife',
		file: 'build/bundle.js'
	});
});

gulp.task('html-dev', ['clean'], function(){
	return gulp.src('src/index.pug')
		.pipe(pug({
			locals: {
				production: false
			}
		}))
		.pipe(gulp.dest('.'));
});

gulp.task('js-prod', async function()
{
	const bundle = await rollup.rollup({
		input: 'src/js/index.js',
		plugins: [babel(babelConfig), commonjs(), resolve(), uglify()]
	});

	await bundle.write({
		format: 'iife',
		file: 'build/bundle.min.js'
	});
});

gulp.task('html-prod', ['clean'], function(){
	return gulp.src('src/index.pug')
		.pipe(pug({
			locals: {
				production: true
			}
		}))
		.pipe(gulp.dest('.'));
});

gulp.task('build-dev', ['js-dev', 'html-dev']);
gulp.task('build', ['js-prod', 'html-prod']);
gulp.task('default', ['build']);