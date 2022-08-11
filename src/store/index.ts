import { createStore } from 'vuex';
import { NodeGroup, FlowRoute, Suanpan } from '@/api/api';
import { map, find, get, forEach } from 'lodash';
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
    // 增加节点
    addProcessor(state, item) {
      state.flowOut.processors.push(item);
    },
    // 更新节点properties
    setProcessorProperties(state, {properties, node}) {
      const { id, parentId, grantId } = node;
      state.flowOut.processors.forEach(item => {
        let processor;
        if (grantId && item.processorId === grantId) {
          processor = find(item.processors, {processorId: parentId});
        } else if (parent && item.processorId === parentId) {
          processor = find(item.processors, {processorId: id});
        } else {
          processor = item;
        }
        processor.properties = properties;
      })
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
      Suanpan.getContext().then(res => {
        console.log('--- context: ', res)
      })
    },
    fetchFlow({commit}, payload) {
      FlowRoute.get(payload).then((res: any) => {
        console.log('---- flow: ', res)
      })
    },
    setProperties({commit}, payload) {
      commit('setProcessorProperties', payload)
    }
  }
})
