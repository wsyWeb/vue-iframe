import 'ol/ol.css'
import { Map, View, Feature, Overlay } from 'ol'
import { ScaleLine, FullScreen, Zoom, ZoomSlider, MousePosition, defaults as defaultControls } from 'ol/control'
import { createStringXY } from 'ol/coordinate'
import { Vector as VectorLayer, Tile as TileLayer, Image as ImageLayer } from 'ol/layer'
import { Point, Polygon, LineString, Circle as CircleFeature } from 'ol/geom'
import { Vector as VectorSource, TileWMS, ImageWMS, ImageStatic, OSM } from 'ol/source'
import { Fill, Circle, Stroke, Style, RegularShape, Icon, Text } from 'ol/style'
// import * as coord from '@/common/coord' //边界信息
// import * as turf from '@turf/turf'
import * as olProj from 'ol/proj'
import { GeoJSON } from 'ol/format'
import { cloneDeep } from 'lodash'
import { toSize } from 'ol/size'
// import { measure, clear } from './Measure'

//默认边界
let defaultBounds = [108.37, 18.1, 111.03, 20.1],
  defaultCenter = [109.77127, 19.14018],
  move_rocketcar_time = null //移动火箭车轨迹定时器

class Dbmap {
  constructor(id, options) {
    this.overlay = null
    options.viewParams.center = options.viewParams.center || defaultCenter
    this.map = new Map({
      target: id,
      controls: defaultControls({ zoom: false }).extend([]),
      view: new View(options.viewParams),
    })
    //是否显示鼠标划入显示坐标点
    this.map.addControl(
      new MousePosition({
        coordinateFormat: createStringXY(4), // 将坐标保留4位小数位，并转换为字符串
        projection: 'EPSG:4326', // 定义投影
        className: 'custom-mouse-position', // 控件的CSS类名
        target: document.getElementById('mouse-position'), // 将控件渲染在该DOM元素中
        undefinedHTML: '&nbsp;',
      })
    )
    // 是否显示缩放调整控件
    if (options.zoomshow) {
      this.map.addControl(new Zoom())
    }

    // 是否显示缩放滑块控件
    if (options.zoomslidershow) {
      this.map.addControl(new ZoomSlider())
    }
    // 是否显示全屏控件
    if (options.fullscreenshow) {
      this.map.addControl(
        new FullScreen({
          className: 'ol-controls-fullscreen',
        })
      )
    }
    //是否显示比例尺
    if (options.scaleshow) {
      this.map.addControl(
        new ScaleLine({
          units: 'metric',
        })
      )
    }
    // 初始化图层
    if (options.layerList) {
      this.loadLayers(options.layerList)
    }
  }

  /**
   * 加载地域图层
   * @param {*} layers 图层数组
   */
  loadLayers(layers) {
    layers.forEach(options => {
      // console.log(options);
      //定义参数layerParams,sourceParams
      var layerParams = options.params
      var sourceParams = {}
      // 替换url和params参数
      if (options.url) {
        sourceParams.url = options.url
        sourceParams.crossOrigin = 'anonymous'
        if (layerParams) {
          sourceParams.params = layerParams
        }
      }
      let layer = null
      let source = null
      if (options.layertype == 'default') {
        layer = new TileLayer()
        source = new OSM()
      } else if (options.layertype == 'Tile') {
        layer = new TileLayer(layerParams)
        source = new TileWMS(sourceParams)
      } else {
        layer = new ImageLayer(layerParams)
        source = new ImageWMS(sourceParams)
      }
      // 图层编码
      layer.code = options.code
      layer.zIndex = options.zIndex
      layer.setSource(source)
      this.map.addLayer(layer)
    })
  }
  /**
   * 获取图层
   * @param {*} code 图层编号
   * @returns
   */
  getLayer(code) {
    const layers = this.map.getLayers().getArray()
    if (layers.length > 0) {
      return layers.find(item => item.code === code)
    }
  }

  /**
   * 设置图层显示 / 隐藏
   * @param {*} code 图层编号
   * @param {*} bool 是否显示
   */
  showLayer(code, bool) {
    const layer = this.getLayer(code)
    if (layer) {
      layer.setVisible(bool)
    }
  }
  /**
   * 设置图层显示 包含的code也会显示 / 隐藏
   * @param {*} code 图层编号
   */
  showConcatLayer(code, bool) {
    const layers = this.map.getLayers().getArray()
    let exsitLayers = []
    if (layers.length > 0) {
      exsitLayers = layers.filter(item => item.code.includes(code))
    }
    if (exsitLayers.length > 0) {
      exsitLayers.forEach(layer => {
        layer.setVisible(bool)
      })
    }
  }
  updateMapSize() {
    this.map.updateSize()
  }
  /**
   * 设置图层 前置
   * @param {*} code 图层编号
   * @param {*} n zindex
   */
  setLayerIndex(code, n) {
    const layer = this.getLayer(code)
    if (layer) {
      layer.setZIndex(n)
    }
  }
  /**
   * 删除图层 包含的code也会删除
   * @param {*} code 图层编号
   */
  deleteConcatLayer(code) {
    const layers = this.map.getLayers().getArray()
    let exsitLayers = []
    if (layers.length > 0) {
      exsitLayers = layers.filter(item => item.code.includes(code))
    }
    if (exsitLayers.length > 0) {
      exsitLayers.forEach(layer => {
        this.map.removeLayer(layer)
      })
    }
  }
  /**
   * 设置图层透明度
   * @param {*} code 图层编号
   */
  setLayerOpacity(code, opacity) {
    const layers = this.map.getLayers().getArray()
    let exsitLayers = []
    if (layers.length > 0) {
      exsitLayers = layers.filter(item => item.code.includes(code))
    }
    if (exsitLayers.length > 0) {
      exsitLayers.forEach(layer => {
        layer.setOpacity(opacity)
      })
    }
  }
  /**
   * 删除图层
   * @param {*} code 图层编号
   */
  deleteLayer(code) {
    const layer = this.getLayer(code)
    if (layer) {
      // layer.getSource().clear();
      this.map.removeLayer(layer)
    }
  }
  // 删除所有的Overlays
  deleteAllOverlays() {
    // 将之前的overlay全部删除
    this.map.getOverlays().clear()
  }

