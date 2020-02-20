<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <h3>Welcome {{ $store.state.user.username }} to the FusionBot website</h3>
  </div>
</template>

<script>
export default {
  name: "home",
  components: {}
};
</script>

<style scoped="scoped">
.home {
  text-align: center;
}
</style>
