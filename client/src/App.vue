<template>
  <div id="app">
    <header>
      <h1 v-if="isInTeam">
        <img :src="TeamIcon" class="logo"  alt=""/>
        {{ TeamName }}
      </h1>
      <div style="position: absolute; right: 100px; top: 80px">
        {{ timezone }}
      </div>
    </header>
    <Nav v-if="$route.path !== '/timetable'" />
    <router-view class="router-view jumbotron" />
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
header {
  margin: 20px;
  border: 3px solid #ffffff;
  color: #fbffff;
  padding: 10px;
  text-align: center;
}

.logo {
  border-radius: 50%;
  margin-top: -20px;
  margin-right: 20px;
  height: 100px;
}

.router-view {
  margin-top: 40px;
  margin-right: 40px;
  margin-left: 200px;
  padding: 30px;
}
</style>
