<template>
  <div>
    <div class="line-r">
      <el-button type="primary" size="small" plain icon="Plus" @click="addLine()">新增</el-button>
    </div>
    <el-table
      cell-class-name="sys-table-cell"
      :data="tableData"
      max-height="360"
      empty-text="暂无数据"
      default-expand-all
      row-key="rowKey"
      lazy
      :load="load"
     >
      <el-table-column
          v-for="row in tableConfig"
          :prop="row.name" :label="row.title">
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
          <el-button v-if="treeTable && scope.row.children" class="sys-table-add" type="text" circle icon="CirclePlusFilled" @click="addChildren(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineEmits, reactive, watch } from "vue";
import { forEach, findIndex, remove } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import FieldFactory from "@/views/flowEdit/components/fieldFactory.vue";
import func from "vue-temp/vue-editor-bridge";

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
  properties: Object,
  treeTable: Boolean
});
let width:number = computed(() => props.treeTable ? 110 : 60);
let tableData = reactive(props.modelValue);
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
  if (props.treeTable) {
    row.children = [];
    row.hasChildren = true;
  }
  tableData.push(row);
  onChange();
}
function deleteRow({rowKey, parentRowKey}) {
  if (parentRowKey) {
    const parentIndex = tableData.findIndex(item => item.rowKey === parentRowKey);
    if (parentIndex > -1) {
      remove(tableData[parentIndex].children, item => item.rowKey === rowKey)
    }
  } else {
    remove(tableData, item => item.rowKey === rowKey)
  }
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
  emit('change', tableData);
}

function load(row, treeNode, resolve) {
  resolve(row.children)
}

watch(() => props.tableConfig, (newValue) => {
  defaultRow = getDefaultRow(newValue);
})

watch(() => props.modelValue, (newValue) => {
  tableData = newValue;
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