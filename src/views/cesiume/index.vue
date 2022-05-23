<template>
  <div id="topContainer" :class="{ 'full-screen': isFullScreen }" class="app-container">
    <div id="cesiumContainer" />
    <div class="tuli bg-white">
      <a-checkbox-group @change="changeStationStatus" :default-value="checkedValue">
        <a-row>
          <a-col :span="24" class="m-b-xs">
            <a-checkbox :value="1">高炮作业点</a-checkbox>
          </a-col>
          <a-col :span="24" class="m-b-xs">
            <a-checkbox :value="2">火箭作业点</a-checkbox>
          </a-col>
        </a-row>
      </a-checkbox-group>
    </div>
    <div class="station-modal" id="stationModal">
      <div class="title">{{ selectStation.jobSpotName }}{{ selectStation.deviceType === 1 ? '高炮' : '火箭' }}站点</div>
      <a-row :gutter="20" class="body">
        <a-col :span="12">{{ selectStation.controlZone }}{{ selectStation.jobSpotName }}</a-col>
        <a-col :span="12">经纬度：{{ selectStation.jobSpotLon }},{{ selectStation.jobSpotLan }}</a-col>
        <a-col :span="12">海拔：{{ selectStation.altitude }}</a-col>
        <a-col :span="12">建设时间：{{ selectStation.jobSpotLon }}</a-col>
        <a-col :span="12">管控面积：{{ selectStation.jobSpotLon }}</a-col>
        <a-col :span="12">下垫面：</a-col>
        <a-col :span="24">装备类型：xxxxxx</a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
import CesiumTools from '@/views/cesiume/CesiumTools'
import screenfull from 'screenfull'
import { stationList } from './station'
const cesiumTools = CesiumTools.getInstance()
let viewer = null
let handler = null

