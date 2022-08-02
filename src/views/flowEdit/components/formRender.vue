<template>
  <div class="render">
    <div class="title">
      {{ formConfig.title }}
    </div>
    <div class="hr"></div>
    <div class="form-box">
      <div class="form-item" v-for="field in formConfig.properties" :key="field.name">
        <div class="label">{{ field.title }}</div>
        <div class="opt">
          <field-factory :node-data="field" v-model="properties[field.name]"></field-factory>
          <el-button class="set-btn"
                     size="default"
                     type="primary"
                     v-if="field.position==='model'"
                     @click="getExtendData(field)">
            {{ field.title }}
          </el-button>
        </div>
        <template v-if="field.extend&&field.extend[properties[field.name]]">
          <el-button class="set-btn"
                     size="default"
                     type="primary"
                     v-if="field.extend&&field.extend[properties[field.name]]&&field.extend[properties[field.name]].position==='model'"
                     @click="getExtendData(field.extend[properties[field.name]])">
            详细设置
          </el-button>
          <template v-if="field.extend&&field.extend[properties[field.name]]&&field.extend[properties[field.name]].position==='default'">
            <div class="opt" v-for="iField in field.extend[properties[field.name]].content">
              <field-factory :node-data="iField" :key="iField.name"></field-factory>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>

  <el-dialog title="设置" v-model="dialogFormVisible" destroy-on-close>
    <div class="dia-form">
      <div class="form-line" v-for="field in diagFormConfig.content">
        <field-factory :node-data="field" ></field-factory>
        {{field.extend}}
        <template
            :key="subField.name"
            v-for="subField in field.extend[properties[field.name]].content"
            v-if="properties[field.name]">

          <field-factory
              :node-data="subField">
          </field-factory>
        </template>
      </div>
    </div>
    <template #footer>
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import FieldFactory from "@/views/flowEdit/components/fieldFactory.vue";
import {readonly, ref} from "vue";

const props = defineProps({
  formConfig: {
    type: Object, //(string也可以是其他你自定义的接口)
    required: true,
    default: () => []
  }
})
const formInfo = readonly(props.formConfig);
let properties = ref({});
//弹窗展示
let dialogFormVisible = ref(false);
let diagFormConfig = ref({});

console.log(formInfo);
//设置需要输入的参数 用于v-model
// function getProperties() {
//   // formInfo.properties.forEach(item=>{
//   //   properties.value[item.name] = '';
//   // });
// }
//设置弹窗内容
function getExtendData(modelData) {
  console.log(modelData)
  diagFormConfig.value = modelData;
  dialogFormVisible.value = true;
}

// getProperties();

</script>

<style scoped lang="less">
.render {
  box-sizing: border-box;
  font-size: 14px;
  color: #828D99;

  .title {
    font-size: 14px;
    color: #1C2126;
    margin-bottom: 15px;
    margin-left: 13px;
  }

  .form-box {
    padding: 13px;

    .form-item {
      .label {
        margin: 12px 0;
      }

      .set-btn {
        margin-top: 20px;
        margin-left: 10px;
      }
      .opt{
        margin: 10px;
        width: 215px;
      }
    }
  }
}

.dia-form {
  .form-line {
    margin:0 20px;
    div{
      margin: 0 5px;
    }
  }
}
</style>