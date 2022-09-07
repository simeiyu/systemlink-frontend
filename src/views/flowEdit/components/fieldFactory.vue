<template>
  <el-skeleton v-if="nodeData.form==='el-checkbox-group' && loading" :rows="3" animated />
  <component
    :is="type"
    ref="refField"
    show-time
    :multiple="nodeData.multiple"
    :required="nodeData.required"
    :tableConfig="nodeData.table"
    @change="change"
    @focus="onFocus"
    @blur="onBlur"
    v-model="fieldValue"
    :value-format="dateFormat"
    :placeholder="nodeData.title"
    :no-data-text="'暂无数据'"
    :loading="loading"
    loading-text="加载中"
    :type="nodeData.form === 'textArea' && 'textarea'"
    :rows="2"
    :properties="properties"
    :treeTable="nodeData.form === 'treeTable'"
    @mousedown.stop
  >
    <el-option
        v-if="type==='el-select'"
        v-for="item in options"
        :key="item.name"
        :label="item.name"
        :value="item.value"
    />
    <el-checkbox
      class="sys-checkbox"
      v-if="nodeData.form === 'el-checkbox-group'"
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
import { ref, defineEmits, watch, markRaw, onMounted } from "vue";
import { forEach, isEmpty, has, map, get } from 'lodash';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import EditTable from "@/views/flowEdit/components/edit-table.vue";
import { NodeGroup } from '@/api/api';

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
  properties: Object
});
const fieldMap = {
  "select": 'el-select',
  "input": 'el-input',
  "table": markRaw(EditTable),
  "treeTable": markRaw(EditTable),
  // "datetime": 'el-date-picker',
  "datetime": markRaw(DatePicker),
  "textArea":'el-input',
  "el-checkbox-group": 'el-checkbox-group',
}

const dateFormat = "YYYY-MM-DD HH:mm:ss";
//定义select的选项
let options = ref([]);
let type = ref('');
let refField = ref();
let fieldValue = ref();
// valueUrl 中解析的query
let valueUrl = ref({});
// let remoteUrl = ref('');
let loading = ref(false);
let isFocus = ref(false);
// 装载选项数据
function loadOptionData() {
  options.value = props.nodeData.enum;
  // remote - valueUrl
  if (props.nodeData.valueUrl) {
    // getRemoteUrl(props.properties);
    formatValueUrl(props.nodeData.valueUrl);
    getRemoteOptions(props.properties);
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
  fieldValue.value = props.modelValue || ((props.nodeData.multiple || ['treeTable', 'table'].includes(props.nodeData.form)) ? [] : '');
  // remoteUrl.value = ''
  switch (props.nodeData.form) {
    case 'select':
    case 'el-checkbox-group':
      loadOptionData();
      break;
    case 'table' :
      loadTableData();
      break
  }
}

function change(val) {
  emit('input', {name: props.nodeData.name, value: val})
}
function onFocus() {
  isFocus.value = true
}
function onBlur() {
  isFocus.value = false
}

function formatValueUrl(str) {
  const index = str.indexOf('?');
  const path = str.slice(0, index);
  const params = str.slice(index + 1).split('&');
  const query = {}
  forEach(params, item => {
    const arr = item.split('=');
    query[arr[0]] = arr[1];
  })
  valueUrl.value = {
    path,
    query
  }
}

function getValueUrl(params) {
  let url = valueUrl.value.path;
  const query = valueUrl.value.query;
  if (!isEmpty(query)) {
    url += '?'
    const arr: string[] = []
    for (let key in query) {
      let val
      if (key === 'appId') {
        val = store.getters['context/appId']();
      } else {
        if (query[key] === '(?)' && key in params) {
          val = params[key]
        } else {
          val = query[key]
        }
      }
      arr.push(`${key}=${val}`)
    }
    url += arr.join('&')
  }
  return url
}

function getRemoteOptions(params) {
  loading.value = true;
  const url = getValueUrl(params || props.properties);
  if (url.indexOf('(?)') > -1) return;
  NodeGroup.getOptions(url).then((res: any) => {
    loading.value = false;
    if (res.code === 200) {
      options.value = res.data;
      fieldValue.value = (props.nodeData.multiple || ['treeTable', 'table'].includes(props.nodeData.form)) ? [] : '';
    } else {
      ElMessage({
        type: 'error',
        message: res.msg
      })
    }
  })
}

watch(() => props.nodeData, (newValue, oldValue) => {
  checkData();
})
watch(() => props.modelValue, (newValue, oldValue) => {
  fieldValue.value = newValue
})
watch(() => store.state.context.expression, (newValue, oldValue) => {
  if (isFocus.value && ['input', 'textArea'].includes(props.nodeData.form)) {
    const start = refField.value.ref.selectionStart;
    const end = refField.value.ref.selectionEnd;
    const prev = fieldValue.value.slice(0, start);
    const next = fieldValue.value.slice(end);
    fieldValue.value = prev + newValue + next;
    emit('input', {name: props.nodeData.name, value: fieldValue.value})
  }
})
watch(() => props.properties, (newValue, oldValue) => {
  if (props.nodeData.valueUrl && !isEmpty(valueUrl.value.query)
    && Object.keys(valueUrl.value.query).findIndex(key => newValue[key] !== oldValue[key]) > -1
    ) {
    getRemoteOptions(newValue)
  }
})

onMounted(() => {
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

.sys-checkbox {
  width: calc(25% - 30px);
  font-weight: normal;
}
</style>