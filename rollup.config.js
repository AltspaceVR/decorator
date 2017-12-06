import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const babelConfig = {
	presets: [
		['env', {
			modules: false,
			//useBuiltIns: 'usage',
		}]
	],
	plugins: ['external-helpers', 'transform-runtime'],
	runtimeHelpers: true,
	externalHelpers: false,
	exclude: 'node_modules/**'
}

export default {
	input: 'src/index.js',
	output: {
		format: 'iife',
		file: 'build/bundle.js'
	},
	plugins: [babel(babelConfig), commonjs(), resolve()]
}