<template>
  <nav>
    <b-card class="border-danger mb-3 user">
      <img class="avatar" :src="$store.state.user.avatar" />
      {{ $store.state.user.name }}
    </b-card>
    <b-card class="menu">
      <b-nav vertical pills>
        <b-nav-item to="/" exact exact-active-class="active">
          Home
        </b-nav-item>
        <b-nav-item to="/availability" exact exact-active-class="active">
          Availability
        </b-nav-item>
        <b-nav-item to="/schedule" exact exact-active-class="active">
          Schedule
        </b-nav-item>
      </b-nav>
    </b-card>
  </nav>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.card {
  position: fixed;
  width: 200px;
}
.menu {
  margin-top: 150px;
}
.avatar {
  border-radius: 50%;
  height: 50px;
  float: left;
  margin-right: 10px;
}
.user {
  font-size: 15px;
  line-height: 50px;
}
</style>
