<template>
  <div>
    <div class="line-r">
      <el-button type="primary" size="small" plain icon="Plus" :disabled="disabled" @click="addLine()">新增</el-button>
    </div>
    <el-table
      :data="tableData"
      cell-class-name="sys-table-cell"
      empty-text="暂无数据"
      default-expand-all
      row-key="rowKey"
     >
      <el-table-column v-for="row in tableConfig" :prop="row.name" :label="row.title">
        <template #default="scope">
          <field-factory
            :node-data="row"
            :properties="properties"
            v-model="scope.row[row.name]"
            @input="({name, value}) => onFieldChange(scope.row, name, value)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="width">
        <template #default="scope">
          <el-button type="danger" size="small" plain @click="deleteRow(scope.row)">删除</el-button>
          <el-button v-if="treeTable" class="sys-table-add" type="text" circle icon="CirclePlusFilled" @click="addChildren(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineEmits, reactive, ref, watch } from "vue";
import { forEach, findIndex, remove, isEmpty } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import FieldFactory from "@/views/flowEdit/components/fieldFactory.vue";

const emit = defineEmits(['change']);
const props = defineProps({
  tableConfig: {
    type: Array, //(string也可以是其他你自定义的接口)
    required: false,
    default: () => {
      return []
    }
  },
  modelValue: {
    type: Object,
    required: false,
    default: () => ([])
  },
  focus: Function,
  properties: Object,
  treeTable: Boolean
});

interface Row {
  rowKey: string;
  hasChildren?: boolean;
  children?: Row[];
  [propName:string]: any;
}

let width:number = computed(() => props.treeTable ? 110 : 60);
let tableData: Row[] = ref(props.modelValue || []);
let disabled:boolean = computed(() => props.treeTable && tableData.value.length > 0)
let defaultRow = getDefaultRow(props.tableConfig);
function getDefaultRow(columns) {
  const row = {};
  forEach(columns, ({name}) => {
    row[name] = '';
  });
  return row;
}
function addLine() {
  let row = {
    ...defaultRow,
    rowKey: uuidv4(),
  };
  tableData.value.push(row);
  onChange();
}
function loopDel (rowKey, data) {
  const index = data.findIndex(item => item.rowKey === rowKey);
  if (index > -1) {
    data.splice(index, 1)
  } else {
    data.forEach(item => {
      if (!isEmpty(item.children)) {
        loopDel(rowKey, item.children)
      }
    })
  }
}
function deleteRow({rowKey}) {
  loopDel(rowKey, tableData.value)
  onChange();
}
function addChildren(row) {
  if(!row.children) row.children = [];
  row.children.push({
    ...defaultRow,
    rowKey: uuidv4(),
    parentRowKey: row.rowKey
  });
  onChange();
}
function onFieldChange(row, name, value) {
  if (!row) row = {};
  row[name] = value;
  onChange();
}
function onChange() {
  emit('change', tableData.value);
}

watch(() => props.tableConfig, (newValue) => {
  defaultRow = getDefaultRow(newValue);
})

watch(() => props.modelValue, (newValue) => {
  console.log('--- table modelValue: ', newValue)
  tableData.value = newValue;
})

</script>
<style lang="less" scoped>
.line-r {
  padding: 8px 0;
  text-align: right;
}
.sys-table-add {
  padding: 5px;
}
</style>