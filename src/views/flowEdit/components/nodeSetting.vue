<template>
  <div class="sys-node-info" v-if="node">
    <h4 class="sys-node-name">节点信息</h4>
    <div class="sys-node-body">
    <el-form-item label="名称" label-width="40">
      <el-input v-model="node.name" placeholder="节点名称" @change="updateName"></el-input>
    </el-form-item>
    <el-button style="margin-left: 40px" type="danger" plain icon="Delete" @click="deleteNode">删除节点</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'; 
import { ActiveNode } from '@/store/type';

interface Props {
  node: ActiveNode;
  delete: Function;
  updateName: Function;
}

const props = defineProps<Props>();

function deleteNode () {
  props.delete && props.delete(props.node)
}

function updateName(val) {
  props.updateName && props.updateName(val)
}

</script>

<style lang="less" scoped>
  .sys-node{
    &-info {
      margin-top: 16px;
      border-top: 1px solid var(--el-border-color-light);
    }
    &-body {
      padding: 12px 16px;
    }
    &-name {
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      font-size: 14px;
      font-weight: normal;
      color: var(--el-text-color-primary);
    }
  }
</style>