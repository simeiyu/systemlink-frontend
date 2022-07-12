<template>
  <div class="rect-item"
       :style="{width:width+'px',height:height+'px'}"
       draggable="true"
       @dragstart="drag($event,label)"
  >{{ label }}{{nodeLabel}}</div>
</template>

<script lang="ts">
export default {
  name: "components",
  props:{
    label:String,
    width:Number,
    height:Number
  },
  data(){
    return{
      nodeLabel:''
    }
  },
  setup(props:any) {
    let {label,width,height} = props;
    function drag(ev: DragEvent, item: Object) {
      ev.dataTransfer?.setData("item", label);
    }
    return {label,width,height,drag};
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
  line-height: 50px;
  text-align: center;
  box-sizing: border-box;
}
</style>