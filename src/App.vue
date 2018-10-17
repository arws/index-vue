<template>
  <div id="app">
    <el-tabs type="border-card">
      <el-tab-pane label="宏观数据(季度)">
        <mq-home></mq-home>
      </el-tab-pane>
      <el-tab-pane label="证券指数">
        <sw-home></sw-home>
      </el-tab-pane>
      <el-tab-pane label="证券个股">
        <stock-home></stock-home>
      </el-tab-pane>
      <el-tab-pane label="猪周期">
        <pig-home></pig-home>
      </el-tab-pane>
      <el-tab-pane label="数据查询">
        <query-home></query-home>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import mqHome from './pages/macroquarter/macroQuarterHome'
import swHome from './pages/swindex/swhome'
import pigHome from './pages/pig/pigHome'
import queryHome from './pages/query/queryHome'
import stockHome from './pages/stock/stockHome'

export default {
  name: 'App',
  components: {
    mqHome,
    swHome,
    pigHome,
    queryHome,
    stockHome
  }
}
</script>

<style lang="stylus" scoped>

</style>
