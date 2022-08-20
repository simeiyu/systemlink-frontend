<template>
  <div class="render">
    <div class="title">
      <span>{{ formConfig.title }}</span>
      <!-- 保存 -->
      <el-button type="primary" plain round @click="onSave">保存</el-button>
    </div>
    <div class="hr"></div>
    <div class="form-box">
      <div class="form-item" v-for="field in formConfig.properties" :key="field.name">
        <div class="label">{{ field.title || node.label }}</div>
        <div class="opt">
          <field-factory :node-data="field" v-model="properties[field.name]" @input="updateProperties" :getFormatUrl="getFormatUrl"></field-factory>
          <el-button class="set-btn"
                     size="default"
                     type="primary"
                     v-if="field.position==='model'"
                     @click="getExtendData(field)">
            {{ field.title }}
          </el-button>
        </div>
        <template v-if="field.extend&&field.extend[properties[field.name]]">
          <el-button class="set-btn"
                     size="default"
                     type="primary"
                     v-if="field.extend&&field.extend[properties[field.name]]&&field.extend[properties[field.name]].position==='model'"
                     @click="getExtendData(field.extend[properties[field.name]])">
            详细设置
          </el-button>
          <template
              v-if="field.extend&&field.extend[properties[field.name]]&&field.extend[properties[field.name]].position==='default'">
            <div class="opt" v-for="iField in field.extend[properties[field.name]].content">
              <field-factory :node-data="iField" :key="iField.name" v-model="properties[iField.name]" @input="updateProperties" :getFormatUrl="getFormatUrl"></field-factory>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>

  <el-dialog title="设 置" v-model="dialogFormVisible" destroy-on-close width="60%">
    <div class="dia-content">
      <Inputs @selectExpression="onSelectExpression" />
      <!-- <el-form :model="dialogForm" class="dia-form" label-position="top">
        <el-form-item v-for="field in dialogFormConfig">
          <field-factory :node-data="field" v-model="dialogForm[field.name]" @input="updateDialogForm" :getFormatUrl="getFormatUrl"></field-factory>
        </el-form-item>
      </el-form> -->
      <div class="dia-form">
        <div class="form-line" v-for="field in dialogFormConfig">
          <div class="sys-label">{{ field.title }}</div>
          <field-factory :node-data="field" v-model="dialogForm[field.name]" @input="updateDialogForm" :getFormatUrl="getFormatUrl" :focus="onFocus"></field-factory>
          <div
            v-if="properties[field.name]&&field.extend"
            v-for="subField in field.extend[properties[field.name]].content"
            :key="subField.name"
            >
            <div class="sys-label">{{ subField.title }}</div>
            <field-factory
              :node-data="subField"
              v-model="dialogForm[subField.name]"
              @input="updateDialogForm" :getFormatUrl="getFormatUrl" :focus="onFocus"
            >
            </field-factory>
          </div>
        </div>
      </div>

    </div>
    <template #footer>
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { watch, ref, defineProps, inject } from "vue";
import { useStore } from 'vuex';
import { has, map, filter } from 'lodash';
import { ActiveNode } from '@/store/type';
import { ElMessage } from "element-plus";
import { Graph } from '@antv/x6';
import FieldFactory from "@/views/flowEdit/components/fieldFactory.vue";
import Inputs from '@/components/inputs.vue'

const store = useStore();
const graph: Graph | undefined = inject('graph');

interface Props {
  node: ActiveNode;
  save: Function;
}

const props = defineProps<Props>();
let metaInfo = store.getters.getMetaInfo(props.node.kind);
let formConfig = ref(metaInfo);
let properties = ref(store.getters.getProperties(props.node.id, props.node.parentId, props.node.grantId));
//弹窗展示
let dialogForm = ref({});
let dialogFormVisible = ref(false);
let dialogFormConfig = ref({});
// 处于焦点中的输入框
let focusInputName = ref('')

