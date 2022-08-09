<template>
  <div class="map-node">
    <div class="header">
      <div class="icon">
        <i class="iconfont icon-a-lianhe290"></i>
        <div class="tip">
          决策分支
        </div>
      </div>
      <a class="btn-toggle" @click.stop="onToggle">{{icon}}</a>
    </div>
    <div class="footer">
      <a class="btn-add" @click.stop="onAddBranch">+</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, ref, computed } from "vue-demi";
import branch from "@/utils/choice/branch";

let collapsed = ref(false);
let icon = computed(() => collapsed.value ? '↓' : '↑');
const getNode = inject("getNode");
const getGraph = inject("getGraph");
const node = getNode();
const graph = getGraph();
function onToggle () {
  collapsed.value = !collapsed.value;
  if (collapsed.value) {
    node.getChildren().forEach(item => item.hide());
    node.resize(120, 90);
  } else {
    node.getChildren().forEach(item => item.show());
    node.resize(644, 486);
  }
}
function onAddBranch () {
  const index = node.getChildren().length;  
  const metaInfo = JSON.parse(node.getData().nodeData.metaInfo);
  const item = metaInfo.branches.find(item => item.processorType === 'when');
  branch.create(graph, node, index, item);
}
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
  padding: 16px;
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
    .tip{
      font-size: 14px;
      color: #4C5A67;
    }
    .iconfont {
      font-size: 26px;
      color: #0084FF;
    }
  }
  .footer {
    position: absolute;
    left: 0;
    bottom: 10px;
    width: 100%;
    text-align: center;
  }
}
</style>