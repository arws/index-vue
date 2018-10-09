<template>
    <div>
        <div class="nav">
            <el-checkbox-group v-model="activeIndex" class="check">
              <div v-for="(item, idx) in indexes" :key="idx">
                <el-checkbox :label="item"></el-checkbox>
              </div>
            </el-checkbox-group>
            <!-- <div v-for="(item, idx) in indexes" :key="idx" class="check">
                <input type="checkbox" :id="item" :value="item" v-model="activeIndex"/>
                <label :for="item">{{item}}</label>
            </div> -->
        </div>
        <div class="chart-wrapper">
            <ve-line v-bind:height="height" width="1500px" :data="chartData" :axisPointer="axisPointer" :grid="grid" :xAxis="xAxis" :yAxis="yAxis" :series="series" class="chart"/>
        </div>

    </div>
</template>

<script>
import VeLine from 'v-charts/lib/line.common'
import axios from 'axios'

export default {
  name: 'homeBody',

  data () {
    return {
      height: '1800px',
      indexes: [],
      activeIndex: [],
      chartData: {
      },
      dataset: [],
      grid: [],
      axisPointer: {
        link: {
          xAxisIndex: 'all'
        }
      },
      xAxis: [],
      yAxis: [],
      series: []
    }
  },
  watch: {
    activeIndex: function (val, old) {
      // 检查当前有哪些active指标
      // 找出Active的DataSet
      var activeSet = []
      for (var i in this.dataset) {
        if (val.indexOf(this.dataset[i].name) !== -1) {
          activeSet.push(this.dataset[i])
        }
      }
      // 调整grid数量
      this.adjustgrid(activeSet)
      // 调整x轴数量
      this.adjustXAxis(activeSet)
      // 调整y轴数量
      this.adjustYAxis(activeSet)
      // 调整series数量
      this.adjustSeries(activeSet)
    }
  },
  components: {
    veLine: VeLine
  },
  methods: {
    adjustgrid: function (activeSet) {
      this.height = (300 * activeSet.length).toString() + 'px'
      this.grid = []
      for (var i = 1; i <= activeSet.length; i++) {
        this.grid.push(
          {
            top: ((i - 1) * Math.floor(100 / activeSet.length) + 4).toString() + '%',
            height: Math.floor(100 / activeSet.length - 4).toString() + '%'
          }
        )
      }
    },
    adjustXAxis: function (activeDataSet) {
      this.xAxis = []
      for (var i in activeDataSet) {
        this.xAxis.push({
          type: 'category',
          data: activeDataSet[i].x,
          gridIndex: i
        })
      }
    },
    adjustYAxis: function (activeDataSet) {
      this.yAxis = []
      for (var i in activeDataSet) {
        this.yAxis.push({
          name: activeDataSet[i].name,
          type: 'value',
          gridIndex: i,
          min: 'dataMin',
          max: 'dataMax'
        })
      }
    },
    adjustSeries: function (activeDataSet) {
      this.series = []
      for (var i in activeDataSet) {
        this.series.push({
          type: 'line',
          name: activeDataSet[i].name,
          data: activeDataSet[i].y,
          xAxisIndex: i,
          yAxisIndex: i
        })
      }
    },
    getDataSet () {
      axios.get(process.env.ROOT + '/data/index.json').then(this.loadData)
    },
    loadData (res) {
      if (res && res.status === 200) {
        this.dataset = res.data.data
        for (let i = 0; i < this.dataset.length; i++) {
          this.indexes.push(this.dataset[i].name)
          this.activeIndex.push(this.dataset[i].name)
        }
      }
    }
  },
  mounted () {
    this.getDataSet()
    this.adjustgrid(this.dataset)
    this.adjustXAxis(this.dataset)
    this.adjustYAxis(this.dataset)
    this.adjustSeries(this.dataset)
  }
}
</script>

<style lang="stylus" scoped>
    .nav
        float left
        width 300px
        line-height 20px
        .check
            margin-top 50%
            margin-left 20%
            width 100px
    .chart-wrapper
        border solid 1px
        width 1500px
        margin-left 300px
        margin-right 200px
        .chart
            margin-right 200px
</style>
