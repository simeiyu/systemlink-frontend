import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";// 需要安装的插件@types/node
// 按需加载必备插件
import viteCompression from "vite-plugin-compression"; //gzip必备插件
const resolve = (dir: string) => path.join(__dirname, dir);
// 1. defineConfig: 不用 jsdoc 注解也可以获取类型提示
// 2. 找不到模块“path”或其相应的类型声明 或者 找不到名称“__dirname 安装 @types/node
// https://vitejs.dev/config/
export default defineConfig({
    publicDir: "public", // 公共文件路径,会被复制到outDir 根目录
    // 路径相关规则
    resolve: {
        alias: [
            {
                find: '@',
                replacement: path.resolve(__dirname, 'src')
            },
            {
                find: '@antv/x6',
                replacement: '@antv/x6/lib',
            },
            {
                find: '@antv/x6-vue-shape',
                replacement: '@antv/x6-vue-shape/lib',
            },
        ]
    },
    // 样式相关规则
    css: {
        preprocessorOptions: {
            scss: {
                // 加载全局样式
                additionalData: `@use './src/assets/styles/var.scss';
                         @use './src/assets/styles/common.scss';`,
            },
        },
    },
    // 为服务器设置代理规则
    server: {
        host: "0.0.0.0", // 指定服务器主机名
        port: 8688, // 指定服务端口号
        open: false, // 运行自动打开浏览器
        // https: false, // 关闭https
        strictPort: true, // 若3333端口被占用,直接结束项目
        proxy: {
            // 选项写法
            // "/api": {
            //   target: "http://jsonplaceholder.typicode.com",
            //   changeOrigin: true,
            //   rewrite: (path) => path.replace(/^\/api/, ""),
            // },
        },
    },
    // 打包相关规则
    build: {
        target: "es2020", //指定es版本,浏览器的兼容性
        outDir: "dist", //指定打包输出路径
        assetsDir: "assets", //指定静态资源存放路径
        cssCodeSplit: true, //css代码拆分,禁用则所有样式保存在一个css里面
        sourcemap: false, //是否构建source map 文件
        terserOptions: {
            // 生产环境移除console
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
    },
    plugins: [
        vue(),
        viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: "gzip",
            ext: ".gz",
        }),
        // styleImport({
        //   libs: [
        //     {
        //       libraryName: "element-plus",
        //       esModule: true,
        //       ensureStyleFile: true,
        //       resolveStyle: (name) => {
        //         name = name.slice(3);
        //         return `element-plus/packages/theme-chalk/src/${name}.scss`;
        //       },
        //       resolveComponent: (name) => {
        //         return `element-plus/lib/${name}`;
        //       },
        //     },
        //   ],
        // }),
    ],
});
