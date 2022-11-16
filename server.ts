const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { Parameter } = require('suanpan_node_sdk');

// const systemlinkEndpoint = 'http://sp7.iamzju.com:30080';
const systemlinkEndpoint = 'http://systemlink-web-service.systemlink:8080';
axios.defaults.timeout = 60000;
axios.defaults.withCredentials = true;
axios.defaults.ContentType = 'application/json;charset=UTF-8';

const dist = __dirname + '/dist';
const app = express();
let port = 3004;
let AppId = 78242;
let NodeId = 'ff88e450625f11ed9524e5a09a748e9c';
let UserId = 1000184;
let ComponentId = 15130;

app.use(cors({
  origin: '*',
}));

app.engine('html', require('ejs-mate'));
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/assets", express.static(dist + '/assets'))
app.set('views', dist);

// app.use('/systemlink*', async (req, res, next) => {
//   const { originalUrl, method, params, body } = req;
//   let result;
//   switch(method) {
//     case 'GET':
//       result = await axios({ url: `${systemlinkEndpoint}${originalUrl}`, method, params});
//       break;
//     case 'POST':
//       result = await axios({ url: `${systemlinkEndpoint}${originalUrl}`,method, data: body});
//       break;
//     case 'DELETE':
//       result = await axios({ url: `${systemlinkEndpoint}${originalUrl}`,method, params});
//       break;
//   }
//   const { status, data } = result;
//   res.send(data);
//   next();
// });
app.get('/sp/context', (req, res) => {
  res.send({
    success: true,
    data: {
      appId: Parameter.AppId || AppId,
      nodeId: Parameter.NodeId || NodeId,
      userId: Parameter.UserId || UserId,
      componentId: Parameter.ComponentId || ComponentId,
      component: process.argv[2],
      componentType: process.argv[3]
    }
  })
});
app.get('/', (req, res) => {
  res.render('index')
});

app.listen(port, () => {
  console.info(`result callback server is listening at :${port}`);
});

