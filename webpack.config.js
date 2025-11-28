const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Set EXPO_ROUTER_APP_ROOT for expo-router
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(path.resolve(__dirname, 'app')),
    })
  );
  
  // Customize the config
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native': 'react-native-web',
  };
  
  return config;
};

