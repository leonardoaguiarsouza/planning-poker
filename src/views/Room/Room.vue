<template>
    <div class="main">
        <div v-if="isLoading" aria-busy="true"></div>
        <div v-else>
            <nav>
                <ul>
                    <li><router-link to="/">Voltar</router-link></li>
                </ul>
                <ul>
                    <li>
                        <strong v-if="playerNameFinal">Sala : {{ roomTitle }} - Perfil: {{ playerNameFinal }}</strong>
                        <strong v-else>Sala : {{ roomTitle }}</strong>
                    </li>
                </ul>
                <ul>
                    <li><a @click="playerNameInput = playerNameFinal; isPlayerEditModalOpen = true">Configurações do
                            Perfil</a></li>
                    <li><a @click="isRoomEditModalOpen = true">Configurações da Sala</a></li>
                </ul>
            </nav>
            <div class="play-field">
                <modal title="Digite seu nome" v-show="isPlayerEditModalOpen" @close="isPlayerEditModalOpen = false">
                    <form @submit.prevent="createPlayer">
                        <input type="text" placeholder="Digite seu nome" v-model="playerNameInput" />
                        <button :disabled="!playerNameInput">Salvar</button>
                    </form>
                </modal>
                <div class="room-controls">
                    <button @click="togglePoll">
                        {{ showVotes ? "Ocultar" : "Revelar" }} Cards
                    </button>
                    <button @click="clearPoll">Limpar votação</button>
                    <modal title="Configurações da sala" v-show="isRoomEditModalOpen" @close="isRoomEditModalOpen = false">
                        <form @submit.prevent="createPlayer">
                            <input type="text" placeholder="Digite seu nome" v-model="playerNameInput" />
                            <button :disabled="!playerNameInput">Salvar</button>
                        </form>
                    </modal>
                </div>
                <table role="grid">
                    <thead>
                        <th>Pessoa</th>
                        <th>Voto</th>
                        <th>Votou</th>
                    </thead>
                    <tbody>
                        <tr v-for="(vote, player) in sortedPoll">
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
import { ref, onMounted, computed } from "vue";
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/enviroment";
import Card from "../../components/Card/Card.vue";
import Modal from "../../components/Modal/Modal.vue";

const roomId = window.location.pathname.replace(/^\/([^\/]*).*$/, "$1");

const isLoading = ref(true);
const isPlayerEditModalOpen = ref(true);
const isRoomEditModalOpen = ref(false);
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
    updatePoll(playerNameFinal.value, "-");
    isPlayerEditModalOpen.value = false;
};

const roomsCollection = collection(db, "rooms");

onMounted(() => {
    onSnapshot(doc(db, "rooms", roomId), (doc) => {
        roomTitle.value = doc.data().title;
        cards.value = doc.data().cards;
        poll.value = doc.data().poll;
        isLoading.value = false;
    });

});

onMounted(() => {
    if (localStorage.playerName) {
        playerNameFinal.value = localStorage.playerName;
        updatePoll(playerNameFinal.value, "-");
        isPlayerEditModalOpen.value = false;
    }
});

const sortedCards = computed(() => {
    let modifiedData = cards.value;

    modifiedData = modifiedData.sort((a, b) => a - b);
    return modifiedData;
});

const sortedPoll = computed(() => {
    const modifiedData = Object.keys(poll.value).sort().reduce(
        (obj, key) => {
            obj[key] = poll.value[key];
            return obj;
        },
        {}
    );
    return modifiedData;
});

const vote = (cardValue) => {
    if (playerNameFinal.value === "") {
        alert("Primeiro escolha um nome");
        return;
    }
    updatePoll(playerNameFinal.value, cardValue);
    selectedCard.value = cardValue;
};

const updatePoll = (playerName, cardValue) => {
    console.log(playerName, cardValue);
    const updateData = {};
    updateData["poll." + playerName] = cardValue;
    updateDoc(doc(roomsCollection, roomId), updateData);
};

const togglePoll = () => {
    showVotes.value = !showVotes.value;
};

const clearPoll = () => {
    for (const [key] of Object.entries(poll.value)) {
        const updateData = {};
        updateData["poll." + key] = "-";
        updateDoc(doc(roomsCollection, roomId), updateData);
    }
    showVotes.value = false;
};
</script>

<style scoped>
.main {
    padding: 0 40px;
}

h1,
h2 {
    text-align: center;
}

a {
    cursor: pointer;
}

.room-controls {
    display: flex;
    gap: 20px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

@media only screen and (min-width: 768px) {
    .room-controls {
        flex-direction: row;
        justify-content: space-evenly;
        align-items: baseline;
    }

    .room-controls button:last-child {
        margin-left: auto;
    }
}
</style>
