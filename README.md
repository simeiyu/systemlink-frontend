### 关于package.json
#### name
sp_systemlink
#### version
版本号
#### scripts
```jsx
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview",
    "v:patch": "npm version --no-git-tag-version patch",
    "docker": "vite build && node docker/build.js",
    "start": "node server.ts"
},
```

- dev：本地开发——前端
- build：前端构建dist目录
- serve：略
- v:patch：版本号更新
- docker：打包docker镜像，执行前请修改version
- start：启动server，带两个参数。这两个参数会从/sp/context 接口发送给前端。

### 组件的镜像设置
在算盘的组件或节点中，设置镜像（Image）为 [name]:[version]<br />例如：sp_systemlink:0.0.1
### 组件的启动命令
node server.ts
