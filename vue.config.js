module.exports = {
    devServer: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          secure: true,
          changeOrigin: true,
          pathRewrite: {
            '^/api': '',
          },
        }
      },
    },
  }