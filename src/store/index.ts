import { createStore } from 'vuex';
import { NodeGroup, FlowRoute, Suanpan } from '@/api/api';
import { map, find, get, forEach, remove, isEmpty } from 'lodash';
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
      nodeGroupLoading: false,
      nodeGroup: [],
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
    }
  },
  mutations: {
    // 初始化获取到集成流json
    initFlowData(state, {routeJson, showRule}) {
      state.flowOut = JSON.parse(showRule);
      state.graphJson = JSON.parse(routeJson);
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
    setNodeGroupLoading(state, loading) {
      state.nodeGroupLoading = loading;
    },
    setNodeGroup(state, data) {
      state.nodeGroup = data;
    },
    setComponentInfo(state, data) {
      state.componentInfo = data;
    },
    setContext(state, payload) {
      state.spContext = payload;
    }
  },
  actions: {
    fetchComponents({commit}) {
      commit('setNodeGroupLoading', true);
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
        commit('setNodeGroupLoading', false);
      })
    },
    fetchContext({commit, dispatch}) {
      Suanpan.getContext().then((res: any) => {
        commit('setContext', res.data);
        dispatch('fetchFlow', res.data.nodeId);
      })
    },
    fetchFlow({commit}, payload) {
      FlowRoute.get(payload).then((res: any) => {
        console.log('---- flow: ', res)
        commit('initFlowData', res.data);
      })
    },
    setProperties({commit}, payload) {
      commit('setProcessorProperties', payload)
    },
    saveFlow({commit, state}, payload) {
      console.log('--- save context: ', state.spContext)
      console.log('--- save showRule: ', state.flowOut)
      console.log('--- save routeJson: ', payload)
      FlowRoute.save({
        nodeId: state.spContext?.nodeId,
        routeJson: JSON.stringify(payload),
        showRule: JSON.stringify(state.flowOut)
      })
    }
  }
})
