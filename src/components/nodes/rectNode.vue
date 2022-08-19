<template>
  <div class="node-item" v-if="!onMap">
    <div class="icon">
      <i class="iconfont" :class="icon"></i>
    </div>
    {{ label }}
  </div>
  <div class="map-node" v-else>
    <div class="icon">
      <i class="iconfont" :class="mapIcon"></i>
    </div>
    <div style="text-align: center">
      {{ mapLabel }}
    </div>
  </div>
</template>

<script lang="ts">
import {inject, onMounted, ref} from "vue";

export default {
  props: {
    icon: '',
    label: '',
    onMap: false
  },
  setup(props) {
    let mapLabel = ref(''),
        mapIcon = ref('');
    onMounted(() => {
      if (props.onMap) {
        let getNode = inject<any>('getNode');
        let node = getNode();
        let { name, icon } = node.data;
        mapLabel.value = name;
        mapIcon.value = icon;
        node.on('change:data', ({current}) => {
          mapLabel.value = current.name;
        })
      }
    })
    return {
      mapLabel,
      mapIcon
    }
  }
}
</script>

<style scoped lang="less">
.node-item {
  width: 74px;
  height: 100px;
  background: #F4F6F9;
  border-radius: 2px 2px 2px 2px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
  padding: 12px 5px;

  &:hover {
    cursor: pointer;
    color: #0084FF;

    .icon {
      .iconfont {
        color: #0084FF;
      }
    }
  }

  .icon {
    .iconfont {
      font-size: 26px;
      color: #4C5A67;
    }

    margin-bottom: 5px;
  }
}

.map-node {
  width: 100%;
  height: 100%;
  background: #FFFFFF;
  border-radius: 16px 16px 16px 16px;
  border: 1px solid #DCDEE1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
  margin-bottom: 5px;
  gap:5px;
  padding: 16px;
  font-size: 14px;
  font-weight: 400;
  color: #4C5A67;
  line-height: 1.2;
  .icon {
    .iconfont {
      font-size: 26px;
      color: #0084FF;
    }
  }
}
</style>