  /**
   * 删除所有图层
   * @param {*} excludes 不删除的图层数组
   */
  deleteAllLayer(excludes = []) {
    var layers = this.map.getLayers().array_
    // 从末尾开始判断，以免删除后数组长度变化
    for (var i = layers.length; i > 0; i--) {
      if (!excludes.includes(layers[i - 1].code)) {
        this.map.removeLayer(layers[i - 1])
      }
    }
  }

  /**
   * 创建矢量图层VectorLayer
   * code： 图层编号
   */
  createLayer(code, options) {
    let layer = this.getLayer(code)
    if (layer) {
      layer.getSource().clear()
    } else {
      layer = new VectorLayer({
        source: new VectorSource(),
        ...options,
      })
      if (code) {
        layer.code = code
      }
      this.map.addLayer(layer)
    }
    return layer
  }

  /**
   * 创建一个点
   * @param {*} lon 经度
   * @param {*} lat 纬度
   * @param {*} option feature参数
   * @returns
   */
  createPoint(lon, lat, option) {
    const map = this.map
    var defaultOption = {
      geometry: new Point(olProj.transform([Number(lon), Number(lat)], 'EPSG:4326', map.getView().getProjection())),
      ...option,
    }
    const feature = new Feature(defaultOption)
    return feature
  }

  /**
   *  测量方法
   * @param {} type LineString距离 / Polygon面积
   * @param {} num 其他参数如剖面等
   */
  measureMap(type, num, vue) {
    measure(type, this.map, num, vue)
  }
  /**
   *  清除测量方法
   * @param {} type LineString距离 / Polygon面积
   * @param {} num 其他参数如剖面等
   */
  clearMap() {
    clear(this.map)
  }
  /**
   *  放大缩小地图
   * @param {} type 1放大， 0缩小
   */
  setZoom(type) {
    const zoom = this.map.getView().getZoom()
    if (type == 1) {
      this.map.getView().setZoom(zoom + 1)
    } else {
      this.map.getView().setZoom(zoom - 1)
    }
  }
  /**
   * 设置地图中心位置
   * @param {*} ALon 经度
   * @param {*} ALat 纬度
   */
  setCenter(ALon, ALat) {
    this.map.getView().setCenter([ALon, ALat])
    this.map.getView().setZoom(12)
  }

  /**
   * 加载图片图层
   * @param {*} data
   * @param {*} code
   */
  loadImageLayer(code, data, opacity) {
    let bounds = data.bounds ? data.bounds : defaultBounds
    const size = new toSize([0, 0])
    const imageSource = new ImageStatic({
      imageExtent: bounds,
      url: process.env.VUE_APP_API_BASE_URL + data.url,
      imageSize: size,
      projection: 'EPSG:4326',
    })

    let newimageLayer = new ImageLayer({
      opacity: opacity || 1,
      extent: bounds,
      source: imageSource,
      zIndex: 101,
    })
    newimageLayer.code = code

    this.map.addLayer(newimageLayer)
    // 解决雷达图的模糊化
    newimageLayer.on('postrender', function(evt) {
      evt.context.imageSmoothingEnabled = false
      evt.context.webkitImageSmoothingEnabled = false
      evt.context.mozImageSmoothingEnabled = false
      evt.context.msImageSmoothingEnabled = false
    })
  }

  /**
   * 加载敏感点
   * @param {*} code
   * @param {*} data
   */
  loadSensetivePoint(code, data) {
    const style = function(feature) {
      return new Style({
        image: new Icon({
          scale: 0.7,
          crossOrigin: 'anonymous',
          src: feature.get('pointData').img,
        }),
      })
    }
    let features = []
    data.forEach(d => {
      let feature = new Feature({
        geometry: new Point([d['lon'], d['lat']]),
        pointData: d,
      })

      feature.setStyle(style)
      features.push(feature)
    })
    const layer = this.createLayer(code, {
      zIndex: 101,
    })
    layer.getSource().addFeatures(features)
  }

