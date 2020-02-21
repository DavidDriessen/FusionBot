<template>
  <div class="home">
    <img
      alt="$store.state.team.name + 'logo'"
      :src="$store.state.team.icon"
      class="logo"
    />
    <h3>Welcome {{ $store.state.user.username }} to the FusionBot website</h3>
  </div>
</template>

<script>
export default {
  name: "profile",
  components: {},
  beforeMount() {
    this.$store.dispatch("fetchData");
  }
};
</script>

<style scoped="scoped">
.home {
  text-align: center;
}
</style>
