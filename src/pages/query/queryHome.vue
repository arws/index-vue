<template>
  <div>
    <query-home-header></query-home-header>
    <query-home-body></query-home-body>
  </div>
</template>

<script>
import queryHomeHeader from './components/queryHomeHeader.vue'
import queryHomeBody from './components/queryHomeBody.vue'

export default {
  name: 'QueryHome',
  components: {
    queryHomeHeader,
    queryHomeBody
  }
}
</script>

<style lang="stylus" scoped>

</style>