  /**
   * feature 点击每个地图上面所有点的信息
   * container：最外层包含所有元素的div
   * content：显示弹出框具体内容的div
   * currData:想自己获取展示的具体数据信息
   */
  handlePopoverInfo(container, coodinate, data, code) {
    const overlay = new Overlay({
      type: 'pupop',
      id: code,
      //设置弹出框的容器
      element: container,
      //是否自动平移，即假如标记在屏幕边缘，弹出时自动平移地图使弹出框完全可见
      autoPan: true,
    })
    if (data) {
      overlay.setPosition(coodinate || defaultCenter)
      this.map.addOverlay(overlay)
    }
  }
  setOverlayPosition(coodinate, code) {
    const overlays = this.map.getOverlays().getArray()
    let curOverlay = null
    if (overlays.length > 0) {
      curOverlay = overlays.find(item => item.id === code)
    }
    if (curOverlay) curOverlay.setPosition(coodinate)
  }
  /**
   * 导出图片
   */
  exportImage(container, fileName = 'map.png') {
    const _this = this
    //此种方法生成得图片带有比例尺和缩放按钮
    // html2canvas(container, {
    //   allowTaint: true, ///允许跨域图片
    //   useCORS: true, //是否尝试使用CORS从服务器加载图像
    // }).then((canvas) => {
    //   // 转成图片，生成图片地址
    //   const imgUrl = canvas.toDataURL('image/png') //可将 canvas 转为 base64 格式
    //   console.log(imgUrl)
    //   // downloadIamge(imgUrl, 'map')
    // })
    // return
    this.map.once('postcompose', function(event) {
      const canvas = document.createElement('canvas')
      const size = _this.map.getSize()
      canvas.width = size[0]
      canvas.height = size[1]
      const mapContext = canvas.getContext('2d')
      Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), function(canvas) {
        if (canvas.width > 1) {
          const opacity = canvas.parentNode.style.opacity
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity)
          const transform = canvas.style.transform
          // Get the transform parameters from the style's transform matrix
          const matrix = transform
            .match(/^matrix\(([^\(]*)\)$/)[1]
            .split(',')
            .map(Number)
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix)
          mapContext.drawImage(canvas, 0, 0)
        }
      })
      let base64Img = ''
      if (navigator.msSaveBlob) {
        base64Img = canvas.msToBlob()
      } else {
        base64Img = canvas.toDataURL()
      }
      downloadFile(base64Img, fileName)
    })
    this.map.renderSync()
  }

  //安全射界图层
  // 10圈禁射区
  drawSafeRangeCricleLayer(centerPoint) {
    let layer = this.createLayer('safeRangeCricleLayer')
    layer.setZIndex(99)
    let feactures = []
    const style = function() {
      return new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.08)',
        }),
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 0.8)',
          width: 2,
        }),
      })
    }
    for (var i = 1; i <= 10; i += 1) {
      //画圆
      feactures.push(createCircleFeacture(centerPoint, i, 0, { borderColor: '#808080' }, this.map.getView().getProjection()))
      //标注
      let feacture = showMarkerName(centerPoint, i)
      if (feacture) {
        feactures.push(feacture)
      }
    }
    layer.getSource().addFeatures(feactures)
  }

  // 辐射线
  drawSafeRangeLineLayer(centerPoint, flag) {
    let layer = this.createLayer('safeRangeLineLayer')
    layer.setZIndex(99)
    let feactures = []
    for (var i = 0; i < 360; i += 15) {
      var pointToPoint = new Array()

      // if (i % 90 == 0) {
      //     centerPoint = centerPoint;
      // } else {
      //     // let xy = getLonLatR(i, 0.0012, centerPoint);
      //     // centerPoint = [xy.lon, xy.lat];
      // }
      // 存放两点的坐标
      pointToPoint.push(centerPoint)
      // 得到10公里处，角度为i处的坐标 ,r为公里数
      var lonlat = getLonLatByJiaodu(i, centerPoint)
      pointToPoint.push(lonlat)
      // 画辐射线(45°倍数为实线)
      if (i % 45 == 0) {
        // 标识角度
        feactures.push(showMarkerJiaodu(lonlat[0], lonlat[1], i, flag))
      }
      feactures.push(drawMyLine(pointToPoint, i, '#808080'))
    }

    layer.getSource().addFeatures(feactures)
  }

  // 绘制禁射区
  drawForbiddenArea(centerPoint, forbiddenArea) {
    let layer = this.createLayer('forbiddenAreaLayer')
    layer.setZIndex(100)
    let features = []
    //for循环
    for (var i = 0; i < forbiddenArea.length; i++) {
      if (forbiddenArea[i] != undefined) {
        let sector = sectorRing(
          centerPoint,
          parseFloat(forbiddenArea[i].startRadius) / 1000,
          parseFloat(forbiddenArea[i].endRadius) / 1000,
          forbiddenArea[i].startAngle,
          forbiddenArea[i].endAngle,
          this.map.getView().getProjection(),
          360
        )

        let feature = new Feature(sector)
        feature.setStyle(
          new Style({
            fill: new Fill({
              color: forbiddenArea[i].type == 0 ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 168, 0, 0.6)',
            }),
            stroke: new Stroke({
              color: 'rgba(255, 255, 255, 0.8)',
              width: 1,
            }),
            text: new Text({
              textAlign: 'center', // 对齐方式
              textBaseline: 'middle', // 文本基线
              font: 'normal 12px 微软雅黑', // 字体样式
              text: forbiddenArea[i].name + '',
              fill: new Fill({
                color: '#fff',
              }),
            }),
          })
        )
        features.push(feature)
      }
    }
    layer.getSource().addFeatures(features)
  }

  /**
   * 加载站点图层不同
   * @param {*} code
   * @param {*} data
   */
  loadWarnStation(code, data, index = 101) {
    const that = this
    const style = function(feature) {
      // 获取当前地图的缩放级别
      const zoom = that.map.getView().getZoom(),
        sta = feature.get('warStationInfo')
      let images = null,
        scale = 1
      if (sta.type === 1) {
        // images = require('@/views/common/map/img/tuli-bb.png')
      }

      return new Style({
        image: new Icon({
          scale: 1,
          crossOrigin: 'anonymous',
          src: images,
        }),
        // text: new Text({
        // 	offsetX: 10,
        // 	offsetY: 15,
        // 	text: sta.aid,
        // 	scale: 0.8,
        // 	font: 'normal 12px 微软雅黑',
        // 	fill: new Fill({
        // 		color: '#a234e1'
        // 	})
        // })
      })
    }
    let features = []
    data.forEach(d => {
      let feature = new Feature({
        geometry: new Point([Number(d['lon']), Number(d['lat'])]),
        warStationInfo: d,
        code: code,
      })

      feature.setStyle(style)
      features.push(feature)
    })
    const layer = that.createLayer(code, {
      zIndex: index,
    })
    layer.getSource().addFeatures(features)
  }
  //加载综合监控站点
  loadIntegratedStation(code, data, className, idx = 101) {
    const that = this
    const style = function(feature) {
      // 获取当前地图的缩放级别
      const zoom = that.map.getView().getZoom(),
        sta = feature[code],
        scale = 1
      // let images = require('@/views/common/map/img/integrated-monitor/normal.png'),
      //   icon = require('@/views/monitor/img/1-h.png'),
      //   offsetX = -40
      // if (sta.status === 2) {
      //   images = require('@/views/common/map/img/integrated-monitor/delay.png')
      //   offsetX = -36
      // } else if (sta.status === 3) {
      //   images = require('@/views/common/map/img/integrated-monitor/nodata.png')
      //   offsetX = -36
      // } else if (sta.status === 4) {
      //   images = require('@/views/common/map/img/integrated-monitor/uninline.png')
      //   offsetX = -40
      // }
      if (className === 'status') {
        return new Style({
          image: new Icon({
            scale: 1,
            crossOrigin: 'anonymous',
            src: images,
          }),
        })
      } else {
        return new Style({
          image: new Icon({
            scale: 0.8,
            crossOrigin: 'anonymous',
            src: icon,
            offset: [offsetX, -45],
            offsetOrigin: 'bottom-right',
            size: [100, 100],
          }),
        })
      }
    }
    let features = []
    data.forEach(d => {
      let feature = new Feature({
        geometry: new Point([Number(d['lon']), Number(d['lat'])]),
        integratedStationInfo: d,
      })
      feature[code] = d
      feature.setStyle(style)
      features.push(feature)
    })
    const layer = this.createLayer(code, {
      zIndex: idx,
    })
    layer.getSource().addFeatures(features)
  }
  /**
   * 加载数据统计站点
   * @param {*} code 图层名称
   * @param {*} data 数据数组
   * @param {*} type feature类型
   */
  loadDataStatisticStation({ code, data, type, featureKey }, zIndex = 101) {
    const style = function(feature) {
      const sta = feature.get('featureInfo')
      if (type === 'base') {
        return new Style({
          image: new Icon({
            scale: 1,
            crossOrigin: 'anonymous',
            // src: require('@/views/data-show/auto-station/img/map-bg.png'),
          }),
          text: new Text({
            offsetX: 30,
            offsetY: 22,
            text: sta.stationName,
            font: 'bold 14px 微软雅黑',
            fill: new Fill({
              color: '#1A339E',
              stroke: 1,
            }),
            stroke: new Stroke({ color: '#ffffff', width: 1 }),
          }),
        })
      } else {
        return new Style({
          text: new Text({
            offsetY: -4,
            textAlign: 'center',
            text: sta.max + ' / ' + sta.min,
            font: 'bold 14px 微软雅黑',
            fill: new Fill({ color: '#fff' }),
          }),
        })
      }
    }
    let features = []
    data.forEach(d => {
      let feature = new Feature({
        geometry: new Point([Number(d['lon']), Number(d['lat'])]),
        featureInfo: d,
      })
      feature['featureKey'] = featureKey
      feature.setStyle(style)
      features.push(feature)
    })
    const layer = this.createLayer(code, { zIndex })
    layer.getSource().addFeatures(features)
  }
  //绘制风暴
  drawStorm(code, storms) {
    const layer = this.createLayer('stormLayer_' + code, {
      zIndex: 105,
    })
    //以下数据可绘制
    // storms.push({
    // 	borderLons:
    // 		'110.615,110.61752,110.62009,110.62273,110.625,110.625,110.625,110.625,110.625,110.625,110.63746,110.641914,110.645004,110.645004,110.645004,110.64802,110.655,110.655,110.655,110.655,110.655,110.655,110.645645,110.638916,110.635,110.635,110.635,110.635,110.63275,110.629814,110.62721,110.62486,110.622696,110.62067,110.61873,110.61685,110.615,110.612274,110.609505,110.60665,110.605,110.605,110.605,110.605,110.605,110.60384,110.60171,110.59907,110.59568,110.59108,110.58436,110.575,110.575,110.575,110.575,110.575,110.575,110.581985,110.585,110.585,110.585,110.58809,110.59254,110.59615,110.59919,110.60181,110.60412,110.60621,110.60814,110.60995,110.61168,110.61335',
    // 	borderLats:
    // 		'19.145,19.155,19.155,19.155,19.15363,19.1476,19.143475,19.140436,19.138071,19.136154,19.145,19.145,19.143475,19.140144,19.137074,19.135,19.133207,19.129654,19.126154,19.122654,19.1191,19.115437,19.115,19.115,19.114607,19.11215,19.109373,19.106153,19.105,19.105,19.105,19.105,19.105,19.105,19.105,19.105,19.095001,19.095001,19.095001,19.095001,19.098679,19.10471,19.108833,19.111874,19.114237,19.115,19.115,19.115,19.115,19.115,19.115,19.115437,19.1191,19.122654,19.126154,19.129654,19.133207,19.135,19.137074,19.140144,19.143475,19.145,19.145,19.145,19.145,19.145,19.145,19.145,19.145,19.145,19.145,19.145',
    // 	stormNum: '1',
    // 	projAreaCentroid_x: 110.615,
    // 	projAreaCentroid_y: 19.126154,
    // 	projArea: 32.0346,
    // 	projAreaIncrease: -19.57104,
    // 	direction: 54.855156,
    // 	speed: 2.675731
    // })
    let color = '#9529fb',
      hour = ''
    switch (code) {
      case 1:
        color = '#FF6000'
        break
      case 2:
        color = '#FF0000'
        break
      case 3:
        hour = 10 / 60
        break
      case 4:
        hour = 20 / 60
        break
      case 5:
        hour = 30 / 60
        break
      case 6:
        hour = 60 / 60
        break
      default:
        color = '#9529fb'
        break
    }

    let features = new Array()
    storms.forEach(storm => {
      const lons = storm.borderLons.split(','),
        lats = storm.borderLats.split(',')
      const linePoints = []

      for (let i = 0; i < lons.length; i++) {
        let pointLonLat = [lons[i], lats[i]]
        if (code !== 1 && code !== 2 && code !== 7) {
          pointLonLat = formatStormPolygonLonLat(code, storm, hour, lons[i], lats[i], i)
        }

        linePoints.push(pointLonLat)
      }
      if (code === 7) {
        let arrowFeature = formatStormArrorFeature(code, storm, layer)
        console.log(code, arrowFeature)
      } else {
        let feature = new Feature({
          geometry: new Polygon([linePoints]),
        })
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: color,
              width: 2,
            }),
          })
        )
        features.push(feature)
        if (code === 2) {
          let feature = new Feature({
            geometry: new Point([storm.projAreaCentroid_x, storm.projAreaCentroid_y]),
            stormInfo: storm,
          })
          feature.setStyle(
            new Style({
              text: new Text({
                offset: [15, 125],
                text: feature.get('stormInfo').stormNum,
                scale: 1,
                font: 'normal 12px 微软雅黑',
                fill: new Fill({
                  color: '#000',
                }),
              }),
            })
          )
          features.push(feature)
        }
      }
    })

    layer.getSource().addFeatures(features)
  }
  //绘制移动火箭车轨迹
  drawMoveRocketCarLayer(params) {
    const pointList = params.data
    if (move_rocketcar_time) {
      clearTimeout(move_rocketcar_time)
      if (!params.draw) return
    }
    this.deleteLayer('move_rocketcar_trail')
    const layer = this.createLayer('move_rocketcar_trail', {
      zIndex: 106,
    })
    let move_idx = 0,
      pointFeature = null

    const fn = () => {
      let move_icon_idx = 1
      if (move_idx < pointList.length) {
        try {
          if (move_idx + 1 != pointList.length) {
            move_icon_idx = getImageSrc(
              pointList[move_idx].lonNow,
              pointList[move_idx].latNow,
              pointList[move_idx + 1].lonNow,
              pointList[move_idx + 1].latNow
            )
          }
          // const moveIconUrl = require(`@/views/operation-command/img/rocketcar/${move_icon_idx}.png`)
          if (pointFeature) layer.getSource().removeFeature(pointFeature) //如果火箭车已存在，先删除再绘制
          pointFeature = new Feature({
            geometry: new Point([pointList[move_idx].lonNow, pointList[move_idx].latNow]),
          })
          pointFeature.setStyle(
            new Style({
              image: new Icon({
                scale: 1,
                crossOrigin: 'anonymous',
                src: moveIconUrl,
              }),
            })
          )
          layer.getSource().addFeature(pointFeature)
          const lineFeature = drawMyLine(
            [
              [pointList[move_idx].lonNow, pointList[move_idx].latNow],
              [pointList[move_idx + 1].lonNow, pointList[move_idx + 1].latNow],
            ],
            0,
            '#ee0ed6'
          )
          layer.getSource().addFeature(lineFeature)
          move_rocketcar_time = setTimeout(fn, 200) //循环绘制
          move_idx += 1
        } catch (err) {
          clearTimeout(move_rocketcar_time)
        }
      }
    }
    fn()
  }
  //绘制风暴追踪
  drawStmtraLayer(code, data) {
    const layer = this.createLayer(code, {
      zIndex: 105,
    })
    // const fbzzDatas = [...data, ...fbzz.trackings]
    const fbzzDatas = data
    fbzzDatas.forEach(track => {
      let curPoint = new Point(track.current_time),
        historyFeatures = [], //历史轨迹
        pushfeatures = [] //外推轨迹
      if (track.pre_time && track.pre_time.length > 0) {
        for (let i in track.pre_time) {
          // const x1 = Number(track.pre_time[i].mainpoint[0]) - Number(track.radius) * 1000,
          // 	x2 = Number(track.pre_time[i].mainpoint[0]) + Number(track.radius) * 1000
          // console.log([x1, track.pre_time[i].mainpoint[1]], [x2, track.pre_time[i].mainpoint[1]])
          // const feature = new Feature({
          // 	geometry: new LineString([
          // 		[x1, track.pre_time[i].mainpoint[1]],
          // 		[x2, track.pre_time[i].mainpoint[1]]
          // 	])
          // })
          historyFeatures.push(track.pre_time[i].mainpoint)
        }
      }
      if (track.next_time && track.next_time.length > 0) {
        for (let j in track.next_time) {
          pushfeatures.push(track.next_time[j])
        }
      }

      const textFeature = new Feature({
        geometry: curPoint,
      })
      textFeature.setStyle(
        new Style({
          text: new Text({
            offsetX: 15,
            offsetY: -8,
            text: track.id + '',
            scale: 1,
            font: 'normal 12px 微软雅黑',
            fill: new Fill({
              color: '#FF0000',
            }),
          }),
        })
      )
      if (historyFeatures.length > 0) {
        //历史轨迹线
        const history_line = new Feature({
          geometry: new LineString(historyFeatures),
        })
        history_line.setStyle(
          new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 1,
            }),
          })
        )
        //历史到当前风暴的线
        const cur_his_line = drawMyLine([curPoint.getCoordinates(), historyFeatures[0]], 0, 'red')
        layer.getSource().addFeature(cur_his_line)
        layer.getSource().addFeature(history_line)
      }

      if (pushfeatures.length > 0) {
        const push_line = new Feature({
          geometry: new LineString(pushfeatures),
        })
        push_line.setStyle(
          new Style({
            stroke: new Stroke({
              color: '#00FF00',
              width: 1,
            }),
          })
        )
        //外推到当前风暴的线
        const cur_push_line = drawMyLine([curPoint.getCoordinates(), pushfeatures[0]], 0, '#00FF00')
        layer.getSource().addFeature(cur_push_line)
        layer.getSource().addFeature(push_line)
      }

      layer.getSource().addFeature(textFeature)
    })
  }
  //绘制案例管理中作业点位置
  loadPointLayer(code, data) {
    const layer = this.createLayer(code, {
      zIndex: 105,
    })
    const style = () => {
      return new Style({
        stroke: new Stroke({
          color: '#FF0000',
          width: 2,
        }),
      })
    }
    let features = []
    data.forEach(item => {
      const feature1 = new Feature({
        geometry: new CircleFeature([Number(item.gpsLon), Number(item.gpsLat)], 0.001),
      })
      const feature2 = new Feature({
        geometry: new CircleFeature([Number(item.gpsLon), Number(item.gpsLat)], 0.09),
      })
      feature1.setStyle(style)
      feature2.setStyle(style)
      features.push(feature1, feature2)
    })

    layer.getSource().addFeatures(features)
  }
}

