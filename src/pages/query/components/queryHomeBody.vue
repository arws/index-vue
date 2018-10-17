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
          <p class="inline-label">金融市场</p>
          <el-cascader
            expand-trigger="hover"
            :options="dataName.financialMarketName"
            v-model="financialMarketQueryString"
            @change="handleBasicChange"
            class="inline-cascader">
          </el-cascader>
          <el-button icon="el-icon-plus" @click="addFinancialMarket" circle></el-button>
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
      height: '',
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
      financialMarketQueryString: [],
      dataName: {
        macroName: [],
        indexName: [],
        basicName: [],
        stockName: [],
        financialMarketName: []
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
      switch (this.macroQueryString[0]) {
        case '国内宏观':
          switch (this.macroQueryString[1]) {
            case '消费':
              axios.get(process.env.ROOT + '/data/macro/consume/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '总量':
              axios.get(process.env.ROOT + '/data/macro/gross/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '信贷':
              axios.get(process.env.ROOT + '/data/macro/credit/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '国际贸易':
              axios.get(process.env.ROOT + '/data/macro/internationaltrade/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '投资':
              axios.get(process.env.ROOT + '/data/macro/investment/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '货币政策':
              axios.get(process.env.ROOT + '/data/macro/money/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '财政':
              axios.get(process.env.ROOT + '/data/macro/publicfinance/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            default:
              break
          }
          break
        default:
          break
      }
    },
    addMacroName: function (res) {
      if (res && res.data) {
        if (res.data.SubCategory) {
          var idx = this.dataName.macroName.findIndex(x => x.value === res.data.Category)
          if (this.dataName.macroName.findIndex(x => x.value === res.data.Category) === -1) {
            this.dataName.macroName.push({
              value: res.data.Category,
              label: res.data.Category,
              children: [{
                value: res.data.SubCategory,
                label: res.data.SubCategory,
                children: res.data.data
              }]
            })
          } else {
            if (this.dataName.macroName[idx].children.findIndex(x => x.value === res.data.SubCategory) === -1) {
              this.dataName.macroName[idx].children.push({
                value: res.data.SubCategory,
                label: res.data.SubCategory,
                children: res.data.data
              })
            } else {
              this.dataName.macroName[idx].children[this.dataName.macroName[idx].children.findIndex(x => x.value === res.data.SubCategory)].children.concat(res.data.data)
            }
          }
        } else {
          this.dataName.macroName.push({
            value: res.data.Category,
            label: res.data.Category,
            children: res.data.data
          })
        }
      }
    },
    financialMarketSearch: function (queryString, cb) {
      cb(this.dataName.macroName)
    },
    addFinancialMarket: function () {
      switch (this.financialMarketQueryString[0]) {
        case '金融市场':
          switch (this.financialMarketQueryString[1]) {
            case '债券':
              axios.get(process.env.ROOT + '/data/financialmarket/bond/single/' + this.financialMarketQueryString[2]).then(this.loadData)
              break
            case '权益':
              axios.get(process.env.ROOT + '/data/financialmarket/equity/single/' + this.financialMarketQueryString[2]).then(this.loadData)
              break
            case '外汇':
              axios.get(process.env.ROOT + '/data/financialmarket/exchange/single/' + this.financialMarketQueryString[2]).then(this.loadData)
              break
            case '银行间市场':
              axios.get(process.env.ROOT + '/data/financialmarket/interbank/single/' + this.financialMarketQueryString[2]).then(this.loadData)
              break
            default:
              break
          }
          break
        default:
          break
      }
    },
    addfinancialMarketName: function (res) {
      if (res && res.data) {
        if (res.data.SubCategory) {
          var idx = this.dataName.financialMarketName.findIndex(x => x.value === res.data.Category)
          if (this.dataName.financialMarketName.findIndex(x => x.value === res.data.Category) === -1) {
            this.dataName.financialMarketName.push({
              value: res.data.Category,
              label: res.data.Category,
              children: [{
                value: res.data.SubCategory,
                label: res.data.SubCategory,
                children: res.data.data
              }]
            })
          } else {
            if (this.dataName.financialMarketName[idx].children.findIndex(x => x.value === res.data.SubCategory) === -1) {
              this.dataName.financialMarketName[idx].children.push({
                value: res.data.SubCategory,
                label: res.data.SubCategory,
                children: res.data.data
              })
            } else {
              this.dataName.financialMarketName[idx].children[this.dataName.financialMarketName[idx].children.findIndex(x => x.value === res.data.SubCategory)].children.concat(res.data.data)
            }
          }
        } else {
          this.dataName.financialMarketName.push({
            value: res.data.Category,
            label: res.data.Category,
            children: res.data.data
          })
        }
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
      switch (this.basicQueryString[0]) {
        case '猪周期':
          axios.get(process.env.ROOT + '/data/basic/pig/single/' + this.basicQueryString[1]).then(this.loadData)
          break
        default:
          break
      }
    },
    addBasicName (res) {
      // console.log('收到')
      if (res && res.data) {
        if (res.data.SubCategory) {
          var idx = this.dataName.basicName.findIndex(x => x.value === res.data.Category)
          if (this.dataName.basicName.findIndex(x => x.value === res.data.Category) === -1) {
            this.dataName.basicName.push({
              value: res.data.Category,
              label: res.data.Category,
              children: [{
                value: res.data.SubCategory,
                label: res.data.SubCategory,
                children: res.data.data
              }]
            })
          } else {
            if (this.dataName.basicName[idx].children.findIndex(x => x.value === res.data.SubCategory) === -1) {
              this.dataName.basicName[idx].children.push({
                value: res.data.SubCategory,
                label: res.data.SubCategory,
                children: res.data.data
              })
            } else {
              this.dataName.basicName[idx].children[this.dataName.basicName[idx].children.findIndex(x => x.value === res.data.SubCategory)].children.concat(res.data.data)
            }
            // console.log(res.data.data)
            // console.log(this.dataName.basicName[idx].children)
          }
        } else {
          this.dataName.basicName.push({
            value: res.data.Category,
            label: res.data.Category,
            children: res.data.data
          })
        }
      }
    },
    loadName: function () {
      // axios.get(process.env.ROOT + '/data/macro/quarter/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/index/name').then(this.addIndexName)
      axios.get(process.env.ROOT + '/data/basic/pig/name').then(this.addBasicName)
      axios.get(process.env.ROOT + '/data/stock/name').then(this.addStockName)

      axios.get(process.env.ROOT + '/data/financialmarket/interbank/name').then(this.addfinancialMarketName)
      axios.get(process.env.ROOT + '/data/financialmarket/bond/name').then(this.addfinancialMarketName)
      axios.get(process.env.ROOT + '/data/financialmarket/equity/name').then(this.addfinancialMarketName)
      axios.get(process.env.ROOT + '/data/financialmarket/exchange/name').then(this.addfinancialMarketName)

      axios.get(process.env.ROOT + '/data/macro/consume/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/credit/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/gross/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/internationaltrade/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/investment/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/money/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/publicfinance/name').then(this.addMacroName)
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
