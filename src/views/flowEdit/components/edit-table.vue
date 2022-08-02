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
          <el-input size="default" v-model="scope.row[row.name]" :placeholder="row.title"></el-input>
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
import {ref} from "vue";

const props = defineProps({
  tableConfig: {
    type: Array, //(string也可以是其他你自定义的接口)
    required: false,
    default: () => {
      return []
    }
  },
});
let tableConfig = props.tableConfig;
let row = {};
tableConfig.forEach((item:any) => {
    row[item.name] = '';
});
let newRow = Object.assign({},row);
let tableData = ref([row]);
function addLine() {
  tableData.value.push(Object.assign({},newRow));
}
function deleteLine(index,val) {
  console.log(val)
  tableData.value.splice(index,1);
}

</script>
<style lang="less" scoped>
.line-r{
  text-align: right;
  margin: 10px 0 0;
}
</style>