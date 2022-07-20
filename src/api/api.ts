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
