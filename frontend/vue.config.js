const webpack = require('webpack')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin()
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

let settings
try {
  settings = require('./vue.config.settings')
} catch (ex) {
  settings = {}
}

settings = Object.assign({}, require('./vue.config.settings.default'), settings)

const config = {
  lintOnSave: true,
  transpileDependencies: ['vuetify'],
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'development') {
      config.entry['app'].push(require.resolve(`webpack-dev-server/client`) + (settings.clientUrl ? '?' + settings.clientUrl : ''))
    }
    config.plugins.push(new VuetifyLoaderPlugin())
    config.plugins.push(gitRevisionPlugin)
    config.plugins.push(new webpack.DefinePlugin({
      'VERSION': JSON.stringify(gitRevisionPlugin.version()),
      'COMMITHASH': JSON.stringify(gitRevisionPlugin.commithash()),
      'BRANCH': JSON.stringify(gitRevisionPlugin.branch()),
    }))
  },
  devServer: {
    host: '0.0.0.0',
    port: settings.port,
    disableHostCheck: true,
    proxy: {
      '/sf': {
        target: settings.symfony,
        secure: false,
        changeOrigin: true,
        pathRewrite: {'^/sf/': '/'},
      }
    },
    watchOptions: {
      poll: 1000,
    }
  },
  pwa: {
    name: 'GFI Coffee',
    themeColor: '#000000',
    msTileColor: '#000000',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/sw.js',
      swDest: 'service-worker.js'
    }
  }
}

module.exports = config
