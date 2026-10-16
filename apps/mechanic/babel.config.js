module.exports = function (api) {
  api.cache(true);
  const isWeb = process.env.EXPO_WEBPACK_PLATFORM === 'web' || process.env.npm_lifecycle_script?.includes('web');
  return {
    presets: ['babel-preset-expo'],
    plugins: isWeb ? [] : ['nativewind/babel'],
  };
};
