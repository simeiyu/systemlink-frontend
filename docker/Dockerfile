ARG ARCH="amd64"
FROM registry.cn-shanghai.aliyuncs.com/shuzhi-$ARCH/node_sdk_base:latest
WORKDIR /home/app/
RUN mkdir -p /home/app/dist
COPY package.json server.ts ./
RUN npm --registry http://registry.npm.taobao.org i --only=production
COPY dist ./dist
CMD [ "bash" ]

