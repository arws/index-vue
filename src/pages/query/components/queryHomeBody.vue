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
        <el-checkbox v-model="normalized" class="normalize-check">加载时是否归一化</el-checkbox>
        <el-input v-model="gridtoload" placeholder="需要加载第几幅图" class="gridload-input"></el-input>
        <el-checkbox-group v-model="activeIndex" class="check">
          <div v-for="(item, idx) in indexes" :key="idx">
            <el-checkbox :label="item"></el-checkbox>
          </div>
        </el-checkbox-group>
        <el-button type="success" @click="clearData" class="clear-btn">清空指标</el-button>
      </div>
    </div>
    <div class="chart-wrapper">
        <ve-line v-bind:height="height" width="1500px" :data="vchart.chartData" :dataZoom="vchart.dataZoom" :axisPointer="vchart.axisPointer" :grid="vchart.grid" :legend="vchart.legend" :xAxis="vchart.xAxis" :yAxis="vchart.yAxis" :series="vchart.series" class="chart">
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
      bindgroup: [],
      gridtoload: '',
      normalized: false,
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
        legend: {
          type: 'plain',
          orient: 'horizontal',
          top: '0%'
        },
        grid: [],
        xAxis: [],
        yAxis: [],
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
      if (val.length === 0) {
        this.vchart.grid = []
        this.vchart.xAxis = []
        this.vchart.yAxis = []
        this.vchart.series = []
      }
      var activeSet = []
      if (old.length > val.length) {
        // 被删除的grid的名称
        var deleted = old.filter(x => !val.includes(x))[0]
        var repeat = false
        // 找出被删除的grid的位置
        for (var k of this.dataset) {
          if (k.name === deleted) {
            var deletedGrid = k.grid
          }
        }
        // 被删除的grid是否在多个指标在同一个图里
        for (var w of this.dataset) {
          if (w.grid === deletedGrid && w.name !== deleted) {
            repeat = true
          }
        }
        if (repeat) {
          for (var t in this.dataset) {
            if (val.indexOf(this.dataset[t].name) !== -1) {
              // 当前指标压入activeset
              activeSet.push(this.dataset[t])
            }
          }
        } else {
          for (var i in this.dataset) {
            // 数据里哪些在当前指标下
            if (val.indexOf(this.dataset[i].name) !== -1) {
              if (this.dataset[i].grid > deletedGrid) {
                var bindIndex = this.bindgroup.findIndex(x => x.includes(this.dataset[i].name))
                if (bindIndex !== -1) {
                  this.bindgroup[bindIndex].forEach(x => {
                    this.dataset[this.dataset.findIndex(y => y.name === x)].grid = this.dataset[this.dataset.findIndex(y => y.name === x)].grid - 1
                  })
                } else {
                  this.dataset[i].grid = this.dataset[i].grid - 1
                }
              }
              activeSet.push(this.dataset[i])
            } else {
              // 把删除的指标放到grid的最后
              this.dataset[i].grid = old.length
            }
          }
        }
      } else {
        // 添加指标
        var added = val[val.length - 1]
        // 添加的是指标是否和当前的指标有绑定
        var bindCurrentIndex = this.bindgroup.findIndex(x => x.includes(added))
        if (bindCurrentIndex === -1) {
          // 添加的指标和当前的指标没有绑定
          this.dataset.map(x => {
            if (x.name === added) {
              x.grid = this.vchart.grid.length + 1
            }
          })
          for (var j in this.dataset) {
            if (val.indexOf(this.dataset[j].name) !== -1) {
              activeSet.push(this.dataset[j])
            }
          }
        } else {
          // 添加的指标和当前的指标有绑定
          // 添加的指标是否有当前激活的绑定指标
          var tmp = this.bindgroup[bindCurrentIndex].filter(x => {
            return (this.activeIndex.includes(x) && x !== added)
          })
          if (tmp.length === 0) {
            this.dataset.map(y => {
              if (y.name === added) {
                y.grid = this.vchart.grid.length + 1
              }
            })
          } else {
            var bindname = this.bindgroup[bindCurrentIndex].find(x => x.name !== added)
            var bindcurrentgrid = this.dataset.find(x => x.name === bindname).grid
            this.dataset.map(x => {
              if (x.name === added) {
                x.grid = bindcurrentgrid
              }
            })
          }
          for (j in this.dataset) {
            if (val.indexOf(this.dataset[j].name) !== -1) {
              activeSet.push(this.dataset[j])
            }
          }
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
      this.bindgroup = []
    },
    adjustgrid: function (activeSet) {
      this.vchart.grid = []
      var maxGrid = 1

      for (var s of activeSet) {
        if (s.grid > maxGrid) {
          maxGrid = s.grid
        }
      }
      this.vchart.dataZoom[0].xAxisIndex = Array.from(new Array(maxGrid), (val, idx) => idx)
      this.vchart.dataZoom[1].xAxisIndex = Array.from(new Array(maxGrid), (val, idx) => idx)
      this.height = (300 * maxGrid + 50).toString() + 'px'
      for (var d of activeSet) {
        this.vchart.grid[d.grid - 1] = {
          top: (d.grid - 1) * 280 + 50,
          height: 240
        }
      }
      // for (var i = 1; i <= activeSet.length; i++) {
      //   this.vchart.grid.push(
      //     {
      //       top: (i - 1) * 280 + 50,
      //       height: 240
      //     }
      //   )
      // }
    },
    adjustXAxis: function (activeDataSet) {
      this.vchart.xAxis = []
      for (var d of activeDataSet) {
        this.vchart.xAxis[d.grid - 1] = {
          type: 'category',
          data: d.x,
          gridIndex: d.grid - 1
        }
      }
      // for (var i in activeDataSet) {
      //   this.vchart.xAxis.push({
      //     type: 'category',
      //     data: activeDataSet[i].x,
      //     gridIndex: i
      //   })
      // }
    },
    adjustYAxis: function (activeDataSet) {
      this.vchart.yAxis = []
      for (var d of activeDataSet) {
        this.vchart.yAxis[d.grid - 1] = {
          name: d.name,
          type: 'value',
          gridIndex: d.grid - 1,
          min: 'dataMin',
          max: 'dataMax'
        }
      }
      // for (var i in activeDataSet) {
      //   this.vchart.yAxis.push({
      //     name: activeDataSet[i].name,
      //     type: 'value',
      //     gridIndex: i,
      //     min: 'dataMin',
      //     max: 'dataMax'
      //   })
      // }
    },
    adjustSeries: function (activeDataSet) {
      this.vchart.series = []
      for (var d of activeDataSet) {
        this.vchart.series.push({
          type: 'line',
          name: d.name,
          data: d.y,
          xAxisIndex: d.grid - 1,
          yAxisIndex: d.grid - 1
        })
      }
      // for (var i in activeDataSet) {
      //   this.vchart.series.push({
      //     type: 'line',
      //     name: activeDataSet[i].name,
      //     data: activeDataSet[i].y,
      //     xAxisIndex: i,
      //     yAxisIndex: i
      //   })
      // }
    },
    loadData (res) {
      if (res && res.status === 200) {
        if (this.gridtoload) {
          var grid = parseInt(this.gridtoload)
          res.data.grid = grid
        } else {
          res.data.grid = this.vchart.grid.length + 1
        }
        if (res.data.grid <= this.vchart.grid.length) {
          // 放到捆绑组里
          var bindname = this.vchart.yAxis[res.data.grid - 1].name
          var idx = this.bindgroup.findIndex(x => x.includes(bindname))
          if (idx === -1) {
            this.bindgroup.push([bindname, res.data.name])
          } else {
            this.bindgroup[idx].push(res.data.name)
          }
        }

        if (this.normalized) {
          idx = this.bindgroup.findIndex(x => x.includes(res.data.name))
          if (idx === -1) {
            res.data.y = res.data.y.map(x => (x / res.data.y[0]).toFixed(2))
            this.dataset.push(res.data)
          } else {
            this.dataset.push(res.data)
            this.bindgroup[idx].map(x => {
              var tmpIdx = this.dataset.findIndex(y => y.name === x)
              this.dataset[tmpIdx].y = this.dataset[tmpIdx].y.map(z => (z / this.dataset[tmpIdx].y[0]).toFixed(2))
            })
          }
        } else {
          this.dataset.push(res.data)
        }
        // this.dataset.push(res.data)
        this.indexes.push(res.data.name)
        this.activeIndex.push(res.data.name)
        // this.adjustgrid(this.dataset)
        // this.adjustXAxis(this.dataset)
        // this.adjustYAxis(this.dataset)
        // this.adjustSeries(this.dataset)
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
        case '美国宏观':
          switch (this.macroQueryString[1]) {
            case '消费':
              axios.get(process.env.ROOT + '/data/macro/america/consume/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '金融市场':
              axios.get(process.env.ROOT + '/data/macro/america/financialmarket/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '总量':
              axios.get(process.env.ROOT + '/data/macro/america/gross/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '国际贸易':
              axios.get(process.env.ROOT + '/data/macro/america/internationaltrade/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '就业':
              axios.get(process.env.ROOT + '/data/macro/america/job/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '货币政策':
              axios.get(process.env.ROOT + '/data/macro/america/money/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '实体经济':
              axios.get(process.env.ROOT + '/data/macro/america/realeco/single/' + this.macroQueryString[2]).then(this.loadData)
              break
            case '房地产':
              axios.get(process.env.ROOT + '/data/macro/america/realestate/single/' + this.macroQueryString[2]).then(this.loadData)
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
        case '房地产':
          axios.get(process.env.ROOT + '/data/basic/realestate/single/' + this.basicQueryString[1]).then(this.loadData)
          break
        case '实体经济':
          axios.get(process.env.ROOT + '/data/basic/realeco/single/' + this.basicQueryString[1]).then(this.loadData)
          break
        case '大宗商品':
          switch (this.basicQueryString[1]) {
            case '全球大宗':
              axios.get(process.env.ROOT + '/data/commodity/global/single/' + this.basicQueryString[2]).then(this.loadData)
              break
            case '国内大宗':
              axios.get(process.env.ROOT + '/data/commodity/domestic/single/' + this.basicQueryString[2]).then(this.loadData)
              break
            default:
              break
          }
          break
        default:
          break
      }
    },
    addBasicName (res) {
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
      axios.get(process.env.ROOT + '/data/stock/name').then(this.addStockName)

      axios.get(process.env.ROOT + '/data/basic/pig/name').then(this.addBasicName)
      axios.get(process.env.ROOT + '/data/basic/realeco/name').then(this.addBasicName)
      axios.get(process.env.ROOT + '/data/basic/realestate/name').then(this.addBasicName)

      axios.get(process.env.ROOT + '/data/commodity/global/name').then(this.addBasicName)
      axios.get(process.env.ROOT + '/data/commodity/domestic/name').then(this.addBasicName)

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

      axios.get(process.env.ROOT + '/data/macro/america/consume/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/america/financialmarket/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/america/gross/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/america/internationaltrade/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/america/job/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/america/money/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/america/realeco/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/macro/america/realestate/name').then(this.addMacroName)
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
    width: 350px
    .input-area
      margin-left 5%
      margin-top 40%
      .inline-input
        width 220px
      .inline-cas
        display inline
        .inline-cascader
          width 220px
      .inline-label
        margin-left 10px
    .gridload-input
      margin-top 30px
      width 220px
    .normalize-check
      margin-top 30px
      margin-left 10px
    .check
      margin-top 30px
      margin-left 10px
    .clear-btn
      margin-top 50px
  .chart-wrapper
    margin-left: 350px
    margin-right: 200px

</style>
