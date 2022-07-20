import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
// 按需加载必备插件
import viteCompression from "vite-plugin-compression"; //gzip必备插件
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
                find: '/@/',
                replacement: '/src/'
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
            "/systemlink": {
                // target: "http://10.88.36.131:8080/",
                target: " http://192.168.10.65:8080/",
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
    // 打包相关规则
    build: {
        minify: 'terser',
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
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                chunkFileNames: 'js/[name]-[hash].js', // 分类输出
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: '[ext]/[name]-[hash].[ext]',
                manualChunks(id) {
                    if (id.includes('node_modules')) { // 超大静态资源拆分
                        return id.toString().split('node_modules/')[1].split('/')[0].toString()
                    }
                }
            }
        }
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
    ],
});
