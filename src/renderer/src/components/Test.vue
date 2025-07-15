<script lang="ts" setup>
import { onMounted } from 'vue';

window.api.message.getMsg2("hello");

// 本地保持引用注册后，将由本组件的生命周期管理注册时间
const loginHandle = (msg) => {
  console.log(msg);
}

onMounted(() => {
  window.api.window.maximize();
  // 直接传递箭头函数注册并且本地未保存引用，将导致引用丢失，以极快的速度被gc回收
  // 观察渲染进程控制台打印和主进程控制台打印
  window.notify.addListener('hello', (msg) => {
    console.log(msg);
  });
  window.notify.addListener('login', loginHandle);
});
</script>
<template>
  hello
</template>
