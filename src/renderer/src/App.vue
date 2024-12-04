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
  setInterval(async () => {
    window.api.message.shy.startle('hello');

    const ss = await window.api.hadaController.test('111', '222');
    console.log(ss);
    const ss1 = await window.api.userController.login('333', '444');
    console.log(ss1);
  }, 2000);
});
</script>

<template>
  <Test v-if="flag" />
  <Versions />
  <button @click="ipcHandle">ping</button>
</template>
