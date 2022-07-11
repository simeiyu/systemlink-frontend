<template>
  <div id="container"></div>
  <div class="prop">
    <div v-for="(value,key) in cusModel">
      {{key}} <input type="text" v-model="cusModel[key]">
    </div>

    <button @click="getConfig">导出</button>
    <button @click="importJson()">导入</button>
    <p>
      <textarea v-model="jsonInfo" style="height: 500px;width: 99%;"></textarea>
    </p>
  </div>
</template>

<script>
import { Graph } from '@antv/x6';
export default {
  name: "index",
  data(){
    return{
      cusModel:{},
      jsonInfo:''
    }
  },
  methods:{
    initMap(){
      const data =  [
        {
          "position": {
            "x": 40,
            "y": 40
          },
          "size": {
            "width": 100,
            "height": 40
          },
          "attrs": {
            "text": {
              "text": "Hello"
            },
            "customer":{
              "v1":'1',
              "v2":2,
              "v3":'3'
            },
            "body": {
              "rx": 10,
              "ry": 10
            }
          },
          "shape": "rect",
          "id": "64d6c6bd-3bcb-4a7c-9480-b988879d8372",
          "zIndex": 1
        },
        {
          "position": {
            "x": 240,
            "y": 180
          },
          "size": {
            "width": 100,
            "height": 40
          },
          "attrs": {
            "customer":{
              "v1":'11',
              "v2":"22",
              "v3":'33'
            },
            "text": {
              "text": "World"
            }
          },
          "shape": "ellipse",
          "id": "87e84f2b-2543-4774-b3e9-4aa8ea5ff738",
          "zIndex": 2
        },
        {
          "shape": "edge",
          "id": "07c1f11c-190b-413c-ad30-7b73005c8ddb",
          "source": {
            "cell": "64d6c6bd-3bcb-4a7c-9480-b988879d8372"
          },
          "target": {
            "cell": "87e84f2b-2543-4774-b3e9-4aa8ea5ff738"
          },
          "zIndex": 3
        }
      ]
      console.log(JSON.stringify(data));
      const graph = this.graph= new Graph({
        container: document.getElementById('container'),
        width: 800,
        height: 600,
        grid: { visible: true },
        snapline: {
          enabled: true,
        },
        selecting: {
          enabled: true,
          multiple: true,
          rubberband: true,
          movable: true,
          showNodeSelectionBox: true,
        },
      });
      // graph.fromJSON(data);
      let vm = this;
      graph.on('node:click', ({ e, x, y, node, view }) => {
        vm.cusModel = node.attrs.customer;
      })
    },
    getConfig(){
      this.jsonInfo =JSON.stringify(this.graph.toJSON());
    },
    importJson(){
      let obj = JSON.parse(this.jsonInfo)
      this.graph.fromJSON(obj)
    }
  },
  mounted() {
    this.initMap();
  }
}
</script>

<style scoped lang="less">
  .prop{
    position: absolute;
    right: 0;
    top: 0;
    background: #eee;
    height: 100vh;
    width: 300px;
  }
</style>