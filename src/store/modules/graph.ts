import { get, forEach, map, isEmpty } from 'lodash'
import { ElMessage } from 'element-plus';
import { FlowRoute, ProcessorInstance } from '@/api/api';

export interface ActiveNode {
  id: string;
  kind: string;
  name?: string;
  parentId?: string;
  sourceId?: string;
}
export interface Processor {
  processorId: string;
  parentProcessorId?: string;
  sourceProcessorId?: string;
  name?: string;
  processorType: string;
  properties: object;
  nodeId?: string;
  processors?: Processor[];
  output: string;
}

export default {
  namespaced: true,
  state: () => ({
    showRule: null,
    processor: {},       // 输出逻辑中的processors 一一映射
    status: '',
    execute: '',
    loading: {},  
  }),
  getters: {
    processor: (state) => (processorId) => state.processor[processorId],
    properties: (state) => (processorId) => get(state.processor[processorId], 'properties', {}),
    showRule: (state) => () => state.showRule,
  },
  mutations: {
    setShowRule(state, showRule) {
      state.showRule = showRule
    },
    setProcessors(state, processors) {
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
    updateProcessorName(state, {processorId, name}) {
      state.processor[processorId].name = name;
    },
    setProperties(state, {properties, processorId}) {
      if (!state.processor[processorId]) state.processor[processorId] = {}
      state.processor[processorId].properties = properties;
    },
  },
  actions: {
    // 请求画布数据（flowOut， graphJson）
    fetchFlow({commit, dispatch}, payload) {
      FlowRoute.get(payload).then((res: any) => {
        if (res.code === 200) {
          const showRule = JSON.parse(res.data.showRule);
          commit('setShowRule', showRule);
          forEach(showRule.cells, cell => {
            if (cell.shape !== 'edge') {
              const data = cell.data || {}
              dispatch('getProcessor', {processorId: cell.id, ...data})
            }
          })
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
      dispatch('saveProcessor', node)
    },
    // 删除节点
    deleteProcessor({commit, dispatch}, processorId) {
      commit('setLoading', {key: 'delete', loading: true})
      ProcessorInstance.delete(processorId).then((res:any) => {
        commit('deleteProcessor', processorId);
        ElMessage.success('节点信息已删除');
        commit('setLoading', {key: 'delete', loading: false})
      })
    },
    getProcessor({commit, dispatch}, {processorId, ...rest}) {
      commit('setLoading', {key: 'get', loading: true})
      ProcessorInstance.get(processorId).then((res: any) => {
        if (res.code === 200 && res.data) {
          const { properties } = res.data
          commit('setProcessor', {
            ...res.data,
            properties: JSON.parse(properties)
          });
        } else {
          commit('setProcessor', {
            processorId: processorId,
            ...rest,
            properties: {}
          });
        }
        commit('setLoading', {key: 'get', loading: false})
      })
    },
    // 保存画布节点
    saveProcessor({commit, dispatch, getters, rootGetters}, payload) {
      const nodeId = rootGetters['context/nodeId']();
      const processorId = payload.processorId;
      const processor = getters['processor'](processorId);
      const param = {
        ...processor,
        ...payload,
        nodeId: nodeId,
        properties: JSON.stringify(processor.properties),
      }
      ProcessorInstance.save(param).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success('保存节点信息成功')
        }
      })
    },
    // 更新节点的properties
    setProperties({commit, dispatch}, payload) {
      commit('setProperties', payload)
      dispatch('saveProcessor', payload)
    },
    save({commit, rootGetters}, payload) {
      commit('setShowRule', payload)
      const appId = rootGetters['context/appId']();
      const nodeId = rootGetters['context/nodeId']();
      FlowRoute.save({
        appId: appId,
        nodeId: nodeId,
        showRule: JSON.stringify(payload),
      }).then((res: any) => {
        // console.log('--- save: ', res)
      })
    },
    // 启动集成流
    turnOn({commit, state, rootGetters}) {
      const appId = rootGetters['context/appId']();
      const nodeId = rootGetters['context/nodeId']();
      const userId = rootGetters['context/userId']();
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
      const appId = rootGetters['context/appId']();
      const nodeId = rootGetters['context/nodeId']();
      const userId = rootGetters['context/userId']();
      commit('setLoading', {key: 'turnOff', loading: true});
      FlowRoute.turnOff({appId, nodeId, userId}).then((res: any) => {
        // console.log('---- turn off: ', res);
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
    execute({commit, state, rootGetters}, {processorType, processorId, properties}) {
      const appId = rootGetters['context/appId']();
      commit('setLoading', {key: "execute", loading: true});
      ProcessorInstance.execute(processorType, { processorId, properties, appId }).then((res: any) => {
        commit('execute', res.data || res.msg)
        commit('setLoading', {key: "execute", loading: false});
      })
    }
  },
}