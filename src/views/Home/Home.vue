<template>
    <div class="main">
        <h1>Planning Poker</h1>
        <form @submit.prevent="createRoom">
            <input type="text" placeholder="Criar uma sala" v-model="newRoomTitle" />
            <button :disabled="!newRoomTitle">Criar Sala</button>
        </form>
        <h2>Ou entre em uma sala existente</h2>
        <form @submit.prevent="joinRoom">
            <input type="text" placeholder="Id da sala" v-model="roomId" />
            <button :disabled="!roomId">Entrar</button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import router from '@/router'
import {
    collection,
    addDoc
} from "firebase/firestore";
import { db } from '@/firebase/enviroment';

const roomsCollection = collection(db, "rooms");

const roomId = ref('');
const newRoomTitle = ref('');

const createRoom = () => {
    const newRoom = {
        title: newRoomTitle.value,
        createdAt: Date.now()
    };
    addDoc(roomsCollection, newRoom).then((docRef) => {
        router.push(`/${docRef.id}`)
    });
}

const joinRoom = () => {
    router.push(`/${roomId.value}`)
}
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