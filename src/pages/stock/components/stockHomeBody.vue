<template>
  <div>
    <el-container>
      <el-aside width="300px">
      <div class="input-area">
        <p class="inline-label">起始日期</p>
        <el-input v-model="startDate" placeholder="起始日期 20150101" class="input-date">
        </el-input>
        <p class="inline-label">结束日期</p>
        <el-input v-model="endDate" placeholder="结束日期 20150101" class="input-date">
              </el-input>
        <div>
          <p class="inline-label">指数</p>
          <el-autocomplete class="inline-input" v-model="indexQueryString" :fetch-suggestions="indexSearch" placeholder="指数"></el-autocomplete>
          <el-button icon="el-icon-plus" @click="addIndex" circle></el-button>
        </div>
        <div>
          <p class="inline-label">证券</p>
          <el-autocomplete class="inline-input" v-model="stockQueryString" :fetch-suggestions="stockSearch" placeholder="请输入证券代码" :trigger-on-focus="false"></el-autocomplete>
          <el-button icon="el-icon-plus" @click="addStock" circle></el-button>
        </div>
        <el-checkbox-group v-model="activeIndex" class="check">
          <div v-for="(item, idx) in indexes" :key="idx">
            <el-checkbox :label="item"></el-checkbox>
          </div>
        </el-checkbox-group>
        <el-button type="success" @click="clearData" class="clear-btn">清空指标</el-button>
        <el-button type="success" @click="recompute" class="recompute-btn">重新计算</el-button>
      </div>
    </el-aside>
    <el-main>
        <el-row>
            <el-col :span="18">
                <div class="grid-content">
                    <ve-line v-bind:height="height" width="1200px" :data="vchart.chartData" :legend="vchart.legend" :dataZoom="vchart.dataZoom" :axisPointer="vchart.axisPointer" :grid="vchart.grid" :xAxis="vchart.xAxis" :yAxis="vchart.yAxis" :series="vchart.series" class="chart">
                    </ve-line>
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
                        label="名称"
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
import axios from 'axios'
import VeLine from 'v-charts/lib/line.common'

export default {
  name: 'StockHomeBody',
  data () {
    return {
      startDate: '',
      endDate: '',
      height: '500px',
      dataset: [],
      deletedDataset: [],
      activeIndex: [],
      indexes: [],
      vchart: {
        chartData: {},
        axisPointer: {
          link: {
            xAxisIndex: 'all'
          }
        },
        grid: [{
          top: 50,
          height: 400
        }],
        legend: {
          type: 'plain',
          orient: 'horizontal',
          top: '0%'
        },
        xAxis: {},
        yAxis: {},
        dataZoom: [{
          type: 'slider',
          show: true,
          xAxisIndex: [0]
        }, {
          type: 'inside',
          xAxisIndex: [0]
        }],
        series: []
      },
      indexQueryString: '',
      stockQueryString: '',
      dataName: {
        indexName: [],
        stockName: []
      }
    }
  },
  watch: {
    activeIndex: function (val, old) {
      // 检查当前有哪些active指标
      // 找出Active的DataSet
      for (var i in this.dataset) {
        if (val.indexOf(this.dataset[i].name) === -1) {
          this.deletedDataset.push(this.dataset[i])
          this.dataset.splice(i, 1)
        }
      }

      for (var j in this.deletedDataset) {
        if (val.indexOf(this.deletedDataset[j].name) !== -1) {
          this.dataset.push(this.deletedDataset[j])
        }
      }
      this.recompute()
    }
  },
  methods: {
    clearData () {
      this.dataset = []
      this.indexes = []
      this.activeIndex = []
    },
    adjustXAxis: function (activeDataSet) {
      this.vchart.xAxis = []
      this.vchart.xAxis.push({
        type: 'category',
        data: activeDataSet[0].x,
        axisLabel: {
          rotate: 45
        }
      })
    },
    adjustYAxis: function (activeDataSet) {
      this.vchart.yAxis = []

      this.vchart.yAxis.push({
        type: 'value',
        axisLabel: {
          formatter: '{value}'
        },
        scale: true
      })
    },
    adjustSeries: function (activeDataSet) {
      this.vchart.series = []
      for (var i in activeDataSet) {
        this.vchart.series.push({
          type: 'line',
          name: activeDataSet[i].name,
          data: activeDataSet[i].y,
          xAxisIndex: 0,
          yAxisIndex: 0
        })
      }
    },
    recompute () {
      if (this.dataset.length !== 0) {
        var startIdx = this.dataset[0].x.findIndex(d => d >= this.startDate)
        var endIdx = this.dataset[0].x.findIndex(d => d > this.endDate) === 0 ? this.dataset[0].x.length - 1 : this.dataset[0].x.findIndex(d => d > this.endDate) - 1
        this.recomputeRegion(startIdx, endIdx)
      } else {
        this.vchart.xAxis = []
        this.vchart.yAxis = []
        this.vchart.series = []
      }
    },
    sortTableData: function () {
      this.tableData.sort((x, y) => x.ret <= y.ret)
      for (var k in this.tableData) {
        this.tableData[k].rank = parseInt(k) + 1
        this.tableData[k].ret = this.tableData[k].ret.toFixed(3).toString() + '%'
      }
    },
    recomputeRegion (startIdx, endIdx) {
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
        this.adjustXAxis(activeDataSet)
        this.adjustYAxis(activeDataSet)
        this.adjustSeries(activeDataSet)
      }
      this.sortTableData()
    },
    loadData (res) {
      if (res && res.status === 200) {
        this.dataset.push(res.data)
        this.indexes.push(res.data.name)
        this.activeIndex.push(res.data.name)
        for (var i in this.dataset) {
          this.dataset[i].y = this.dataset[i].y.map(s => s / this.dataset[i].y[0])
        }
        this.recompute()
        // this.adjustXAxis(this.dataset)
        // this.adjustYAxis(this.dataset)
        // this.adjustSeries(this.dataset)
      }
    },
    indexSearch (queryString, cb) {
      var indexname = this.dataName.indexName
      var results = queryString ? indexname.filter(x => {
        return x.value.indexOf(queryString) !== -1
      }) : indexname
      cb(results)
      // cb(this.dataName.indexName)
    },
    addIndex () {
      axios.get(process.env.ROOT + '/data/financialmarket/index/single/' + this.indexQueryString).then(this.loadData)
    },
    addIndexName (res) {
      if (res && res.data) {
        this.dataName.indexName = res.data.data
      }
    },
    stockSearch (queryString, cb) {
      var stockname = this.dataName.stockName
      var results = queryString ? stockname.filter(x => {
        return x.value.indexOf(queryString) !== -1
      }) : stockname
      cb(results)
    },
    addStock () {
      axios.get(process.env.ROOT + '/data/stock/single/' + this.stockQueryString.slice(0, 6)).then(this.loadData)
    },
    addStockName (res) {
      if (res && res.data) {
        this.dataName.stockName = res.data.data
      }
    },
    loadName: function () {
      axios.get(process.env.ROOT + '/data/financialmarket/index/name').then(this.addIndexName)
      axios.get(process.env.ROOT + '/data/stock/name').then(this.addStockName)
    }
  },
  mounted: function () {
    this.loadName()
  },
  components: {
    veLine: VeLine
  }
}
</script>

<style lang="stylus" scoped>
    .input-area
      margin-left 30px
      margin-top 10px
      .input-date
        width 200px
      .inline-input
        width 200px
      .check
        margin-top 50px
        margin-left 40px
      .clear-btn
        margin-top 50px
        .grid-content
            border-radius 4px
            overflow scroll
            width 100%
</style>
