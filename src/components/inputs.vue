<template>
  <div class="sys-inputs-wrapper">
    <h4 class="sys-inputs-title">输入数据</h4>
    <el-scrollbar height="460px" class="sys-inputs">
      <el-tree
        v-loading="loading"
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
import { ref, watch, inject, reactive, defineEmits, computed } from 'vue'
import { useStore } from 'vuex'
import { isEmpty, map, get } from 'lodash'
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { ProcessorInstance, Transform } from '@/api/api'

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
let loading = ref(false);
const treeRef = ref<InstanceType<typeof ElTree>>();

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
    children: []
    // children: getTransformChildren(activeNode.value.id),
  })
  return data;
}

function loopUpstream(data) {
  return map(Object.keys(data), key => {
    const { title, type, expression, properties } = data[key];
    const item = {
      id: key,
      label: title,
      type: type,
      expression: expression,
      hasChildren: false
    }
    if (!isEmpty(properties)) {
      item.children = loopUpstream(properties);
      item.hasChildren = true;
    }
    return item
  })
}
// 处理上游节点到tree
function getUpstream(list) {
  if (isEmpty(list)) return [];
  return map(list, item => {
    const output = JSON.parse(item.output);
    let children: Tree[] = [];
    if (output) {
      children = loopUpstream(output);
    }
    return {
      id: item.processorId,
      label: item.name || item.processorType,
      children
    }
  })
}

const loadNode = (node: Node, resolve: (data: Tree[]) => void) => {
  if (!activeNode.value) resolve([])
  if (node.level === 0) {
    loading.value = true;
    const rootTree = getTreeData();
    ProcessorInstance.getUpstream(activeNode.value.id).then((res: any) => {
      const upstream = res ? getUpstream(res.data) : [];
      rootTree.push(...upstream);
      loading.value = false;
      resolve(rootTree)
    })
  } else if (node.data.id === '222') {
    Transform.getTransforms(activeNode.value.id).then((res: any) => {
      console.log('--- res: ', res)
      let transformList: Tree[] = [];
      if (res.data) {
        transformList = map(res.data, item => {
          const { currentProcessor, properties, output, transformId, processorId, transformType, name } = item;
          store.commit('updateTransforms', {
            processorId,
            transformId,
            properties: JSON.parse(properties),
            output: JSON.parse(output),
          });
          return {
            id: transformId,
            label: name,
            action: {
              icon: 'Setting',
              click: openTransform
            },
            transform: {
              transformId,
              processorId,
              transformType,
              currentProcessor,
            },
            leaf: true
          }
        });
      }
      return resolve(transformList)
    })
    // return resolve(currentTransforms);
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