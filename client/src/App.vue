<template>
  <div
    id="app"
    :class="$route.path === '/timetable' || collapseMenu ? 'collapse' : ''"
  >
    <b-jumbotron>
      <b-button
        v-if="$route.path !== '/timetable'"
        class="menu-btn"
        @click="collapseMenu = !collapseMenu"
        >Menu</b-button
      >
      <h1 v-if="isInTeam">
        <img :src="TeamIcon" class="logo" :alt="TeamName" />
        {{ TeamName }}
      </h1>
      <div class="timezone">
        {{ timezone }}
      </div>
    </b-jumbotron>
    <Nav />
    <b-container fluid="">
      <b-card>
        <router-view />
      </b-card>
    </b-container>
    <footer></footer>
  </div>
</template>

<script>
import Nav from "./components/Nav.vue";
import { mapGetters } from "vuex";
import moment from "moment-timezone";

export default {
  data() {
    return {
      collapseMenu: false
    };
  },
  components: {
    Nav
  },
  computed: {
    ...mapGetters(["isInTeam", "TeamIcon", "TeamName"]),
    timezone() {
      if (this.$route.name === "timetable") return "UTC";
      return moment.tz.guess();
    }
  }
};
</script>

<style lang="scss">
@import "~bootswatch/dist/cyborg/variables";
@import "~bootstrap";
@import "~bootstrap-vue";
@import "~bootswatch/dist/cyborg/bootswatch";

#app {
  display: grid;
  grid-template-columns: auto 9fr;
  grid-template-rows: 200px auto 100px;
  grid-template-areas:
    "head head"
    "side cont"
    "foot foot";
}

.jumbotron {
  margin: 20px;
  border: 3px solid #ffffff;
  color: #fbffff;
  padding: 40px;
  text-align: center;
  grid-area: head;
}

nav {
  grid-area: side;
  width: 200px;
  transition: all 0.3s;
  margin: 20px;
}

.collapse nav {
  margin-left: -240px;
}

.container-fluid {
  grid-area: cont;
  padding-top: 20px;
  padding-left: 30px;
  padding-right: 30px;
}
footer {
  grid-area: foot;
}

.logo {
  border-radius: 50%;
  margin-top: -20px;
  margin-right: 20px;
  height: 100px;
}

.fc-today {
  background: #000000 !important;
  border: none !important;
  border-top: 1px solid #ddd !important;
  font-weight: bold;
}

.timezone {
  position: absolute;
  right: 100px;
  top: 80px;
}
.menu-btn {
  position: absolute;
  left: 100px;
  top: 80px;
}
</style>
