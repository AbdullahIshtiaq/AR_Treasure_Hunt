// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb', 'gltf', 'png', 'jpg' ,'mtl', 'obj');
config.resolver.sourceExts.push('cjs');

module.exports = config;