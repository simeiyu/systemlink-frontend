<template>
  <div class="sys-inputs-wrapper">
    <h4 class="sys-inputs-title">输入数据</h4>
    <el-scrollbar height="320px" class="sys-inputs">
      <el-tree
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
import { ref, defineProps, inject, reactive, defineEmits } from 'vue'
import { useStore } from 'vuex'
import { compact, filter, isEmpty, map, sortedUniq } from 'lodash'
import { Graph } from '@antv/x6'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { ProcessorInstance } from '@/api/api'

const store = useStore();
const activeNode = inject('activeNode');
const graph = inject('graph');
const emits = defineEmits(['selectExpression'])

let props = defineProps({
  types: {
    type: String,
    required: true,
    default: () => 'properties,transforms'
  }
})
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
let nodes:string[] = [];

function getUpstreamNodeId(edges, ids, box) {
  const upstreams = filter(edges, edge => ids.includes(edge.target.cell)).map(edge => edge.source.cell);
  const nodeIds = sortedUniq(compact(upstreams));
  if (!isEmpty(nodeIds)) {
    box.push(...nodeIds);
    getUpstreamNodeId(edges, nodeIds, box);
  }
}

// 获取上游节点
function getNodes() {
  if (!graph || !activeNode) return null;
  const edges = graph.getEdges();
  const { id, parentId, grantId } = activeNode.value;
  const _nodes = compact([id, parentId, grantId]);
  getUpstreamNodeId(edges, _nodes, _nodes);
  return _nodes;
}

function getTransformChildren() {
  return map(store.getters.getInputTransforms(nodes), item => ({
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

function getTreeData(types) {
  const data: Tree[] = [];
  nodes = getNodes();
  if (types.indexOf('properties') > -1) {
    // 项目参数
    data.push({
      id: '111',
      label: '项目参数',
      children: [],
    })
  }
  if (types.indexOf('transforms') > -1) {
    const children = getTransformChildren()
    data.push({
      id: '222',
      label: '数据转换',
      action: {
        icon: 'Plus',
        click: openTransform
      },
      children,
    })
  }
  data.push({
    id: '333',
    label: '前序节点',
    children: [],
  })
  return data;
}

data = getTreeData(props.types);

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
    const rootTree = getTreeData(props.types);
    return resolve(rootTree)
  } else if (node.data.id == '222') {
    const children = getTransformChildren();
    return resolve(children);
  } else if (node.data.id == '333') {
    ProcessorInstance.getUpstream(6).then((res: any) => {
      console.log('---upstream: ', res)
      const upstream = res ? getUpstream(res.data) : [];
      resolve(upstream)
    })
  } else if (node.data.children) {
    return resolve(node.data.children)
  } else {
    return resolve([])
  }
}

function openTransform (node, data) {
  console.log('transform opened: ', node, data)
  const transformId = data.id !== '222' ? data.id : null;
  store.commit('setTransform', {visible: true, transformId, processorId: activeNode.value.id})
}
function handleNodeClick (node: Tree) {
  console.log('--- click: ', node)
  if (node.expression) {
    emits('selectExpression', node.expression)
  }
}
function handleExpand (data: Tree) {
  // console.log('--- expand: ', data)
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
  }
</style>