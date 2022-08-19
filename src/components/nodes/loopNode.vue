<template>
  <div class="map-node">
    <div class="header">
      <div class="icon">
        <i class="iconfont icon-a-zu10160"></i>
        <div class="tip">
          {{label}}
        </div>
      </div>
      <a class="btn-toggle" @click.stop="onToggle">
        <i v-if="collapsed" class="iconfont icon-down"></i>
        <i v-else class="iconfont icon-up"></i>
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, ref, reactive, onMounted } from "vue-demi";

const getNode = inject("getNode");
const node = getNode();
let collapsed = ref(!!node.data.collapsed);
let expandSize = reactive({width: 500, height: 320});
let label = ref(node.data.name || '循环');

function onToggle () {
  collapsed.value = !collapsed.value;
  node.data.collapsed = collapsed.value;
  let toggleFunc;
  if (collapsed.value) {
    expandSize = node.getSize();
    node.resize(120, 90);
    toggleFunc = 'hide';
  } else {
    node.resize(expandSize.width, expandSize.height);
    toggleFunc = 'show';
  }
  node.getChildCount() && node.getChildren().forEach(item => item[toggleFunc]());
}
node.on('change:data', ({current}) => {
  label.value = current.name;
})
</script>

<style scoped lang="less">
.map-node {
  position: relative;
  width: 100%;
  height: 100%;
  background: #FFFFFF;
  border-radius: 16px 16px 16px 16px;
  border: 1px solid #DCDEE1;
  box-sizing: border-box;
  margin-bottom: 5px;
  gap:5px;
  padding: 8px 0 0 16px;
  font-size: 14px;
  font-weight: 400;
  color: #4C5A67;
  .header {
    display: flex;
    align-items: center;
  }
  .icon {
    width: 60px;
    text-align: center;
    margin-right: 8px;
    .tip{
      font-size: 14px;
      color: #4C5A67;
    }
    .iconfont {
      font-size: 26px;
      color: #0084FF;
    }
  }
}
</style>