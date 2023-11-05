<template>
    <div class="main">
        <h1>Planning Poker</h1>
        <h2>Crie uma sala</h2>
        <form @submit.prevent="createRoom">
            <input type="text" placeholder="Digite o nome da sala" v-model="newRoomTitle" />
            <button :disabled="!newRoomTitle">Criar Sala</button>
        </form>
        <h2>Ou entre em uma sala existente</h2>
        <form @submit.prevent="joinRoom(roomId)">
            <input type="text" placeholder="Digite o ID da sala" v-model="roomId" />
            <button :disabled="!roomId">Entrar</button>
        </form>
        <div v-show="lastRoomVisited && lastRoomVisited !== 'null'">
            <h3>Última sala visitada</h3>
            <article>
                <p>{{ lastRoomVisited }}</p>
                <button class="small-btn" data-tooltip="Entrar" data-placement="left" @click="joinRoom(lastRoomVisited)">
                    <vue-feather type="log-in" size="22" class="icon" />
                </button>
            </article>
        </div>
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
import VueFeather from 'vue-feather';

const roomsCollection = collection(db, "rooms");

const roomId = ref('');
const newRoomTitle = ref('');
const lastRoomVisited = ref(localStorage.getItem("recentRooms"));

const defaultDeck = [
    "1",
    "2",
    "3",
    "4",
    "5"
]

const createRoom = async () => {
    const newRoom = {
        title: newRoomTitle.value,
        cards: defaultDeck,
        createdAt: Date.now(),
        showPoll: false,
        averageScore: 0
    };

    addDoc(roomsCollection, newRoom).then((docRef) => {
        router.push(`/${docRef.id}`);
        updateRecentRooms(docRef.id);
    });
}

const joinRoom = (roomId) => {
    router.push(`/${roomId}`);
    updateRecentRooms(roomId);
}

const updateRecentRooms = (roomId) => {
    localStorage.recentRooms = roomId;
}
</script>

<style scoped>
.main {
    padding: 40px;
}

h1,
h2,
h3 {
    text-align: center;
}

.main form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

article {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

article p {
    margin: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.small-btn {
    max-width: 80px;
    max-height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
}

@media only screen and (min-width: 768px) {
    h2 {
        text-align: left;
    }

    .main form {
        flex-direction: row;
    }

    .main form button {
        max-width: 160px;
    }
}
</style>