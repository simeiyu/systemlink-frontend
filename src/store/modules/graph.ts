import { get, forEach, map } from 'lodash'
import { NodeGroup } from '@/api/api';

export default {
  namespace: true,
  state: () => ({
    processors: [],      // 输出逻辑中的processors
    properties: [],      
  }),
  getters: {},
  mutations: {},
  actions: {},
}