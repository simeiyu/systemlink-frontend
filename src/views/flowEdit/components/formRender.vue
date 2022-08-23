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
          <field-factory :node-data="field" v-model="properties[field.name]" :properties="properties" @input="updateProperties"></field-factory>
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
              <field-factory :node-data="iField" :key="iField.name" v-model="properties[iField.name]" :properties="properties" @input="updateProperties"></field-factory>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>

  <el-dialog title="设 置" v-model="dialogFormVisible" destroy-on-close width="60%" custom-class="sys-dialog" @closed="onDialogClosed">
    <div class="dia-content">
      <Inputs @selectExpression="onSelectExpression" />
      <el-scrollbar height="500px" class="dia-form">
        <div class="sys-padding-hori" v-for="field in dialogFormConfig">
          <div :class="{'sys-form-group': field.form!=='table', 'sys-form-group-line': field.form==='input' || field.form==='select', 'sys-form-table': field.form==='table'}">
            <div class="sys-label">{{ field.title }}</div>
            <field-factory :node-data="field" v-model="dialogForm[field.name]" :properties="dialogForm" @input="updateDialogForm" :focus="onFocus"></field-factory>
          </div>
          <div class="sys-form-sub" v-if="dialogForm[field.name]&&field.extend">
            <div v-for="subField in field.extend[dialogForm[field.name]].content"
              :key="subField.name"
               :class="{'sys-form-group': subField.form!=='table', 'sys-form-group-line': subField.form==='input' || subField.form==='select', 'sys-form-table': subField.form==='table'}"
              >
              <div class="sys-label">{{ subField.title }}</div>
              <field-factory
                :node-data="subField"
                v-model="dialogForm[subField.name]"
                :properties="dialogForm"
                :focus="onFocus"
                @input="updateDialogForm"
              >
              </field-factory>
            </div>
          </div>
        </div>
        <div class="sys-execute-wrapper" v-if="['rest', 'database'].includes(node.kind)">
          <div class="sys-execute-action"><el-button @click="handleExecute" type="primary" plain size="small" :disabled="executing">
            <el-icon v-if="executing"><Loading /></el-icon>
            <el-icon v-else><VideoPlay /></el-icon>
            <span style="margin-left: px">测试</span>
          </el-button></div>
          <div class="sys-execute">
            <pre>{{execute}}</pre>
          </div>
        </div>
      </el-scrollbar>

    </div>
    <template #footer>
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { watch, ref, defineProps, inject, computed } from "vue";
import { useStore } from 'vuex';
import { map, filter } from 'lodash';
import { ActiveNode } from '@/store/type';
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
let execute = computed(() => store.state.execute ? JSON.stringify(store.state.execute, null, 4) : '');
let executing = computed(() => store.state.loading.execute);
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
      _dialogForm[item.name] = properties.value[item.name] || (item.multiple || ['treeTable', 'table'].includes(item.form) ? [] : '');
    })
  } else {
    dialogFormConfig.value = [modelData];
    _dialogForm[modelData.name] = properties.value[modelData.name] || (modelData.multiple || ['treeTable', 'table'].includes(modelData.form) ? [] : '');
  }
  dialogForm.value = {...properties.value, ..._dialogForm};
  console.log('--- dialogForm: ', dialogForm.value)
}

function onSubmit() {
  const _properties = {
    ...properties.value,
    ...dialogForm.value
  }
  properties.value = _properties;
  store.dispatch('setProperties', {
    properties: _properties,
    node: props.node
  });
  dialogFormVisible.value = false;
}

function onDialogClosed() {
  console.log('--- dialog closed')
  // database 和rest 组件的弹窗关闭时，execute 置空
  if (['database', 'rest'].includes(props.node.kind)) store.state.execute = '';
}

function handleExecute() {
  const _properties = {
    ...properties.value,
    ...dialogForm.value
  }
  store.dispatch('execute', {
    processorType: props.node.kind,
    processorId: props.node.id,
    properties: JSON.stringify(_properties)
  });
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
  padding: 0;
  border: 1px solid  var(--el-border-color-lighter);
  * {
    user-select: none !important;
  }

  .sys-label {
    color: var(--el-text-color-secondary);
    margin: 5px 0;
  }
  .sys-padding-hori {
    padding: 0 20px;
  }
  .sys-form {
    padding: 0 20px;
    &-group {
      margin: 20px 0;
      &-line {
        display: flex;
        .sys-label {
          flex: 0 0 80px;
        }
      }
    }
    &-sub {
      border-top: 1px solid var(--el-border-color-extra-light);
    }
    &-table {
      margin: 20px 0;
      position: relative;
      > .sys-label {
        position: absolute;
      }
    }
  }
  .sys-execute {
    min-height: 50px;
    padding: 8px 12px;
    &-wrapper {
      border-top: 1px solid var(--el-border-color-lighter);
      background-color: var(--el-fill-color-lighter);
    }
    &-action {
      display: flex;
      justify-content: flex-end;
      padding: 8px 20px;
      border-bottom: 1px dashed var(--el-border-color-lighter);
    }
    > pre {
      margin: 0;
      white-space: break-spaces;
    }
  }
}
</style>