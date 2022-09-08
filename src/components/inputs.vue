<template>
  <div class="sys-inputs-wrapper" @mousedown.prevent>
    <h4 class="sys-inputs-title">输入数据</h4>
    <el-scrollbar height="460px" class="sys-inputs">
      <el-tree
        v-loading="loading"
        ref="treeRef"
        node-key="id"
        :data="data"
        :props="TreeProps"
        :load="loadNode"
        lazy
      >
        <template #default="{ node, data }">
          <span :class="{'sys-tree-node': !!data.action || data.type==='JSONArray'}">
            <span>{{ node.label }}
              <a v-if="data.type" class="sys-tree-node-type" @click.stop="handleNodeClick(data, node)">{{ data.type }}</a>
            </span>
            <el-input-number
              v-if="data.type==='JSONArray'"
              v-model="data.index"
              size="small"
              controls-position="right"
              class="sys-tree-node-number"
              @mousedown.stop
              @change="(val) => onIndexChange(val, node)"
            />
            <el-button v-if="data.action" class="sys-tree-node-action" type="primary" @click.stop="data.action.click(node, data)" :icon="data.action.icon" circle text></el-button>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, reactive } from 'vue'
import { useStore } from 'vuex'
import { isEmpty, map, get, toLower } from 'lodash'
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { ProcessorInstance, Transform } from '@/api/api'

const store = useStore();
const activeNode = inject('activeNode');

interface Tree {
  id: string;
  label: string;
  children?: Tree[];
  action?: { icon: string; click: Function };
  leaf?: boolean;
  expression?: string;
  type?: string;
  index?: number;
}
let data = reactive<Tree[]>([]);
let loading = ref(false);
const treeRef = ref<InstanceType<typeof ElTree>>();

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
      expression: expression
    }
    if (toLower(type) === 'jsonarray') {
      item.index = 0
    }
    if (!isEmpty(properties)) {
      item.children = loopUpstream(properties);
      item.hasChildren = true;
    } else {
      item.leaf = true
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
        store.commit('transform/setTransforms', res.data)
        transformList = map(res.data, item => {
          const { currentProcessor, output, transformId, processorId, transformType, name } = item;
          const trans = {
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
          }
          if (output) {
            trans.hasChildren = true;
            trans.children = loopUpstream(JSON.parse(output));
          } else {
            trans.leaf = true
          }
          return trans
        });
      }
      return resolve(transformList)
    })
  } else if (node.data.children) {
    return resolve(node.data.children)
  } else {
    return resolve([])
  }
}

function openTransform (node, data) {
  console.log('--- open transform: ', data.transform)
  store.commit('transform/openModal', {visible: true, transform: data.transform})
}
function handleNodeClick (data: Tree, node) {
  let exp = get(data, 'expression', '');
  if (node.parent && get(node.parent, 'data.type') === 'JSONArray') {
    const index = get(node.parent, 'data.index');
    exp = exp.replace('*', index);
  }
  store.dispatch('context/setExpression', exp)
}
function onIndexChange (val, data: Tree) {
  console.log('--- onIndexChange: ', val, data)
}

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
    &-number {
      width: 64px;
      &.el-input-number.is-controls-right .el-input__wrapper {
        padding-left: 8px!important;
        padding-right: 32px!important;
      }
    }
  }
</style>