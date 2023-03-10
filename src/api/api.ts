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

    static async getOptions(valueUrl) {
      return request(valueUrl)
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
  /**
   * 保存前端输出的画布json和逻辑json
   * @param {nodeId, routeJson, showRule} 
   * @returns 
   */
  static async save(param) {
    return request('/systemlink/integration/route', param, 'post')
  }
  // 启动集成流
  static async turnOn(param) {
    return request('/systemlink/integration/route/turn_on_flow', param)
  }
  // 关闭集成流
  static async turnOff(param) {
    return request('/systemlink/integration/route/turn_off_flow', param)
  }
}

/**
 * transform 转换方法
 */
export class Transform {
  /**
   * @description 转换方法列表
   * @returns {Request} result
   */
  static async getList() {
    return request('/systemlink/transformMeta/list')
  }
  // 查询当前节点下的数据转换列表
  static async getTransforms(id) {
    return request('/systemlink/transformInstance/findList', {processorId: id})
  }
  // 保存数据转换输出信息
  static async saveItem(param) {
    return request('/systemlink/transformInstance', param, 'post')
  }

}

/**
 * 画布节点详情
 */
export class ProcessorInstance {
  // 查询前序节点的输出数据
  static async getUpstream(id) {
    return request('/systemlink/processorInstance/findParent', {processorId: id})
  }
  // 保存画布节点输出信息
  static async get(id) {
    return request('/systemlink/processorInstance', {processorId: id}, 'get')
  }
  // 保存画布节点输出信息
  static async save(params) {
    return request('/systemlink/processorInstance', params, 'post')
  }
  // 删除画布节点输出信息
  static async delete(id) {
    return request('/systemlink/processorInstance', {processorId: id}, 'delete')
  }
  // 测试执行，获取执行结果和响应结构(数据库组件-database、http请求组件-rest)
  static async execute(processorType, param) {
    return request(`/systemlink/integration/processor/${processorType}/execute`, param, 'post')
  }
}

export class Suanpan {
  static async getContext() {
    const prefix = location.href.replace('/#/', '/')
    return request(`${prefix}sp/context`)
  }
}