function updateProperties({name, value}) {
  properties[name] = value;
  const _properties = {
    ...properties.value,
    [`${name}`]: value
  }
  properties.value = _properties;
  store.dispatch('setProperties', {
    properties: _properties,
    node: props.node
  })
}
function updateDialogForm({name, value}) {
  dialogForm.value = {
    ...dialogForm.value,
    [`${name}`]: value
  };
}

//设置弹窗内容
function getExtendData(modelData) {
  dialogFormVisible.value = true;
  const _dialogForm = {};
  if (modelData.content) {
    dialogFormConfig.value = modelData.content
    modelData.content.forEach(item => {
      _dialogForm[item.name] = properties.value[item.name] || '';
    })
  } else {
    dialogFormConfig.value = [modelData];
    _dialogForm[modelData.name] = properties.value[modelData.name] || '';
  }
  dialogForm.value = _dialogForm;
}

function onSubmit() {
  dialogFormVisible.value = false;
  const _properties = {
    ...properties.value,
    ...dialogForm.value
  }
  properties.value = _properties;
  store.dispatch('setProperties', {
    properties: _properties,
    node: props.node
  });
}

function getFormatUrl(str) {
  const { appId } = store.state.spContext
  const arr = map(str.split('&'), (item, index) => {
    let i = 0;
    if (!index && item.indexOf('(?)') > -1) {
      i = item.replace('(?)', '').lastIndexOf('?') + 1;
    } 
    const query = item.slice(i).split('=');
    const key = query[0];
    if (key === 'appId') {
      return item.replace(`${key}=(?)`, `${key}=${appId}`)
    } else if (has(properties.value, key)) {
      return item.replace(`${key}=(?)`, `${key}=${properties.value[key]}`)
    } else if (query[1] === '(?)') {
      ElMessage.error(`未读取到"${key}"`);
    }
    return item;
  });
  return arr.join('&');
}

function onFocus(name) {
  focusInputName.value = name;
}

function onSelectExpression(exp: string) {
  if (focusInputName.value) {
    dialogForm.value[focusInputName.value] = exp;
  }
}

function getUpstreamProcessorId() {
  if (!graph || !props.node) return '';
  const { id, parentId } = props.node;
  if (parentId) return parentId;
  const edges = graph.getEdges();
  const upstreams = map(filter(edges, edge => edge.target.cell === id), edge => edge.source.cell);
  return upstreams[0];
}
function onSave() {
  const upStreamProcessorId = getUpstreamProcessorId();
  const { nodeId } = store.state.spContext;
  const { id, kind } = props.node;
  // 保存画布全部信息
  props.save && props.save();
  // 保存画布节点输出信息
  store.dispatch('saveProcessor', {
    nodeId,
    parentProcessorId: upStreamProcessorId,
    processorId: id,
    processorType: kind,
    properties: JSON.stringify(properties.value),
    output: ''
  })
}

watch(() => props.node, (newValue) => {
  formConfig.value = store.getters.getMetaInfo(newValue.kind);
  properties.value = store.getters.getProperties(newValue.id, newValue.parentId, newValue.grantId);
})

</script>

<style scoped lang="less">
.render {
  box-sizing: border-box;
  font-size: 14px;
  color: var(--el-text-color-secondary);

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
    padding: 0 12px;
  }

  .form-box {
    padding: 13px;

    .form-item {
      .label {
        margin: 12px 0;
      }

      .set-btn {
        margin-top: 20px;
        margin-left: 10px;
      }

      .opt {
        margin: 10px;
        width: 215px;
      }
    }
  }
}

.dia-content {
  display: flex;
}
.dia-form {
  flex: 1 1 60%;
  margin-left: -1px;
  // padding: 20px 20px 0 20px;
  border: 1px solid  var(--el-border-color-lighter);
  * {
    user-select: none !important;

  }
  .form-line {
    margin: 20px;

    .sys-label {
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }
  }
}
</style>