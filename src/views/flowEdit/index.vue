<template>
  <div class="flow-header">
    <div class="left">
      <div class="back">
        <el-icon>
          <ArrowLeftBold/>
        </el-icon>
      </div>
      <div class="title">
        集成流操作
      </div>
    </div>
    <div class="right">
      <!-- 撤销 -->
      <el-button icon="DArrowLeft" plain size="large" circle text :disabled="canUndo" @click="onUndo" />
      <!-- 重做 -->
      <el-button icon="DArrowRight" size="large" circle text :disabled="canRedo" @click="onRedo" />
      <div class="v-line"></div>
      <!-- 设置 -->
      <el-button icon="Setting" text circle size="large"/>
      <!-- 停止 -->
      <el-button v-if="status==='running'" icon="VideoPause" text circle size="large" @click="handleTurnOff" />
      <!-- 测试 -->
      <el-button v-else icon="VideoPlay" text circle size="large" @click="handleTurnOn" />
      <!-- 发布 -->
      <el-button icon="Promotion" text circle size="large" />
      <!-- 清理 -->
      <el-button icon="Briefcase" text circle size="large" @click="clearCells" />
    </div>
  </div>
  <div class="flow-center">
    <!-- 画布区域 -->
    <div class="flow-left">
      <div class="flow-box" id="boxRf"></div>
      <!-- <div class="flow-bottom"></div> -->
    </div>
    <!-- 右侧组件栏、设置项 -->
    <div class="tool-box">
      <el-tabs v-model="activeName" class="sys-tabs">
        <el-tab-pane label="组件栏" name="components">
          <div class="sys-group">
            <el-input class="input" placeholder="关键词搜索" size="large"/>
            <el-skeleton style="padding: 12px;" v-if="loading" :rows="5" animated />
            <div class="sys-group-nodes"
                :class="{active:curActive===index}"
                v-for="(item,index) in nodeGroup">
              <div class="item-block"
                  @click="curActive=index">
                <el-icon class="arrow-icon">
                  <CaretRight/>
                </el-icon>
                <span>{{ item.name }}</span>
              </div>
              <div class="item-box">
                <rectNode
                  :icon="node.icon"
                  :label="node.name"
                  @mousedown="dropNode($event,node)"
                  v-for="node in item.processorMetaVOList"
                ></rectNode>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="设置项" name="settings">
          <el-scrollbar>
            <form-render v-if="activeNode" :node="activeNode"></form-render>
            <node-setting :node="activeNode" :delete="deleteNode" :updateName="updateName" />
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  <transform :active-node="activeNode" />
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref, createVNode, computed, provide, watch } from "vue";
import { Graph, Addon, Shape, Dom, Node } from '@antv/x6';
import { useStore } from 'vuex';
import { get, filter, map, findIndex, forEach } from 'lodash';
import { ElMessage } from 'element-plus';
import ports from "@/views/flowEdit/ports";
import rectNode from "@/components/nodes/rectNode.vue";
import choiceNode from "@/components/nodes/choiceNode.vue"
import loopNode from "@/components/nodes/loopNode.vue"
import transform from '@/components/transform.vue';
import branch from "@/utils/choice/branch";
import formRender from './components/formRender.vue'
import nodeSetting from './components/nodeSetting.vue'
import { ActiveNode, Processor } from '@/store/modules/graph';

const store = useStore();

let dnd: Addon.Dnd;
let graph: Graph;
const activeName = ref('components');
let curActive = ref(0);
let nodeGroup = computed(() => store.state.components.nodeGroup)
let loading = computed(() => store.state.components.loading);
let status = computed<string>(() => store.state.graph.status);
let activeNode:Ref<ActiveNode | null> = ref();
let canRedo = ref(true);
let canUndo = ref(true);
provide('activeNode', activeNode);

function getUpstreamProcessorId(id) {
  const edges = filter(graph.getEdges(), edge => edge.target.cell === id);
  const upstreams = map(edges, edge => edge.source.cell);
  return upstreams ? upstreams[0] : null;
}

