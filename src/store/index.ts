import { Transform } from './../api/api';
import { createStore } from 'vuex';
import { NodeGroup, FlowRoute, Suanpan } from '@/api/api';
import { map, find, get, forEach, remove, filter, isEmpty } from 'lodash';
import { State } from './type';

export const store = createStore<State>({
  state() {
    return {
      flowOut: {
        routeId: "",
        properties: {},
        transforms: [],
        processors: [],
        externalDataSource: []
      },
      componentInfo: {},
      loading: {
        nodeGroup: false,
        options: false,
      },
      nodeGroup: [],
      options: {},
      transform: {
        list: []
      }
    }
  },
  getters: {
    getProperties: (state) => (id, parentId, grantId) => {
      let grant = grantId && find(state.flowOut.processors, {processorId: grantId});
      let parent;
      if (parentId) {
        parent = find(grant?.processors || state.flowOut.processors, {processorId: parentId});
      }
      return get(find(parent?.processors || state.flowOut.processors, {processorId: id}), 'properties', {});
    },
    getMetaInfo: (state) => (kind) => {
      const metaInfo = get(state.componentInfo, `${kind}.metaInfo`, '');
      return typeof metaInfo === 'object' ? metaInfo : JSON.parse(metaInfo);
    },
    getInputTransforms: (state) => (nodes) => {
      if (isEmpty(nodes)) return []
      return filter(state.flowOut.transforms, item => nodes.includes(item.processorId))
    }
  },
  mutations: {
    // 初始化获取到集成流json
    initFlowData(state, {routeJson, showRule}) {
      state.flowOut = JSON.parse(routeJson);
      state.graphJson = JSON.parse(showRule);
    },
    setGraphJson(state, payload) {
      state.graphJson = payload;
    },
    // 增加节点
    addProcessor(state, item) {
      state.flowOut.processors.push(JSON.parse(JSON.stringify(item)));
    },
    // 更新节点
    updateProcessor(state, {nodeId, parentId, prevParentId}) {
      let node;
      if (prevParentId) {
        const loop = function(processors) {
          forEach(processors, item => {
            if (item.processors && item.processors.length) {
              if (item.processorId === prevParentId) {
                node = remove(item.processors, {processorId: nodeId});
              } else {
                loop(item.processors);
              }
            }
          })
        }
        loop(state.flowOut.processors);
      } else {
        node = remove(state.flowOut.processors, {processorId: nodeId});
      }
      if (node) {
        if (parentId) {
          const pushLoop = function(processors) {
            forEach(processors, item => {
              if (item.processorId === parentId) {
                if (!item.processors) {
                  item.processors = []
                } 
                item.processors.push(...node);
              } else if (item.processors && item.processors.length) {
                pushLoop(item.processors)
              }
            })
          }
          pushLoop(state.flowOut.processors);
        } else {
          state.flowOut.processors.push(...node);
        }
      }
    },
    // 更新节点properties
    setProcessorProperties(state, {properties, node}) {
      const { id, parentId, grantId } = node;
      state.flowOut.processors.forEach(item => {
        let processor;
        let parent;
        if (grantId && item.processorId === grantId) {
          parent = find(item.processors, {processorId: parentId});
        }
        if (parent) {
          processor = find(parent.processors, {processorId: id});
        } else if (item.processorId === parentId) {
          processor = find(item.processors, {processorId: id});
        } else if (item.processorId === id) {
          processor = item;
        }
        if (processor) processor.properties = JSON.parse(JSON.stringify(properties));
      });
    },
    setLoading(state, {key, loading}) {
      state.loading[key] = loading;
    },
    setNodeGroup(state, data) {
      state.nodeGroup = data;
    },
    setComponentInfo(state, data) {
      state.componentInfo = data;
    },
    setContext(state, payload) {
      state.spContext = payload;
    },
    setOptions(state, {path, data}) {
      state.options[path] = data;
    },
    setTransformList(state, payload) {
      state.transform.list = map(payload, item => {
        if (item.metaInfo) {
          return {
            ...item,
            metaInfo: JSON.parse(item.metaInfo)
          }
        }
        return item
      })
      console.log(' tranform: ', state.transform.list)
    }
  },
  actions: {
    // 获取组件列表（元数据）
    fetchComponents({commit}) {
      commit('setLoading', {key: 'nodeGroup', loading: true});
      commit('setNodeGroup', []);
      NodeGroup.getGroupList({}).then((res: any) => {
        const componentInfo = {};
        const nodeGroup = map(res.data, item => {
          const children = map(item.processorMetaVOList, proc => {
            const { name, icon, description, processorType } = proc;
            componentInfo[processorType] = proc;
            if (proc.processorType === 'choice') {
              // 决策设置中有branches
              const metaInfo = JSON.parse(proc.metaInfo);
              forEach(metaInfo.branches, branch => {
                componentInfo[branch.processorType] = branch;
              });
            }
            return {
              name,
              icon,
              description,
              processorType
            }
          });
          return {
            name: item.name,
            description: item.description,
            processorMetaVOList: children
          }
        });
        commit('setNodeGroup', nodeGroup);
        commit('setComponentInfo', componentInfo);
      }).finally(() => {
        commit('setLoading', {key: 'nodeGroup', loading: false});
      })
    },
    // 请求环境变量（appId, userId, nodeId, componentId)
    fetchContext({commit, dispatch}) {
      Suanpan.getContext().then((res: any) => {
        commit('setContext', res.data);
        dispatch('fetchFlow', res.data.nodeId);
      })
    },
    // 请求画布数据（flowOut， graphJson）
    fetchFlow({commit}, payload) {
      FlowRoute.get(payload).then((res: any) => {
        commit('initFlowData', res.data);
      })
    },
    // 请求valueUrl的下拉列表，保存到state.options
    fetchOptions({commit, state}, valueUrl) {
      commit('setLoading', {key: 'options', loading: true});
      NodeGroup.getOptions(valueUrl).then((res: any) => {
        console.log('---- getOptions: ', res)
        commit('setOptions', {
          path: valueUrl,
          data: res.data
        })
      }).finally(() => {
        commit('setLoading', {key: 'options', loading: false});
      })
    },
    // 更新节点的properties
    setProperties({commit}, payload) {
      commit('setProcessorProperties', payload)
    },
    // 保存画布数据（flowOut、graphJson）
    saveFlow({commit, state}, payload) {
      console.log('--- save showRule: ', payload)
      commit('setGraphJson', payload);
      FlowRoute.save({
        nodeId: state.spContext?.nodeId,
        showRule: JSON.stringify(payload),
        routeJson: JSON.stringify(state.flowOut)
      })
    },
    // 请求转换方法列表
    fetchTransformList({commit}) {
      Transform.getList().then((res: any) => {
        commit('setTransformList', res.data);
      })
    }
  }
})
