<script lang="ts" setup>
const emits = defineEmits<{
  (e: "drop", file: FileSystemFileEntry[], event: DragEvent): void
}>()

const showDrag = ref(false)
const dropFile = (e: any) => {
  e.preventDefault()
  showDrag.value = false
  const files = Array.from(e.dataTransfer.items)
    .map((item) => item as DataTransferItem)
    .filter((item) => item.kind === "file")
    .map((item) => item.webkitGetAsEntry()!)
    .map((entry) => entry as FileSystemFileEntry)
  emits("drop", files, e)
}
onMounted(() => {
  document.ondragenter = () => {
    showDrag.value = true
  }
})
onBeforeUnmount(() => {
  document.ondragenter = null
})
</script>

<template>
  <div
    v-if="showDrag"
    class="cover full-screen-cover flex"
    @dragleave="
      () => {
        showDrag = false
      }
    "
    @dragover="
      (e) => {
        e.preventDefault()
      }
    "
    @drop="dropFile"
    @click="showDrag = false"
  >
    <div class="drag-text">松手上传</div>
  </div>
</template>

<style lang="scss" scoped>
.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
}

.full-screen-cover {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;

  .drag-text {
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 20px;
    padding: 14px 20px;
    pointer-events: none; //一定要加这个，关键！
    font-weight: 700;
    font-size: 40px;
    color: #36ad6a;
  }
}
</style>
