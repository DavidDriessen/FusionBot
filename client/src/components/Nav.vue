<template>
  <nav>
    <b-card class="border-danger mb-3">
      <b-card-header>
        <img :src="$store.state.user.avatar" />
        <h5>{{ $store.state.user.name }}</h5>
      </b-card-header>
    </b-card>
    <br />
    <b-card>
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
<style scoped lang="scss"></style>
