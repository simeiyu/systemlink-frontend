import { createStore } from 'vuex';
import { NodeGroup, FlowRoute, Suanpan } from '@/api/api';
import { map, find, get, forEach } from 'lodash';
import { State } from './type';

const graphDemo = {
  "cells": [
      {
          "position": {
              "x": 255,
              "y": 42
          },
          "size": {
              "width": 90,
              "height": 90
          },
          "view": "vue-shape-view",
          "shape": "vue-shape",
          "id": "65708bec-fe31-4c62-b348-1298da0ecac1",
          "component": "rectNode",
          "data": {
              "kind": "schedule",
              "description": "周期触发",
              "icon": "icon-a-lianhe292"
          },
          "ports": {
              "groups": {
                  "top": {
                      "position": "top",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "right": {
                      "position": "right",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "bottom": {
                      "position": "bottom",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "left": {
                      "position": "left",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  }
              },
              "items": [
                  {
                      "group": "top",
                      "id": "4497f6ed-95c3-41de-905b-c93c8e9185bc"
                  },
                  {
                      "group": "right",
                      "id": "12095217-84a0-4cbb-add7-da8ac00953e3"
                  },
                  {
                      "group": "bottom",
                      "id": "4178e20f-4436-4142-8608-b249ff09b395"
                  },
                  {
                      "group": "left",
                      "id": "7721ff91-5ae6-49f5-86d0-9d75dc01f564"
                  }
              ]
          },
          "zIndex": 1
      },
      {
          "shape": "edge",
          "attrs": {
              "line": {
                  "stroke": "#0084FF",
                  "strokeDasharray": 5,
                  "style": {
                      "animation": "ant-line 30s infinite linear"
                  }
              }
          },
          "id": "cc5b1753-726e-4582-af27-bfe2181aaef0",
          "zIndex": 1,
          "source": {
              "cell": "65708bec-fe31-4c62-b348-1298da0ecac1",
              "port": "12095217-84a0-4cbb-add7-da8ac00953e3"
          },
          "target": {
              "cell": "08fd49b0-ce54-4bda-ad55-4fe2612226c0",
              "port": "bd5fcc1e-c8ba-408e-a75f-51f8e75e7e96"
          }
      },
      {
          "shape": "edge",
          "attrs": {
              "line": {
                  "stroke": "#0084FF",
                  "strokeDasharray": 5,
                  "style": {
                      "animation": "ant-line 30s infinite linear"
                  }
              }
          },
          "id": "f2adec50-57da-40cc-b74f-cedd0b32c6d6",
          "zIndex": 1,
          "source": {
              "cell": "08fd49b0-ce54-4bda-ad55-4fe2612226c0",
              "port": "5ab21d29-87e3-4cc0-9286-f62af8795152"
          },
          "target": {
              "cell": "6c7d2572-aa6b-4740-87a6-d56a2ddaf8b8",
              "port": "3c896a3e-5f54-4c4c-b49b-391c6d8da74c"
          }
      },
      {
          "position": {
              "x": 98,
              "y": 224
          },
          "size": {
              "width": 90,
              "height": 90
          },
          "view": "vue-shape-view",
          "shape": "vue-shape",
          "id": "08fd49b0-ce54-4bda-ad55-4fe2612226c0",
          "component": "rectNode",
          "data": {
              "kind": "webhook",
              "description": "webhook",
              "icon": null
          },
          "ports": {
              "groups": {
                  "top": {
                      "position": "top",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "right": {
                      "position": "right",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "bottom": {
                      "position": "bottom",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "left": {
                      "position": "left",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  }
              },
              "items": [
                  {
                      "group": "top",
                      "id": "93d2dd92-a835-4b55-bab9-96c3afeb9f45"
                  },
                  {
                      "group": "right",
                      "id": "5ab21d29-87e3-4cc0-9286-f62af8795152"
                  },
                  {
                      "group": "bottom",
                      "id": "03be8fee-9086-4cd6-9ea8-b17a63e38026"
                  },
                  {
                      "group": "left",
                      "id": "bd5fcc1e-c8ba-408e-a75f-51f8e75e7e96"
                  }
              ]
          },
          "zIndex": 2
      },
      {
          "position": {
              "x": 286,
              "y": 346
          },
          "size": {
              "width": 604,
              "height": 122
          },
          "attrs": {
              "text": {
                  "fontSize": 12,
                  "fill": "#262626"
              },
              "body": {
                  "strokeWidth": 0,
                  "fill": "#F4F6F9"
              }
          },
          "visible": true,
          "shape": "rect",
          "id": "91ba214d-728d-44a6-b82d-f3d23c924f10",
          "zIndex": 2,
          "data": {
              "kind": "when",
              "nodeData": {
                  "processorType": "when",
                  "metaInfo": {
                      "title": "决策设置",
                      "properties": [
                          {
                              "title": "过滤模式",
                              "name": "model",
                              "type": "String",
                              "form": "select",
                              "enum": [
                                  {
                                      "name": "简单模式",
                                      "value": "simple"
                                  },
                                  {
                                      "name": "表达式模式",
                                      "value": "expression"
                                  }
                              ],
                              "required": true,
                              "extend": {
                                  "simple": {
                                      "position": "model",
                                      "content": [
                                          {
                                              "position": "default",
                                              "title": "输入",
                                              "name": "source",
                                              "type": "String",
                                              "form": "input",
                                              "required": false
                                          },
                                          {
                                              "position": "default",
                                              "type": "String",
                                              "title": "匹配模式",
                                              "name": "compare",
                                              "form": "select",
                                              "enum": [
                                                  {
                                                      "name": ">",
                                                      "value": "&gt;"
                                                  },
                                                  {
                                                      "name": ">=",
                                                      "value": "&gt;="
                                                  },
                                                  {
                                                      "name": "<",
                                                      "value": "&lt;"
                                                  },
                                                  {
                                                      "name": "<=",
                                                      "value": "&lt;="
                                                  }
                                              ],
                                              "required": false
                                          },
                                          {
                                              "position": "default",
                                              "type": "String",
                                              "title": "预期值",
                                              "name": "compareValue",
                                              "form": "input",
                                              "required": false
                                          }
                                      ]
                                  },
                                  "expression": {
                                      "position": "model",
                                      "content": [
                                          {
                                              "position": "default",
                                              "title": "表达式",
                                              "name": "expression",
                                              "type": "String",
                                              "form": "input",
                                              "required": true
                                          }
                                      ]
                                  }
                              }
                          }
                      ]
                  },
                  "branches": [],
                  "fixed": true
              },
              "properties": {}
          },
          "parent": "6c7d2572-aa6b-4740-87a6-d56a2ddaf8b8"
      },
      {
          "position": {
              "x": 266,
              "y": 238
          },
          "size": {
              "width": 644,
              "height": 486
          },
          "view": "vue-shape-view",
          "shape": "vue-shape",
          "id": "6c7d2572-aa6b-4740-87a6-d56a2ddaf8b8",
          "component": "choiceNode",
          "data": {
              "kind": "choice"
          },
          "ports": {
              "groups": {
                  "top": {
                      "position": "top",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "right": {
                      "position": "right",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "bottom": {
                      "position": "bottom",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "left": {
                      "position": "left",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  }
              },
              "items": [
                  {
                      "group": "top",
                      "id": "c6a9e314-aef9-4e12-81bf-8fb7cc28c28e"
                  },
                  {
                      "group": "right",
                      "id": "1d849175-c577-4d7d-acf7-5bb385aee2ac"
                  },
                  {
                      "group": "bottom",
                      "id": "1cfff0d8-22a9-462c-a70a-56b0278bdf87"
                  },
                  {
                      "group": "left",
                      "id": "3c896a3e-5f54-4c4c-b49b-391c6d8da74c"
                  }
              ]
          },
          "zIndex": 1,
          "children": [
              "91ba214d-728d-44a6-b82d-f3d23c924f10",
              "6ce7666e-9937-4919-89d0-419d1d1e6ab4"
          ],
          "originSize": {
              "width": 644,
              "height": 486
          },
          "originPosition": {
              "x": 255,
              "y": 224
          }
      },
      {
          "position": {
              "x": 487,
              "y": 362
          },
          "size": {
              "width": 90,
              "height": 90
          },
          "view": "vue-shape-view",
          "shape": "vue-shape",
          "id": "6ce7666e-9937-4919-89d0-419d1d1e6ab4",
          "component": "rectNode",
          "data": {
              "kind": "rest",
              "description": "rest",
              "icon": null
          },
          "ports": {
              "groups": {
                  "top": {
                      "position": "top",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "right": {
                      "position": "right",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "bottom": {
                      "position": "bottom",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  },
                  "left": {
                      "position": "left",
                      "attrs": {
                          "circle": {
                              "r": 4,
                              "magnet": true,
                              "stroke": "#5F95FF",
                              "strokeWidth": 1,
                              "fill": "#fff",
                              "style": {
                                  "visibility": "hidden"
                              }
                          }
                      }
                  }
              },
              "items": [
                  {
                      "group": "top",
                      "id": "148d637c-d030-4634-a3b2-aa6056dafb80"
                  },
                  {
                      "group": "right",
                      "id": "766bf787-7f84-4685-baf1-6eeec065028a"
                  },
                  {
                      "group": "bottom",
                      "id": "e1056a67-0cde-479c-8935-5b734ffa86f8"
                  },
                  {
                      "group": "left",
                      "id": "0da53784-1aac-40b8-9621-1428c001e1bf"
                  }
              ]
          },
          "zIndex": 4,
          "parent": "6c7d2572-aa6b-4740-87a6-d56a2ddaf8b8",
          "visible": true
      }
  ]
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
      return typeof metaInfo === 'object' ? metaInfo : JSON.parse(metaInfo);
    }
  },
  mutations: {
    // 初始化获取到集成流json
    initFlowData(state, {routeJson, showRule}) {
      // state.flowOut = item.routeJson;
      state.graphJson = graphDemo;  // item.showRule
    },
    // 增加节点
    addProcessor(state, item) {
      state.flowOut.processors.push(item);
    },
    // 更新节点properties
    setProcessorProperties(state, {properties, node}) {
      const { id, parentId, grantId } = node;
      state.flowOut.processors.forEach(item => {
        let processor;
        if (grantId && item.processorId === grantId) {
          processor = find(item.processors, {processorId: parentId});
        } else if (parent && item.processorId === parentId) {
          processor = find(item.processors, {processorId: id});
        } else {
          processor = item;
        }
        processor.properties = properties;
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
    },
    setContext(state, payload) {
      state.spContext = payload;
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
    },
    fetchContext({commit, dispatch}) {
      Suanpan.getContext().then((res: any) => {
        commit('setContext', res.data);
        dispatch('fetchFlow', res.data.nodeId);
      })
    },
    fetchFlow({commit}, payload) {
      FlowRoute.get(123456).then((res: any) => {
        console.log('---- flow: ', res)
        commit('initFlowData', res.data);
      })
    },
    setProperties({commit}, payload) {
      commit('setProcessorProperties', payload)
    },
    saveFlow({commit, state}) {

    }
  }
})
