<template>
  <dialog :open="isOpen">
    <article>
      <a
        aria-label="Close"
        class="close"
        @click="closeModal()"
      >
      </a>
      <h3>{{ title }}</h3>
      <slot></slot>
    </article>
  </dialog>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const isOpen = ref(true);

const closeModal = () => {
    isOpen.value = false;
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
