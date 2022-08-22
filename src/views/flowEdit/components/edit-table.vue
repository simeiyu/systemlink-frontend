<template>
  <div>
    <div class="line-r">
      <el-button type="primary" size="small" @click="addLine()">新增</el-button>
    </div>
    <el-table :data="tableData" max-height="300">
      <el-table-column
          v-for="row in tableConfig"
          :prop="row.name" :label="row.title">
        <template #default="scope">
          <!-- <el-input size="default" v-model="scope.row[row.name]" :placeholder="row.title" @input="onChange"></el-input> -->
          <field-factory
            :node-data="row"
            v-model="scope.row[row.name]"
            :properties="properties"
            @input="({name, value}) => onChange(scope.row, name, value)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button type="danger" size="small" plain @click="deleteLine(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, reactive, watch } from "vue";
import { forEach } from "lodash";
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
    default: () => ({})
  },
  properties: Object
});
let tableData = reactive(props.modelValue);
function addLine() {
  const row = {};
  forEach(props.tableConfig, ({name}) => {
    row[name] = '';
  });
  tableData.push(row);
  onChange();
}
function deleteLine(index,val) {
  console.log(val)
  tableData.splice(index,1);
  onChange();
}
function onChange(row, name, value) {
  if (!row) row = {};
  row[name] = value;
  emit('change', tableData);
}
</script>
<style lang="less" scoped>
.line-r {
  padding: 8px 0;
  text-align: right;
}
</style>