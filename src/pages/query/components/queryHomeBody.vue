<template>
  <div>
    <div class="nav">
      <div class="input-area">
        <!-- <div>
          <p class="inline-label">宏观指标</p>
          <el-autocomplete class="inline-input" v-model="macroQueryString" :fetch-suggestions="macroSearch" placeholder="宏观指标"></el-autocomplete>
          <el-button icon="el-icon-plus" @click="addMacro" circle></el-button>
        </div> -->
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
        <div class="inline-cas">
          <p class="inline-label">宏观指标</p>
          <el-cascader
            expand-trigger="hover"
            :options="dataName.macroName"
            v-model="macroQueryString"
            @change="handleBasicChange"
            class="inline-cascader">
          </el-cascader>
          <el-button icon="el-icon-plus" @click="addMacro" circle></el-button>
        </div>
        <div class="inline-cas">
          <p class="inline-label">基本面数据</p>
          <el-cascader
            expand-trigger="hover"
            :options="dataName.basicName"
            v-model="basicQueryString"
            @change="handleBasicChange"
            class="inline-cascader">
          </el-cascader>
          <el-button icon="el-icon-plus" @click="addBasic" circle></el-button>
        </div>
        <el-checkbox-group v-model="activeIndex" class="check">
          <div v-for="(item, idx) in indexes" :key="idx">
            <el-checkbox :label="item"></el-checkbox>
          </div>
        </el-checkbox-group>
        <el-button type="success" @click="clearData" class="clear-btn">清空指标</el-button>
      </div>
    </div>
    <div class="chart-wrapper">
        <ve-line v-bind:height="height" width="1500px" :data="vchart.chartData" :dataZoom="vchart.dataZoom" :axisPointer="vchart.axisPointer" :grid="vchart.grid" :xAxis="vchart.xAxis" :yAxis="vchart.yAxis" :series="vchart.series" class="chart">
        </ve-line>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import VeLine from 'v-charts/lib/line.common'

export default {
  name: 'queryHomeBody',
  data () {
    return {
      dataset: [],
      activeIndex: [],
      indexes: [],
      vchart: {
        chartData: {},
        axisPointer: {
          link: {
            xAxisIndex: 'all'
          }
        },
        grid: [],
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
      macroQueryString: [],
      indexQueryString: '',
      stockQueryString: '',
      basicQueryString: [],
      dataName: {
        macroName: [],
        indexName: [],
        basicName: [],
        stockName: []
      }
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
  methods: {
    clearData () {
      this.dataset = []
      this.indexes = []
      this.activeIndex = []
    },
    adjustgrid: function (activeSet) {
      this.height = (300 * activeSet.length + 50).toString() + 'px'
      this.vchart.grid = []
      this.vchart.dataZoom[0].xAxisIndex = Array.from(new Array(activeSet.length), (val, idx) => idx)
      this.vchart.dataZoom[1].xAxisIndex = Array.from(new Array(activeSet.length), (val, idx) => idx)

      for (var i = 1; i <= activeSet.length; i++) {
        this.vchart.grid.push(
          {
            top: (i - 1) * 280 + 50,
            height: 240
          }
        )
      }
    },
    adjustXAxis: function (activeDataSet) {
      this.vchart.xAxis = []
      for (var i in activeDataSet) {
        this.vchart.xAxis.push({
          type: 'category',
          data: activeDataSet[i].x,
          gridIndex: i
        })
      }
    },
    adjustYAxis: function (activeDataSet) {
      this.vchart.yAxis = []
      for (var i in activeDataSet) {
        this.vchart.yAxis.push({
          name: activeDataSet[i].name,
          type: 'value',
          gridIndex: i,
          min: 'dataMin',
          max: 'dataMax'
        })
      }
    },
    adjustSeries: function (activeDataSet) {
      this.vchart.series = []
      for (var i in activeDataSet) {
        this.vchart.series.push({
          type: 'line',
          name: activeDataSet[i].name,
          data: activeDataSet[i].y,
          xAxisIndex: i,
          yAxisIndex: i
        })
      }
    },
    loadData (res) {
      if (res && res.status === 200) {
        this.dataset.push(res.data)
        this.indexes.push(res.data.name)
        this.activeIndex.push(res.data.name)

        this.adjustgrid(this.dataset)
        this.adjustXAxis(this.dataset)
        this.adjustYAxis(this.dataset)
        this.adjustSeries(this.dataset)
      }
    },
    handleBasicChange (value) {
      // console.log(this.basicQueryString)
    },
    macroSearch: function (queryString, cb) {
      cb(this.dataName.macroName)
    },
    addMacro: function () {
      axios.get(process.env.ROOT + '/data/macro/quarter/' + this.macroQueryString[1]).then(this.loadData)
    },
    addMacroName: function (res) {
      if (res && res.data) {
        this.dataName.macroName.push({
          value: '国内宏观',
          label: '国内宏观',
          children: res.data.data
        })
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
      axios.get(process.env.ROOT + '/data/index/single/' + this.indexQueryString).then(this.loadData)
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
    basicSearch (queryString, cb) {
      cb(this.dataName.basicName)
    },
    addBasic () {
      if (this.basicQueryString[0] === '猪周期') {
        axios.get(process.env.ROOT + '/data/pig/single/' + this.basicQueryString[1]).then(this.loadData)
      }
    },
    addPigName (res) {
      if (res && res.data) {
        this.dataName.basicName.push({
          value: '猪周期',
          label: '猪周期',
          children: res.data.data
        })
      }
    },
    loadName: function () {
      axios.get(process.env.ROOT + '/data/macro/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/index/name').then(this.addIndexName)
      axios.get(process.env.ROOT + '/data/pig/name').then(this.addPigName)
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
  .nav
    float: left
    width: 300px
    .input-area
      margin-left 15%
      margin-top 40%
      .inline-input
        width 180px
      .inline-cas
        display inline
        .inline-cascader
          width 180px
      .inline-label
        margin-left 10px
    .check
      margin-top 30px
      margin-left 50px
    .clear-btn
      margin-top 50px
  .chart-wrapper
    border: solid 1px
    margin-left: 300px
    margin-right: 200px

</style>
