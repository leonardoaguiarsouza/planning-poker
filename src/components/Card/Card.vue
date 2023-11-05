<template>
    <div :class="isSelected ? 'card selected-card' : 'card'">
        <p>{{ cardValue }}</p>
    </div>
</template>

<script setup>
const props = defineProps({
    cardValue: {
        type: String,
        required: true
    },
    isSelected: {
        type: Boolean,
        default: false
    }
})

</script>

<style scoped>
.card {
    border: 1px solid #1d67f1;
    border-radius: 10px;
    min-width: 70px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.card:first-child {
    margin-left: auto;
}

.card:last-child {
    margin-right: auto;
}

.card p {
    margin: 0;
    color: #1d67f1;
}

.selected-card {
    border-color: var(--primary);
}

.selected-card p {
    color: var(--primary);
}
</style>