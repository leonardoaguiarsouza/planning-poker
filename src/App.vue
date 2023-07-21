<template>
  <div class="main">
    <h1>Todo App</h1>
    <form @submit.prevent="addTodo">
      <input type="text" placeholder="Type your todo" v-model="newTodoContent" />
      <button :disabled="!newTodoContent">Add Todo</button>
    </form>
    <div v-if="!todos" aria-busy="true"></div>
    <article v-else v-for="todo in todos">
      <p v-if="todo.done" class="isDone"><s>{{ todo.content }}</s></p>
      <p v-else>{{ todo.content }}</p>
      <div class="btnGroup">
        <button v-if="todo.done" class="outline" @click="toogleDone(todo.id)">&check;</button>
        <button v-else class="primary" @click="toogleDone(todo.id)">&check;</button>
        <button class="secondary" @click="deleteTodo(todo.id)">&cross;</button>
      </div>
    </article>
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
  orderBy
} from "firebase/firestore";
import { db } from '@/firebase/enviroment';

const todosCollection = collection(db, "todos");
const todosCollectionQuery = query(todosCollection, orderBy("createdAt", "desc"));

const todos = ref(null);

onMounted(() => {
  onSnapshot(todosCollectionQuery, (querySnapshot) => {
    const fbTodos = [];
    querySnapshot.forEach((doc) => {
      const todo = {
        id: doc.id,
        content: doc.data().content,
        done: doc.data().done
      }
      fbTodos.push(todo);
    });
    todos.value = fbTodos;
  });
});

const newTodoContent = ref('');

const addTodo = () => {
  const newTodo = {
    content: newTodoContent.value,
    done: false,
    createdAt: Date.now()
  };
  addDoc(todosCollection, newTodo);

  newTodoContent.value = '';
}

const deleteTodo = (id) => {
  deleteDoc(doc(todosCollection, id));
}

const toogleDone = (id) => {
  const index = todos.value.findIndex((todo) => todo.id === id);

  updateDoc(doc(todosCollection, id), {
    done: !todos.value[index].done
  });
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