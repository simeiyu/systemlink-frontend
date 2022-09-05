import { Suanpan } from '@/api/api';

export default {
  namespaced: true,
  state: () => ({
    appId: '',
    nodeId: '',
    userId: '',
    componentId: '',
    loading: false
  }),
  getters: {
    nodeId: (state) => () => state.nodeId,
    appId: (state) => () => state.appId,
    userId: (state) => () => state.userId,
  },
  mutations: {
    setContext(state, {appId, nodeId, userId, componentId, component, componentType}) {
      state.appId = appId;
      state.nodeId = nodeId;
      state.userId = userId;
      state.componentId = componentId;
    },
  },
  actions: {
    // 请求环境变量（appId, userId, nodeId, componentId)
    fetchContext({commit, state, dispatch}) {
      state.loading = true;
      Suanpan.getContext().then((res: any) => {
        commit('setContext', res.data);
      }).finally(() => {
        state.loading = false;
        // commit('setContext', {
        //   "appId": 77800,
        //   "nodeId": "99ec0780f39211ec84c5bfc02d1bcaa4",
        //   "userId": 1000184,
        //   "componentId": 15130,
        //   "component": "DataConnector",
        //   "componentType": "DataBase"
        // })
        // dispatch('graph/fetchFlow', "99ec0780f39211ec84c5bfc02d1bcaa4", {root: true});
      })
    },
  },
}
