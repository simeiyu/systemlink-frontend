<template>
  <div>
    <div class="line-r">
      <el-button type="primary" size="default" @click="addLine()">新增</el-button>
    </div>
    <el-table :data="tableData" max-height="300">
      <el-table-column
          v-for="row in tableConfig"
          :prop="row.name" :label="row.title">
        <template #default="scope">
          <el-input size="default" v-model="scope.row[row.name]" :placeholder="row.title" @input="onChange"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button type="primary" size="default" plain @click="deleteLine(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits, reactive } from "vue";
import { forEach } from "lodash";

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
  }
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
function onChange() {
  emit('change', tableData);
}
</script>
<style lang="less" scoped>
.line-r{
  text-align: right;
}
</style>