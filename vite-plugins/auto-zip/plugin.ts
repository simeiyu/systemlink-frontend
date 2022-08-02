import {Plugin} from "vite";

const path = require('path')
import * as fs from 'fs';
const JSZip = require('jszip');
import {name} from '../../package.json'
import VitePluginCompression from "vite-plugin-compression";
const zip = new JSZip()
const plugin = function(){
    const makeZip = function (outputDir:any, fileName = 'dist.zip') {
        const distPath = path.resolve(__dirname,'../../dist') as string;
        const readDir = function (zip:any, dirPath:string) {
            // 读取dist下的根文件目录
            const files = fs.readdirSync(dirPath);
            files.forEach((fileName:string) => {
                const fillPath = path.join(dirPath, "./", fileName)
                const file = fs.statSync(fillPath);
                // 如果是文件夹的话需要递归遍历下面的子文件
                if (file.isDirectory()) {
                    const dirZip = zip.folder(fileName);
                    readDir(dirZip, fillPath);
                } else {
                    // 读取每个文件为buffer存到zip中
                    zip.file(fileName, fs.readFileSync(fillPath))
                }
            });
        }
        const removeExistedZip = () => {
            const dest = path.join(distPath, './' + fileName)
            if (fs.existsSync(dest)) {
                fs.unlinkSync(dest)
            }
        }
        const zipDir = function () {
            readDir(zip, distPath);
            zip.generateAsync({
                type: "nodebuffer", // 压缩类型
                compression: "DEFLATE", // 压缩算法
                compressionOptions: { // 压缩级别
                    level: 9
                }
            }).then((content:any) => {
                const dest = path.join(outputDir, './' + fileName)
                removeExistedZip()
                // 把zip包写到硬盘中，这个content现在是一段buffer
                fs.writeFileSync(dest, content);
                console.log(`生成项目压缩包:${dest}`)
            });
        }
        removeExistedZip()
        zipDir()
    }
    return {
        name: 'vite-plugin-auto-zip',
        apply: 'build',
        enforce:'post',
        async closeBundle(){
            const realPath = path.resolve(__dirname,'../../deploy');
            if(!fs.existsSync(realPath)){
                fs.mkdirSync(realPath)
            }
            console.log(new Date().toLocaleString())
            const zipName = `${name}-${new Date().getTime()}.zip`
            makeZip(realPath,zipName)
        }
    }
}

module.exports = plugin