/***************************************安全射界区域扇形常用形状封装*****************************************/
/**
 * 扇形环（安全射界）
 * @param center 圆心[x,y]
 * @param startR 起始半径（KM）
 * @param endR 终止半径（KM）
 * @param startAngle 起始角度（正北为0,顺时针为正）
 * @param endAngle 结束角度
 * @param projection 返回坐标的投影坐标系（默认EPSG:4326）
 * @param size 点数量（默认50）
 * @constructor
 */
function sectorRing(center, startR, endR, startAngle, endAngle, projection, size) {
  //获取到起始半径圆弧的点坐标
  var sPoints = arcPoints(center, startR, startAngle, endAngle, projection, size)
  //获取到结束半径圆弧的点坐标
  var ePoints = arcPoints(center, endR, endAngle, startAngle, projection, size)

  //连接两段圆弧
  ePoints.forEach(function(node) {
    sPoints.push(node)
  })
  //连接起点
  sPoints.push(sPoints[0])
  return new Polygon([sPoints])
}
/**
 * 计算圆弧上的点坐标
 * @param center 圆心[x,y]
 * @param r 半径（KM）
 * @param startAngle 起始角度（正北为0,顺时针为正）
 * @param endAngle 结束角度
 * @param projection 返回坐标的投影坐标系（默认EPSG:4326）
 * @param size 点数量（默认50）
 * @constructor
 */
