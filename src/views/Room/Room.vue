<template>
    <div class="main">
        <div v-if="isLoading" aria-busy="true"></div>
        <div v-else>
            <h1>{{ roomTitle }}</h1>
            <div class="play-field">
                <form @submit.prevent="createPlayer" v-if="!playerNameFinal">
                    <input type="text" placeholder="Digite seu nome" v-model="playerNameInput" />
                    <button :disabled="!playerNameInput">Salvar</button>
                </form>
                <h2 v-else>{{ playerNameFinal }}</h2>
                <button @click="togglePoll">Revelar/Ocultar Cards</button>
                <button @click="clearPoll">Limpar votação</button>
                <table role="grid">
                    <thead>
                        <th>Pessoa</th>
                        <th>Voto</th>
                        <th>Votou</th>
                    </thead>
                    <tbody>
                        <tr v-for="(vote, player) in poll">
                            <td>{{ player }}</td>
                            <td>{{ showVotes ? vote : "?" }}</td>
                            <td>{{ vote !== "-" ? "Sim" : "Não" }}</td>
                        </tr>

                    </tbody>
                </table>
                <div class="deck">
                    <card v-for="(card, index) in sortedCards" :key="index" :card-value="card"
                        :is-selected="selectedCard === card" @click="vote(card)" />
                </div>
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

const isLoading = ref(true);
const playerNameFinal = ref("");
const playerNameInput = ref("");
const roomTitle = ref("");
const cards = ref([]);
const poll = ref();
const showVotes = ref(false);
const selectedCard = ref(null);

const createPlayer = () => {
    playerNameFinal.value = playerNameInput.value;
    localStorage.playerName = playerNameFinal.value;
    updatePoll("-");
}

const roomsCollection = collection(db, "rooms");

onMounted(() => {
    onSnapshot(doc(db, "rooms", roomId), (doc) => {
        roomTitle.value = doc.data().title;
        cards.value = doc.data().cards;
        poll.value = doc.data().poll;

        isLoading.value = false;
    })
});

onMounted(() => {
    if (localStorage.playerName) {
        playerNameFinal.value = localStorage.playerName;
        updatePoll("-");
    }
});

const sortedCards = computed(() => {
    let modifiedData = cards.value;

    modifiedData = modifiedData.sort((a, b) => a - b);
    return modifiedData;
});

const vote = (cardValue) => {
    if (playerNameFinal.value === "") {
        alert("Primeiro escolha um nome");
        return;
    }
    updatePoll(cardValue);
    selectedCard.value = cardValue;
}

const updatePoll = (cardValue) => {
    const updateData = {};
    updateData["poll." + playerNameFinal.value] = cardValue;
    updateDoc(doc(roomsCollection, roomId), updateData);
}

const togglePoll = () => {
    showVotes.value = !showVotes.value;
}

const clearPoll = () => {
    for (const [key] of Object.entries(poll.value)) {
        const updateData = {};
        updateData["poll." + key] = "-";
        updateDoc(doc(roomsCollection, roomId), updateData);
    }
    togglePoll();
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