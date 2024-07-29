/**
 * Builds the DLL for development electron renderer process
 */

import webpack from 'webpack';
import path from 'path';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import { dependencies } from '../../package.json';
import checkNodeEnv from '../scripts/check-node-env';

checkNodeEnv('production');

const dist = webpackPaths.dllPath;

function getDependencies(especialLibraries: string[]): string[] {
  const tempDependencies = { ...dependencies };
  Object.keys(tempDependencies || {}).forEach((key) => {
    if (especialLibraries.includes(key)) {
      delete tempDependencies[key];
    }
  });

  return Array.from(new Set([...Object.keys(tempDependencies || {})]));
}

const configuration: webpack.Configuration = {
  context: webpackPaths.rootPath,
  devtool: 'eval',
  mode: 'production',
  target: 'electron-renderer',
  externals: ['fsevents', 'crypto-browserify'],
  module: require('./webpack.config.renderer.prod').default.module,
  entry: {
    renderer: getDependencies(['primereact', 'primeflex', 'primeicons']),
  },
  output: {
    path: dist,
    filename: '[name].prod.dll.js',
    library: {
      name: 'renderer',
      type: 'var',
    },
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(dist, '[name].json'),
      name: '[name]',
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: webpackPaths.srcPath,
        output: {
          path: webpackPaths.dllPath,
        },
      },
    }),
  ],
};

export default merge(baseConfig, configuration);
