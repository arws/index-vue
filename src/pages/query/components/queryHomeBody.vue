<template>
  <div>
    <div class="nav">
      <div class="input-area">
        <div>
          <p class="inline-label">宏观指标</p>
          <el-autocomplete class="inline-input" v-model="macroQueryString" :fetch-suggestions="macroSearch" placeholder="宏观指标"></el-autocomplete>
          <el-button icon="el-icon-plus" @click="addMacro" circle></el-button>
        </div>
        <div>
          <p class="inline-label">指数</p>
          <el-autocomplete class="inline-input" v-model="indexQueryString" :fetch-suggestions="indexSearch" placeholder="指数"></el-autocomplete>
          <el-button icon="el-icon-plus" @click="addIndex" circle></el-button>
        </div>
        <div>
          <p class="inline-label">基本面</p>
          <el-autocomplete class="inline-input" v-model="basicQueryString" :fetch-suggestions="basicSearch" placeholder="基本面"></el-autocomplete>
          <el-button icon="el-icon-plus" @click="addBasic" circle></el-button>
        </div>
      </div>
    </div>
    <div class="chart-wrapper">
      chart
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'queryHomeBody',
  data () {
    return {
      macroQueryString: '',
      indexQueryString: '',
      stockQueryString: '',
      basicQueryString: '',
      dataName: {
        macroName: [],
        indexName: [],
        stockName: [],
        basicName: []
      }
    }
  },
  methods: {
    macroSearch: function (queryString, cb) {
      cb(this.dataName.macroName)
    },
    addMacro: function () {
    },
    addMacroName: function (res) {
      if (res && res.data) {
        this.dataName.macroName = res.data.data
      }
    },
    indexSearch (queryString, cb) {
      cb(this.dataName.indexName)
    },
    addIndex () {

    },
    addIndexName (res) {
      if (res && res.data) {
        this.dataName.indexName = res.data.data
      }
    },
    basicSearch (queryString, cb) {
      cb(this.dataName.basicName)
    },
    addBasic () {

    },
    addBasicName (res) {
      if (res && res.data) {
        this.dataName.basicName = res.data.data
      }
    },
    loadName: function () {
      axios.get(process.env.ROOT + '/data/macro/name').then(this.addMacroName)
      axios.get(process.env.ROOT + '/data/index/name').then(this.addIndexName)
      axios.get(process.env.ROOT + '/data/pig/name').then(this.addBasicName)
    }
  },
  mounted: function () {
    this.loadName()
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
      .inline-label
        margin-left 10px

  .chart-wrapper
    border: solid 1px
    margin-left: 300px
    margin-right: 400p

</style>