export default {
  name: 'MapHomeNew',
  data() {
    return {
      map: null,
      isFullScreen: false,
      areaMarkers: [],
      stationMarkers: [],
      currentMode: 'area',
      stationIndex: 1,
      list: [],
      currentCity: '540000',
      loginForm: {
        username: 'admin',
        password: 'admin',
      },
      tabPosition: '',
      local: localStorage.getItem('regionId'),
      allStation: stationList,
      checkedValue: [1, 2],
      stationEntities: null,
      selectStation: {},
    }
  },
  computed: {
    fullscreenIcon() {
      return this.isFullScreen ? 'exit-fullscreen' : 'fullscreen'
    },
  },
  watch: {
    xfcHandleType: function(val) {
      if (val === '2') {
        this.addKeyDownEvent()
      }
    },
  },
  mounted() {
    this.initCesium()
    // this.initStationList()
  },
  beforeDestroy() {
    // this.destory3D()
  },
  methods: {
    setFullscreen() {
      this.$emit('onScreenfull')
    },
    changeStationStatus(value) {
      let checkstate = []
      this.allStation.forEach(item => {
        if (value.includes(Number(item.deviceType))) {
          checkstate.push(item)
        }
      })
      this.initStationData(checkstate)
    },
    initCesium() {
      viewer = cesiumTools.initViewer('cesiumContainer')
      // cesiumTools.loadImageryProvider('//t0.tianditu.com/img_w/wmts?tk=fb7d7dbda854373c6a925ca2dfeac14e')
      this.$root.viewer = viewer
      const _this = this
      window.setTimeout(function() {
        _this.setCesiumView(91.77099, 29.24008)
        // _this.setCesiumViewLngLat(91.77099, 29.24008)
        // _this.initStationData(_this.allStation)
      }, 1000)
      // 全屏处理
      document.onkeydown = e => {
        if (e.code === 'F11') {
          e.preventDefault()
          screenfull.request()
        }
        if (e.code === 'Escape') {
          e.preventDefault()
          screenfull.exit()
        }
      }
      screenfull.on('change', () => {
        this.isFullscreen = screenfull.isFullscreen
      })

      viewer.scene.camera.moveEnd.addEventListener(function() {
        var currentMagnitude = viewer.camera.getMagnitude()
      })
      this.addEvent()
    },
    _getBillboard(image) {
      return {
        image,
        width: 40,
        height: 40,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        verticalOrigin: cesiumTools.Cesium.VerticalOrigin.BOTTOM,
        heightReference: cesiumTools.Cesium.HeightReference.CLAMP_TO_GROUND,
      }
    },
    setCesiumView() {
      const center = cesiumTools.Cesium.Cartesian3.fromDegrees(91.7786751, 29.2430269)
      viewer.camera.lookAt(center, cesiumTools.Cesium.Cartesian3(0.0, -4790000.0, 3930000.0))
      // viewer.camera.setView({
      //   destination: new cesiumTools.Cesium.Cartesian3.fromDegrees(91.7786751, 29.2430269),
      //   orientation: {
      //     pitch: -0.5932581119570622,
      //     roll: 6.282900622632994,
      //     heading: 0.19762932161294586,
      //   },
      // })
    },
    setCesiumViewLngLat(lng, lat) {
      viewer.camera.setView({
        destination: cesiumTools.Cesium.Cartesian3.fromDegrees(lng, lat, 150000),
        orientation: {
          heading: cesiumTools.Cesium.Math.toRadians(0, 0),
          // 视角
          pitch: cesiumTools.Cesium.Math.toRadians(-25),
          roll: 0,
        },
      })
    },
    initAreaData() {
      const _this = this,
        _textColor = '#e3cc15',
        allArea = this.$store.state.areaData || []
      for (let i = 0; i < allArea.length; i++) {
        const item = allArea[i]
        if (item.code !== '540523') {
          var _pb = new cesiumTools.Cesium.PropertyBag()
          _pb.addProperty('item', item)
          // _pb.addProperty('type', type)
          viewer.entities.add({
            id: item.name + (i + 1),
            name: item.name,
            position: cesiumTools.Cesium.Cartesian3.fromDegrees(Number(item.longitude), Number(item.latitude), Number(0) + 10),
            // properties: _pb,
            billboard: {
              image: '/static/images/area.png',
              verticalOrigin: cesiumTools.Cesium.VerticalOrigin.BOTTOM,
              show: true, // default
              width: 80, // default: undefined
              heightReference: cesiumTools.Cesium.HeightReference.CLAMP_TO_GROUND,
            },
            label: {
              text: item.name,
              font: 'normal 32px MicroSoft YaHei',
              scale: 0.5, //字体大小
              fillColor: cesiumTools.Cesium.Color.fromCssColorString(_textColor),
              style: cesiumTools.Cesium.LabelStyle.FILL,
              showBackground: false,
              horizontalOrigin: cesiumTools.Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: cesiumTools.Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new cesiumTools.Cesium.Cartesian2(0, -10), // 调整偏移位置
            },
          })
        }
      }
    },
    initStationData(data) {
      let makers = this.allStation.map(i => i.jobSpotCode)
      this.clearMakers(makers)
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        const image = item.deviceType === 1 ? '/static/images/hj.png' : '/static/images/gp.png'
        const _pb = new cesiumTools.Cesium.PropertyBag()
        _pb.addProperty('stationItem', item)
        if (item.jobSpotLan && item.jobSpotLan && Number(item.spotType) === 1) {
          this.stationEntities = viewer.entities.add({
            id: item.jobSpotCode,
            name: item.jobSpotName,
            position: cesiumTools.Cesium.Cartesian3.fromDegrees(Number(item.jobSpotLon), Number(item.jobSpotLan), Number(0) + 10),
            properties: _pb,
            billboard: {
              image: image,
              verticalOrigin: cesiumTools.Cesium.VerticalOrigin.BOTTOM,
              show: true, // default
              width: 100, // default: undefined
              heightReference: cesiumTools.Cesium.HeightReference.CLAMP_TO_GROUND,
            },
          })
        }
      }
    },
    clearMakers(makers) {
      for (let i = 0; i < makers.length; i++) {
        viewer.entities.removeById(makers[i])
      }
    },

    fullscreenButtonClick() {
      if (!screenfull.enabled) {
        this.$message({
          message: '浏览器不支持全屏',
          type: 'warning',
        })
        return false
      }
      screenfull.toggle()
    },

    addEvent() {
      const _this = this
      handler = new cesiumTools.Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      // 鼠标左键点击事件
      handler.setInputAction(movement => {
        const position = movement.position
        const ref = document.getElementById('stationModal')
        const pickedFeature = viewer.scene.pick(movement.position)
        if (!pickedFeature || !pickedFeature.id) {
          ref.style.display = 'none'
          return
        }
        const entity = pickedFeature.id
        _this.selectStation = entity._properties.stationItem._value
        // const item = entityProperties.item._value
        // const type = entityProperties.type._value
        ref.style.display = 'block'
        ref.style.left = position.x + 30 + 'px'
        ref.style.top = position.y - 200 + 'px'
        return
      }, cesiumTools.Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    destory3D() {
      viewer.entities.removeAll()
      viewer.destroy()
      const gis = document.getElementById('cesiumContainer')
      gis.style.display = 'none'
      document.getElementById('topContainer').removeChild(gis)
      document.body.appendChild(gis)
    },
    getCurSetting() {
      console.log(viewer.camera.position)
      console.log(viewer.camera.pitch)
      console.log(viewer.camera.roll)
      console.log(viewer.camera.heading)
    },

    toEditPageRow(row) {
      /*
      this.$router.push({
        name: 'WeathStationEdit1',
        query: {
          weathStationId: row.id,
          weathStationCode: row.code,
          weathStationName: row.name,
          cityCode: row.area
        }
      })
      */
      this.$router.push({
        name: 'ModelView',
        query: {
          weathStationCode: row.code,
          weathStationId: row.id,
          weathStationName: row.name,
          latitude: row.latitude,
          longitude: row.longitude,
          cityCode: row.area,
          parent: 'MapHomeNew',
        },
      })
    },
  },
}
</script>

<style lang="less">
#topContainer {
  .app-container,
  #cesiumContainer {
    position: absolute;
    padding: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .tuli {
    position: absolute;
    right: 50px;
    bottom: 50px;
    border-radius: 5px;
    padding: 10px;
  }
  .station-modal {
    display: none;
    position: absolute;
    background-image: url('/static/images/tc.png');
    height: 200px;
    width: 420px;
    background-size: cover;
    font-size: 15px;
    .title {
      color: #fff;
      line-height: 48px;
      padding-left: 24px;
    }
    .body {
      line-height: 32px;
      padding-top: 16px;
    }
    .ant-col {
      padding-left: 25px !important;
    }
  }
}
</style>