function initEditor() {
  //注册组件节点
  Graph.registerVueComponent(
      "rectNode",
      {
        //只能使用render方式保证打包之后展示正常
        render() {
          return createVNode(rectNode, {onMap: true});
        }
      } as any,
      true
  );
  Graph.registerVueComponent(
      "choiceNode",
      {
        //只能使用render方式保证打包之后展示正常
        render() {
          return createVNode(choiceNode);
        }
      } as any,
      true
  );
  Graph.registerVueComponent(
      "loopNode",
      {
        //只能使用render方式保证打包之后展示正常
        render() {
          return createVNode(loopNode);
        }
      } as any,
      true
  );
  graph = new Graph({
    container: document.getElementById('boxRf') as HTMLElement,
    grid: {
      size: 14,
      visible: true,
      type: 'mesh', // 'dot' | 'fixedDot' | 'mesh'
      args: {
        color: '#DCDEE1', // 网格线/点颜色
        thickness: 1,     // 网格线宽度/网格点大小
      },
    },
    panning: true,  // 画布拖曳
    history: true,  // 撤销、重做
    autoResize: true,
    keyboard: {   // 键盘快捷键
      enabled: true
    },
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      router: {
        name: 'manhattan',
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#0084FF',
              strokeWidth: 2,
              strokeDasharray: 5,
              targetMarker: 'classic',
              style: {
                animation: 'ant-line 30s infinite linear',
              },
            },
          },
          zIndex: 1,
        })
      },
      validateConnection({targetMagnet}) {
        return !!targetMagnet
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95FF',
          },
        },
      },
    },
    selecting: {
      enabled: true,
      rubberband: false,   // 是否启用框选
      showNodeSelectionBox: true,
      showEdgeSelectionBox: false,
      // choice组件在画布中不选中
      // filter(node) {
      //   return !['choice', 'when', 'otherwise', 'loop'].includes(node.data.kind);
      // },
      // 有节点被选中，其他事件依然响应
      pointerEvents: 'none',
    },
    translating: {
      // 将子节点的移动范围限制在父节点内
      restrict(view) {
        const cell = view.cell
        if (cell.isNode()) {
          const parent = cell.getParent()
          if (parent) {
            if (parent.getData().kind === 'choice') return cell.getBBox()
            return parent.getBBox()
          }
        }

        return null
      },
    },
    embedding: {
      enabled: true,
      findParent({node}) {
        const bbox = node.getBBox()
        const kind = node.getData().kind;
        if (kind === 'when' || kind === 'otherwise') return []
        return this.getNodes().filter((item) => {
          // 只有 data.kind 为 when、otherwise 或 loop 的节点才是父节点
          const data = item.getData<any>()
          if (data && ['choice', 'when', 'otherwise', 'loop'].includes(data.kind)) {
            const targetBBox = item.getBBox()
            return bbox.isIntersectWithRect(targetBBox)
          }
          return false
        })
      }
    },
    resizing: {
      enabled: (node) => ['when', 'otherwise', 'loop'].includes(node.data.kind),
      minWidth: 90,
      minHeight: 90,
    },
    scaling: { min: 0.1, max: 5},
    snapline: true,
    clipboard: true,
  });
  provide('graph', graph);
  dnd = new Addon.Dnd({
    target: graph,
    scaled: false,
    animation: true,
    validateNode(droppingNode: any, options: any) {
      return droppingNode.shape === 'html'
          ? new Promise<boolean>((resolve) => {
            const {draggingNode, draggingGraph} = options
            const view = draggingGraph.findView(draggingNode)
            const contentElem = view.findOne('foreignObject > body > div')
            Dom.addClass(contentElem, 'validating')
            setTimeout(() => {
              Dom.removeClass(contentElem, 'validating')
              resolve(true)
            }, 3000)
          })
          : true
    },
  })
  // 点击画布中的节点
  graph.on('node:click', ({node}) => {
    if (!activeNode.value || activeNode.value.id !== node.id) {
      const sourceId = getUpstreamProcessorId(node.id);
      const item = {id: node.id, name: get(node, 'data.name', ''), kind: get(node, 'data.kind'), parentId: node.getParentId(), sourceId};
      store.dispatch('graph/getProcessor', {
        processorId: node.id,
        name: item.name,
        kind: item.kind,
        parentProcessorId: item.parentId,
        sourceProcessorId: sourceId
      });
      activeNode.value = item;
      activeName.value = 'settings';
    }
  })
  // 控制连接桩显示/隐藏
  const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden'
    }
  }
  graph.on('node:mouseenter', () => {
    const container = document.getElementById('boxRf')!
    const ports = container.querySelectorAll(
        '.x6-port-body',
    ) as NodeListOf<SVGElement>
    showPorts(ports, true)
  })
  graph.on('node:mouseleave', () => {
    const container = document.getElementById('boxRf')!
    const ports = container.querySelectorAll(
        '.x6-port-body',
    ) as NodeListOf<SVGElement>
    showPorts(ports, false)
  })
  graph.on('node:embedded', ({node, currentParent, previousParent}) => {
    // console.log('--- node embedded: ', node, currentParent, previousParent)
    if (currentParent && currentParent.isNode()) {
      if (previousParent?.id !== currentParent.id) {
        save();
        store.dispatch('graph/saveProcessor', { processorId: node.id, parentProcessorId: currentParent.id });
      }
      // let originSize = currentParent.prop('originSize')
      // if (originSize == null) {
      //   currentParent.prop('originSize', currentParent.getSize())
      // }
      // originSize = currentParent.prop('originSize')

      // let originPosition = currentParent.prop('originPosition')
      // if (originPosition == null) {
      //   currentParent.prop('originPosition', currentParent.getPosition())
      // }
      // originPosition = currentParent.prop('originPosition')

      // let x = originPosition.x
      // let y = originPosition.y
      // let cornerX = originPosition.x + originSize.width
      // let cornerY = originPosition.y + originSize.height
      // let hasChange = false

      // const children = currentParent.getChildren()
      // if (children) {
      //   children.forEach((child) => {
      //     const bbox = child.getBBox().inflate(10)
      //     const corner = bbox.getCorner()

      //     if (bbox.x < x) {
      //       x = bbox.x
      //       hasChange = true
      //     }

      //     if (bbox.y < y) {
      //       y = bbox.y
      //       hasChange = true
      //     }

      //     if (corner.x > cornerX) {
      //       cornerX = corner.x
      //       hasChange = true
      //     }

      //     if (corner.y > cornerY) {
      //       cornerY = corner.y
      //       hasChange = true
      //     }
      //   })
      // }

      // if (hasChange) {
      //   currentParent.prop(
      //       {
      //         position: {x, y},
      //         // size: {width: cornerX - x, height: cornerY - y},
      //       },
      //       // Note that we also pass a flag so that we know we shouldn't
      //       // adjust the `originPosition` and `originSize` in our handlers.
      //       {skipParentHandler: true},
      //   )
      // }
    }
  })
  graph.on('node:added', ({node, index, options}) => {
    const kind = get(node, 'data.kind');
    const parentId = node.getParentId();
    const processor: Processor = {
      parentProcessorId: parentId,
      processorId: node.id,
      name: get(node, 'data.name', ''),
      processorType: kind,
      properties: {},
      output: ''
    }
    if (node["component" as keyof typeof node] === "choiceNode") {
      //元数据解析
      // processor.processors = [];
      const metaInfo = store.getters['components/metaInfo'](kind);
      if (metaInfo) {
        metaInfo.branches.forEach((item)=>{
          branch.create(graph, node, item);
        });
      }
    }
    save();
    store.dispatch('graph/addProcessor', processor);
  })
  graph.on('node:unselected', ({node}) => {
    if (activeNode.value && node.id === activeNode.value.id) {
      activeNode.value = null;
      activeName.value = 'components';
    }
  });
  
  // 节点被删除
  graph.on('node:removed', ({node}) => {
    const item: ActiveNode = {id: node.id, name: get(node, 'data.name', ''), kind: get(node, 'data.kind'), parentId: node.getParentId()};
    if (item.parentId) {
      item.grantId = node.parent?.getParentId();
    }
    // 如果被删除的节点是when，则修改choice节点的height及其子节点的y
    if (item.kind === 'when') {
      const choice = graph.getCellById(item.parentId);
      if (choice) {
        const { y } = node.position();
        const children = choice.getChildren();
        const { width, height } = choice.getSize();
        choice.resize(width, height - 122 - 20);
        children && children?.forEach(item => {
          const pos = item.position();
          if (pos.y > y) {
            item.position(pos.x, pos.y - 142)
          }
        });
      }
    }
    save();
    store.dispatch('graph/deleteProcessor', node.id);
    if (activeNode.value && activeNode.value.id === node.id) {
      activeNode.value = null;
      activeName.value = 'components';
    }
  })

  // 键盘事件绑定
  graph.bindKey('ctrl+c', () => {

  })
  graph.bindKey('delete', () => {
    const cells = graph.getSelectedCells();
    forEach(cells, cell => {
      if (cell.data.kind === 'otherwise') {
        ElMessage.warning('决策组件中不能没有otherwise')
      } else if (cell.data.kind === 'when') {
        const when = filter(cell.getParent()?.getChildren(), item => item.data.kind === 'when');
        if (when.length === 1) {
          ElMessage.warning('决策组件中至少要有一个when')
        } else {
          graph.removeCell(cell)
        }
      } else {
        graph.removeCell(cell)
      }
    })
  })

  graph.on('node:change:size', ({node, current, previous}) => {
    // 决策分支内的when或otherwise, 向右|下改变size
    if (['when', 'otherwise'].includes(node.data.kind)) {
      // console.log('--- size: ', node, current, previous)
      const choice = node.getParent();
      if (choice) {
        const children = choice?.getChildren();
        const padding = [68, 20, 48, 20];
        let { x, y, width, height } = choice.getBBox();
        let left = x + padding[3];
        const index = findIndex(children, item => item.id === node.id);
        const my = current?.height - previous?.height;
        let right = 0
        children?.forEach((child, i) => {
          const box = child.getBBox();
          const r = box.x + box.width;
          if (box.x < left) left = box.x;
          if (r > right) right = r;
          // if (i > index) {
          //   child.prop('position', {x: box.x, y: box.y + my})
          // }
        });
        choice.prop({
          'size': {width: right - left + padding[1] + padding[3], height: height + my},
        })
      }
    } else if (node.data.kind === 'choice') {
      // 决策节点大小改变
      const space = 20;
      const padding = [68, space, 48, space];
      const children = node.getChildren();
      const { x, y, width, height } = node.getBBox();
      let left = x + padding[3];
      let top = y + padding[0];
      let childY = 0
      let childrenHeight = 0;
      children?.forEach((child) => {
        const childBbox = child.getBBox();
        child.prop({position: {x: left, y: top + childY}, size: {width: width - space * 2, height: childBbox.height}});
        childY += childBbox.height + space;
        childrenHeight += childY;
      });
      const moreHeight = height - padding[0] - padding[2] - childrenHeight;
      if (moreHeight) {
        const len = children?.length;
        const plit = moreHeight / len;
        children?.forEach((child) => {
          const size = child.getSize();
          child.prop('size', { width: size.width, height: size.height + plit })
        })
      }
    }
  })
  // graph.on('node:change:position', ({node, current, previous}) => {
  //   // 移动位置，及 向上|左改变size
  //   if (['when', 'otherwise'].includes(node.data.kind)) {
  //     const choice = node.getParent();
  //     if (choice) {
  //       const mx = current.x - previous?.x;
  //       const my = current.y - previous?.y;
  //       const children = choice?.getChildren();
  //       const index = findIndex(children, item => item.id === node.id);
  //       let left;
  //       children?.forEach((child, i) => {
  //         const { x, y } = child.getPosition();
  //         if (!left || x < left) {
  //           left = x;
  //         }
  //         if (my && i < index) {
  //           child.prop('position', {x, y: y + my});
  //         }
  //       })
  //     }
  //   }
  // })

  // 节点移动后
  graph.on('node:moved',() => save())

  // 连线后更新下游节点的 processor.sourceProcessorId
  graph.on('edge:connected', ({ isNew, edge }) => {
    if (isNew) {
      const source = edge.getSourceCell();
      const target = edge.getTargetCell();
      const processorId = target?.id
      const parentId = target?.getParentId()
      save();
      // 保存画布节点输出信息
      store.dispatch('graph/saveProcessor', { parentProcessorId: parentId, sourceProcessorId: source?.id, processorId })
    }
  })
  // 连线删除
  graph.on('edge:removed', ({ edge }) => {
    const target = edge.getTargetCell();
    if (target) {
      const processorId = target?.id;
      store.dispatch('graph/saveProcessor', { sourceProcessorId: '', processorId })
    }
    save();
  })
  canRedo.value = graph.history.canRedo();
  canUndo.value = graph.history.canUndo();
}

