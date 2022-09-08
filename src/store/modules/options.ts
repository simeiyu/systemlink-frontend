import { ElMessage } from 'element-plus';
import { NodeGroup } from '@/api/api';

let timer;

export default {
  namespaced: true,
  state: () => ({
    loading: false,
    data: {}
  }),
  getters: {
    getOptions: (state) => (url) => {
      return state.data[url]
    }
  },
  mutations: {
    setOptions(state, {url, options}) {
      state.data[url] = options
    },
  },
  actions: {
    // 请求 valueUrl
    fetch({commit, state}, url) {
      if (!timer) {
        timer = setTimeout(function() {
          state.loading = true;
          NodeGroup.getOptions(url).then((res: any) => {
            state.loading = false;
            if (res.code === 200) {
              commit('setOptions', { url, options: res.data })
            } else {
              ElMessage({
                type: 'error',
                message: res.msg
              })
            }
          })
          clearTimeout(timer)
          timer = null
        }, 120)
      }
    },
  },
}