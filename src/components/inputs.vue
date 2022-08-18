<template>
  <div class="sys-inputs-wrapper">
    <h4 class="sys-inputs-title">输入数据</h4>
    <el-tree
      :data="data"
      :props="TreeProps"
      node-key="id"
      accordion
      @node-click="handleNodeClick"
      class="sys-inputs"
    >
    <template #default="{ node, data }">
      <span :class="{'sys-tree-node': !!data.action}">
        <span>{{ node.label }}</span>
        <el-button v-if="data.action" type="primary" @click.stop="data.action.click(node, data)" :icon="data.action.icon" circle text></el-button>
      </span>
    </template>
    </el-tree>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, inject } from 'vue'
import { useStore } from 'vuex'
import { compact, filter, isEmpty, map, sortedUniq, find, forEach } from 'lodash'
import { Graph } from '@antv/x6'

const store = useStore();
const activeNode = inject('activeNode');
const graph: Graph = inject('graph');
console.log('--- activeNode: ', activeNode.value)

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
  input?: any;
}

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
  const nodes = [];
  getUpstreamNodeId(edges, compact([id, parentId, grantId]), nodes);
  return nodes;
}


// 通过上游节点id获取tree
function getUpstreamNodes(nodes) {
  const { id, parentId, grantId } = activeNode.value;
  const processors = store.state.flowOut.processors;
  let data: Tree[] = [];
  if (grantId) {
    let grant = find(processors, {processorId: grantId});
    let parent = find(grant.processors, {processorId: parentId})
    let grantNode = {
      id: grant.processorId,
      label: grant.name,
      output: grant.output,
      children: [{
        id: parent.processorId,
        label: parent.name,
        output: parent.output,
        children: map(filter(parent.processors, ({processorId}) => {
          const index = nodes.indexOf(processorId);
          nodes.splice(index, 1);
          return index > -1;
        }), item => ({
          id: item.d,
          label: item.name,
          output: item.output
        })),
      }]
    }
    data = [grantNode]
  } else if (parentId) {
    let parent = find(processors, {processorId: parentId})
    let parentNode = {
      id: parent.processorId,
      label: parent.name,
      output: parent.output,
      children: map(filter(parent.processors, ({processorId}) => {
          const index = nodes.indexOf(processorId);
          nodes.splice(index, 1);
          return index > -1;
        }), item => ({
        id: item.d,
        label: item.name,
        output: item.output
      })),
    }
    data = [parentNode]
  }
  forEach(nodes, id => {
    const item = find(processors, {processorId: id});
    if (item) {
      data.push({
        id: item.processorId,
        label: item.name,
        output: item.output,
      })
    }
  })
}

function getTreeData(types) {
  const data: Tree[] = [];
  const nodes = getNodes();
  if (types.indexOf('properties') > -1) {
    // 项目参数
    data.push({
      id: '111',
      label: '项目参数',
      children: [],
    })
  }
  if (types.indexOf('transforms') > -1) {
    const children = map(store.getters.getInputTransforms(nodes), item => ({
      id: item.transformId,
      label: item.properties.name,
      action: {
        icon: 'Plus',
        click: openTransform
      },
      transform: item
    }))
    data.push({
      id: '222',
      label: '数据转换',
      children,
      action: {
        icon: 'Plus',
        click: openTransform
      }
    })
  }
  if (!isEmpty(nodes)) {
    // 将上游节点加入Tree
    const upstreamNodes = getUpstreamNodes(nodes)
  }
  return data;
}

const data = getTreeData(props.types);

function openTransform (node, data) {
  console.log('transform opened: ', node, data)
}
function handleNodeClick () {

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
      border-bottom: 1px solid var(--el-border-color-extra-light);
      background-color: var(--el-fill-color-lighter);
    }
  }
  .sys-tree-node {
    flex: 1 1 auto;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 8px;
  }
</style>