const path = require("path");

const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  publicPath: "/",
  productionSourceMap: false,
  devServer: {
    port: 8080,
    open: false,
    overlay: {
      warnings: false,
      errors: true,
    },
  },

  configureWebpack: {
    resolve: {
      alias: {
        "@": resolve("src"),
        src: resolve("src"),
        common: resolve("src/common"),
        components: resolve("src/components"),
        views: resolve("src/views"),
      },
    },
  },
  // css: {
  //     loaderOptions: {
  //         // 给 sass-loader 传递选项
  //         sass: {
  //             prependData: `@import "@/assets/stylesheets/_new_variable";`,
  //         },
  //     },
  // },
  configureWebpack: (config) => {
    const myConfig = {};
    if (process.env.NODE_ENV === "production") {
      myConfig.plugins = [];
      // 去掉注释
      // 去掉注释
      myConfig.plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              comments: false, // 去掉注释
            },
            compress: {
              warnings: false,
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ["console.log"], //移除console
            },
          },
        })
      );
    }
  },
  chainWebpack(config) {
    config.plugins.delete("preload");
    config.plugins.delete("prefetch");

    config.module.rule("svg").exclude.add(resolve("src/icons")).end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();

    // config.module
    //     .rule("vue")
    //     .use("vue-loader")
    //     .loader("vue-loader")
    //     .tap((options) => {
    //         options.compilerOptions.preserveWhitespace = true;
    //         return options;
    //     })
    //     .end();
    config.when(process.env.NODE_ENV === "development", (config) =>
      config.devtool("cheap-source-map")
    );

    config.when(process.env.NODE_ENV !== "development", (config) => {
      config
        .plugin("ScriptExtHtmlWebpackPlugin")
        .after("html")
        .use("script-ext-html-webpack-plugin", [
          {
            inline: /runtime\..*\.js$/,
          },
        ])
        .end();
      config.optimization.splitChunks({
        chunks: "all",
        cacheGroups: {
          libs: {
            name: "chunk-libs",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: "initial",
          },
          // elementUI: {
          //     name: "chunk-elementUI",
          //     priority: 20,
          //     test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
          // },
          commons: {
            name: "chunk-commons",
            test: resolve("src/components"),
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      });
      config.optimization.runtimeChunk("single");
    });
  },
};
