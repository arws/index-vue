
<template>
    <div>
        <pig-home-header></pig-home-header>
        <pig-home-body></pig-home-body>
    </div>
</template>

<script>
import pigHomeHeader from './components/pigHomeHeader'
import pigHomeBody from './components/pigHomeBody'

export default {
  name: 'PigHome',
  components: {
    pigHomeHeader,
    pigHomeBody
  }
}
</script>

<style lang="stylus" scoped>
</style>
