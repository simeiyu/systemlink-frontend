<template>
  <div id="container" @drop="dropNode" @dragover="allowDrop"></div>
  <div class="prop">
    <div v-for="(value,key) in cusModel">
      {{ key }} <input type="text" v-model="cusModel[key]">
    </div>

    <button @click="getConfig">导出</button>
    <button @click="importJson()">导入</button>
    <button @click="addGroup()">组合</button>
    <p>
      <textarea v-model="jsonInfo" style="height: 500px;width: 99%;"></textarea>
    </p>
    <div class="line">
      <myRect v-for="i in 4" :label="'test'+i" :width="nodeConfig.rect.width" :height="nodeConfig.rect.height"></myRect>
    </div>
  </div>
</template>

<script lang="ts">

import { Graph,Addon, Rectangle, Shape} from '@antv/x6';
const {Dnd} = Addon
import myRect from './myRect.vue';
import {Ref, ref, defineComponent, reactive, UnwrapNestedRefs, onMounted} from 'vue'
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
  components: {myRect},
  setup() {
    let cusModel = ref({});
    let jsonInfo = ref("");
    let graph: Graph;
    const nodeConfig = {
      rect: {
        width: 120,
        height: 60,
      }
    }

    function initMap() {
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
            args: {
              padding: 1,
            },
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
              zIndex: 0,
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
        resizing: true,
        rotating: true,
        selecting: {
          enabled: true,
          rubberband: true,
          showNodeSelectionBox: true,
        },
        snapline: true,
        keyboard: true,
        clipboard: true,
      });
      //注册组件节点
      graph.on('node:click', ({e, x, y, node, view}) => {
        console.log(node)
        cusModel.value = node.attrs?.customer as Object;
      })
      graph.on('node:change:size', ({node, options}) => {
        if (options.skipParentHandler) {
          return
        }

        const children = node.getChildren()
        if (children && children.length) {
          node.prop('originSize', node.getSize())
        }
      })

      graph.on('node:change:position', ({node, options}) => {
        if (options.skipParentHandler) {
          return
        }

        const children = node.getChildren()
        if (children && children.length) {
          node.prop('originPosition', node.getPosition())
        }

        const parent = node.getParent()
        if (parent && parent.isNode()) {
          let originSize = parent.prop('originSize')
          if (originSize == null) {
            parent.prop('originSize', parent.getSize())
          }
          originSize = parent.prop('originSize')

          let originPosition = parent.prop('originPosition')
          if (originPosition == null) {
            parent.prop('originPosition', parent.getPosition())
          }
          originPosition = parent.prop('originPosition')

          let x = originPosition.x
          let y = originPosition.y
          let cornerX = originPosition.x + originSize.width
          let cornerY = originPosition.y + originSize.height
          let hasChange = false

          const children = parent.getChildren()
          if (children) {
            children.forEach((child) => {
              const bbox = child.getBBox().inflate(30);
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
            parent.prop(
                {
                  position: {x, y},
                  size: {width: cornerX - x, height: cornerY - y},
                },
                // Note that we also pass a flag so that we know we shouldn't
                // adjust the `originPosition` and `originSize` in our handlers.
                {skipParentHandler: true},
            )
          }
        }
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

    }
    function dropNode(evt: DragEvent) {
      evt.preventDefault();
      let label = evt.dataTransfer?.getData("item");
      let {
        x,
        y
      } = graph.clientToLocal(evt.clientX - Math.floor(nodeConfig.rect.width / 2), evt.clientY - Math.floor(nodeConfig.rect.height / 2))
      graph.addNode({
        x,
        y,
        ports: {...ports},
        width: nodeConfig.rect.width,
        height: nodeConfig.rect.height,
        shape: 'vue-shape',
        component: {
          template: `<myRect label="${label}" />`,
          components: {
            myRect,
          }
        },
      })

    }

    function allowDrop(ev: DragEvent) {
      ev.preventDefault();
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
          attrs: {
            body: {
              fill: '#fffbe6',
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
      allowDrop,
      getConfig,
      importJson,
      addGroup,
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
  }
}
</style>