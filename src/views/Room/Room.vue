<template>
    <div class="main">
        <h1>{{ roomTitle }}</h1>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    orderBy
} from "firebase/firestore";
import { db } from '@/firebase/enviroment';
import router from '@/router'

const roomId = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');

const roomTitle = ref();
onMounted(() => {
    onSnapshot(doc(db, "rooms", roomId), (doc) => {
        roomTitle.value = doc.data().title
    });
});

</script>

<style scoped>
.main {
    padding: 40px;
}

h1 {
    text-align: center;
}

.main form {
    display: flex;
    gap: 10px;
}

.main form button {
    width: 160px;
}

.main article {
    display: flex;
    justify-content: space-between;
}

.main article p {
    align-self: center;
    margin: 0;
}

.main article .isDone {
    color: var(--primary);
}

.main article .btnGroup button {
    min-width: 60px;
    min-height: 60px;
    margin: 0;
}

.main article .btnGroup {
    display: flex;
    gap: 10px;
}
</style>