function arcPoints(center, r, startAngle, endAngle, projection, size) {
  //获取投影的单位
  var units = projection ? projection.getUnits() : 'degrees'
  //中心经纬度坐标转换为指定投影坐标
  var mcenter = projection ? olProj.transform(center, 'EPSG:4326', projection) : center
  //半径转换
  var dr = units == 'm' ? r * 1000 : r / 111
  //角度转换为弧度制
  var sAngle = (startAngle * Math.PI) / 180
  var eAngle = (endAngle * Math.PI) / 180
  //点数默认为50
  size = size ? size : 50
  //每一个点相差的角度
  var dAngle = (eAngle - sAngle) / size

  //计算弧度线上的点
  var points = new Array()
  for (var i = 0; i <= size; i++) {
    points.push([mcenter[0] + dr * Math.sin(sAngle + i * dAngle), mcenter[1] + dr * Math.cos(sAngle + i * dAngle)])
  }
  return points
}
/**
 * 创建一个圆圈的feacture
 * @param centerPoint 经纬度[]
 * @param r  半径
 * @param type  线的类型 1虚线,2实线
 * @param color 线的颜色
 */
function createCircleFeacture(centerPoint, r, type, color, projection) {
  // var cil = 0.00899322029299999989; center 1, 0
  // let feacture = new Feature({
  //     geometry: new GeomCircle(centerPoint, cil * r),
  // });
  let sectorRingins = sectorRing(centerPoint, 0, r, 0, 360, projection)
  // 圆圈的样式单独设置
  let style = new Style({
    fill: new Fill({
      color: color.fillColor || 'rgba(255,255,255,0)',
    }),
    // 边线颜色
    stroke: new Stroke({
      color: color.borderColor || '#808080',
      width: 1,
      // lineCap: 'square',
      // lineDashOffset: 100
      // lineDash: type == 1 ? [0] : [5]
    }),
  })
  let feacture = new Feature(sectorRingins)
  feacture.setStyle(style)
  return feacture
}
function showMarkerName(centerPoint, juli) {
  // 距离标识
  var currentjuli = juli * 0.00899322029299999989
  //仅标出1km和10km
  if (juli == 1 || juli == 10) {
    // 当前的横坐标
    var currentLon = centerPoint[0] + currentjuli
    // 当前的纵坐标
    var currentLat = centerPoint[1]

    var labelName = juli + 'km'

    let feacture = new Feature({
      geometry: new Point([Number(currentLon), Number(currentLat)]),
    })
    feacture.setStyle(
      new Style({
        fill: new Fill({
          color: 'rgba(37,241,239,0.2)',
        }),
        text: new Text({
          text: labelName,
          offsetX: 15,
          offsetY: -10,
          fill: new Fill({
            // color: "#ffcc33",
            color: '#808080',
          }),
        }),
      })
    )
    return feacture
  }
  return null
}

