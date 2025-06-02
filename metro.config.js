const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

// Provide Node core module polyfills and stub unsupported modules
const extraModules = require('node-libs-react-native');
// Map https and http to browser-compatible versions
extraModules.https = require.resolve('https-browserify');
extraModules.http = require.resolve('stream-http');
// Stub 'net' and 'ws' (Node-only) to an empty shim
extraModules.net = path.resolve(__dirname, 'shims/empty.js');
extraModules.ws = path.resolve(__dirname, 'shims/empty.js');
defaultConfig.resolver.extraNodeModules = extraModules;
// Support .cjs files used by some Node libraries
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'cjs'];

module.exports = defaultConfig; 