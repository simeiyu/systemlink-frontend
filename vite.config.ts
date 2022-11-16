import {defineConfig} from "vite";
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
// @ts-ignore
import {name} from "./package.json";
// 按需加载必备插件
import vue from "@vitejs/plugin-vue";
import * as path from "path"; //gzip必备插件

// 1. defineConfig: 不用 jsdoc 注解也可以获取类型提示
// 2. 找不到模块“path”或其相应的类型声明 或者 找不到名称“__dirname 安装 @types/node
// https://vitejs.dev/config/
export default defineConfig({
    publicDir: "public", // 公共文件路径,会被复制到outDir 根目录
    // 路径相关规则
    base: './',
    resolve: {
        alias: [
            {
                find: '@',
                replacement: path.resolve(__dirname, "src"),
            },
            {
                find: '@antv/x6',
                replacement: '@antv/x6/dist/x6.js',
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
            less: {
                // 加载全局样式
                additionalData: `@use './src/assets/common.less';`,
            },
        },
    },
    // 为服务器设置代理规则
    server: {
        host: true, // 指定服务器主机名
        port: 8690, // 指定服务端口号
        open: false, // 运行自动打开浏览器
        // https: false, // 关闭https
        strictPort: true, // 若端口被占用,直接结束项目
        proxy: {
            "/systemlink": {
                target: "http://sp7.xuelangyun.com:30080/",
                // target: "http://10.88.36.131/",
                changeOrigin: true,
                headers: {
                  Cookie: 'sp7.sid=s%3ARgQVI1UXiasGs5Vpm_6a-2alCgQaMOv5.CeNzQLVyKW1PDMcsFPigc4eO43xM2RSU0mz5ob11g%2FA; Path=/; Expires=Thu, 17 Nov 2022 06:03:19 GMT; HttpOnly'
                }
                // rewrite: (path) => path.replace(/^\/api/, ""),
            },
            "/integration": {
                target: "http://sp7.xuelangyun.com:30080/",
                // target: " http://192.168.10.65:8080/",
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, ""),
            },
            '/sp/context': {
              changeOrigin: true,
              target: 'http://localhost:3004/'
            },
        },
    },
    // 打包相关规则
    build: {
        minify:'terser',
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
        chunkSizeWarningLimit: 10000,
    },
    define: {
      'process.env': process.env
    },
    plugins: [
        vue(),
        viteCommonjs(),
        // autoZip(),
    ],
});
