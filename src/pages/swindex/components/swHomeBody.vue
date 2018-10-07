<template>
    <div>
        <div class="chart-wrapper">
            <ve-line v-bind:height="height" width="1500px" :tooltip="tooltip" :legend="legend" :data="chartData" :axisPointer="axisPointer" :grid="grid" :xAxis="xAxis" :yAxis="yAxis" :series="series" class="chart"/>
        </div>

    </div>
</template>

<script>
import VeLine from 'v-charts/lib/line.common'
import axios from 'axios'

export default {
  name: 'swHomeBody',

  data () {
    return {
      height: '800px',
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
      series: [],
      legend: {
        type: 'plain',
        orient: 'vertical',
        right: '0%',
        top: '0%'
      },
      tooltip: {
        trigger: 'axis'
      }
    }
  },
  components: {
    veLine: VeLine
  },
  methods: {
    adjustgrid: function (activeDataSet) {
      this.grid = []

      this.grid.push(
        {
          top: '2%'
        }
      )
    },
    adjustXAxis: function (activeDataSet) {
      this.xAxis = []
      this.xAxis.push({
        type: 'category',
        data: activeDataSet[0].x
      })
    },
    adjustYAxis: function (activeDataSet) {
      this.yAxis = []

      this.yAxis.push({
        type: 'value',
        axisLabel: {
          formatter: '{value}'
        },
        scale: true
      })
    },
    adjustSeries: function (activeDataSet) {
      this.series = []
      for (var i in activeDataSet) {
        this.series.push({
          type: 'line',
          name: activeDataSet[i].name,
          data: activeDataSet[i].y
        })
      }
    },
    getDataSet () {
      axios.get(process.env.ROOT + '/macro/swindex.json').then(this.loadData)
    },
    loadData (res) {
      if (res && res.status === 200) {
        this.dataset = res.data.data
        console.log(this.dataset[0].name)
        this.adjustgrid(this.dataset)
        this.adjustXAxis(this.dataset)
        this.adjustYAxis(this.dataset)
        this.adjustSeries(this.dataset)
      }
    }
  },
  mounted () {
    this.getDataSet()
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
        width 1500px
        margin-left 300px
        margin-right 200px
        .chart
            margin-right 200px
</style>
