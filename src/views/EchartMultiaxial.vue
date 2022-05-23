<template>
  <div>
    <h1>echarts 多轴</h1>
    <div class="about" ref="myChart" style="width: 1200px; height: 600px"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
// import moment from 'moment'
let myChart = null

export default {
  mounted() {
    this.$nextTick(() => {
      this.initChart(this.c_tableData)
    })
    window.onresize = function () {
      myChart.resize()
    }
  },
  methods: {
    initChart(datas) {
      const colors = ['#ffc566', '#19c259', '#09f', '#999999', '#006666']
      myChart = echarts.init(this.$refs.myChart)
      this.datas = datas || []
      if (myChart) myChart.clear()
      let stationpress = [10200, 10050, 12365, 10000, 11452, 15201], //气压
        maxTemp = [26.3, 22, 28, 19.3, 15.2, 32], // 温度
        timeData = ['2021-06-10', '2021-06-11', '2021-06-12', '2021-06-13', '2021-06-14', '2021-06-15'],
        minRelHumidity = [50, 42, 33, 51, 12, 86], //湿度,
        precipitation = [200, 46, 120, 532, 0, 12], //降水量
        instantWindV = [65, 123, 44, 12.3, 28, 45] //风力(m/s)
      // this.datas.forEach(function (item) {
      //     timeData.push(moment(item.observeDate).format("YYYY-MM-DD HH:mm"))
      //     stationpress.push(item.stationpress)
      //     maxTemp.push(item.maxTemp / 10),
      //     minRelHumidity.push(item.minRelHumidity)
      //     precipitation.push(item.precipitation)
      //     instantWindV.push(item.instantWindV || 0)
      // })

      const option = {
        title: {
          text: '数据图表',
          left: 'center',
        },
        toolbox: {
          right: '20%',
          feature: {
            saveAsImage: {},
            iconStyle: {
              color: '#0066ff',
            },
          },
        },
        legend: {
          data: ['温度(℃)', '湿度(%)', '降水(mm)', '气压(hPa)', '风力(m/s)'],
          top: 40,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false,
          },
        },
        axisPointer: {
          link: {
            // 表示所有 xAxisIndex 为 0、3、4 和 yAxisName 为 'someName' 的坐标轴联动。
            xAxisIndex: 'all',
          },
        },
        grid: [
          {
            left: 200,
            right: 50,
            top: '20%',
            height: '26%',
            with: '100%',
          },
          {
            left: 200,
            right: 50,
            top: '65%',
            height: '26%',
          },
        ],
        xAxis: [
          {
            type: 'category',
            gridIndex: 0,
            boundaryGap: true, //坐标轴两边留白
            data: timeData,
            axisTick: {
              // 坐标刻度
              show: true,
              alignWithLabel: true,
              interval: 'auto',
            },
            axisLabel: {
              interval: 'auto',
            },
            axisLine: {
              lineStyle: {
                color: '#999999',
              },
            },
          },
          {
            gridIndex: 1,
            type: 'category',
            boundaryGap: true,
            data: timeData,
            position: 'bottom',
            axisTick: {
              show: true,
              alignWithLabel: true,
              interval: 'auto',
            },
            axisLabel: {
              interval: 'auto',
            },
            axisLine: {
              lineStyle: {
                color: '#999999',
              },
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: '',
            position: 'left',
            gridIndex: 0,
            axisLine: {
              lineStyle: {
                color: '#797874',
              },
            },
            splitLine: {
              //坐标分割线
              show: false,
            },
          },
          {
            type: 'value',
            name: 'T(℃)',
            position: 'left',
            gridIndex: 0,
            min: 0,
            max: 100,
            offset: 0,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#999999',
              },
            },
            axisTick: {
              show: true,
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
              },
            },
            // splitNumber: 1,
          },
          {
            type: 'value',
            name: 'RH(%)',
            gridIndex: 0,
            min: 0,
            max: 100,
            position: 'left',
            offset: 60,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#999999',
              },
            },
            splitLine: {
              show: false, // 是否显示坐标得横纵线
            },
            // splitNumber: 1,
            axisTick: {
              show: true,
            },
          },
          {
            type: 'value',
            name: 'R(mm)',
            gridIndex: 0,
            offset: 120,
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#999999',
              },
            },
            splitLine: {
              show: false,
            },
            // splitNumber: 1,
            axisTick: {
              show: true,
            },
          },
          {
            type: 'value',
            name: '',
            position: 'left',
            gridIndex: 1,
            axisLine: {
              lineStyle: {
                color: '#797874',
              },
            },
            splitLine: {
              show: false,
            },
          },
          {
            type: 'value',
            name: 'hPa',
            gridIndex: 1,
            offset: 0,
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#999999',
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
              },
            },
            // splitNumber: 1,
            axisTick: {
              show: true,
            },
          },
          {
            type: 'value',
            name: 'UV(m/s)',
            gridIndex: 1,
            offset: 60,
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#999999',
              },
            },
            splitLine: {
              show: false,
            },
            // splitNumber: 1,
            axisTick: {
              show: true,
            },
          },
        ],
        series: [
          {
            name: '温度(℃)',
            type: 'line',
            yAxisIndex: 1,
            xAxisIndex: 0,
            color: colors[0],
            data: maxTemp,
            symbol: 'circle',
            symbolSize: 6,
          },
          {
            name: '湿度(%)',
            type: 'line',
            color: colors[1],
            yAxisIndex: 2,
            xAxisIndex: 0,
            data: minRelHumidity,
            symbol: 'circle',
            symbolSize: 6,
          },
          {
            name: '降水(mm)',
            type: 'bar',
            color: colors[2],
            yAxisIndex: 3,
            xAxisIndex: 0,
            data: precipitation,
            symbol: 'circle',
            symbolSize: 6,
          },
          {
            name: '气压(hPa)',
            type: 'line',
            yAxisIndex: 5,
            xAxisIndex: 1,
            color: colors[3],
            data: stationpress,
            symbol: 'circle',
            symbolSize: 6,
          },
          {
            name: '风力(m/s)',
            type: 'line',
            yAxisIndex: 6,
            xAxisIndex: 1,
            color: colors[4],
            data: instantWindV,
            symbol: 'circle',
            symbolSize: 6,
          },
        ],
      }

      myChart.setOption(option)
    },
  },
}
</script>
