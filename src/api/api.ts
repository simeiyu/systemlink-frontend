import { request } from '../plugin/axios'

/**
 * @description -封装NodeGroup类型的接口方法
 */
export class NodeGroup {       // 模块一
    /**
     * @description 获取分组及节点
     * @param {string} params - 参数
     * @return {Request} result
     */
    static async getGroupList(params) {   // 接口一
        return request('/systemlink/processorMeta/groupList',params, 'get')
    }
}

/**
 * @description 画布json和逻辑json
 */
export class FlowRoute {
  /**
   * @description 查询前端输出的画布json和逻辑json
   * @param {nodeId} - 参数: 算盘后面板节点id
   * @return {Request} result
   */
  static async get(nodeId) {
    return request('/systemlink/integration/route', { nodeId }, 'get')
  }
}

export class Suanpan {
  static async getContext() {
    return request('/sp/context/get')
  }
}
