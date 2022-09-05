<template>
  <el-skeleton v-if="nodeData.form==='el-checkbox-group' && loading" :rows="3" animated />
  <component
    :is="type"
    show-time
    :multiple="nodeData.multiple"
    :required="nodeData.required"
    :tableConfig="nodeData.table"
    @change="change"
    @focus="onFocus"
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
import { ref, defineEmits, watch, computed, markRaw, onMounted } from "vue";
import { forEach, isEmpty, has, map } from 'lodash';
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
  focus: Function,
  properties: Object
});
const fieldMap = {
  "select": 'el-select',
  "input": 'el-input',
  "table": markRaw(EditTable),
  "treeTable": markRaw(EditTable),
  // "datetime": 'el-date-picker',
  datetime: markRaw(DatePicker),
  "textArea":'el-input',
  "el-checkbox-group": 'el-checkbox-group',
}
const dateFormat = "YYYY-MM-DD HH:mm:ss";
//定义select的选项
let options = ref([]);
let type = ref('');
let fieldValue = ref();
// valueUrl 中解析的query
let remoteUrl = ref('');
let loading = ref(false);
// 装载选项数据
function loadOptionData() {
  options.value = props.nodeData.enum;
  // remote - valueUrl
  if (props.nodeData.valueUrl) {
    getRemoteUrl(props.properties);
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
  fieldValue.value = props.modelValue || (props.nodeData.multiple || ['treeTable', 'table'].includes(props.nodeData.form) ? [] : '');
  remoteUrl.value = ''
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
  console.log('--- field change: ', props.nodeData.name, val)
  emit('input', {name: props.nodeData.name, value: val})
}
function onFocus() {
  if (props.focus) props.focus(props.nodeData.form === 'input' ? props.nodeData.name : '');
}

function getRemoteUrl(properties) {
  const str = props.nodeData.valueUrl;
  if (str.indexOf('(?)') === -1) return str;
  const appId = store.getters['context/appId']();
  const arr = map(str.split('&'), (item, index) => {
    let i = 0;
    if (!index && item.indexOf('(?)') > -1) {
      i = item.replace('(?)', '').lastIndexOf('?') + 1;
    } 
    const query = item.slice(i).split('=');
    const key = query[0];
    if (key === 'appId') {
      return item.replace(`${key}=(?)`, `${key}=${appId}`)
    } else if (has(properties, key)) {
      return item.replace(`${key}=(?)`, `${key}=${properties[key]}`)
    } else if (query[1] === '(?)') {
      console.log(`【${props.nodeData.title}】远程请求地址${str}中的${key}未能解析到`);
    }
    return item;
  });
  const url = arr.join('&');
  console.log('--- remote url: ', url)
  if (url.indexOf('(?)') === -1 && remoteUrl.value !== url) {
    remoteUrl.value = url;
    getRemoteOptions(url);
  }
}

function getRemoteOptions(url) {
  loading.value = true;
  NodeGroup.getOptions(url).then((res: any) => {
    loading.value = false;
    if (res.code === 200) {
      options.value = res.data;
    } else {
      ElMessage({
        type: 'error',
        message: res.msg
      })
    }
  })
}

watch(() => props.nodeData, (newValue, oldValue) => {
  console.log('--- watch nodeData')
  checkData();
})
watch(() => props.modelValue, (newValue, oldValue) => {
  fieldValue.value = newValue
})
watch(() => props.properties, (newValue, oldValue) => {
  if (props.nodeData.valueUrl && !remoteUrl.value) {
    console.log('--- properties changed: ', newValue)
    getRemoteUrl(newValue)
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