<template>
  <div id="mapContainer" class="map-container" />
</template>

<script setup>
import { onMounted } from "vue";
import { initMap } from "../services/map"; // Adjust the import path as necessary

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
