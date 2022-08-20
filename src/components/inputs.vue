<template>
  <div class="sys-inputs-wrapper">
    <h4 class="sys-inputs-title">输入数据</h4>
    <el-scrollbar height="320px" class="sys-inputs">
      <el-tree
        ref="treeRef"
        node-key="id"
        :data="data"
        :props="TreeProps"
        :load="loadNode"
        @node-click="handleNodeClick"
        @node-expand="handleExpand"
        lazy
      >
        <template #default="{ node, data }">
          <span :class="{'sys-tree-node': !!data.action}">
            <span>{{ node.label }}</span>
            <span v-if="data.type" class="sys-tree-node-type">{{ data.type }}</span>
            <el-button v-if="data.action" class="sys-tree-node-action" type="primary" @click.stop="data.action.click(node, data)" :icon="data.action.icon" circle text></el-button>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, inject, reactive, defineEmits } from 'vue'
import { useStore } from 'vuex'
import { isEmpty, map } from 'lodash'
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { ProcessorInstance } from '@/api/api'

const store = useStore();
const activeNode = inject('activeNode');
const emits = defineEmits(['selectExpression'])

interface Tree {
  id: string;
  label: string;
  children?: Tree[];
  action?: { icon: string; click: Function };
  leaf?: boolean;
  expression?: string;
  type?: string;
}
let data = reactive<Tree[]>([]);

const treeRef = ref<InstanceType<typeof ElTree>>()

function getTransformChildren(id) {
  return map(store.getters.getInputTransforms(id), item => ({
      id: item.transformId,
      label: item.properties.name,
      action: {
        icon: 'Setting',
        click: openTransform
      },
      transform: item,
      leaf: true
    }))
}

function getTreeData() {
  const data: Tree[] = [];
  // 项目参数
  data.push({
    id: '111',
    label: '项目参数',
    children: [],
  })
  // 数据转换
  data.push({
    id: '222',
    label: '数据转换',
    action: {
      icon: 'Plus',
      click: openTransform
    },
    children: getTransformChildren(activeNode.value.id),
  })
  return data;
}

// 处理上游节点到tree
function getUpstream(list) {
  if (isEmpty(list)) return [];
  return map(list, item => {
    const output = JSON.parse(item.output);
    let children: Tree[] = [];
    if (output) {
      children = map(Object.keys(output), key => {
        const sub = output[key];
        return {
          id: key,
          label: sub.title,
          type: sub.type,
          expression: sub.expression,
          children: map(Object.keys(sub.properties), id => ({
            id: id,
            label: sub.properties[id].title,
            type: sub.properties[id].type,
            expression: sub.properties[id].expression,
            leaf: true
          }))
        }
      })
    }
    return {
      id: item.processorId,
      label: item.name || item.processorType,
      children
    }
  })
}

const loadNode = (node: Node, resolve: (data: Tree[]) => void) => {
  if (node.level === 0) {
    const rootTree = getTreeData();
    ProcessorInstance.getUpstream(node.id).then((res: any) => {
      const upstream = res ? getUpstream(res.data) : [];
      rootTree.push(...upstream);
      resolve(rootTree)
    })
  } else if (node.data.id === '222') {
    const currentTransforms = getTransformChildren(activeNode.value.id);
    return resolve(currentTransforms);
  } else if (node.data.children) {
    return resolve(node.data.children)
  } else {
    return resolve([])
  }
}

function openTransform (node, data) {
  const transformId = data.id !== '222' ? data.id : null;
  store.commit('setTransform', {visible: true, transformId, processorId: activeNode.value.id})
}
function handleNodeClick (node: Tree) {
  if (node.expression) {
    emits('selectExpression', node.expression)
  }
}
function handleExpand (data: Tree) {
  // console.log('--- expand: ', data)
}
watch(() => store.state.flowOut.transforms, () => {

})
const TreeProps = {
  children: 'children',
  label: 'label',
  isLeaf: 'leaf'
}
</script>

<style scoped lang="less">
  .sys-inputs {
    &-wrapper {
      width: 272px;
      border: 1px solid var(--el-border-color-lighter);
    }
    &-title {
      margin: 0;
      padding: 8px 12px;
      height: 40px;
      color: #1C2126;
      font-weight: bold;
      border-left: 2px solid var(--el-color-primary);
      border-bottom: 1px solid var(--el-border-color-light);
      background-color: var(--el-fill-color-lighter);
    }
  }
  .sys-tree-node {
    flex: 1 1 auto;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 8px;
    &-type {
      display: inline-block;
      margin-left: 12px;
      padding: 0 5px;
      border-radius: 5px;
      // background-color: var(--el-fill-color-lighter);
      border: 1px solid var(--el-border-color-lighter);
      font-size: 12px;
      color: var(--el-color-info);
    }
  }
</style>