function getLonLatByJiaodu(jiaodu, centerPoint, length = 10) {
  var jiaodu1 = (Math.PI * 1 * jiaodu) / 180
  //length为公里数
  var r = length * 0.00899322029299999989
  var x = r * Math.sin(jiaodu1) * 1 + centerPoint[0]
  var y = r * Math.cos(jiaodu1) * 1 + centerPoint[1]
  return [parseFloat(x), parseFloat(y)]
}

//标识角度
function showMarkerJiaodu(operationLon, operationLat, jiaodu, flag) {
  var labelName = jiaodu + '°'
  if (flag == 2) {
    labelName = ((parseInt(jiaodu) * 100) / 6).toFixed(0)
  }
  let x, y
  if (jiaodu == 0) {
    x = 0
    y = -10
  }
  if (jiaodu == 45) {
    x = 10
    y = -10
  }
  if (jiaodu == 90) {
    x = 15
    y = 0
  }
  if (jiaodu == 135) {
    x = 10
    y = 10
  }
  if (jiaodu == 180) {
    x = 0
    y = 15
  }
  if (jiaodu == 225) {
    x = -10
    y = 10
  }
  if (jiaodu == 270) {
    x = -20
    y = 0
  }
  if (jiaodu == 315) {
    x = -10
    y = -10
  }
  var style_point = new Style({
    fill: new Fill({
      color: 'rgba(37,241,239,0.2)',
    }),
    text: new Text({
      text: labelName,
      offsetX: x, //Math.sin((jiaodu / 180) * Math.PI) * 15,
      offsetY: y, //Math.cos((jiaodu / 180) * Math.PI) * 15,
      fill: new Fill({
        // color: "#ffcc33",
        color: '#808080',
      }),
    }),
  })
  let feacture = new Feature({
    geometry: new Point([Number(operationLon), Number(operationLat)]),
  })
  feacture.setStyle(style_point)
  return feacture
}

