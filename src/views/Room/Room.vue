<template>
    <div class="main">
        <div v-if="isLoading" aria-busy="true"></div>
        <div v-else>
            <nav>
                <ul>
                    <li>
                        <router-link to="/">
                            <vue-feather type="arrow-left" size="22" class="icon" />
                            Voltar
                        </router-link>
                    </li>
                </ul>
                <ul>
                    <li>
                        <strong>
                            {{ roomTitle }}
                        </strong>
                    </li>
                </ul>
                <ul>
                    <li>
                        <a @click="playerNameInput = playerNameFinal; isPlayerEditModalOpen = true"
                            data-tooltip="Configurações do perfil" data-placement="left">
                            <vue-feather type="user" size="22" class="icon" />
                            {{ playerNameFinal }}
                        </a>
                    </li>
                    <li>
                        <a @click="isRoomEditModalOpen = true" data-tooltip="Configurações da Sala" data-placement="left">
                            <vue-feather type="settings" size="22" class="icon" />
                        </a>
                    </li>
                </ul>
            </nav>
            <div class="play-field">
                <modal title="Digite seu nome" v-show="isPlayerEditModalOpen" @close="isPlayerEditModalOpen = false">
                    <form @submit.prevent="createPlayer">
                        <label for="playerName">
                            Nome do perfil
                            <input id="playerName" name="playerName" type="text" placeholder="Digite seu nome" v-model="playerNameInput" />
                        </label>
                        <button :disabled="!playerNameInput">Salvar</button>
                    </form>
                </modal>
                <div class="room-controls">
                    <button @click="togglePoll">
                        {{ showPoll ? "Ocultar" : "Revelar" }} votos
                    </button>
                    <button @click="clearPoll" :disabled="!showPoll">Limpar votação</button>
                    <modal title="Configurações da sala" v-show="isRoomEditModalOpen" @close="isRoomEditModalOpen = false">
                        <form @submit.prevent="updateCards">
                            <label for="cards">
                                Cards exibidos na sala
                                <input id="cards" name="cards" type="text" placeholder="Digite os valores dos cards, separados por vírgula"
                                v-model="cardsEditInput" />
                            </label>
                            <button :disabled="!cardsEditInput">Salvar</button>
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
                            <td>{{ showPoll ? vote : "?" }}</td>
                            <td>{{ vote !== "-" ? "Sim" : "Não" }}</td>
                        </tr>
                    </tbody>
                </table>
                <article class="average">
                    <h1>Média</h1>
                    <h2>{{ averageScore || '?' }}</h2>
                </article>

            </div>
            <div class="deck">
                <card v-for="(card, index) in sortedCards" :key="index" :card-value="card"
                    :is-selected="!showPoll ? selectedCard === card : selectedCard = null" @click="vote(card)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import {
    collection,
    doc,
    onSnapshot,
    updateDoc,
    deleteField
} from "firebase/firestore";
import { db } from "@/firebase/enviroment";
import VueFeather from 'vue-feather';
import Card from "../../components/Card/Card.vue";
import Modal from "../../components/Modal/Modal.vue";

const roomId = window.location.pathname.replace(/^\/([^\/]*).*$/, "$1");

const isPlayerEditModalOpen = ref(true);
const isRoomEditModalOpen = ref(false);
const playerNameFinal = ref("");
const playerNameInput = ref("");
const playerNameOld = ref(null);
const cardsEditInput = ref([]);
const roomTitle = ref("");
const cards = ref([]);
const poll = ref();
const showPoll = ref();
const selectedCard = ref(null);
const isLoading = ref(true);
const averageScore = ref();

const roomsCollection = collection(db, "rooms");

onMounted(() => {
    window.addEventListener("beforeunload", (event) => {
        logout()
    });
});

onUnmounted(() => {
    logout();
});

onMounted(() => {
    onSnapshot(doc(db, "rooms", roomId), (doc) => {
        roomTitle.value = doc.data().title;
        cards.value = doc.data().cards;
        poll.value = doc.data().poll;
        showPoll.value = doc.data().showPoll;
        cardsEditInput.value = doc.data().cards;
        averageScore.value = doc.data().averageScore;
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
    if (!poll.value) return;
    const modifiedData = Object.keys(poll.value).sort().reduce(
        (obj, key) => {
            obj[key] = poll.value[key];
            return obj;
        },
        {}
    );
    return modifiedData;
});

const createPlayer = () => {
    if (playerNameFinal.value !== "") {
        playerNameOld.value = playerNameFinal.value;
    }

    playerNameFinal.value = playerNameInput.value;
    localStorage.playerName = playerNameFinal.value;

    if (playerNameOld.value) {
        const updateData = {};
        updateData["poll." + playerNameOld.value] = deleteField();
        updateDoc(doc(roomsCollection, roomId), updateData);
    }

    updatePoll(playerNameFinal.value, "-");
    isPlayerEditModalOpen.value = false;
};

const updateCards = () => {
    const cardsArray = cardsEditInput.value.split(",");

    updateDoc(doc(roomsCollection, roomId), {
        cards: cardsArray
    });

    clearPoll();
    isRoomEditModalOpen.value = false;
};

const vote = (cardValue) => {
    if (playerNameFinal.value === "") {
        alert("Primeiro escolha um nome");
        return;
    }
    else if (showPoll.value) {
        alert("Votação encerrada");
        return;
    }
    updatePoll(playerNameFinal.value, cardValue);
    selectedCard.value = cardValue;
};

const updatePoll = (playerName, cardValue) => {
    const updateData = {};
    updateData["poll." + playerName] = cardValue;
    updateDoc(doc(roomsCollection, roomId), updateData);
};

const togglePoll = () => {
    if (!showPoll.value) {
        calcAverageScore();
    }

    updateDoc(doc(roomsCollection, roomId), {
        showPoll: !showPoll.value
    });
};

const clearPoll = () => {
    for (const [key] of Object.entries(poll.value)) {
        const updateData = {};
        updateData["poll." + key] = "-";
        updateDoc(doc(roomsCollection, roomId), updateData);
    }
    updateDoc(doc(roomsCollection, roomId), {
        averageScore: null
    });
    togglePoll();
};

const calcAverageScore = () => {
    let votesArr = []
    for (const [key, value] of Object.entries(poll.value)) {
        if (value !== '-') {
            votesArr.push(Number(value));
        }
    }

    const calculateScore = votesArr.reduce((p, c) => p + c, 0) / votesArr.length;
    updateDoc(doc(roomsCollection, roomId), {
        averageScore: calculateScore
    });
};

const logout = () => {
    if (playerNameFinal.value !== "") {
        const updateData = {};
        updateData["poll." + playerNameFinal.value] = deleteField();
        updateDoc(doc(roomsCollection, roomId), updateData);
    }
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

a,
strong {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
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

.room-controls button {
    margin-bottom: 0;
}

.play-field {
    display: flex;
    flex-direction: column;
}

.average {
    align-self: center;
    max-width: 200px;
    border-radius: 20px;
}

.average h1 {
    margin-bottom: 10px;
}

.average h2 {
    margin-bottom: 0;
}

.deck {
    display: flex;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 40px;
    gap: 24px;
    overflow-x: auto;
}

@media only screen and (min-width: 768px) {
    .room-controls {
        flex-direction: row;
        justify-content: space-evenly;
        align-items: baseline;
    }

    .room-controls button {
        margin-bottom: 18px;
    }

    .room-controls button:last-child {
        margin-left: auto;
    }
}
</style>
