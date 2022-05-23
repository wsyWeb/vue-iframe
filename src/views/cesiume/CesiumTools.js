import * as Cesium from 'cesium/Source/Cesium.js'
import buildModuleUrl from 'cesium/Source/Core/buildModuleUrl'
import 'cesium/Source/Widgets/widgets.css'

const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MmJhZTAwOS0yYjU2LTRlZjMtYTU0NC1hYzYwN2E4NjVlMDciLCJpZCI6ODU5NCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MjM1NzQxN30.hGgpnswVStqJQoq5WLblAalgwxwNE6dTHAVgPZCLEJ0'
const buildModulePath = '/static/Cesium/'

export default class CesiumTools {
  constructor() {
    this.accessToken = accessToken
    this.buildModuleUrl = buildModulePath
    this.container = null
    this.viewer = null
    this.handler = null
    this.Cesium = Cesium
    this._tooltip = null
    this.instance = null
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new CesiumTools()
    }
    return this.instance
  }

  /**
   * 创建一个tip
   * @returns {HTMLDivElement}
   * @private
   */
  _createTooltip() {
    const div = document.createElement('div')
    div.className = 'cesium-tools-tip'
    div.style.backgroundColor = 'rgba(48, 51, 54, 0.8)'
    div.style.color = '#edffff'
    div.style.padding = '5px'
    div.style.position = 'absolute'
    div.style.display = 'none'
    div.style.fontSize = '12px'
    this.viewer.container.appendChild(div)
    div.show = (position, msg) => {
      div.style.left = position.x + 10 + 'px'
      div.style.top = position.y + 'px'
      div.innerText = msg
      div.style.display = 'block'
    }
    div.hide = () => {
      div.style.left = ''
      div.style.top = ''
      div.innerText = ''
      div.style.display = 'none'
    }
    return div
  }

  /**
   * 加载平面图
   * @param url
   * @param options
   */
  loadTileMap(url, options) {
    const tms = Cesium.createTileMapServiceImageryProvider({
      url: url,
      fileExtension: 'png',
      ...options,
    })
    return this.viewer.imageryLayers.addImageryProvider(tms)
  }

  /**
   * 加载天地图影像
   * @param url
   * @param options
   */
  loadImageryProvider(url, options) {
    const tms = new Cesium.WebMapTileServiceImageryProvider({
      url,
      layer: 'img',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'w',
      credit: new Cesium.Credit('天地图影像'),
      maximumLevel: 18,
      ...options,
    })
    return this.viewer.imageryLayers.addImageryProvider(tms)
  }

  /**
   * 加载3D模型
   * @param url
   * @param options
   */
  init3DTileset(url, options) {
    const tmp = new Cesium.Cesium3DTileset({
      url,
      skipLevelOfDetail: true,
      cullWithChildrenBounds: true,
      dynamicScreenSpaceError: true,
      baseScreenSpaceError: 1,
      maximumScreenSpaceError: 128, // 这个值越大越节约内存
      dynamicScreenSpaceErrorDensity: 1,
      skipScreenSpaceErrorFactor: 50,
      skipLevels: 10,
      immediatelyLoadDesiredLevelOfDetail: true,
      loadSiblings: false,
      maximumMemoryUsage: 512, // 超过这个限制，所有用不到的tile会被释放
      maximumNumberOfLoadedTiles: 500, // 同maximumMemoryUsage
      ...options,
    })
    return tmp
  }

  /**
   * 飞到一个坐标位置
   * @param cartesian3
   * @param options
   */
  flyTo(cartesian3, options) {
    this.viewer.camera.flyTo({
      destination: cartesian3,
      ...options,
    })
  }

  /**
   * 世界坐标
   * @param x
   * @param y
   * @param z
   */
  getCartesian3(x, y, z) {
    return new Cesium.Cartesian3(x, y, z)
  }

  /**
   * 屏幕坐标
   * @param x
   * @param y
   */
  getCartesian2(x, y) {
    return new Cesium.Cartesian2(x, y)
  }

  /**
   * 经纬度坐标
   * @param longitude
   * @param latitude
   * @param height
   */
  getCartographic(longitude, latitude, height) {
    return new Cesium.Cartographic(longitude, latitude, height)
  }

  /**
   * 经纬度转换为世界坐标
   * @param cartographic
   */
  getCartographicToCartesian3(longitude, latitude, height) {
    return Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
  }

  /**
   * 初始化Viewer
   * @param container
   * @param options
   * @returns {null}
   */
  initViewer(container, options) {
    this.container = container
    Cesium.Ion.defaultAccessToken = this.accessToken
    buildModuleUrl.setBaseUrl(this.buildModuleUrl)
    this.viewer = new Cesium.Viewer(this.container, {
      // terrainProvider: new Cesium.CesiumTerrainProvider({
      //   url: '/3DTerrainQQ500',
      // }),

      imageryProvider: new Cesium.WebMapServiceImageryProvider({
        url: 'http://11.1.1.134:47880/geoserver/sn_web/wms',
        layers: 'sn_web:sn_dz',
        maximumLevel: 18,
        parameters: {
          service: 'WMS',
          format: 'image/png',
          transparent: true,
        },
      }),

      homeButton: false,
      fullscreenButton: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      scene3DOnly: true,
      showRenderLoopErrors: true,
      automaticallyTrackDataSourceClocks: false,
      geocoder: false,
      animation: false,
      shouldAnimate: true,
      timeline: false,
      infoBox: false,
      selectionIndicator: false,
      ...options,
    })
    // console.log(this.viewer)
    this._tooltip = this._createTooltip()
    this.viewer.cesiumWidget.creditContainer.style.display = 'none'
    this.viewer.scene.globe.enableLighting = true //高亮光晕
    return this.viewer
  }

  /**
   * 屏幕坐标转世界坐标
   * @param cartesian2
   * @returns {Cartesian3}
   */
  getCartesian2ToCartesian3(cartesian2) {
    return this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(cartesian2), this.viewer.scene)
  }

  /**
   * 世界坐标转屏幕坐标
   * @param cartesian3
   * @returns {Cartesian2}
   */
  getCartesian3ToCartesian2(cartesian3) {
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartesian3)
  }

  /**
   * 鼠标点击事件
   * @param callback
   */
  onLeftClick(callback) {
    const _handler = this.handler || new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    _handler.setInputAction(movement => {
      const position = movement.position
      const pickedFeature = this.viewer.scene.pick(position)
      const cartesian3 = this.getCartesian2ToCartesian3(position)
      callback({ position, _handler, pickedFeature, cartesian3 })
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /**
   * 鼠标移动事件
   * @param callback
   */
  onMouseMove(callback) {
    const _handler = this.handler || new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    _handler.setInputAction(movement => {
      const position = movement.endPosition
      const pickedFeature = this.viewer.scene.pick(position)
      const cartesian3 = this.getCartesian2ToCartesian3(position)
      callback({ position, _handler, pickedFeature, cartesian3 })
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  /**
   * Billboard 对象
   * @param image
   */
  getBillboard(image, options) {
    console.log(image)
    return new Cesium.BillboardGraphics({
      image: image,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      ...options,
    })
  }

  /**
   * Label对象
   * @param text
   */
  getLabel(text, options) {
    return {
      text,
      fillColor: Cesium.Color.WHITE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      showBackground: true,
      font: '16px Helvetica',
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      ...options,
    }
  }

  /**
   * 折线对象
   */
  getPolyLine(positions, options) {
    return {
      positions,
      width: 3,
      material: Cesium.Color.RED,
      clampToGround: true,
      ...options,
    }
  }

  /**
   * 多边形对象
   */
  getPolyGon(hierarchy, options) {
    return {
      hierarchy,
      material: Cesium.Color.RED.withAlpha(0.5),
      ...options,
    }
  }

  /**
   * Point对象
   */
  getPoint() {
    return {
      pixelSize: 5,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    }
  }

  /**
   * 添加Entitie
   * @param entitie
   */
  addEntity(options, callback) {
    const res = this.viewer.entities.add({
      ...options,
    })
    if (callback) {
      callback(res)
    } else {
      return res
    }
  }

  /**
   * 移除指定entity
   * @param entity
   * @param callback
   * @returns {Boolean}
   */
  removeEntity(entity, callback) {
    const res = this.viewer.entities.remove(entity)
    if (callback) {
      callback(res)
    } else {
      return res
    }
  }

  /**
   * 移除所有entity
   * @param callback
   */
  removeAllEntity(callback) {
    const res = this.viewer.entities.removeAll()
    if (callback) {
      callback(res)
    } else {
      return res
    }
  }

  /**
   * 移除指定id的entity
   * @param id
   * @param callback
   * @returns {Boolean}
   */
  removeEntityById(id, callback) {
    const res = this.viewer.entities.removeById(id)
    if (callback) {
      callback(res)
    } else {
      return res
    }
  }

  /**
   * 获取指定id的entity
   * @param id
   * @param callback
   * @returns {Entity|*}
   */
  getEntityById(id, callback) {
    const res = this.viewer.entities.getById(id)
    if (callback) {
      callback(res)
    } else {
      return res
    }
  }

  /**
   * 世界坐标转换为经纬度
   * @param cartesian3
   */
  getCartesian3ToCartographic(cartesian3) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian3)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height
    return { longitude, latitude, height }
  }

  /**
   * 绘制多边形
   * @type {_}
   */
  PolygonPrimitive = (() => {
    const _that = this

    function _(positions) {
      this.options = {
        name: '多边形',
        polygon: {
          hierarchy: [],
          material: Cesium.Color.GREEN.withAlpha(0.5),
        },
      }
      this.hierarchy = positions
      this._init()
    }

    _.prototype._init = function() {
      const _self = this
      const _update = function() {
        return new Cesium.PolygonHierarchy(_self.hierarchy)
      }
      // 实时更新polygon.hierarchy
      this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false)
      _that.viewer.entities.add(this.options)
    }

    return _
  })()

  PolygonPrimitiveWithColor = (() => {
    const _that = this

    function _(id, positions, color, pb) {
      this.options = {
        id: id,
        name: '多边形',
        properties: pb,
        polygon: {
          hierarchy: [],
          material: color,
        },
      }
      this.hierarchy = positions
      this._init()
    }

    _.prototype._init = function() {
      const _self = this
      const _update = function() {
        return new Cesium.PolygonHierarchy(_self.hierarchy)
      }
      // 实时更新polygon.hierarchy
      this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false)
      _that.viewer.entities.add(this.options)
    }

    return _
  })()

  /**
   * 绘制折线
   * @type {_}
   */
  PolylinePrimitive = (() => {
    const _that = this

    function _(positions, material = Cesium.Color.GREEN) {
      this.options = {
        name: '折线',
        polyline: {
          positions: [],
          width: 3,
          material,
          clampToGround: true,
        },
      }
      this.positions = positions
      this._init()
    }

    _.prototype._init = function() {
      const _self = this
      const _update = function() {
        return _self.positions
      }
      // 实时更新polyline.positions
      this.options.polyline.positions = new Cesium.CallbackProperty(_update, false)
      _that.viewer.entities.add(this.options)
    }

    return _
  })()

  /**
   * 绘制网格
   * @param callback
   * @param isFull true:绘制多边形，false:绘制折线
   */
  drawPolyGon(callback, isFull = true) {
    const positions = []
    const tempPoints = []
    let polygon = null
    let cartesian = null
    const _handler = this.handler || new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    _handler.setInputAction(movement => {
      const ray = this.viewer.camera.getPickRay(movement.endPosition)
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      if (positions.length >= 2) {
        this._tooltip.show(movement.endPosition, '右击结束')
        if (!Cesium.defined(polygon)) {
          polygon = isFull ? new this.PolygonPrimitive(positions) : new this.PolylinePrimitive(positions)
        } else {
          positions.pop()
          positions.push(cartesian)
        }
      } else {
        this._tooltip.show(movement.endPosition, '单击开始，至少3个点')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    _handler.setInputAction(movement => {
      const ray = this.viewer.camera.getPickRay(movement.position)
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      if (positions.length === 0) {
        positions.push(cartesian.clone())
      }
      positions.push(cartesian)
      const cartographic = this.getCartesian3ToCartographic(positions[positions.length - 1])
      tempPoints.push(cartographic)
      this.viewer.entities.add({
        name: '多边形的点',
        position: positions[positions.length - 1],
        billboard: {
          ...this.getBillboard(),
        },
      })
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    _handler.setInputAction(movement => {
      this._tooltip.hide()
      _handler.destroy()
      positions.pop()
      callback(positions, tempPoints)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  drawWallByPositions(positions) {
    var dp = []
    for (var i = 0; i < positions.length; i++) {
      var ellipsoid = this.viewer.scene.globe.ellipsoid
      var cartesian3 = new Cesium.Cartesian3(positions[i].x, positions[i].y, positions[i].z)
      var cartographic = ellipsoid.cartesianToCartographic(cartesian3)
      var lat = Cesium.Math.toDegrees(cartographic.latitude)
      var lng = Cesium.Math.toDegrees(cartographic.longitude)
      dp.push(lng)
      dp.push(lat)
      dp.push(200)
    }
    const dps = Cesium.Cartesian3.fromDegreesArrayHeights(dp)
    var alp = 1
    var num = 0
    return this.viewer.entities.add({
      wall: {
        id: 'wall',
        positions: dps,
        material: new Cesium.ImageMaterialProperty({
          transparent: true,
          color: new Cesium.CallbackProperty(function() {
            if (num % 2 === 0) {
              alp -= 0.005
            } else {
              alp += 0.005
            }

            if (alp <= 0.3) {
              num++
            } else if (alp >= 1) {
              num++
            }
            return Cesium.Color.GREEN.withAlpha(alp)
          }, false),
        }),
      },
      show: true,
    })

    // this.viewer.zoomTo(wyoming)
  }

  drawWall(callback) {
    var positions = []
    var poly = null
    const _this = this
    const _handler = this.handler || new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    var WallPoly = (function() {
      var alp = 1
      var num = 0
      function _(positions) {
        this.options = {
          id: 'wall',
          wall: {
            positions: [],
            material: new Cesium.ImageMaterialProperty({
              transparent: true,
              color: new Cesium.CallbackProperty(function() {
                if (num % 2 === 0) {
                  alp -= 0.005
                } else {
                  alp += 0.005
                }

                if (alp <= 0.3) {
                  num++
                } else if (alp >= 1) {
                  num++
                }
                return Cesium.Color.GREEN.withAlpha(alp)
                // entity的颜色透明 并不影响材质，并且 entity也会透明
              }, false),
            }),
          },
        }
        this.positions = positions
        this._init()
      }
      _.prototype._init = function() {
        var _self = this
        var _update = function() {
          var dp = []
          for (var i = 0; i < _self.positions.length; i++) {
            var ellipsoid = _this.viewer.scene.globe.ellipsoid
            var cartesian3 = new Cesium.Cartesian3(positions[i].x, positions[i].y, positions[i].z)
            var cartographic = ellipsoid.cartesianToCartographic(cartesian3)
            var lat = Cesium.Math.toDegrees(cartographic.latitude)
            var lng = Cesium.Math.toDegrees(cartographic.longitude)
            dp.push(lng)
            dp.push(lat)
            dp.push(200)
          }
          return Cesium.Cartesian3.fromDegreesArrayHeights(dp) // _self.positions;
        }

        this.options.wall.positions = new Cesium.CallbackProperty(_update, false)
        _this.viewer.entities.add(this.options)
      }
      return _
    })()

    _handler.setInputAction(function(movement) {
      // const ray = _this.viewer.camera.getPickRay(movement.endPosition)
      // let cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene)
      var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid)
      if (positions.length === 0) {
        positions.push(cartesian.clone())
      }
      positions.push(cartesian)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    _handler.setInputAction(function(movement) {
      // const ray = _this.viewer.camera.getPickRay(movement.endPosition)
      // let cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene)
      var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.endPosition, _this.viewer.scene.globe.ellipsoid)
      if (positions.length >= 1) {
        if (!Cesium.defined(poly)) {
          poly = new WallPoly(positions)
        } else {
          positions.pop()
          positions.push(cartesian)
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    _handler.setInputAction(function(movement) {
      callback(positions)
      _handler.destroy()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  /**
   * 计算坐标中心点
   * @param positions
   * @returns {{x: number, y: number, z: number}}
   */
  getCenterPosition(positions) {
    const length = positions.length
    let x = 0
    let y = 0
    let z = 0
    positions.forEach(item => {
      x += item.x
      y += item.y
      z += item.z
    })
    x = x / length
    y = y / length
    z = z / length
    return new Cesium.Cartesian3(x, y, z)
  }

  /**
   * 根据经纬度计算两点之间距离
   * @param point1
   * @param point2
   * @returns {*}
   * @private
   */
  distance(point1, point2) {
    const point1cartographic = Cesium.Cartographic.fromCartesian(point1)
    const point2cartographic = Cesium.Cartographic.fromCartesian(point2)
    // 根据经纬度计算出距离
    const geodesic = new Cesium.EllipsoidGeodesic()
    geodesic.setEndPoints(point1cartographic, point2cartographic)
    let s = geodesic.surfaceDistance
    // 返回两点之间的距离
    s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
    return s
  }

  /**
   * 空间两点距离计算函数
   * @param positions
   * @returns {string}
   */
  getSpaceDistance(positions) {
    let distance = 0
    for (let i = 0; i < positions.length - 1; i++) {
      distance = distance + this.distance(positions[i], positions[i + 1])
    }
    return distance.toFixed(2)
  }

  // 计算多边形面积
  getArea(points, positions) {
    let res = 0
    // 拆分三角曲面
    for (let i = 0; i < points.length - 2; i++) {
      const j = (i + 1) % points.length
      const k = (i + 2) % points.length
      const totalAngle = this.angle(points[i], points[j], points[k])
      const dis_temp1 = this.distance(positions[i], positions[j])
      const dis_temp2 = this.distance(positions[j], positions[k])
      res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))
    }
    return res.toFixed(2)
  }

  // 角度
  angle(p1, p2, p3) {
    const bearing21 = this.bearing(p2, p1)
    const bearing23 = this.bearing(p2, p3)
    let angle = bearing21 - bearing23
    if (angle < 0) {
      angle += 360
    }
    return angle
  }

  // 方向
  bearing(from, to) {
    // 角度转化为弧度(rad)
    const radiansPerDegree = Math.PI / 180.0
    // 弧度转化为角度
    const degreesPerRadian = 180.0 / Math.PI
    const lat1 = from.latitude * radiansPerDegree
    const lon1 = from.longitude * radiansPerDegree
    const lat2 = to.latitude * radiansPerDegree
    const lon2 = to.longitude * radiansPerDegree
    let angle = -Math.atan2(
      Math.sin(lon1 - lon2) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
    )
    if (angle < 0) {
      angle += Math.PI * 2.0
    }
    // 角度
    angle = angle * degreesPerRadian
    return angle
  }

  /**
   * 测量距离
   * @param callback
   */
  measureLineSpace(callback, autoStop = false) {
    const handler = this.handler || new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    const positions = []
    let poly = null
    let distance = 0
    let cartesian = null
    handler.setInputAction(movement => {
      const ray = this.viewer.camera.getPickRay(movement.endPosition)
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      console.log(cartesian)
      if (positions.length >= 2) {
        this._tooltip.show(movement.endPosition, '右击结束')
        if (!Cesium.defined(poly)) {
          poly = new this.PolylinePrimitive(positions)
        } else {
          positions.pop()
          positions.push(cartesian)
        }
        distance = this.getSpaceDistance(positions)
      } else {
        this._tooltip.show(movement.endPosition, '单击开始，至少2个点')
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(movement => {
      if (autoStop && positions.length >= 2) {
        this._tooltip.hide()
        handler.destroy()
        positions.pop()
        if (callback) callback()
      }
      const ray = this.viewer.camera.getPickRay(movement.position)
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      if (positions.length === 0) {
        positions.push(cartesian.clone())
      }
      positions.push(cartesian)
      // 在三维场景中添加Label
      const textDisance = distance + '米'
      this.viewer.entities.add({
        name: '空间直线距离',
        position: positions[positions.length - 1],
        label: {
          ...this.getLabel(textDisance),
        },
      })
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction(() => {
      this._tooltip.hide()
      handler.destroy()
      positions.pop()
      if (callback) callback()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  measureAreaSpace() {
    this.drawPolyGon((positions, tempPoints) => {
      const textArea = this.getArea(tempPoints, positions) + '平方米'
      this.viewer.entities.add({
        name: '多边形面积',
        position: positions[positions.length - 1],
        label: this.getLabel(textArea, {
          verticalOrigin: Cesium.VerticalOrigin.TOP,
        }),
      })
    }, true)
  }

  addPrimitiveCollection({ position, dimensions, name, color = Cesium.Color.BLUE.withAlpha(0) }) {
    const primitiveCollection = new Cesium.PrimitiveCollection()
    const s = Cesium.Transforms.eastNorthUpToFixedFrame(position)
    // HeadingPitchRoll:旋转值 Translation:平移值
    const rotation = Cesium.Matrix3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(-15, 0, 0))
    // fromRotationTranslation(旋转, 平移, 结果);矩阵计算
    const u = Cesium.Matrix4.fromRotationTranslation(rotation, new Cesium.Cartesian3(0, -3, 0))
    Cesium.Matrix4.multiply(s, u, s)
    primitiveCollection.add(
      new Cesium.ClassificationPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: Cesium.BoxGeometry.fromDimensions({
            // 给定其尺寸，创建一个以原点为中心的立方体
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT, // webgl 顶点着色器 设置颜色
            dimensions: new Cesium.Cartesian3(dimensions[0], dimensions[1], dimensions[2]),
          }),
          modelMatrix: s, // 模型矩阵
          attributes: {
            // 顶点着色器属性
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
            show: new Cesium.ShowGeometryInstanceAttribute(true), // 确定是否显示几何实例
          },
          id: name,
        }),
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, // 是否影响地形
      })
    )
    return primitiveCollection
  }
}