function dropNode(evt: any, nodeData: any) {
  let node: Node | undefined;
  //判断节点类型 实现不同类型的节点添加到画布
  const { processorType, name, icon, isTrigger } = nodeData;
  if (isTrigger) {
    const tiggerIndex = graph.getNodes().findIndex(item => item.getData().isTrigger);
    if (tiggerIndex > -1) {
      ElMessage({
        type: 'warning',
        message: '集成流中已有触发器组件'
      })
      return;
    }
  }
  switch (processorType) {
    case 'loop':
      node = graph.createNode({
        ports: {...ports},
        shape: 'vue-shape',
        width: 500,
        height: 320,
        component: 'loopNode',
        zIndex: 1,
        data: {
          name,
          kind: processorType,
        }
      });
      break;
    case 'choice':
      node = graph.createNode({
        ports: {...ports},
        shape: 'vue-shape',
        width: 520,
        height: 400,
        component: 'choiceNode',
        zIndex: 1,
        data: {
          name,
          kind: processorType,
          metaInfo: nodeData.metaInfo
        }
      });
      break;
    default:
      node = graph.createNode({
        ports: {...ports},
        width: 90,
        height: 90,
        shape: 'vue-shape',
        component: 'rectNode',
        zIndex: 3,
        data: {
          name,
          kind: processorType,
          icon,
          isTrigger
        }
      });
  }
  if (node) {
    dnd.start(node, evt)
  }
}

