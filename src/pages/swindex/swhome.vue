<template>
    <div>
        <sw-home-header></sw-home-header>
        <sw-home-body></sw-home-body>
    </div>
</template>

<script>
import swHomeHeader from './components/swHomeHeader'
import swHomeBody from './components/swHomeBody'

export default {
  name: 'swHome',
  components: {
    swHomeHeader,
    swHomeBody
  }
}
</script>

<style lang="stylus" scoped>
</style>
