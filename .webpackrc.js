const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  proxy: {
    //context: ["/auth", "/api"],
    "/authentication/require": {
      //"target": "http://192.168.1.100:8181"
      "target": "http://www.honke.club/yiw"
    }, 
    "/api": {
      //"target": "http://192.168.1.100:8181",
      "target": "http://www.honke.club/api",
      "pathRewrite": { "^/api" : "" }
    }
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  disableDynamicImport: false,
  hash: true,
};