function deleteNode(node) {
  if (node.data.kind === 'otherwise') {
    ElMessage.warning('决策组件中不能没有otherwise')
  } else if (node.data.kind === 'when') {
    const when = filter(node.getParent()?.getChildren(), item => item.data.kind === 'when');
    if (when.length === 1) {
      ElMessage.warning('决策组件中至少要有一个when')
    } else {
      graph.removeCell(node)
    }
  } else {
    graph.removeCell(node)
  }
}

function updateName({ id, name, parentId, sourceId }) {
  const node = graph.getCellById(id);
  node.updateData({name});
  store.dispatch('graph/updateProcessorName', {processorId: id, name, parentProcessorId: parentId, sourceProcessorId: sourceId});
  save();
}

function onRedo() {
  graph.history.redo();
}
function onUndo() {
  graph.history.undo();
}

function setShowRule() {
  store.commit('graph/setShowRule', graph.toJSON())
}

function save() {
  store.dispatch('graph/save', graph.toJSON())
}

// 清空画布
function clearCells() {
  graph.clearCells();
  save()
}

// 启动
function handleTurnOn() {
  store.dispatch('turnOn')
}
// 停止
function handleTurnOff() {
  store.dispatch('turnOff')
}

watch(() => store.state.graph.showRule, () => {
  graph && graph.fromJSON(store.state.graph.showRule)
})