// 两点画线方法
function drawMyLine(pointList, angle, color) {
  let feature = new Feature({
    geometry: new LineString(pointList),
  })
  if (angle % 45 == 0) {
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          // color: "#ffcc33",
          color: color || 'black',
          width: 1,
        }),
      })
    )
  } else {
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: color || 'black',
          width: 1,
          lineDash: [3, 6],
        }),
      })
    )
  }
  return feature
}

function downloadFile(url, fileName) {
  const a = document.createElement('a') // 生成一个a元素
  const event = new MouseEvent('click') // 创建一个单击事件
  a.download = fileName || 'map' // 设置图片名称
  a.href = url // 将生成的URL设置为a.href属性
  a.dispatchEvent(event) // 触发a的单击事件
}

function formatStormPolygonLonLat(code, storm, hour, lon, lat, i) {
  //边界点的起始角/ 边界点的展角
  let start_az = 0,
    delta_az = 5

  //风暴投影面积、面积增长
  try {
    let proj_area = Number(storm.projArea),
      proj_area_increase = Number(storm.projAreaIncrease)
    //外推后的面积
    let push_proj_area = proj_area + proj_area_increase * hour
    if (push_proj_area <= 0) return []
    let scale = Math.sqrt(push_proj_area / proj_area), //计算半径比例
      storm_lon = (storm.projAreaCentroid_x && Number(storm.projAreaCentroid_x)) || 110.615, //风暴中心经纬度
      storm_lat = (storm.projAreaCentroid_y && Number(storm.projAreaCentroid_y)) || 19.126154,
      direction = Number(storm.direction), //外推方向
      speed = Number(storm.speed) //速度

    //风暴外推过后的中心点
    let push_center_lon = storm_lon + ((speed * Math.sin((Math.PI * direction) / 180)) / 111) * hour,
      push_center_lat = storm_lat + ((speed * Math.cos((Math.PI * direction) / 180)) / 111) * hour

    const d = distance(lon, lat, storm_lon, storm_lat) //计算中心到点的距离
    const push_distance = d * scale //计算变换后的距离
    //换算为点坐标
    let push_lon = push_center_lon + push_distance * Math.sin((Math.PI * (start_az + delta_az * i)) / 180),
      push_lat = push_center_lat + push_distance * Math.cos((Math.PI * (start_az + delta_az * i)) / 180)
    return [push_lon, push_lat]
  } catch (err) {
    console.log(err, '报错了')
  }
}
function formatStormArrorFeature(code, storm, layer) {
  //风暴投影面积、面积增长
  let proj_area = Number(storm.projArea),
    proj_area_increase = Number(storm.projAreaIncrease),
    hour = 0.5, //外推30分钟后的面积
    push_proj_area = proj_area + proj_area_increase * hour
  //判断外推后风暴是否消失
  if (push_proj_area <= 0) return true
  //风暴中心经纬度 外推方向/速度
  let storm_lon = (storm.projAreaCentroid_x && Number(storm.projAreaCentroid_x)) || 110.615,
    storm_lat = (storm.projAreaCentroid_y && Number(storm.projAreaCentroid_y)) || 19.126154,
    direction = Number(storm.direction),
    speed = Number(storm.speed)

  //风暴外推过后的中心点
  const push_center_lon_30 = storm_lon + ((speed * Math.sin((Math.PI * direction) / 180)) / 111) * hour,
    push_center_lat_30 = storm_lat + ((speed * Math.cos((Math.PI * direction) / 180)) / 111) * hour
  drawLineArrow(storm_lon, storm_lat, push_center_lon_30, push_center_lat_30, layer, { lineWidth: 2, lineColor: '#FF0000' })

  //外推60分钟后的面积
  hour = 1
  push_proj_area = proj_area + proj_area_increase * hour

  //判断外推后风暴是否消失
  if (push_proj_area <= 0) return true
  const push_center_lon_60 = storm_lon + ((speed * Math.sin((Math.PI * direction) / 180)) / 111) * hour,
    push_center_lat_60 = storm_lat + ((speed * Math.cos((Math.PI * direction) / 180)) / 111) * hour
  drawLineArrow(storm_lon, storm_lat, push_center_lon_60, push_center_lat_60, layer, { lineWidth: 5, lineColor: '#FF0000' })
}
/**
 * 计算两点间的距离
 * @param lon0 第一个点的经度
 * @param lat0 第一个点的纬度
 * @param lon1 第二个点的经度
 * @param lat1 第二个点的纬度
 */
