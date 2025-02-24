// 在hooks目录下，新建index.js
import { ref, unref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

export function useDrawSignature(canvasId) {
  let ctx = null;
  let isButtonDown = false;
  let points = [];
  let isSigned = ref(false);

  onLoad(() => {
    ctx = uni.createCanvasContext(canvasId);
    // 设置画笔样式
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  });

  // 触摸开始，获取到起点
  function touchStart(e) {
    let startPoint = { X: e.changedTouches[0].x, Y: e.changedTouches[0].y };
    points.push(startPoint); // 把起点存起来
    ctx.beginPath(); // 每次触摸开始，开启新的路径
    isButtonDown = true;
  }

  // 触摸移动，获取到路径点
  function touchMove(e) {
    if (isButtonDown) {
      let movePoint = { X: e.changedTouches[0].x, Y: e.changedTouches[0].y };
      points.push(movePoint); // 存点
      let len = points.length;
      if (len >= 2) {
        draw(); // 绘制路径
      }
    }
  }

  // 触摸结束，将未绘制的点清空防止对后续路径产生干扰
  function touchEnd() {
    points = [];
    isButtonDown = false;
  }

  // 绘画
  function draw() {
    let point1 = points[0];
    let point2 = points[1];
    points.shift();
    ctx.moveTo(point1.X, point1.Y);
    ctx.lineTo(point2.X, point2.Y);
    ctx.stroke();
    ctx.draw(true);
    isSigned.value = true;
  }

  function clear() {
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.draw(true);
    isSigned.value = false;
  }

  return {
    isSigned,
    touchStart,
    touchMove,
    touchEnd,
    clear,
  };
}