onMounted(() => {
  initEditor();
  store.dispatch('context/fetchContext');
  const data = store.state.graph.showRule;
  if (data) {
    graph.fromJSON(data);
  }
})

</script>
<style lang="less" scoped>
.flow-header {
  height: 6vh;
  background: #FFFFFF;
  box-shadow: 0 8px 16px 1px rgba(55, 99, 170, 0.0800);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  .left {
    display: flex;
    align-items: center;
    gap: 16px;

    .back {
      width: 48px;
      height: 32px;
      background: #FFFFFF;
      border-radius: 2px 2px 2px 2px;
      opacity: 1;
      border: 1px solid #DCDEE1;
      margin-left: 24px;
      line-height: 32px;
      text-align: center;
      cursor: pointer;
    }

    .title {
      font-size: 16px;
      font-weight: 500;
      color: #1C2126;
    }
  }

  .right {
    margin-right: 24px;
    display: flex;
    align-items: center;
    font-size: 24px;

    .v-line {
      width: 2px;
      height: 16px;
      background: #C2C7CC;
      margin: 0 10px;
    }
  }
}

.flow-center {
  display: flex;
  // overflow: auto;

  .flow-left {
    min-width: 1000px;
    flex: 1;
    height: 94vh;

    .flow-box {
      box-sizing: border-box;
      height: 89vh !important;
      width: auto !important;
      margin: 24px;
      background: #fff;
      box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3000), -7px -7px 3px 0px rgba(234, 247, 255, 0.2000);
    }

    .flow-bottom {
      height: 5vh;
      box-sizing: border-box;
      background: #fff;
    }
  }

  .sys-tabs {
    height: 100%;
    .el-tabs__content {
      height: calc(100% - 60px);
    }
  }
  .tool-box {
    width: 272px;
    height: 94vh;
    box-sizing: border-box;
    border-left: solid 1px #EAECEF;
    background: #fff;

    .input {
      width: 240px;
      height: 32px;
      margin: 0 16px 12px;
    }

    :deep(.el-tabs__nav-scroll) {
      padding-left: 16px;
    }

    .sys-group {
      width: 270px;

      &-nodes {
        .item-block {
          height: 40px;
          background: var(--el-fill-color-extra-light);
          opacity: 1;
          border-top: 1px solid var(--el-border-color-light);
          border-bottom: 1px solid var(--el-border-color-lighter);
          font-size: 14px;
          font-weight: 400;
          color: var(--el-text-color-primary);
          display: flex;
          align-items: center;
          gap: 23px;
          padding-left: 16px;
          cursor: pointer;
        }

        .item-box {
          user-select: none;
          transition: all .3s;
          height: 0;
          overflow: auto;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 14px;
          font-weight: 400;
          color: var(--el-text-color-regular);
        }

        &.active {
          .arrow-icon {
            transition: all .3s;
            transform: rotate(90deg);
          }

          .item-box {
            height: auto;
            padding: 16px;
          }
        }
      }
    }

  }
}
</style>
