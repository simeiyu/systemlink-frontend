<template>
  <component
      :is="type"
      :multiple="fieldData.multiple"
      :required="fieldData.required"
      :tableConfig="fieldData.table"
      :type="fieldData.form"
      :value="value"
      @change="change"
      :placeholder="fieldData.title">
    <el-option
        v-if="type==='el-select'"
        v-for="item in options"
        :key="item.name"
        :label="item.name"
        :value="item.value"
    />
  </component>
</template>

<script lang="ts" setup>
import {request} from "@/plugin/axios";
import {readonly, ref, defineEmits, watch,shallowRef,markRaw} from "vue";
import EditTable from "@/views/flowEdit/components/edit-table.vue";

const emit = defineEmits(['input'])
const props = defineProps({
  nodeData: {
    type: Object, //(string也可以是其他你自定义的接口)
    required: true,
    default: () => {
    }
  },
  value: {
    type: String, //(string也可以是其他你自定义的接口)
    required: false,
    default: ''
  },
});
const fieldMap = {
  select: 'el-select',
  input: 'el-input',
  table: markRaw(EditTable),
  datetime:'el-date-picker',
  "textArea":'textarea'
}
//定义select的选项
let options = [], tableData = [];
let type = ref('');
const fieldData = readonly(props.nodeData);

//装载选项数据
function loadOptionData() {
  let url = fieldData.vauleUrl;
  //todo: 接口请求数据
  options = fieldData.enum;
}

//装载表格基础数据
function loadTableData() {

}

//检查需要的类型
function checkData() {
  type.value = fieldMap[fieldData.form];
  switch (fieldData.form) {
    case 'select':
      loadOptionData();
      break;
    case 'table' :
      loadTableData();
      break
  }
}

checkData();

function change(val) {
  emit('input', val)
}

watch(() => props.nodeData, (newValue, oldValue) => {
  console.log(newValue, '---')
})

</script>

<style lang="less" scoped>
textarea{
  width: 100%;
  height: 100px;
  margin: 5px;
  box-sizing: border-box;
  padding: 5px;
  border: none;
  box-shadow: 0 0 0 1px var(--el-input-border-color,var(--el-border-color)) inset;
  outline:none;
  color:#606266;
  &:focus{
    border: none;
    box-shadow: 0 0 0 1px #409eff inset;
  }
}
</style>