<template>
  <div class="render">
    <div class="title">
      {{ formConfig.title }}
    </div>
    <div class="hr"></div>
    <div class="form-box">
      <div class="form-item" v-for="field in formConfig.properties" :key="field.name">
        <div class="label">{{ field.title }}</div>
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
import FieldFactory from "@/views/flowEdit/components/fieldFactory.vue";
import { readonly, ref, defineProps, defineEmits, watch, reactive } from "vue";

const props = defineProps({
  formConfig: {
    type: Object, //(string也可以是其他你自定义的接口)
    required: true,
    default: () => {}
  },
  modelValue: {
    type: Object, //(string也可以是其他你自定义的接口)
    required: true,
    default: () => {}
  },
  nodeId: {
    type: String,
    required: true
  }
})
const formInfo = readonly(props.formConfig);
let properties = reactive({...props.modelValue});
//弹窗展示
let dialogForm = reactive({});
let dialogFormVisible = ref(false);
let dialogFormConfig = ref({});
let emits = defineEmits(['update:modelValue']);

function updateProperties({name, value}) {
  properties[name] = value;
  console.log('--- update: ', properties, name, value)
  emits('update:modelValue', properties)
}
function updateDialogForm({name, value}) {
  dialogForm[name] = value;
}

//设置需要输入的参数 用于v-model
// function getProperties() {
//   formInfo.properties.forEach(item=>{
//     properties.value[item.name] = '';
//   });
// }
//设置弹窗内容
function getExtendData(modelData) {
  console.log('--- modelData: ', modelData);
  dialogFormConfig.value = modelData.content;
  dialogFormVisible.value = true;
  dialogForm = {};
  modelData.content.forEach(item => {
    dialogForm[item.name] = props.modelValue[item.name] || '';
  })
}

// getProperties();

function onSubmit() {
  dialogFormVisible.value = false;
  emits('update:modelValue', Object.assign(properties, dialogForm));
}

watch(() => props.modelValue, (newValue, oldValue) => {
  properties = newValue;
  console.log('--- watch: ', properties)
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