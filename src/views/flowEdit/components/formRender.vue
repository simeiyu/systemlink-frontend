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
          <field-factory :node-data="field" v-model="properties[field.name]" @input="updateProperties"></field-factory>
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
              <field-factory :node-data="iField" :key="iField.name" v-model="properties[iField.name]" @input="updateProperties"></field-factory>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>

  <el-dialog title="设 置" v-model="dialogFormVisible" destroy-on-close>
    <el-form :model="dialogForm" class="dia-form" label-width="120px">
      <el-form-item v-for="field in dialogFormConfig" :label="field.title">
        <field-factory :node-data="field" v-model="dialogForm[field.name]" @input="updateDialogForm"></field-factory>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { watch, ref, defineProps } from "vue";
import { useStore } from 'vuex';
import FieldFactory from "@/views/flowEdit/components/fieldFactory.vue";
import { ActiveNode } from '@/store/type';

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
  // emits('update:modelValue', Object.assign(properties, dialogForm));
  store.dispatch('setProperties', {
    properties: _properties,
    node: props.node
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
  color: #828D99;

  .title {
    font-size: 14px;
    color: #1C2126;
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

.dia-form {
  width: 50%;
  * {
    user-select: none !important;

  }
  .form-line {
    margin: 0 20px;

    div {
      margin: 0 5px;
    }
  }
}
</style>