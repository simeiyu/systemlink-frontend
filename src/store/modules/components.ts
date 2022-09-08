import { ElMessage } from 'element-plus';
import { get, forEach, map } from 'lodash'
import { NodeGroup } from '@/api/api';

export interface Group {
  name: string;
  icon?: string;
  description: string;
  processorType?: string;
  processorMetaVOList?: Group[];
  isTrigger?: boolean;
}

export default {
  namespaced: true,
  state: () => ({
    loading: false,      // 组件列表加载状态
    componentInfo: {},   // 组件信息字典：组件id对应的metaInfo
    nodeGroup: [],       // 组件栏列表：去掉metaInfo的组件列表
  }),
  getters: {
    metaInfo: (state) => (kind) => {
      const metaInfo = get(state.componentInfo, `${kind}.metaInfo`, '');
      // console.log('--- node metaInfo: ', typeof metaInfo === 'object' ? metaInfo : JSON.parse(metaInfo))
      return typeof metaInfo === 'object' ? metaInfo : JSON.parse(metaInfo);
    },
    getByType: (state) => (type) => state.componentInfo[type],
  },
  mutations: {
    // 组件栏列表
    setNodeGroup(state, data) {
      state.nodeGroup = data;
    },
    // 组件信息字典
    setComponentInfo(state, data) {
      state.componentInfo = data;
    },
  },
  actions: {
    // 获取组件列表（元数据）
    fetchList({commit, state}) {
      state.loading = true;
      commit('setNodeGroup', []);
      NodeGroup.getGroupList({}).then((res: any) => {
        if (res.code === 200) {
          const componentInfo = {};
          const nodeGroup = map(res.data, item => {
            const children = map(item.processorMetaVOList, proc => {
              const { name, icon, description, processorType, isTrigger } = proc;
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
                processorType,
                isTrigger,
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
        } else {
          ElMessage.error(res.msg)
        }
      }).finally(() => {
        state.loading = false;
      })
    },
  },
}