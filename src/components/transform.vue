<template>
  <el-dialog title="数据转换" v-model="visible" destroy-on-close width="68%" custom-class="sys-dialog" @closed="onDialogClosed">
    <el-space v-if="transform.properties && visible" class="sys-transform-properties" :size="40">
      <el-form-item label="转换名称" style="margin-bottom: 0">
        <el-input v-model="transform.properties.name" placeholder="输入转换名称" />
      </el-form-item>
      <el-form-item label="转换方法" style="margin-bottom: 0">
        <el-select v-model="transform.properties.type" placeholder="选择转换方法" @change="onTypeChange">
          <el-option
            v-for="item in options"
            :key="item.type"
            :label="item.name"
            :value="item.type"
          />
        </el-select>
      </el-form-item>
    </el-space>
    <div class="sys-transform-wrapper">
      <Inputs />
      <el-scrollbar height="500px" class="sys-transform-metaInfo">
        <div class="sys-form" v-if="metaInfo">
          <div
            v-for="prop in metaInfo.properties"
            :key="prop.name"
            :class="{
              'sys-form-group': prop.form!=='table',
              'sys-form-group-line': prop.form==='input' || prop.form==='select',
              'sys-form-table': prop.form==='table'
            }"
          >
            <div class="sys-label">{{ prop.title }}</div>
            <field-factory :node-data="prop" v-model="transform.properties[prop.name]" @input="updateProperties" />
          </div>
        </div>
      </el-scrollbar>
    </div>
    <template #footer>
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="saving"><el-icon v-if="saving"><Loading /></el-icon>确 定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex';
import { get } from 'lodash';
import { ActiveNode } from '@/store/modules/graph';
import Inputs from '@/components/inputs.vue'
import FieldFactory from "@/views/flowEdit/components/fieldFactory.vue";

interface Transform {
  [key:string]: any;
}

interface MetaInfo {
  properties: {form: string; name: string; [key:string]: any; }[];
  [key:string]: any;
}

interface Props {
  activeNode: ActiveNode;
}

const props = defineProps<Props>()

const store = useStore();
// 是否显示弹窗
let visible:boolean = computed(() => store.state.transform.modal.visible);
// 编辑的tranform
let transform = ref<Transform>({});
let options = computed(store.getters['transform/options']);
// 选择类型后的元数据
let metaInfo = ref<MetaInfo | null>()
// 处于焦点中的输入框
let focusInputName = ref('')
let saving = computed(() => store.state.transform.saving);


watch(() => store.state.transform.modal.transform, (value) => {
  const type = get(value, 'transformType')
  transform.value = store.getters['transform/getById'](props.activeNode.id);
  metaInfo.value = store.getters['transform/getMetaInfo'](type);
})

function onTypeChange(val) {
  metaInfo.value = store.getters['transform/getMetaInfo'](val);
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
  store.dispatch('transform/save', transform.value);
  store.commit('transform/openModal', {visible: false});
}

function onCancel() {
  store.commit('transform/openModal', {visible: false});
}
function onDialogClosed() {
  store.commit('transform/openModal', {visible: false});
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
      border: 1px solid  var(--el-border-color-lighter);
    }
  }
  .sys-label {
    color: var(--el-text-color-secondary);
    margin: 5px 0;
  }
  .sys-padding-hori {
    padding: 0 20px;
  }
  .sys-form {
    padding: 0 20px;
    &-group {
      margin: 20px 0;
      &-line {
        display: flex;
        .sys-label {
          flex: 0 0 100px;
        }
      }
    }
    &-sub {
      border-top: 1px solid var(--el-border-color-extra-light);
    }
    &-table {
      margin: 20px 0;
      position: relative;
      > .sys-label {
        position: absolute;
      }
    }
  }
</style>