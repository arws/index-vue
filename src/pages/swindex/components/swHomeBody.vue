<template>
    <div>
        <el-container>
          <el-aside width="250px">
            <div class="input-area">
              <el-input v-model="startDate" placeholder="起始日期 20150101" class="input-date">
              </el-input>
              <el-input v-model="endDate" placeholder="结束日期 20150101" class="input-date">
              </el-input>
              <div>
                <el-button type="success" @click="recompute">重新计算</el-button>
                <el-button type="success" @click="refresh">重置</el-button>
              </div>
            </div>
          </el-aside>
          <el-main>
            <el-row gutter="20">
              <el-col :span="18">
                <div class="grid-content bg-purple">
                  <ve-line v-bind:height="height" width="1200px" :dataZoom="dataZoom" :tooltip="tooltip" :legend="legend" :data="chartData" :axisPointer="axisPointer" :grid="grid" :xAxis="xAxis" :yAxis="yAxis" :series="series" class="chart"/>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="grid-content bg-purple-light">
                      <el-table
                      :data="tableData"
                      style="width: 100%">
                      <el-table-column
                        prop="rank"
                        label="排名"
                        width="120">
                      </el-table-column>
                      <el-table-column
                        prop="name"
                        label="指数名称"
                        width="120">
                      </el-table-column>
                      <el-table-column
                        prop="ret"
                        label="区间收益率">
                      </el-table-column>
                    </el-table>
                </div>
              </el-col>
            </el-row>
          </el-main>
        </el-container>

    </div>
</template>

<script>
import VeLine from 'v-charts/lib/line.common'
import axios from 'axios'

export default {
  name: 'swHomeBody',

  data () {
    return {
      tableData: [],
      startDate: '',
      endDate: '',
      height: '900px',
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
      dataZoom: [{
        type: 'slider',
        show: true,
        xAxisIndex: [0]
      }, {
        type: 'inside',
        xAxisIndex: [0]
      }],
      legend: {
        type: 'plain',
        orient: 'horizontal',
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
    refresh: function () {
      var startIdx = 0
      var endIdx = this.dataset[0].x.length - 1
      this.recomputeRegion(startIdx, endIdx)
    },
    sortTableData: function () {
      this.tableData.sort((x, y) => x.ret <= y.ret)
      for (var k in this.tableData) {
        this.tableData[k].rank = parseInt(k) + 1
        this.tableData[k].ret = this.tableData[k].ret.toFixed(3).toString() + '%'
      }
    },
    recompute: function () {
      var startIdx = this.dataset[0].x.findIndex(d => d >= this.startDate)

      var endIdx = this.dataset[0].x.findIndex(d => d > this.endDate) - 1
      this.recomputeRegion(startIdx, endIdx)
    },
    recomputeRegion: function (startIdx, endIdx) {
      this.tableData = []
      var activeDataSet = []
      for (var i in this.dataset) {
        this.tableData.push({
          name: this.dataset[i].name,
          ret: ((this.dataset[i].y[endIdx] / this.dataset[i].y[startIdx] - 1).toFixed(4) * 100)
        })
        activeDataSet.push({
          name: this.dataset[i].name,
          x: this.dataset[i].x.slice(startIdx, endIdx),
          y: this.dataset[i].y.slice(startIdx, endIdx).map(s => s / this.dataset[i].y[startIdx])
        })
        this.adjustgrid(activeDataSet)
        this.adjustXAxis(activeDataSet)
        this.adjustYAxis(activeDataSet)
        this.adjustSeries(activeDataSet)
      }
      this.sortTableData()
    },
    adjustgrid: function (activeDataSet) {
      this.grid = []

      this.grid.push(
        {
          top: '15%'
        }
      )
    },
    adjustXAxis: function (activeDataSet) {
      this.xAxis = []
      this.xAxis.push({
        type: 'category',
        data: activeDataSet[0].x,
        axisLabel: {
          rotate: 45
        }
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
          data: activeDataSet[i].y,
          symbol: 'none',
          xAxisIndex: 0,
          yAxisIndex: 0
        })
      }
    },
    getDataSet () {
      axios.get(process.env.ROOT + '/data/swindex.json').then(this.loadData)
    },
    loadData (res) {
      if (res && res.status === 200) {
        this.dataset = res.data.data
        for (var i in this.dataset) {
          this.dataset[i].y = this.dataset[i].y.map(s => s / this.dataset[i].y[0])
        }
        this.recomputeRegion(0, 500)
        // this.adjustgrid(this.dataset)
        // this.adjustXAxis(this.dataset)
        // this.adjustYAxis(this.dataset)
        // this.adjustSeries(this.dataset)
        this.tableData = []
        for (var j in this.dataset) {
          this.tableData.push({
            name: this.dataset[j].name,
            ret: ((this.dataset[j].y[this.dataset[j].y.length - 1] / this.dataset[j].y[0] - 1).toFixed(4) * 100)
          })
        }
        this.sortTableData()
      }
    }
  },
  mounted () {
    this.getDataSet()
  }
}
</script>

<style lang="stylus" scoped>
    .input-area
      line-height 70px
      margin-left 30px
      margin-top 100px
      .input-date
        width 200px
    .grid-content
      border-radius 4px
      overflow scroll
      width 100%
</style>
