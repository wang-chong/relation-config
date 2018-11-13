var systemName = 'demo';
module.exports = {
  // 此处是开发的项目的简称，需要找后端进行确认，便于后端nginx代理返回静态资源，最后访问的html的地址将变为http://localhost:8080/gxqpt-first/index.html
  name: systemName,
  // 静态资源最后打包的文件夹名称，也就是static文件夹下的文件最后打包的文件夹名称，默认 项目名称_static
  assetsSubDirectory: systemName + '_static',
  // js的入口文件路径，webpack打包需要找到对应的入口
  jsEntry: './src/view/entry/**/*.js', // 一般不用修改
  // html模板地址
  htmlEntry: './src/view/entry/*.html', // 一般不用修改
  // 配置代理，便于本地开发过程中可以连到任意的地址进行调试，可以按照规则配置多个代理地址
  proxyTable: {
    '/api': { // ajax请求http://localhost:8080/api/123会被代理到http://139.159.241.21:10086
      target: 'http://139.159.241.21:10086',
      changeOrigin: true, //改变源
      pathRewrite: {
        '^/api': '/api' //路径重写
      }
    }
  }
}
