<template>
    <div>
        <el-container>
          <el-aside width="250px">
            <div class="input-area">
              <el-input v-model="startDate" placeholder="起始日期 20150101" class="input-date">
              </el-input>
              <el-input v-model="endDate" placeholder="结束日期 20150101" class="input-date">
              </el-input>
              <div class="btn-area">
                <el-button type="success" @click="recompute" class="recompute-btn">区间计算</el-button>
                <el-button type="success" @click="refresh" class="refresh-btn">重置</el-button>
                <el-button type="success" @click="loadindex" class="load-btn">加载数据</el-button>
              </div>
              <div>
                <el-checkbox label="全选" class="all-btn" v-model="selectedall"></el-checkbox>
                <el-checkbox-group  v-for="(code, idx) in codes" :key="idx"  v-model="indexlist" class="checklist">
                  <el-checkbox :label="code"></el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </el-aside>
          <el-main>
            <el-row>
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
import Qs from 'qs'

export default {
  name: 'swHomeBody',

  data () {
    return {
      selectedall: false,
      indexlist: [],
      codes: ['上证指数',
        '上证50',
        '沪深300',
        '中证1000',
        '中证500',
        '中证800',
        '深圳成指',
        '中小板指',
        '创业板指',
        '申万农林牧渔',
        '申万采掘',
        '申万化工',
        '申万钢铁',
        '申万有色',
        '申万电子',
        '申万家用电器',
        '申万食品饮料',
        '申万纺织服装',
        '申万轻工制造',
        '申万医药生物',
        '申万公用事业',
        '申万交通运输',
        '申万房地产',
        '申万商业贸易',
        '申万休闲服务',
        '申万综合',
        '申万建筑材料',
        '申万建筑装饰',
        '申万电气设备',
        '申万国防军工',
        '申万计算机',
        '申万传媒',
        '申万通信',
        '申万银行',
        '申万非银金融',
        '申万汽车',
        '申万机械设备'],
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

      var endIdx = this.dataset[0].x.findIndex(d => d > this.endDate) === 0 ? this.dataset[0].x.length - 1 : this.dataset[0].x.findIndex(d => d > this.endDate) - 1
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
    loadindex () {
      axios({
        url: process.env.ROOT + '/data/indexlist',
        method: 'POST',
        params: {
          codes: this.indexlist
        },
        paramsSerializer: function (params) {
          return Qs.stringify(params, {indices: false})
        }
      }).then(this.handleDataRes)
    },
    handleDataRes (res) {
      if (res && res.status === 200) {
        this.dataset = []
        this.dataset = res.data.data
        for (var i in this.dataset) {
          this.dataset[i].y = this.dataset[i].y.map(s => s / this.dataset[i].y[0])
        }
        this.recompute()
      }
    }
  },
  watch: {
    selectedall: function () {
      if (this.selectedall) {
        this.codes.map(x => this.indexlist.push(x))
      } else {
        this.indexlist = []
      }
    }
  },
  mounted () {
    axios({
      url: process.env.ROOT + '/data/indexlist',
      method: 'POST',
      params: {
        codes: ['000001']
      },
      paramsSerializer: function (params) {
        return Qs.stringify(params, {indices: false})
      }
    }).then(this.handleDataRes)
  }
}
</script>

<style lang="stylus" scoped>
    .input-area
      line-height 70px
      margin-left 30px
      margin-top 10px
      .input-date
        width 200px
    .btn-area
      line-height 55px
      .recompute-btn
        width 100px
      .load-btn
        width 100px
        margin-left 0px
    .checklist
      margin-top 0%
      line-height 0px
    .grid-content
      border-radius 4px
      overflow scroll
      width 100%
</style>