function distance(lon0, lat0, lon1, lat1) {
  return Math.sqrt(Math.pow(lon1 - lon0, 2) + Math.pow(lat1 - lat0, 2))
}

/**
 *  画线带箭头
 * @param {*} strlon 起始经度
 * @param {*} strlat 起始纬度
 * @param {*} endlon 结束经度
 * @param {*} endlat 结束纬度
 * @param {*} layer 图层
 */
function drawLineArrow(strlon, strlat, endlon, endlat, layer, params = {}) {
  // 线
  const line2 = new LineString([
    [strlon * 1, strlat * 1],
    [endlon * 1, endlat * 1],
  ])
  const feature = new Feature(line2)
  feature.attr = 'line'
  const style = arrowStyle(feature, params)
  feature.setStyle(style)
  layer.getSource().addFeature(feature)
}

/**
 * 偏移风暴的样式以及箭头
 * @param {*} feature
 * @returns
 */
function arrowStyle(feature, params) {
  var styles = [
    new Style({
      stroke: new Stroke({
        color: params.lineColor || '#0066ff',
        width: params.lineWidth || 2,
      }),
      zIndex: 10,
    }),
  ]
  // 箭头
  var arrow = document.createElement('canvas')
  arrow.width = 20
  arrow.height = 20
  var ctx = arrow.getContext('2d')
  ctx.strokeStyle = params.lineColor || '#0066ff' // 箭头颜色
  ctx.lineWidth = params.lineWidth || 2 // 箭头线条粗细
  ctx.moveTo(0, 5)
  ctx.lineTo(10, 10)
  ctx.lineTo(0, 15)
  ctx.stroke()

  var geometry = feature.get('geometry')
  geometry.forEachSegment(function(start, end) {
    // 计算旋转角度
    var dx = end[0] - start[0]
    var dy = end[1] - start[1]
    var rotation = Math.atan2(dy, dx)
    // 添加箭头样式
    styles.push(
      new Style({
        geometry: new Point(end),
        image: new Icon({
          img: arrow,
          imgSize: [arrow.width, arrow.height],
          rotation: -rotation,
        }),
      })
    )
  })
  return styles
}

function getImageSrc(clon, clat, nlon, nlat) {
  var y = nlat - clat
  var x = nlon - clon
  //第一象限
  if (x >= 0 && y >= 0) {
    //y/x
    var angle = (Math.atan(y / x) * 180) / Math.PI //45，arctan1 = 45°
    if (angle < 22.5) {
      return 1
    } else if (angle > 67.5) {
      return 3
    } else {
      return 2
    }
  }

  //第二象限
  if (x <= 0 && y > 0) {
    //x/y
    var angle = (Math.atan(x / y) * 180) / Math.PI //45，arctan1 = 45°
    if (angle > -22.5) {
      return 3
    } else if (angle < -67.5) {
      return 5
    } else {
      return 4
    }
  }

  //第三象限
  if (x <= 0 && y <= 0) {
    //y/x
    var angle = (Math.atan(y / x) * 180) / Math.PI //45，arctan1 = 45°
    if (angle < 22.5) {
      return 5
    } else if (angle > 67.5) {
      return 7
    } else {
      return 6
    }
  }

  //第四象限
  if (x >= 0 && y <= 0) {
    //x/y
    var angle = (Math.atan(y / x) * 180) / Math.PI //45，arctan1 = 45°
    if (angle > -22.5) {
      return 1
    } else if (angle < -67.5) {
      return 7
    } else {
      return 8
    }
  }
  return 1
}
export default Dbmap
