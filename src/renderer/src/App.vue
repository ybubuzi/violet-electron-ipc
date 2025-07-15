<script setup lang="ts">
import Versions from './components/Versions.vue';
import Test from './components/Test.vue';
import { onMounted, ref } from 'vue';
const ipcHandle = () => window.electron.ipcRenderer.send('ping');

const flag = ref(true);
onMounted(() => {
  setTimeout(() => {
    flag.value = false;
  }, 10000);
  setInterval(() => {
    window.api.message.shy.startle('hello');
    window.api.message.shy.asyncStartle('hello')
  }, 2000);
});
</script>

<template>
  <Test v-if="flag" />
  <Versions />
  <button @click="ipcHandle">ping</button>
</template>
