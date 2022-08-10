import { createStore } from 'vuex';
import { NodeGroup } from '@/api/api';
import { map } from 'lodash';

export interface Processor {
  processorId: string;
  kind: string;
  properties: object;
  processors?: Processor[];
  output: string;
}

interface Transformer {
  transformId: string;
  processorId: string;
  properties: any;
  output: any;
}

interface FlowOut {
  routeId: string;
  properties: any;
  transforms: Transformer[];
  processors: Processor[];
  externalDataSource: any[];
}

interface Group {
  name: string;
  description: string;
  icon?: string;
  processorType?: string;
  processorMetaVOList?: Group[];
}

interface State {
  flowOut: FlowOut;
  componentInfo: any;
  nodeGroup: Group[];
  nodeGroupLoading: boolean;
}

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
  mutations: {
    // 增加节点
    addProcessor(state, item) {
      state.flowOut.processors.push(item);
    },
    // 更新节点properties
    setProcessorProperties(state, {id, properties}) {
      state.flowOut.processors.forEach(item => {
        if (item.processorId === id) {
          item.properties = properties;
        }
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
    }
  }
})
