<template>
  <canvas
    canvas-id="myCanvas"
    class="canvas"
    disable-scroll="true"
    @touchstart="touchStart"
    @touchmove="touchMove"
    @touchend="touchEnd"
  />
  <cover-view class="row button-container">
    <cover-view class="flex1 button" @click="clear">重写</cover-view>
    <cover-view class="flex1 button margin-left-12" @click="save"
      >提交</cover-view
    >
  </cover-view>
</template>
<script setup>
import { useDrawSignature } from "@/hooks/index";
import { ref, unref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
onLoad(() => {});
const { isSigned, touchStart, touchMove, touchEnd, clear } =
  useDrawSignature("myCanvas");

const save = () => {
  if (!unref(isSigned)) {
    uni.showToast({
      title: "请签名",
      icon: "none",
    });
    return;
  } else {
    uni.canvasToTempFilePath({
      canvasId: "myCanvas",
      success: function (res) {
        console.log(res);
        console.log(res.tempFilePath);
      },
    });
  }
};
</script>
<style scoped>
.canvas {
  height: 100vh;
  width: 100vw;
}
.button-container {
  width: 150rpx;
  height: 60rpx;
  position: absolute;
  bottom: 26rpx;
  right: 16rpx;
}

.button {
  font-size: 18rpx;
  height: 26rpx;
  line-height: 26rpx;
  background: white;
  color: #616161ff;
  box-sizing: border-box;
  border-radius: 20rpx;
  margin-top: 2rpx;
  text-align: center;
  border: 1px solid #c9c9c9;
}
</style>
