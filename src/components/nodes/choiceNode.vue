<template>
  <div class="map-node">
    <div class="icon">
      <i class="iconfont icon-a-lianhe290"></i>
      <div class="tip">
        决策分支
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped lang="less">
.map-node {
  width: 644px;
  height: 486px;
  background: #FFFFFF;
  border-radius: 16px 16px 16px 16px;
  border: 1px solid #DCDEE1;
  box-sizing: border-box;
  margin-bottom: 5px;
  gap:5px;
  padding: 16px;
  font-size: 14px;
  font-weight: 400;
  color: #4C5A67;
  .icon {
    width: 60px;
    text-align: center;
    .tip{
      font-size: 14px;
      color: #4C5A67;
    }
    .iconfont {
      font-size: 26px;
      color: #0084FF;
    }
  }
}
</style>