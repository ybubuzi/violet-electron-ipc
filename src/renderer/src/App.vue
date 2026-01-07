<script setup lang="ts">
import Versions from "./components/Versions.vue";
import { onMounted, ref } from "vue";

const enableNotifyFlag = ref(false);

const clickIpcHandle = () => {
  window.api.message.shy.startle("hello");
  window.api.message.shy.asyncStartle("hello");
};
const notifyHandle = (res) => {
  console.log(res);
};

const triggerNotify = () => {
  enableNotifyFlag.value = !enableNotifyFlag.value;
  if (!enableNotifyFlag.value) {
    window.notify.removeListener("login", notifyHandle);
  } else {
    console.log(`===`);
    window.notify.addListener("login", notifyHandle);
  }
};

onMounted(() => {
  // 直接传递箭头函数注册并且本地未保存引用，将导致引用丢失，以极快的速度被gc回收
  // 观察渲染进程控制台打印和主进程控制台打印
  window.notify.addListener("hello", (msg) => {
    console.log(msg);
  });
});
</script>

<template>
  <Versions />
  <button @click="triggerNotify">改变自动推送状态</button>
  <button @click="clickIpcHandle">测试调用主进程方法</button>
</template>
