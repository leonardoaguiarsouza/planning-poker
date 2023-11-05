<template>
  <dialog open>
    <article>
      <a aria-label="Close" class="close" @click="closeModal">
      </a>
      <h3>{{ title }}</h3>
      <slot></slot>
    </article>
  </dialog>
</template>

<script setup>

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["close"]);

const closeModal = () => {
    emit("close");
}
</script>

<style scoped>
article {
  max-width: 500px;
  width: 100%;
}

a {
  cursor: pointer;
}

footer {
  display: flex;
  justify-content: space-between;
}
</style>
