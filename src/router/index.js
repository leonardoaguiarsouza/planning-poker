import { createWebHistory, createRouter } from "vue-router";
import Home from "@/views/Home/Home.vue";
import Room from "@/views/Room/Room.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/:roomId",
    name: "Room",
    component: Room,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;