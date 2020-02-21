<template>
  <div id="app" :class="$route.path !== '/timetable' ? '' : 'collapse'">
    <header>
      <h1 v-if="isInTeam">
        <img :src="TeamIcon" class="logo" :alt="TeamName" />
        {{ TeamName }}
      </h1>
      <div style="position: absolute; right: 100px; top: 80px">
        {{ timezone }}
      </div>
    </header>
    <Nav v-if="$route.path !== '/timetable'" />
    <b-container>
      <router-view />
    </b-container>
  </div>
</template>

<script>
import Nav from "./components/Nav.vue";
import { mapGetters } from "vuex";
import moment from "moment-timezone";

export default {
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
  grid-template-rows: 200px auto;
  grid-template-areas: "head head" "side content";
}

header {
  margin: 20px;
  border: 3px solid #ffffff;
  color: #fbffff;
  padding: 10px;
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

.container {
  grid-area: content;
}

.logo {
  border-radius: 50%;
  margin-top: -20px;
  margin-right: 20px;
  height: 100px;
}
</style>
