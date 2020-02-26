import "@babel/polyfill";
import "mutationobserver-shim";
import Vue from "vue";
import app from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";

Vue.config.productionTip = false;

import BootstrapVue from "bootstrap-vue";
Vue.use(BootstrapVue);

axios.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response;
  },
  function(error) {
    if (error.response) {
      if (error.response.status === 401) {
        window.location.href = "/discord/login";
        return;
      }
    }
    return Promise.reject(error);
  }
);

new Vue({
  router,
  store,
  render: h => h(app)
}).$mount("#app");
