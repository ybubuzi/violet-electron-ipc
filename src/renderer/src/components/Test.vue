<script lang="ts" setup>
import { onMounted } from 'vue';

const msg1 = window.api.message.getMsg2("hello");



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
