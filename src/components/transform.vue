<template>
  <el-dialog title="数据转换" v-model="visible" destroy-on-close width="68%" custom-class="sys-dialog">
    <el-space v-if="transform.properties && visible" class="sys-transform-properties" :size="40">
      <el-form-item label="转换名称" style="margin-bottom: 0">
        <el-input v-model="transform.properties.name" placeholder="输入转换名称" />
      </el-form-item>
      <el-form-item label="转换方法" style="margin-bottom: 0">
        <el-select v-model="transform.properties.type" placeholder="选择转换方法" @change="onTypeChange">
          <el-option
            v-for="item in list"
            :key="item.type"
            :label="item.name"
            :value="item.type"
          />
        </el-select>
      </el-form-item>
    </el-space>
    <div class="sys-transform-wrapper">
      <Inputs @selectExpression="onSelectExpression" />
      <div class="sys-transform-metaInfo">
        <el-form v-if="metaInfo" :model="transform.properties">
          <el-form-item v-for="prop in metaInfo.properties" :key="prop.name" :label="prop.title">
            <field-factory :node-data="prop" v-model="transform.properties[prop.name]" @input="updateProperties" :focus="onFocus" />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <template #footer>
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex';
import { ElDivider } from 'element-plus'
import { find } from 'lodash'
import Inputs from '@/components/inputs.vue'
import FieldFactory from "@/views/flowEdit/components/fieldFactory.vue";

interface Transform {
  [key:string]: any;
}

interface MetaInfo {
  properties: {form: string; name: string; [key:string]: any; }[];
  [key:string]: any;
}

const store = useStore();
// 是否显示弹窗
let visible:boolean = computed(() => store.state.transform.visible);
// 编辑的tranform
let transform = ref<Transform>({});
// transform 元数据列表
let list = computed(() => store.state.transform.list);
// 选择类型后的元数据
let metaInfo = ref<MetaInfo | null>()
// 处于焦点中的输入框
let focusInputName = ref('')

watch(() => store.state.transform.edit, (value) => {
  if (value) {
    transform.value = value;
    if (value.properties.type) {
      const active = find(list.value, ({type}) => type === value.properties.type);
      metaInfo.value = active && active.metaInfo;
    }
  } else {
    transform.value = {};
    metaInfo.value = null;
  }
  console.log('--- transform metaInfo: ', metaInfo.value)
})

function onTypeChange(val) {
  const active = find(list.value, ({type}) => type === val);
  metaInfo.value = active && active.metaInfo;
}

function updateProperties({name, value}) {
  transform.value.properties[name] = value;
}

function onFocus(name) {
  focusInputName.value = name;
}

function onSelectExpression(exp: string) {
  if (focusInputName.value) {
    transform.value.properties[focusInputName.value] = exp;
  }
}

function onSubmit() {
  console.log('--- submit transform: ', transform.value)
  store.commit('updateTransforms', transform.value);
  store.commit('setTransform', {visible: false});
}

function onCancel() {
  store.commit('setTransform', {visible: false});
}
</script>

<style lang="less" scoped>
  .sys-transform {
    &-properties {
      margin-bottom: 16px;
    }
    &-wrapper {
      display: flex;
    }
    &-metaInfo {
      flex: 1 1 60%;
      margin-left: -1px;
      padding: 20px;
      border: 1px solid  var(--el-border-color-lighter);
    }
  }
</style>