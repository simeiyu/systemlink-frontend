<template>
  <div id="container" @drop="dropNode" ></div>
  <div class="prop">
    <div v-for="(value,key) in cusModel">
      <div v-if="typeof cusModel[key] !=='object'">
        {{ key }} <input type="text" v-model="cusModel[key]">
      </div>
      <div v-else>
        {{key}}:
        <div v-for="(inValue,inKey) in cusModel[key]" style="margin-left: 20px">
          {{ inKey }} <input type="text" v-model="cusModel[key][inKey]">
        </div>
      </div>
    </div>

    <button @click="getConfig">导出</button>
    <button @click="importJson()">导入</button>
<!--    <button @click="addGroup()">组合</button>-->
    <p>
      <textarea v-model="jsonInfo" style="height: 500px;width: 99%;"></textarea>
    </p>
    <div class="line">
      <myRect v-for="i in 4" :label="'test'+i"
              @mousedown="dropNode($event,'myRect','test'+i)"
              :width="nodeConfig.myRect.width" :height="nodeConfig.myRect.height"></myRect>
    </div>
    <div class="line">
      <loopNode :width="nodeConfig.loopNode.width" :height="nodeConfig.loopNode.height"
                 @mousedown="dropNode($event,'loopNode','循环组件')"
                 label="循环组件">

      </loopNode>
      <switch-node :width="nodeConfig.loopNode.width" :height="nodeConfig.loopNode.height"
                   @mousedown="dropNode($event,'switchNode','循环组件')"
                   label="switch组件">
      </switch-node>
    </div>
  </div>
</template>

<script lang="ts">

import {Graph, Addon, Rectangle, Shape, Dom,Node} from '@antv/x6';
import myRect from './myRect.vue';
import loopNode from './loopNode.vue'
import switchNode from './switchNode.vue'
import {ref, onMounted} from 'vue'
import '@antv/x6-vue-shape'

const ports = {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
  },
  items: [
    {
      group: 'top',
    },
    {
      group: 'right',
    },
    {
      group: 'bottom',
    },
    {
      group: 'left',
    },
  ],
}
export default {
  name: "index",
  components: {myRect,loopNode,switchNode},
  setup() {
    let cusModel = ref({});
    let jsonInfo = ref("");
    let graph: Graph;
    let dnd:Addon.Dnd;
    const nodeConfig = {
      myRect: {
        width: 80,
        height: 30,
      },
      loopNode:{
        width: 240,
        height: 100,
      },
      switchNode:{
        width: 240,
        height: 100,
      }
    }

    function initMap() {
      //注册组件节点
      Graph.registerVueComponent(
          "myRect",
          {
            template: `<myRect/>`,
            components: {
              myRect,
            },
          },
          true
      );
      Graph.registerVueComponent(
          "loopNode",
          {
            template: `<loopNode/>`,
            components: {
              loopNode,
            },
          },
          true
      );
      Graph.registerVueComponent(
          "switchNode",
          {
            template: `<switchNode/>`,
            components: {
              switchNode,
            },
          },
          true
      );
      //------------------------------
      graph = new Graph({
        container: document.getElementById('container')!,
        grid: true,
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
                  stroke: '#A2B1C3',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'block',
                    width: 12,
                    height: 8,
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
          findParent({ node }) {
            const bbox = node.getBBox()
            return this.getNodes().filter((node) => {
              // 只有 data.parent 为 true 的节点才是父节点
              const data = node.getData<any>()
              if (data && data.parent) {
                const targetBBox = node.getBBox()
                if(node.zIndex) node.zIndex-=1;
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
        cusModel.value = node.data as Object;
      })
      // 控制连接桩显示/隐藏
      const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
        for (let i = 0, len = ports.length; i < len; i = i + 1) {
          ports[i].style.visibility = show ? 'visible' : 'hidden'
        }
      }
      graph.on('node:mouseenter', () => {
        const container = document.getElementById('container')!
        const ports = container.querySelectorAll(
            '.x6-port-body',
        ) as NodeListOf<SVGElement>
        showPorts(ports, true)
      })
      graph.on('node:mouseleave', () => {
        const container = document.getElementById('container')!
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
    function dropNode(evt: any,component:string,info:any) {
      let node:Node;
      //判断节点类型 实现不同类型的节点添加到画布
      if(component==='switchNode'){
        node = graph.createNode({
          ports: {...ports},
          width: nodeConfig[component as keyof typeof nodeConfig].width*2,
          height: nodeConfig[component as keyof typeof nodeConfig].height*2,
          shape: 'vue-shape',
          component: component,
          zIndex:-1,
          data:{
            parent:true,
            lock:true,
            nodeLabel:info,
          }
        });
        dnd.start(node,evt);
      }else {
        node = graph.createNode({
          ports: {...ports},
          width: nodeConfig[component as keyof typeof nodeConfig].width,
          height: nodeConfig[component as keyof typeof nodeConfig].height,
          shape: 'vue-shape',
          component: component,
          data:{
            nodeLabel:info,
            parent: component==='loopNode'
          }
        });
        dnd.start(node,evt)
      }
    }


    function getConfig() {
      jsonInfo.value = JSON.stringify(graph.toJSON()) as string;
    }

    function importJson() {
      let obj = JSON.parse(jsonInfo.value)
      graph.fromJSON(obj)
    }

    onMounted(() => {
      initMap();
    })

    function addGroup() {
      let cells = graph.getSelectedCells();
      if (cells.length > 0) {
        //获取当前组合框，以当前组合框创建分组
        let bbox = graph.getCellsBBox(cells)?.inflate(30) as Rectangle;
        let {x, y, width, height} = bbox;
        const parent = graph.addNode({
          zIndex: -1,
          position: {x, y},
          size: {width, height},
          ports: {...ports},
          data:{
            parent:true
          },
          attrs: {
            body: {
              fill: 'rgba(35,33,154,.2)',
            },
          },
        });
        cells.forEach(cell => {
          parent.addChild(cell);
        })
      }
    }

    return {
      cusModel,
      jsonInfo,
      dropNode,
      getConfig,
      importJson,
      nodeConfig
    }
  },
}
</script>

<style scoped lang="less">
#container {
  width: 100vw;
  height: 100vh;
}

.prop {
  position: absolute;
  right: 0;
  top: 0;
  background: #eee;
  height: 100vh;
  width: 300px;
  user-select: none;

  .line {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 0;
    justify-content: space-around;
    margin-top: 20px;
  }
}
</style>