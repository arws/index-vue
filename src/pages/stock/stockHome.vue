<template>
  <div>
    <stock-home-header></stock-home-header>
    <stock-home-body></stock-home-body>
  </div>
</template>

<script>
import stockHomeHeader from './components/stockHomeHeader.vue'
import stockHomeBody from './components/stockHomeBody.vue'

export default {
  name: 'StockHome',
  components: {
    stockHomeHeader,
    stockHomeBody
  }
}
</script>

<style lang="stylus" scoped>

</style>
