<template>
  <div id="map">
    <ul class="flex_runnet opt">
      <li @click="handleClick('Point')">点绘制</li>
      <li @click="handleClick('LineString')" class="ml15_runnet">线绘制</li>
      <li @click="handleClick('Polygon')" class="ml15_runnet">面绘制</li>
      <li @click="handleClick('Circle')" class="ml15_runnet">圆绘制</li>
      <li @click="handleClick('Square')" class="ml15_runnet">正方形</li>
      <li @click="handleClick('Box')" class="ml15_runnet">长方形</li>
    </ul>
    <a-button id="screen-button" class="screen-btn">截图</a-button>
    <div id="photo-window" class="hide">
      <img id="photo" src="" alt="#" />
    </div>
  </div>
</template>

<script>
import rnMap from '@/common/map/rnMap'
import Measure from '@/common/map/Measure'
import { DragPan } from 'ol/control'

let dbmap = null
export default {
  data() {
    return {
      pan: null,
    }
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.initMap()
      this.bindEvent()
    })
  },
  methods: {
    initMap() {
      let _this = this
      const options = {
        scaleshow: true,
        viewParams: {
          projection: 'EPSG:4326',
          center: [103.816837, 29.406186],
          // minZoom: 8,
          maxZoom: 18,
          zoom: 8,
        },
        layerList: [
          {
            zIndex: 3,
            layertype: 'default',
            code: 'nsdj',
          },
        ],
      }
      dbmap = new rnMap('map', options)

      dbmap.map.on('click', e => {
        let feature = dbmap.map.forEachFeatureAtPixel(e.pixel, feature => {
          return feature
        })

        this.$emit('clickMap')
      })

      // 监听鼠标在地图移动
      dbmap.map.on('pointermove', function(e) {
        let feature = dbmap.map.forEachFeatureAtPixel(e.pixel, function(feature) {
          return feature
        })
        if (feature === undefined) {
          dbmap.map.getTargetElement().style.cursor = 'auto'
        } else {
          dbmap.map.getTargetElement().style.cursor = 'pointer'
        }
      })
      dbmap.map.getInteractions().forEach(function(element, index, array) {
        if (element instanceof DragPan) _this.pan = element
        console.log(_this.pan, 'qweqwe11111111111111111111111')
      })
    },
    handleClick(type, num = 0) {
      Measure.measure(dbmap.map, type, num)
    },
    bindEvent() {
      const _this = this
      document.getElementById('screen-button').addEventListener('click', e => {
        const mousedownEvent = e => {
          _this.pan.setActive(false)
          const [startX, startY] = [e.clientX, e.clientY]
          const divDom = document.createElement('div')
          divDom.id = 'screenshot'
          divDom.width = '1px'
          divDom.height = '1px'
          divDom.style.position = 'absolute'
          let [canvasX, canvasY] = [startX, startY]
          let canvasWidth, canvasHeight
          divDom.style.top = startY + 'px'
          divDom.style.left = startX + 'px'
          document.body.appendChild(divDom)
          const moveEvent = e => {
            const moveX = e.clientX - startX
            const moveY = e.clientY - startY
            if (moveX > 0) {
              divDom.style.width = moveX + 'px'
              canvasWidth = moveX
            } else {
              divDom.style.width = -moveX + 'px'
              divDom.style.left = e.clientX + 'px'
              canvasWidth = -moveX
              canvasX = e.clientX
            }
            if (moveY > 0) {
              divDom.style.height = moveY + 'px'
              canvasHeight = moveY
            } else {
              divDom.style.height = -moveY + 'px'
              divDom.style.top = e.clientY + 'px'
              canvasHeight = -moveY
              canvasY = e.clientY
            }
          }
          window.addEventListener('mousemove', moveEvent)
          window.addEventListener('mouseup', () => {
            window.removeEventListener('mousemove', moveEvent)
            window.removeEventListener('mousedown', mousedownEvent)
            _this.pan.setActive(true)
            getMapImg(canvasX, canvasY, canvasWidth, canvasHeight)
            document.body.removeChild(divDom)
            generateWindow()
          })
        }
        window.addEventListener('mousedown', mousedownEvent)
      })
    },
    getMapImg(startX, startY, mWidth, mHeight) {
      map.once('rendercomplete', () => {
        const mapCanvas = document.createElement('canvas')
        mapCanvas.width = mWidth
        mapCanvas.height = mHeight
        const mapContext = mapCanvas.getContext('2d')
        Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), function(canvas) {
          if (canvas.width > 0) {
            const opacity = canvas.parentNode.style.opacity
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity)
            const transform = canvas.style.transform
            // Get the transform parameters from the style's transform matrix
            const matrix = transform
              .match(/^matrix\(([^(]*)\)$/)[1]
              .split(',')
              .map(Number)
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix)
            mapContext.drawImage(canvas, -startX, -startY)
          }
        })
        if (navigator.msSaveBlob) {
          // link download attribute does not work on MS browsers
          navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png')
        } else {
          dataUrl = mapCanvas.toDataURL()
          console.log(dataUrl, 'dataUrl==>>>>>>>>>>>>>')
          // this.generateWindow(mWidth, mHeight)
        }
      })
      map.renderSync()
    },
    generateWindow(width, height) {
      document.getElementById('photo').src = dataUrl
      const boxDom = document.getElementById('photo-window')
      boxDom.classList.remove('hide')
      boxDom.style.left = 'calc(50% - ' + width / 2 + 'px)'
      boxDom.style.top = 'calc(50% - ' + height / 2 + 'px)'
    },
  },
}
</script>

<style scoped lang="less">
#screenshot {
  border: 3px solid black;
}
#photo-window {
  position: absolute;
  border: 25px solid rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.hide {
  display: none;
}
#map {
  width: 100%;
  height: 100%;
  .opt {
    position: absolute;
    z-index: 3;
    background: #fff;
  }
  .screen-btn {
    position: absolute;
    top: 80px;
    left: 10px;
    z-index: 3;
  }
}
</style>
<style>
.custom-mouse-position {
  position: absolute;
  right: 10px;
  bottom: 10px;
}
.ol-attribution {
  display: none;
}
</style>
