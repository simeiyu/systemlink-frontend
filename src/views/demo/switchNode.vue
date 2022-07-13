<template>
  <div class="rect-item" :style="{width:width+'px',height:height+'px'}">
    <div class="title"> {{ label }}{{ nodeLabel }} </div>
  </div>
</template>

<script lang="ts">
import {inject, onMounted, ref} from "vue";

export default {
  name: "switchNode",
  props: {
    label: String,
    width: Number,
    height: Number
  },
  setup(props: any) {
    let nodeLabel = ref('');
    let {label, width, height} = props;
    let getNode: any;
    //如果没有label参数，就是作为节点传入的
    if (!label) {
      getNode = inject<any>('getNode');
    }
    onMounted(() => {
      //如果是节点,设置默认label
      if (getNode) {
        let node = getNode();
        nodeLabel.value = node.data.nodeLabel;
        //根据不同改的节点类型
        node.setData( {
          "processorId": node.id,
          "kind": "mapper",
          "path": '/aaa/bbb',
          "properties": {
            "prod1": "v1",
            "prod2": "v2"
          },
          "inType": "",
          "outType": ""
        },)
      }
    })
    return {label, width, height, nodeLabel};
  }
}
</script>

<style scoped lang="less">
.rect-item {
  width: 100%;
  height: 100%;
  background: rgb(239, 244, 255);
  cursor: pointer;
  display: inline-block;
  border: solid 2px rgb(95, 149, 255);
  text-align: center;
  box-sizing: border-box;
  position: relative;
  .title{
    text-align: left;
    font-size: 14px;
    font-weight: bold;
    .btn{
      z-index: 5;
    }
  }
  .in-item{
    background: #fff;
    height: 20%;
    margin: 10px;
  }
}
</style>