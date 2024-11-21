<script setup lang="ts">
import { onMounted, reactive } from 'vue'

const versions = reactive({ ...window.electron.process.versions })
onMounted(async ()=>{
  console.log(await window.api.message.getMsg())
})
</script>

<template>
  <ul class="versions">
    <li class="electron-version">Electron v{{ versions.electron }}</li>
    <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="node-version">Node v{{ versions.node }}</li>
  </ul>
</template>
