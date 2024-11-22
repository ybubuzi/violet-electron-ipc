<script lang="ts" setup>
import { onMounted } from 'vue';

onMounted(() => {
  window.notify.addListener('hello', (msg) => {
    console.log(msg);
  });
});
</script>
<template>hello</template>
