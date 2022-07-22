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
      <el-button icon="DArrowLeft" plain size="large" circle text/>
      <el-button icon="DArrowRight" size="large" circle text/>
      <div class="v-line"></div>
      <el-button icon="Setting" text circle size="large"/>
      <el-button icon="VideoPlay" text circle size="large"/>
      <el-button icon="Promotion" text circle size="large"/>
      <el-button icon="Briefcase" text circle size="large"/>
    </div>
  </div>
  <div class="flow-center">
    <div class="flow-left">
      <div class="flow-box" id="boxRf"></div>
      <div class="flow-bottom"></div>
    </div>
    <div class="tool-box">
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane label="组件栏" name="组件栏">
          <el-input class="input" placeholder="关键词搜索" size="large"/>

          <div class="nodeGroup"
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
              <rectNode :icon="node.icon"
                        :label="node.description"
                        @mousedown="dropNode($event,node)"
                        v-for="node in item.processorMetaVOList"></rectNode>
            </div>
          </div>

        </el-tab-pane>
        <el-tab-pane label="设置项" name="设置项">{{ panelData }}</el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ports from "/@/views/flowEdit/ports";
import rectNode from "/@/components/nodes/rectNode.vue";
import {onMounted, ref} from "vue";
import {Graph, Addon, Rectangle, Shape, Dom,Node} from '@antv/x6';
import {NodeGroup} from "/@/api/api";
import myRect from "/@/views/demo/myRect.vue";
let dnd:Addon.Dnd;
let graph: Graph;
const activeName = ref('组件栏');
let curActive = ref(0);
let nodeGroup = ref();
let panelData = ref();

function initEditor() {
  //注册组件节点
  Graph.registerVueComponent(
      "rectNode",
      {
        template: `<rectNode :onMap="true"/>`,
        components: {
          rectNode,
        },
      },
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
    autoResize: true,
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
      rubberband: true,
      showNodeSelectionBox: true,
    },
    embedding: {
      enabled: true,
      findParent({node}) {
        const bbox = node.getBBox()
        return this.getNodes().filter((node) => {
          // 只有 data.parent 为 true 的节点才是父节点
          const data = node.getData<any>()
          if (data && data.parent) {
            const targetBBox = node.getBBox()
            if (node.zIndex) node.zIndex -= 1;
            return bbox.isIntersectWithRect(targetBBox)
          }
          return false
        })
      }
    },
    snapline: true,
  });
  dnd = new Addon.Dnd({
    target: graph,
    scaled: false,
    animation: true,
    validateNode(droppingNode:any, options:any) {
      return droppingNode.shape === 'html'
          ? new Promise<boolean>((resolve) => {
            const { draggingNode, draggingGraph } = options
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
  graph.on('node:click', ({node}) => {
    console.log(node)
    panelData.value = node.data.nodeData.metaInfo as Object;
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
  graph.on('node:embedded', ({ node, currentParent }) => {
    if (currentParent && currentParent.isNode()) {
      let originSize = currentParent.prop('originSize')
      if (originSize == null) {
        currentParent.prop('originSize', currentParent.getSize())
      }
      originSize = currentParent.prop('originSize')

      let originPosition = currentParent.prop('originPosition')
      if (originPosition == null) {
        currentParent.prop('originPosition', currentParent.getPosition())
      }
      originPosition = currentParent.prop('originPosition')

      let x = originPosition.x
      let y = originPosition.y
      let cornerX = originPosition.x + originSize.width
      let cornerY = originPosition.y + originSize.height
      let hasChange = false

      const children = currentParent.getChildren()
      if (children) {
        children.forEach((child) => {
          const bbox = child.getBBox().inflate(10)
          const corner = bbox.getCorner()

          if (bbox.x < x) {
            x = bbox.x
            hasChange = true
          }

          if (bbox.y < y) {
            y = bbox.y
            hasChange = true
          }

          if (corner.x > cornerX) {
            cornerX = corner.x
            hasChange = true
          }

          if (corner.y > cornerY) {
            cornerY = corner.y
            hasChange = true
          }
        })
      }


      if (hasChange) {
        currentParent.prop(
            {
              position: { x, y },
              size: { width: cornerX - x, height: cornerY - y },
            },
            // Note that we also pass a flag so that we know we shouldn't
            // adjust the `originPosition` and `originSize` in our handlers.
            { skipParentHandler: true },
        )
      }
    }
  })

  graph.on('node:added', ({ node }) => {
    if(node["component" as keyof typeof node]==="switchNode"){
      const { x, y } = node.position();
      const bbox = node.getBBox();
      let child = graph.createNode({
        x:x+20,
        y:y+40,
        width: bbox.width-40,
        height: bbox.height/3,
        data:{
          parent:true
        },
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: '#5F95FF',
            fill: '#E2F4FF',
          },
          text: {
            fontSize: 12,
            fill: '#262626',
          },
        },
      });
      node.addChild(child)
      let nchild = child.clone();
      nchild.prop({
        x:x+20,
        y:y+40+bbox.height/3+10,
        width: bbox.width-40,
        height: bbox.height/3,
      })
      node.addChild(nchild)
    }
  })
}

function initData() {
  NodeGroup.getGroupList({}).then((res: any) => {
    nodeGroup.value = res.data;
    console.log(res)
  })
}
function dropNode(evt: any,nodeData:any) {
  let node:Node;
  //判断节点类型 实现不同类型的节点添加到画布
  node = graph.createNode({
    ports: {...ports},
    width: 90,
    height: 90,
    shape: 'vue-shape',
    component: 'rectNode',
    zIndex:-1,
    data:{
      nodeData
    }
  });
  dnd.start(node,evt);
}
onMounted(() => {
  initEditor()
  initData()
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
  overflow: auto;

  .flow-left {
    min-width: 1000px;
    flex: 1;
    height: 94vh;

    .flow-box {
      box-sizing: border-box;
      height: calc(85vh - 12px) !important;
      width: auto !important;
      margin: 24px;
      background: #fff;
      box-shadow: 2px 2px 3px 0 rgba(0,0,0,0.3000), -7px -7px 3px 0px rgba(234,247,255,0.2000);
    }

    .flow-bottom {
      height: 5vh;
      box-sizing: border-box;
      background: #fff;
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

    .nodeGroup{
      .item-block {
        height: 40px;
        background: #FAFAFB;
        opacity: 1;
        border: 1px solid #DCDEE1;
        font-size: 14px;
        font-weight: 400;
        color: #1C2126;
        display: flex;
        align-items: center;
        gap: 23px;
        padding-left: 16px;
        cursor: pointer;
      }
      .item-box{
        user-select: none;
        transition: all .3s;
        height: 0;
        overflow: hidden;
        display: flex;
        gap: 8px;
        font-size: 14px;
        font-weight: 400;
        color: #4C5A67;
      }
      &.active {
        .arrow-icon {
          transition: all .3s;
          transform: rotate(90deg);
        }
        .item-box{
          padding: 18px;
          height: 100px;
        }
      }
    }

  }
}
</style>
