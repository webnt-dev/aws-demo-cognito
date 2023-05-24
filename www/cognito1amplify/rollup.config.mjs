// Import rollup plugins
import { rollupPluginHTML } from '@web/rollup-plugin-html';
import resolve from '@rollup/plugin-node-resolve';
// import minifyHTML from 'rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';
import json from "@rollup/plugin-json";
import { terser } from "rollup-terser";
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

// import { copyFirst } from './library/rollup-plugin-copy-first.js'
// import { minifyCss } from './library/rollup-plugin-minify-css.mjs'
import path from 'node:path';
import fs from "fs";



export default {
  plugins: [
		commonjs({
			strictRequires: "auto",
		}),


    // minifyCss({
    //   patterns: ['css/reset.css', 'css/app.css'],
    //   rootDir: 'src',
    //   destFile: path.join(process.cwd(), 'build/styles.min.css'),
		// 	// exclude: ['css/reset.css'],
    // }, (output) => {
    //   console.log(output);
    // }),

    // minifyCss({
    //   patterns: ['css/reset.css'],
    //   rootDir: 'src',
    //   destFile: path.join(process.cwd(), 'build/reset.min.css'),
    // }, (output) => {
    //   console.log(output);
    // }),

    // Entry point for application build; can specify a glob to build multiple
    // HTML files for non-SPA app

		copy({
			hook: "options",
      targets: [
        { src: './src/*.html', dest: 'build/' },
        // { src: ['assets/fonts/arial.woff', 'assets/fonts/arial.woff2'], dest: 'dist/public/fonts' },
        // { src: 'assets/images/**/*', dest: 'dist/public/images' }
      ]
    }),

		// copyFile('./src/index.html', './build/index.html'),
		// copyFile('./src/app.html', './build/app.html'),


    rollupPluginHTML({
      extractAssets: false,
			input: ['build/index.html'/*, 'build/app.html'*/] ,
    }),

    // Resolve bare module specifiers to relative paths
    resolve({
			'browser': true,
			'preferBuiltins': false,
		}),

    // Minify HTML template literals
    //minifyHTML(),

    // Minify JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),

    // Print bundle summary

    summary({
      showMinifiedSize: true,
    }),

		json(),
    // Optional: copy any static assets to build directory
  ],
//  input: 'ts-build/index.html',
  output: {
    dir: 'public',
		// preserveModules: true,
		// preserveModulesRoot: path.resolve(process.cwd(), 'build'),
		// format: 'esm',
  },
  preserveEntrySignatures: 'strict',
  onwarn: function(warning) {
    // Skip certain warnings

		// don't care
		if ( warning.code === 'CIRCULAR_DEPENDENCY' ) { return; }

    // should intercept ... but doesn't in some rollup versions
    if ( warning.code === 'THIS_IS_UNDEFINED' ) { return; }

    // console.warn everything else
    console.warn( warning.message );
  }
};
