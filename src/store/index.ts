import { ElMessage } from 'element-plus';
import { Transform } from './../api/api';
import { createStore } from 'vuex';
import { NodeGroup, FlowRoute, Suanpan, ProcessorInstance } from '@/api/api';
import { map, find, get, forEach, remove, filter, isEmpty, findIndex } from 'lodash';
import { State } from './type';
import { v4 as uuidv4 } from 'uuid';

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
      loading: {
        nodeGroup: false,
        options: false,
      },
      status: '',
      nodeGroup: [],
      options: {},
      transform: {
        list: []
      }
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
      console.log('--- node metaInfo: ', typeof metaInfo === 'object' ? metaInfo : JSON.parse(metaInfo))
      return typeof metaInfo === 'object' ? metaInfo : JSON.parse(metaInfo);
    },
    getInputTransforms: (state) => (processorId) => {
      if (isEmpty(processorId)) return []
      return filter(state.flowOut.transforms, item => item.processorId === processorId)
    },
    getProcessor: (state) => (id) => {
      return find(state.flowOut.processors, {processorId: id});
    },
  },
  mutations: {
    // 初始化获取到集成流json
    initFlowData(state, {routeJson, showRule}) {
      state.flowOut = JSON.parse(routeJson);
      state.graphJson = JSON.parse(showRule);
    },
    setGraphJson(state, payload) {
      state.graphJson = payload;
    },
    // 增加节点
    addProcessor(state, {parentId, grantId, processor}) {
      if (!parentId) {
        state.flowOut.processors.push(JSON.parse(JSON.stringify(processor)));
      } else if (!grantId) {
        const parentIndex = findIndex(state.flowOut.processors, item => item.processorId === parentId);
        if (parentIndex > -1) {
          if (!state.flowOut.processors[parentIndex].processors) state.flowOut.processors[parentIndex].processors = [];
          state.flowOut.processors[parentIndex].processors?.push(processor);
        }
      } else {
        const grantIndex = findIndex(state.flowOut.processors, item => item.processorId === grantId);
        if (grantIndex > -1 && state.flowOut.processors[grantIndex].processors) {
          const parentIndex = findIndex(state.flowOut.processors[grantIndex].processors, item => item.processorId === grantId);
          if (parentIndex > -1) {
            if (!state.flowOut.processors[grantIndex].processors[parentIndex].processors) {
              state.flowOut.processors[grantIndex].processors[parentIndex].processors = [];
            }
            state.flowOut.processors[grantIndex].processors[parentIndex].processors?.push(processor);
          }
        }
      }
    },
    // 更新节点的所在parent
    updateProcessor(state, {nodeId, parentId, prevParentId}) {
      let node;
      if (prevParentId) {
        const loop = function(processors) {
          forEach(processors, item => {
            if (item.processors && item.processors.length) {
              if (item.processorId === prevParentId) {
                node = remove(item.processors, {processorId: nodeId});
              } else {
                loop(item.processors);
              }
            }
          })
        }
        loop(state.flowOut.processors);
      } else {
        node = remove(state.flowOut.processors, {processorId: nodeId});
      }
      if (node) {
        if (parentId) {
          const pushLoop = function(processors) {
            forEach(processors, item => {
              if (item.processorId === parentId) {
                if (!item.processors) {
                  item.processors = []
                } 
                item.processors.push(...node);
              } else if (item.processors && item.processors.length) {
                pushLoop(item.processors)
              }
            })
          }
          pushLoop(state.flowOut.processors);
        } else {
          state.flowOut.processors.push(...node);
        }
      }
    },
    // 增加choice节点内的when
    addChoiceProcessor(state, { choiceId, processor}) {
      const choiceIndex = state.flowOut.processors.findIndex(item => item.processorId === choiceId);
      if (choiceIndex > -1) state.flowOut.processors[choiceIndex].processors?.push(processor);
    },
    // 更新节点properties、name
    setProcessorProperties(state, {properties, node}) {
      const { id, parentId, grantId, name } = node;
      state.flowOut.processors.forEach(item => {
        let processor;
        let parent;
        if (grantId && item.processorId === grantId) {
          parent = find(item.processors, {processorId: parentId});
        }
        if (parent) {
          processor = find(parent.processors, {processorId: id});
        } else if (item.processorId === parentId) {
          processor = find(item.processors, {processorId: id});
        } else if (item.processorId === id) {
          processor = item;
        }
        if (processor) {
          if (properties) processor.properties = JSON.parse(JSON.stringify(properties));
          processor.name = name;
        }
      });
    },
    // 删除节点
    deleteProcessor(state, node) {
      const { id, parentId, grantId, name } = node;
      let processors;
      if (!parentId) {
        processors = state.flowOut.processors;
        remove(state.flowOut.processors, item => item.processorId === id);
      } else if (!grantId) {
        const parentIndex = findIndex(state.flowOut.processors, item => item.processorId === parentId);
        if (parentIndex > -1) {
          processors = state.flowOut.processors[parentIndex].processors;
        }
      } else {
        const grantIndex = findIndex(state.flowOut.processors, item => item.processorId === grantId);
        if (grantIndex > -1) {
          const index = findIndex(state.flowOut.processors[grantIndex].processors, item => item.processorId === parentId);
          if (index > -1) {
            processors = state.flowOut.processors[grantIndex].processors[index].processors;
          }
        }
      }
      processors && remove(processors, item => item.processorId === id);
    },
    // 更新loading
    setLoading(state, {key, loading}) {
      state.loading[key] = loading;
    },
    // 组件栏列表
    setNodeGroup(state, data) {
      state.nodeGroup = data;
    },
    // 组件信息字典
    setComponentInfo(state, data) {
      state.componentInfo = data;
    },
    // 算盘环境变量
    setContext(state, payload) {
      state.spContext = payload;
    },
    // ValurUrl 的下拉选项
    setOptions(state, {path, data}) {
      state.options[path] = data;
    },
    // transform的元数据
    setTransformList(state, payload) {
      state.transform.list = map(payload, item => {
        if (item.metaInfo) {
          return {
            ...item,
            metaInfo: JSON.parse(item.metaInfo)
          }
        }
        return item
      })
    },
    // 新增或编辑Transform
    setTransform(state, {visible, transformId, processorId}) {
      state.transform.visible = visible;
      if (visible) {
        state.transform.edit = transformId ? find(state.flowOut.transforms, {transformId}) : {
          transformId: uuidv4(),
          processorId: processorId,
          properties: {},
          output: {}
        }
      } else {
        state.transform.edit = null;
      }
      console.log('--- set transform: ', state.transform.edit)
    },
    // 将编辑后的Transform更新到flowOut
    updateTransforms(state, transform) {
      const index = state.flowOut.transforms.findIndex(item => item.transformId === transform.transformId);
      if (index > -1) {
        state.flowOut.transforms[index] = transform;
      } else {
        state.flowOut.transforms.push(transform);
      }
    },
    setStatus(state, payload) {
      state.status = payload;
    },
    execute(state, payload) {
      state.execute = payload;
    }
  },
  actions: {
    // 获取组件列表（元数据）
    fetchComponents({commit}) {
      commit('setLoading', {key: 'nodeGroup', loading: true});
      commit('setNodeGroup', []);
      NodeGroup.getGroupList({}).then((res: any) => {
        const componentInfo = {};
        const nodeGroup = map(res.data, item => {
          const children = map(item.processorMetaVOList, proc => {
            const { name, icon, description, processorType, isCustomExpressionMapper, isTrigger } = proc;
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
              isCustomExpressionMapper,
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
      }).finally(() => {
        commit('setLoading', {key: 'nodeGroup', loading: false});
      })
    },
    // 请求环境变量（appId, userId, nodeId, componentId)
    fetchContext({commit, dispatch}) {
      Suanpan.getContext().then((res: any) => {
        commit('setContext', res.data);
        dispatch('fetchFlow', res.data.nodeId);
      }).finally(() => {
        commit('setContext', {
          "appId": 77800,
          "nodeId": "99ec0780f39211ec84c5bfc02d1bcaa4",
          "userId": 1000184,
          "componentId": 15130,
          "component": "DataConnector",
          "componentType": "DataBase"
        })
        dispatch('fetchFlow', "99ec0780f39211ec84c5bfc02d1bcaa4");
      })
    },
    // 请求画布数据（flowOut， graphJson）
    fetchFlow({commit}, payload) {
      FlowRoute.get(payload).then((res: any) => {
        commit('initFlowData', res.data);
      })
    },
    // 请求valueUrl的下拉列表，保存到state.options
    fetchOptions({commit, state}, valueUrl) {
      commit('setLoading', {key: 'options', loading: true});
      NodeGroup.getOptions(valueUrl).then((res: any) => {
        commit('setOptions', {
          path: valueUrl,
          data: res.data
        })
      }).finally(() => {
        commit('setLoading', {key: 'options', loading: false});
      })
    },
    // 更新节点的properties
    setProperties({commit}, payload) {
      commit('setProcessorProperties', payload)
    },
    // 更新节点的name
    updateProcessorName({commit}, node) {
      commit('setProcessorProperties', {node});
    },
    // 删除节点
    deleteProcessor({commit}, node) {
      commit('setLoading', {key: 'delete', loading: true})
      ProcessorInstance.delete(node.id).then((res:any) => {
        commit('deleteProcessor', node);
        ElMessage.success('节点信息已删除');
        commit('setLoading', {key: 'delete', loading: false})
      })
    },
    // 保存画布数据（flowOut、graphJson）
    saveFlow({commit, state}, payload) {
      console.log('--- save routeJson: ', state.flowOut)
      commit('setGraphJson', payload);
      FlowRoute.save({
        nodeId: state.spContext?.nodeId,
        showRule: JSON.stringify(payload),
        routeJson: JSON.stringify(state.flowOut)
      })
    },
    // 清空画布
    clear({commit, state}) {
      state.flowOut = {
        routeId: "",
        properties: {},
        transforms: [],
        processors: [],
        externalDataSource: []
      };
      state.graphJson = {};
    },
    // 启动集成流
    turnOn({commit, state}, payload) {
      const { appId, nodeId, userId } = state.spContext;
      commit('setStatus', 'running');
      FlowRoute.turnOn({appId, nodeId, userId}).then((res: any) => {
        if (res.code !== 200) {
          commit('setStatus', '');
          ElMessage({
            type: 'error',
            message: `启动失败：${res.msg}`
          })
        }
      })
    },
    // 关闭集成流
    turnOff({commit, state}, payload) {
      const { appId, nodeId, userId } = state.spContext;
      commit('setLoading', {key: 'turnOff', loading: true});
      FlowRoute.turnOff({appId, nodeId, userId}).then((res: any) => {
        console.log('---- turn off: ', res);
        if (res.code === 200) {
          commit('setStatus', '');
        } else {
          ElMessage({
            type: 'error',
            message: `关闭失败：${res.msg}`
          })
        }
      })
    },
    // 请求转换方法列表
    fetchTransformList({commit}) {
      Transform.getList().then((res: any) => {
        commit('setTransformList', res.data);
      })
    },
    // 保存转换方法
    saveTransform({commit, state}, payload) {
      store.commit('updateTransforms', payload);
      const { nodeId } = state.spContext;
      const { processorId, transformId, properties, output } = payload;
      Transform.saveItem({
        nodeId,
        processorId,
        transformId,
        "properties": JSON.stringify(properties),
        "output": JSON.stringify(output),
        "name": payload.properties.name,
        "transformType": payload.properties.type,
      }).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success(`数据转换保存成功`)
        } else {
          ElMessage.error(`数据转换保存失败：${res.msg}`)
        }
      })
    },
    // 保存画布节点输出信息
    saveProcessor({commit}, payload) {
      ProcessorInstance.save(payload).then((res: any) => {
        if (res && res.data) {
          ElMessage.success('保存节点信息成功')
        }
      })
    },
    // 节点测试执行
    execute({commit, state}, {processorType, processorId, properties}) {
      const { appId } = state.spContext;
      commit('setLoading', {key: "execute", loading: true});
      ProcessorInstance.execute(processorType, { processorId, properties, appId }).then((res: any) => {
        commit('execute', res.data || res.msg)
        commit('setLoading', {key: "execute", loading: false});
      })
    }
  }
})
