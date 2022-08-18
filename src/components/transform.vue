<template>
  <el-dialog title="数据转换" v-model="visible" destroy-on-close width="60%">
    <div class="sys-transform-wrapper">
      <Inputs types="properties,nodes" />
      <div class="sys-transform">
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, Ref, defineProps } from 'vue'

interface Props {
  visible: boolean;

}

const props = defineProps<Props>();
</script>