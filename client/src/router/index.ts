import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home
  },
  {
    path: "/availability",
    name: "availability",
    component: () => import("../views/Availability.vue")
  },
  {
    path: "/schedule",
    name: "schedule",
    component: () => import("../views/Schedule.vue")
  },
  {
    path: "/timetable",
    name: "timetable",
    component: () => import("../views/Timetable.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
