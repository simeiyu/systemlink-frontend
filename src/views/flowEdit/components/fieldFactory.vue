<template>
  <component
      :is="type"
      show-time
      :multiple="nodeData.multiple"
      :required="nodeData.required"
      :tableConfig="nodeData.table"
      @change="change"
      v-model="fieldValue"
      :value-format="dateFormat"
      :placeholder="nodeData.title"
      @visible-change="onVisibleChange"
      :no-data-text="'暂无数据'"
      :loading="loading"
    >
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
import DatePicker from 'ant-design-vue/lib/date-picker'; // 加载 JS
import 'ant-design-vue/lib/date-picker/style/css'; // 加载 CSS
import { readonly, ref, defineEmits, watch, computed, markRaw } from "vue";
import { forEach, isEmpty } from 'lodash';
import { useStore } from 'vuex';
import EditTable from "@/views/flowEdit/components/edit-table.vue";

const emit = defineEmits(['input'])
const store = useStore();
const props = defineProps({
  nodeData: {
    type: Object, //(string也可以是其他你自定义的接口)
    required: true,
    default: () => {
    }
  },
  modelValue: {
    type: [String, Array], 
    required: true,
    default: () => ''
  },
  getFormatUrl: {
    type: Function
  }
});
const fieldMap = {
  select: 'el-select',
  input: 'el-input',
  table: markRaw(EditTable),
  datetime:markRaw(DatePicker),
  "textArea":'textarea'
}
const dateFormat = "YYYY-MM-DD HH:mm:ss";
//定义select的选项
let options = ref([]);
let type = ref('');
let fieldValue = ref();
let optionKey = ref('');
let loading = computed<boolean>(() => store.state.loading.options);
// 装载选项数据
function loadOptionData() {
  if (props.getFormatUrl && props.nodeData.vauleUrl) {
    optionKey.value = props.getFormatUrl(props.nodeData.vauleUrl);
  } else {
    options.value = props.nodeData.enum;
  }
}

// 装载表格基础数据
function loadTableData() {
  let rows: any[] = props.modelValue;
  if (isEmpty(rows)) {
    const row = {};
    forEach(props.nodeData.table, col => {
      row[col.name] = '';
    });
    rows = [row];
  }
  fieldValue.value = rows;
}

//检查需要的类型
function checkData() {
  type.value = fieldMap[props.nodeData.form];
  fieldValue.value = props.modelValue;
  switch (props.nodeData.form) {
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
  emit('input', {name: props.nodeData.name, value: val})
}

function onVisibleChange(visible) {
  if (visible && props.nodeData.form === 'select' && props.nodeData.vauleUrl) {
    if (store.state.options[optionKey.value]) {
      options.value = store.state.options[optionKey.value];
    } else {
      const url = props.getFormatUrl && props.getFormatUrl(props.nodeData.vauleUrl);
      optionKey.value = url;
      store.dispatch('fetchOptions', url);
    }
  }
}

watch(() => store.state.loading.options, (newValue, oldValue) => {
  if (props.nodeData.form === 'select' && oldValue && !newValue) {
    options.value = store.state.options[optionKey.value] || [];
  }
})
watch(() => props.nodeData, (newValue, oldValue) => {
  checkData();
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