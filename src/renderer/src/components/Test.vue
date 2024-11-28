<script lang="ts" setup>
import { onMounted } from 'vue';

window.api.message.getMsg2("hello");



onMounted(() => {
  window.api.window.maximize();

  window.notify.addListener('login', (msg) => {
    console.log(msg);
  });
});
</script>
<template>
  hello
</template>
