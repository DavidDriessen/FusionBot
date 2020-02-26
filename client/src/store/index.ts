import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loading: false,
    user: {
      team: { name: null, icon: null, members: [] },
      subber: null,
      name: "",
      avatar: ""
    }
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_USER(state, user) {
      state.user = user;
    }
  },
  actions: {
    fetchData(context) {
      context.commit("SET_LOADING", true);
      axios.get("/api/user").then(response => {
        context.commit("SET_USER", response.data);
        context.commit("SET_LOADING", false);
      });
    },
    fetchTeam(context, payload) {
      context.commit("SET_LOADING", true);
      axios
        .get("/api/user/" + payload.team, { params: { noLogin: true } })
        .then(response => {
          context.commit("SET_USER", response.data);
          context.commit("SET_LOADING", false);
        });
    }
  },
  getters: {
    isInSub(state, getters) {
      return !!state.user.subber;
    },
    isInTeam(state, getters) {
      return !!state.user.team;
    },
    TeamIcon(state, getters) {
      if (!getters.isInTeam) return "";
      return state.user.team.icon;
    },
    TeamName(state, getters) {
      if (!getters.isInTeam) return "";
      return state.user.team.name;
    },
    TeamMembers(state, getters) {
      if (!getters.isInTeam) return [];
      return state.user.team.members;
    }
  },
  modules: {}
});
