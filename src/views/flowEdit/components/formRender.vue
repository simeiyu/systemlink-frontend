<template>
  <div class="render">
    <div class="title">
      {{ formConfig.title }}
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
      <!-- <el-form :model="dialogForm" class="dia-form">
        <el-form-item v-for="field in dialogFormConfig">
          <field-factory :node-data="field" v-model="dialogForm[field.name]" @input="updateDialogForm" :getFormatUrl="getFormatUrl"></field-factory>
        </el-form-item>
      </el-form> -->
      <div class="dia-form">
        <div class="form-line" v-for="field in dialogFormConfig">
          <field-factory :node-data="field" v-model="dialogForm[field.name]" @input="updateDialogForm" :getFormatUrl="getFormatUrl" :focus="onFocus"></field-factory>
          <field-factory
            v-for="subField in field.extend[properties[field.name]].content"
            v-if="properties[field.name]&&field.extend"
            :key="subField.name"
            :node-data="subField"
            v-model="dialogForm[subField.name]"
            @input="updateDialogForm" :getFormatUrl="getFormatUrl" :focus="onFocus"
          >
          </field-factory>
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
import { watch, ref, defineProps } from "vue";
import { useStore } from 'vuex';
import { has, map } from 'lodash';
import { ActiveNode } from '@/store/type';
import { ElMessage } from "element-plus";
import FieldFactory from "@/views/flowEdit/components/fieldFactory.vue";
import Inputs from '@/components/inputs.vue'

const store = useStore();

interface Props {
  node: ActiveNode;
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
  console.log('--- dialogFormConfig: ', dialogFormConfig.value)
}

function onSubmit() {
  dialogFormVisible.value = false;
  const _properties = {
    ...properties.value,
    ...dialogForm.value
  }
  properties.value = _properties;
  // emits('update:modelValue', Object.assign(properties, dialogForm));
  store.dispatch('setProperties', {
    properties: _properties,
    node: props.node
  })
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
    font-size: 14px;
    color: var(--el-text-color-primary);
    margin-bottom: 15px;
    margin-left: 13px;
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

    div {
      margin: 0 5px;
    }
  }
}
</style>