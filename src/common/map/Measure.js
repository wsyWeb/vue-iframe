import Draw from 'ol/interaction/Draw'
import { createRegularPolygon, createBox } from 'ol/interaction/Draw'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import Vue from 'vue'
import { unByKey } from 'ol/Observable.js'
import Overlay from 'ol/Overlay'
import { getArea, getLength } from 'ol/sphere.js'
import View from 'ol/View'
import { LineString, Polygon, Circle } from 'ol/geom.js'
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js'

const myVue = new Vue()
let draw = ''
export default {
  measure(map, type, num) {
    var geometryFunction, maxPoints
    let measureType = type
    if (type === 'Square') {
      measureType = 'Circle'
      geometryFunction = createRegularPolygon(4)
    } else if (type === 'Box') {
      measureType = 'Circle'
      // maxPoints = 2
      geometryFunction = createBox()
    }
    // var htmms = window.document.getElementsByClassName('measureNum')
    // var contHtml = window.document.getElementsByClassName('hidden')
    // // 删除上次测试的面积
    // for (var i = 0; i < htmms.length; i++) {
    // 	htmms[i].parentNode.removeChild(htmms[i])
    // }
    // for (var i = 0; i < contHtml.length; i++) {
    // 	contHtml[i].parentNode.removeChild(contHtml[i])
    // }

    if (draw) map.removeInteraction(draw)
    if (num == 1) return false
    // 绘图图层
    // var vector = getLayer('drawbox')
    var source = new VectorSource()
    console.log(vector, 'vector')
    // if (!vector) {
    var vector = new VectorLayer({
      id: 'lineAndArea',
      source: source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: 'red',
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: 'red',
          }),
        }),
      }),
    })
    vector.code = 'drawbox'
    map.addLayer(vector)
    vector.setZIndex(1000)
    // }
    /**
     * Currently drawn feature.
     * @sketch {module:ol/Feature~Feature}
     * @helpTooltipElement Element
     * @helpTooltip  {module:ol/Overlay}
     * @measureTooltipElement Element
     * @measureTooltip {module:ol/Overlay}
     */
    let sketch, helpTooltipElement, helpTooltip, measureTooltipElement, measureTooltip

    /**
     * Message to show when the user is drawing a polygon.
     * @type {string}
     */
    let continuePolygonMsg = '',
      /**
       * Message to show when the user is drawing a line.
       * @type {string}
       */
      continueLineMsg = ''

    /**
     * Handle pointer move.
     * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
     */
    let pointerMoveHandler = function(evt) {
      if (evt.dragging) return
      /** @type {string} */
      let helpMsg = '请点击开始绘制'

      if (sketch) {
        var geom = sketch.getGeometry()
        if (geom instanceof Polygon) {
          helpMsg = continuePolygonMsg
        } else if (geom instanceof LineString) {
          helpMsg = continueLineMsg
        }
      }

      helpTooltipElement.innerHTML = helpMsg
      helpTooltip.setPosition(evt.coordinate)

      helpTooltipElement.classList.remove('hidden')
    }

    map.on('pointermove', pointerMoveHandler)

    map.getViewport().addEventListener('mouseout', function() {
      helpTooltipElement.classList.add('hidden')
    })

    var draw
    var formatLength = function(line) {
      //获取投影坐标系
      var sourceProj = map.getView().getProjection()
      //ol/sphere里有getLength()和getArea()用来测量距离和区域面积，默认的投影坐标系是EPSG:3857, 其中有个options的参数，可以设置投影坐标系
      var length = getLength(line, { projection: sourceProj })
      //var length = getLength(line);
      var output
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km'
      } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm'
      }
      return output
    }

    var formatArea = function(polygon) {
      //获取投影坐标系
      var sourceProj = map.getView().getProjection()
      var area = getArea(polygon, { projection: sourceProj })
      //var area = getArea(polygon);
      //console.info(area)
      var output
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>'
      } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>'
      }
      return output
    }
    var getnums = function(polygon) {
      //获取投影坐标系
      var sourceProj = map.getView().getProjection()
      var area = getArea(polygon, { projection: sourceProj })
      //var area = getArea(polygon);
      //console.info(area)
      var output
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100
      } else {
        output = Math.round(area * 100) / 100
      }
      return output
    }

    function addInteraction() {
      draw = new Draw({
        source: source,
        type: measureType,
        //几何信息变更时调用函数
        geometryFunction: geometryFunction,
        //最大点数
        maxPoints: maxPoints,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2,
          }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.7)',
            }),
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)',
            }),
          }),
        }),
      })
      map.addInteraction(draw)

      createMeasureTooltip()
      createHelpTooltip()

      var listener
      // 面积
      var coordinates
      // 经纬度
      var lonLanArr
      draw.on(
        'drawstart',
        function(evt) {
          // set sketch
          sketch = evt.feature

          /** @type {module:ol/coordinate~Coordinate|undefined} */
          var tooltipCoord = evt.coordinate

          listener = sketch.getGeometry().on('change', function(evt) {
            var geom = evt.target
            var output
            if (geom instanceof Polygon) {
              output = formatArea(geom)
              coordinates = getnums(geom)
              lonLanArr = geom.flatCoordinates
              tooltipCoord = geom.getInteriorPoint().getCoordinates()
            } else if (geom instanceof LineString) {
              output = formatLength(geom)
              tooltipCoord = geom.getLastCoordinate()
            }
            measureTooltipElement.innerHTML = output
            measureTooltip.setPosition(tooltipCoord)
          })
        },
        this
      )

      draw.on(
        'drawend',
        function(evt) {
          measureTooltipElement.className = 'ol-tooltip ol-tooltip-static measureNum'
          measureTooltip.setOffset([0, -7])
          // unset sketch
          sketch = null
          // unset tooltip so that a new one can be created
          measureTooltipElement = null
          createMeasureTooltip()
          unByKey(listener)
          map.un('pointermove', pointerMoveHandler)

          let geom = evt.feature.get('geometry')
          console.log(geom.getCoordinates(), 'geom.getCoordinates()')
          map.removeInteraction(draw)
          myVue.$emit('func', {
            area: coordinates,
            lonlan: lonLanArr,
            dbArea: evt.target.sketchLineCoords_,
            coordinates: geom.getCoordinates(),
            measureType,
            num,
          })
          // 绘图事件失效
          draw.setActive(false)
          helpTooltipElement.classList.add('hidden')
          //console.info(helpTooltipElement.classList)
        },
        this
      )
    }

    function createHelpTooltip() {
      if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement)
      }
      helpTooltipElement = document.createElement('div')
      helpTooltipElement.className = 'ol-tooltip hidden'
      helpTooltip = new Overlay({
        // element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
      })
      map.addOverlay(helpTooltip)
    }

    function createMeasureTooltip() {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement)
      }
      measureTooltipElement = document.createElement('div')
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure'
      measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
      })
      map.addOverlay(measureTooltip)
    }
    // 量测调用
    addInteraction()
    // 通过图层编码获取图层
    function getLayer(code) {
      const layers = map.getLayers().getArray()
      for (let i = 0; i < layers.length; i++) {
        const item = layers[i]
        if (code === item.code) {
          return item
        }
      }
    }
  },

  myVue,
}
