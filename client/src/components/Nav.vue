<template>
  <div id="nav">
    <div class="card border-danger mb-3" style="max-width: 20rem;">
      <img :src="$store.state.user.avatar" />
      <div class="card-header">{{ $store.state.user.name }}</div>
    </div>
    <br />
    <ul class="list-group">
      <router-link
        to="/"
        tag="li"
        class="list-group-item d-flex justify-content-between align-items-center"
        exact-active-class="active"
      >
        Home
      </router-link>
      <router-link
        to="/availability"
        tag="li"
        class="list-group-item d-flex justify-content-between align-items-center"
        exact-active-class="active"
      >
        Availability
      </router-link>
      <router-link
        to="/schedule"
        tag="li"
        class="list-group-item d-flex justify-content-between align-items-center"
        exact-active-class="active"
      >
        Schedule
      </router-link>
    </ul>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#nav {
  left: 20px;
  padding: 30px;
  width: 200px;
  float: left;
  cursor: pointer;

  li {
    font-weight: bold;
    font-size: 20px;
    color: #dcf1ff;
  }
}
</style>
