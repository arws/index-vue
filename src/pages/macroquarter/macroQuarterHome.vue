
<template>
    <div>
    <home-header></home-header>
    <home-body></home-body>
    </div>
</template>

<script>
import homeHeader from './components/homeHeader'
import homeBody from './components/homeBody'

export default {
  name: 'MacroQuarterHome',
  components: {
    homeHeader,
    homeBody
  }
}
</script>

<style lang="stylus" scoped>
</style>
