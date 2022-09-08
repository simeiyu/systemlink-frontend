import { Suanpan } from '@/api/api';

export default {
  namespaced: true,
  state: () => ({
    appId: '',
    nodeId: '',
    userId: '',
    componentId: '',
    loading: false,
    focusInputName: '',
    expression: '',
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
    setFocusInput(state, payload) {
      state.focusInputName = payload
    }
  },
  actions: {
    // 请求环境变量（appId, userId, nodeId, componentId)
    fetchContext({commit, state, dispatch}) {
      state.loading = true;
      Suanpan.getContext().then((res: any) => {
        commit('setContext', res.data);
        dispatch('graph/fetchFlow', res.data.nodeId, { root: true })
        dispatch('components/fetchList', null, { root: true })
        dispatch('transform/fetchList', null, { root: true })
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
        // dispatch('graph/fetchFlow', "99ec0780f39211ec84c5bfc02d1bcaa4", { root: true })
        // dispatch('components/fetchList', null, { root: true })
        // dispatch('transform/fetchList', null, { root: true })
      })
    },
    setExpression({commit, state}, payload) {
      state.expression = payload
    }
  },
}
