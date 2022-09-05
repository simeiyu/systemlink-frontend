import { get, forEach, map, isEmpty } from 'lodash'
import { ElMessage } from 'element-plus';
import { FlowRoute, ProcessorInstance } from '@/api/api';
export interface Route {
  routeId: string;
  properties: any;
  transforms: Transformer[];
  processors: Processor[];
  externalDataSource: any[];
}
export interface Processor {
  processorId: string;
  name?: string;
  kind: string;
  properties: object;
  processors?: Processor[];
  output: string;
}

export default {
  namespaced: true,
  state: () => ({
    // showRule: {},
    // routeJson: [],
    // processors: [],      // 输出逻辑中的processors
    processor: {},       // 输出逻辑中的processors 一一映射
    status: '',
    execute: '',
    loading: {},  
  }),
  getters: {
    processor: (state) => (processorId) => state.processor[processorId],
    properties: (state) => (processorId) => state.processor[processorId].properties || {},
    showRule: (state) => () => state.showRule,
  },
  mutations: {
    setShowRule(state, showRule) {
      state.showRule = showRule
    },
    setProcessors(state, processors) {
      state.processors = processors;
      if (!isEmpty(processors)) {
        const mapper = {};
        const loopProper = function(data, parentProcessorId) {
          forEach(data, item => {
            mapper[item.processorId] = item.properties;
            if (parentProcessorId) {
              mapper[item.processorId][parentProcessorId] = parentProcessorId;
            }
            if (!isEmpty(item.processors)) {
              loopProper(item.processors, item.processorId);
            }
          })
        }
        loopProper(processors, undefined);
        state.processor = mapper;
      }
    },
    setStatus(state, payload) {
      state.status = payload;
    },
    execute(state, payload) {
      state.execute = payload;
    },
    // 更新loading
    setLoading(state, {key, loading}) {
      state.loading[key] = loading;
    },
    setProcessor(state, item) {
      state.processor[item.processorId] = item;
    },
    deleteProcessor(state, processorId) {
      delete state.processor[processorId];
    },
    updateProcessorName(state, node) {
      state.processor[node.id].name = node.name;
    },
    setProperties(state, {properties, node}) {
      state.processor[node.id].properties = properties;
    },
  },
  actions: {
    // 请求画布数据（flowOut， graphJson）
    fetchFlow({commit}, payload) {
      FlowRoute.get(payload).then((res: any) => {
        if (res.code === 200) {
          const {routeJson, showRule} = res.data;
          commit('setShowRule', JSON.parse(showRule));
          const flowOut = JSON.parse(routeJson);
          commit('setProcessors', flowOut.processors);
          commit('transform/setTransforms', flowOut.transforms);
        }
      })
    },
    // 增加节点
    addProcessor({commit, dispatch}, payload) {
      commit('setProcessor', payload);
      dispatch('saveProcessor', {processorId: payload.processorId})
    },
    // 更新节点的name
    updateProcessorName({commit, dispatch}, node) {
      commit('updateProcessorName', node)
      // 保存画布
      dispatch('save')
    },
    // 删除节点
    deleteProcessor({commit, dispatch}, processorId) {
      commit('setLoading', {key: 'delete', loading: true})
      ProcessorInstance.delete(processorId).then((res:any) => {
        commit('deleteProcessor', processorId);
        ElMessage.success('节点信息已删除');
        commit('setLoading', {key: 'delete', loading: false})
        // 保存画布
        dispatch('save')
      })
    },
    getProcessor({commit, dispatch}, processorId) {
      ProcessorInstance.get(processorId).then((res: any) => {
        if (res.code === 200) {
          const { properties } = res.data
          commit('setProcessor', {
            ...res.data,
            properties: JSON.parse(properties)
          });
        }
      })
    },
    // 保存画布节点
    saveProcessor({commit, dispatch, getters, rootGetters}, {parentId, sourceId, processorId}) {
      const nodeId = rootGetters['context/nodeId']();
      const processor = getters['processor'](processorId);
      const param = {
        nodeId,
        parentProcessorId: parentId,
        sourceProcessorId: sourceId,
        processorId,
        processorType: processor.kind,
        properties: JSON.stringify(processor.properties),
        output: ''
      }
      ProcessorInstance.save(param).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success('保存节点信息成功')
          // 保存画布
          dispatch('save')
        }
      })
    },
    // 更新节点的properties
    setProperties({commit, dispatch}, payload) {
      commit('setProperties', payload)
      const { id, parentId, sourceId } = payload.node
      dispatch('saveProcessor', {parentId, sourceId, processorId: id})
    },
    clear({commit, dispatch}, payload) {
      dispatch('save', {
        routeId: "",
        properties: {},
        transforms: [],
        processors: [],
        externalDataSource: []
      })
    },
    save({commit, getters, rootGetters}, payload) {
      const showRule = getters['showRule']();
      console.log('--- showRule: ', showRule)
      let routeJson;
      if (payload) {
        routeJson = payload
      } else {
        const processors = [];

        routeJson = {
          routeId: "",
          properties: {},
          transforms: rootGetters['transform/get'],
          processors: processors,
          externalDataSource: []
        }
      }
    },
    // 启动集成流
    turnOn({commit, state, rootGetters}) {
      const appId = rootGetters['context/appId'];
      const nodeId = rootGetters['context/nodeId'];
      const userId = rootGetters['context/userId'];
      commit('setStatus', 'running');
      FlowRoute.turnOn({appId, nodeId, userId}).then((res: any) => {
        if (res.code !== 200) {
          commit('setStatus', '');
          ElMessage({
            type: 'error',
            message: `启动失败：${res.msg}`
          })
        }
      })
    },
    // 关闭集成流
    turnOff({commit, state, rootGetters}) {
      const appId = rootGetters['context/appId'];
      const nodeId = rootGetters['context/nodeId'];
      const userId = rootGetters['context/userId'];
      commit('setLoading', {key: 'turnOff', loading: true});
      FlowRoute.turnOff({appId, nodeId, userId}).then((res: any) => {
        console.log('---- turn off: ', res);
        if (res.code === 200) {
          commit('setStatus', '');
        } else {
          ElMessage({
            type: 'error',
            message: `关闭失败：${res.msg}`
          })
        }
      })
    },
    // 节点测试执行
    execute({commit, state}, {processorType, processorId, properties}) {
      const { appId } = state.spContext;
      commit('setLoading', {key: "execute", loading: true});
      ProcessorInstance.execute(processorType, { processorId, properties, appId }).then((res: any) => {
        commit('execute', res.data || res.msg)
        commit('setLoading', {key: "execute", loading: false});
      })
    }
  },
}