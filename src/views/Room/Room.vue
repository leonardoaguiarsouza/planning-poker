<template>
    <div class="main">
        <h1>{{ roomTitle }}</h1>
        <div class="play-field">
            <form @submit.prevent="createPlayer" v-if="!playerNameFinal">
                <input type="text" placeholder="Digite seu nome" v-model="playerNameInput" />
                <button :disabled="!playerNameInput">Salvar</button>
            </form>
            <h2 v-else>{{ playerNameFinal }}</h2>
            <div class="table">
                {{ poll }}
            </div>
            <div class="deck">
                <card v-for="(card, index) in sortedCards" :key="index" :card-value="card"
                    :is-selected="selectedCard === card" @click="vote(card)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
import Card from '../../components/Card/Card.vue';

const roomId = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');

const playerNameFinal = ref("");
const playerNameInput = ref("");
const roomTitle = ref("");
const cards = ref([]);
const poll = ref();
const selectedCard = ref(null);

const createPlayer = () => {
    playerNameFinal.value = playerNameInput.value;
}

const roomsCollection = collection(db, "rooms");

onMounted(() => {
    onSnapshot(doc(db, "rooms", roomId), (doc) => {
        roomTitle.value = doc.data().title;
        cards.value = doc.data().cards;
        poll.value = doc.data().poll;
    });
});

const sortedCards = computed(() => {
    let modifiedData = cards.value;

    modifiedData = modifiedData.sort((a, b) => a - b);
    return modifiedData;
});

const getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value);
};
const vote = (cardValue) => {
    const updateData = {};
    updateData["poll." + playerNameFinal.value] = cardValue;
    updateDoc(doc(roomsCollection, roomId), updateData);
    selectedCard.value = cardValue;
}
</script>

<style scoped>
.main {
    padding: 40px;
}

h1,
h2 {
    text-align: center;
}

.play-field {
    display: flex;
    flex-direction: column;
}

.table {
    margin-top: auto;
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
}

.deck {
    margin-top: auto;
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 40px;
    gap: 24px;
    overflow: scroll;
}
</style>