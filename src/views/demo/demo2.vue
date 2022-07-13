<template>
  <div class="app">
    <div class="app-content" id="refContainer" />
    <div class="dnd-wrap">
      <div
          data-type="rect"
          class="dnd-rect"
          @mousedown="startDrag"
      >
        Rect
      </div>
      <div
          data-type="circle"
          class="dnd-circle"
          @mousedown="startDrag"
      >
        Circle
      </div>
    </div>
  </div>

</template>
<script lang="ts">
import { Graph, Dom, Addon } from '@antv/x6'
import {onMounted} from "vue";
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
  name:'demo2',
  setup(){
    let graph: Graph
    let dnd: any

    onMounted(()=>{
      graph = new Graph({
        container:document.getElementById('refContainer') as HTMLElement,
        grid: true,
        history: true,
        snapline: {
          enabled: true,
          sharp: true,
        },
        mousewheel: {
          enabled: true,
          modifiers: ['ctrl', 'meta'],
        },
      })

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
    })

    function startDrag (e: any) {
      const target = e.currentTarget
      const type = target.getAttribute('data-type')
      const node =
          type === 'rect'
              ? graph.createNode({
                width: 100,
                height: 40,
                attrs: {
                  label: {
                    text: 'Rect',
                    fill: '#6a6c8a',
                  },
                  body: {
                    stroke: '#31d0c6',
                    strokeWidth: 2,
                  },
                },
              })
              : graph.createNode({
                width: 60,
                height: 60,
                shape: 'html',
                html: () => {
                  const wrap = document.createElement('div')
                  wrap.style.width = '100%'
                  wrap.style.height = '100%'
                  wrap.style.display = 'flex'
                  wrap.style.alignItems = 'center'
                  wrap.style.justifyContent = 'center'
                  wrap.style.border = '2px solid rgb(49, 208, 198)'
                  wrap.style.background = '#fff'
                  wrap.style.borderRadius = '100%'
                  wrap.innerText = 'Circle'
                  return wrap
                },
              })

      dnd.start(node, e)
    }
    return{
      startDrag
    }
  }
}
</script>
<style lang="less" scoped>
.app {
  font-family: sans-serif;
  display: flex;
}

.app-content {
  flex: 1;
  height: 900px;
  margin-left: 8px;
  margin-right: 8px;
}
.dnd-wrap {
  width: 200px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

.dnd-rect {
  width: 100px;
  height: 40px;
  border: 2px solid #31d0c6;
  text-align: center;
  line-height: 40px;
  margin: 16px;
  cursor: move;
}

.dnd-circle {
  width: 60px;
  height: 60px;
  border-radius: 100%;
  border: 2px solid #31d0c6;
  text-align: center;
  line-height: 60px;
  margin: 16px;
  cursor: move;
}

.x6-graph-scroller {
  border: 1px solid #f0f0f0;
  margin-left: -1px;
}

.validating {
  position: relative;
}

.validating:after {
  position: absolute;
  top: 4px;
  left: 4px;
  content: ' ';
  display: block;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border-color: #873bf4 transparent #873bf4 transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}

@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>