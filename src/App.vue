<template>
  <div id="app">
    <el-tabs type="border-card">
      <el-tab-pane label="宏观数据">
        <home></home>
      </el-tab-pane>
      <el-tab-pane label="申万">
        <sw-home></sw-home>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import home from './pages/home/home'
import swHome from './pages/swindex/swhome'

export default {
  name: 'App',
  components: {
    home,
    swHome
  }
}
</script>

<style lang="stylus" scoped>

</style>
