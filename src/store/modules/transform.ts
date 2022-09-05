import { map, find, get, forEach, remove, filter, isEmpty, findIndex } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { ElMessage } from 'element-plus';
import { Transform } from '@/api/api';

export default {
  namespaced: true,
  state: () => ({  
    transforms: [],  // routeJson 中的transforms
    list: [],        // transform 列表
    modal: {         // 新增|编辑
      visible: false,
      transform: null
    },
    saving: false,
  }),
  getters: {
    getByProcessorId: (state) => (processorId) => {
      if (isEmpty(processorId)) return []
      return filter(state.transforms, item => item.processorId === processorId)
    },
    get: (state) => () => state.transforms,
    list: (state) => () => state.list,
    current: (state) => () => state.modal.transform,
    visible: (state) => () => state.modal.visible,
    saving: (state) => () => state.saving,
  },
  mutations: {
    setTransforms(state, payload) {
      state.transforms = payload
    },
    // transform的元数据
    setList(state, payload) {
      state.list = map(payload, item => {
        if (item.metaInfo) {
          return {
            ...item,
            metaInfo: JSON.parse(item.metaInfo)
          }
        }
        return item
      })
    },
    // 新增或编辑Transform
    openModal(state, {visible, transformId, processorId}) {
      state.modal.visible = visible;
      if (visible) {
        state.modal.transform = transformId ? find(state.transforms, {transformId}) : {
          transformId: uuidv4(),
          processorId: processorId,
          properties: { name: '', type: '' },
          output: {}
        }
      } else {
        state.modal.transform = null;
      }
    },
    // 将编辑后的Transform更新
    update(state, transform) {
      const index = state.transforms.findIndex(item => item.transformId === transform.transformId);
      if (index > -1) {
        state.transforms[index] = transform;
      } else {
        state.transforms.push(transform);
      }
    },
  },
  actions: {
    // 请求转换方法列表
    fetchList({commit}) {
      Transform.getList().then((res: any) => {
        commit('setList', res.data);
      })
    },
    // 保存转换方法
    save({commit, state, rootGetters}, payload) {
      commit('update', payload);
      state.saving = true;
      const nodeId = rootGetters['context/nodeId']
      const { processorId, transformId, properties, output } = payload;
      Transform.saveItem({
        nodeId,
        processorId,
        transformId,
        "properties": JSON.stringify(properties),
        "output": JSON.stringify(output),
        "name": payload.properties.name,
        "transformType": payload.properties.type,
      }).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success(`数据转换保存成功`)
        } else {
          ElMessage.error(`数据转换保存失败：${res.msg}`)
        }
        state.saving = false;
      })
    },
  },
}