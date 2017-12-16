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
	let localBabelConfig = Object.assign({}, babelConfig, {sourceMaps: false});
	
	const bundle = await rollup.rollup({
		input: 'src/js/index.js',
		plugins: [babel(localBabelConfig), commonjs(), resolve()]
	});

	await bundle.write({
		format: 'iife',
		file: 'build/bundle.js',
		sourcemap: true
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
	let localBabelConfig = Object.assign({}, babelConfig, {sourceMaps: true, sourceMapTarget: 'build/bundle.min.js.map'});
	const bundle = await rollup.rollup({
		input: 'src/js/index.js',
		plugins: [babel(localBabelConfig), commonjs(), resolve(), uglify({
			sourceMap: {filename: 'bundle.min.js', url: 'bundle.min.js.map'}
		})]
	});

	await bundle.write({
		format: 'iife',
		file: 'build/bundle.min.js',
		sourcemap: true
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