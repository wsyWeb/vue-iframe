var baseLayer = new ol.layer.Tile({
  source: new ol.source.TileArcGISRest({
    url: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer',
    crossOrigin: 'Anonymous',
  }),
})

//绘制工具图形
var draw = null
var drawsource = new ol.source.Vector()
var drawlayer = new ol.layer.Vector({
  source: drawsource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#fff',
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: [38, 155, 0, 0], //使用了一个数组，[r,g,b,a]
    }),
  }),
})

var view = new ol.View({
  center: [113.90271877, 22.95186415],
  zoom: 9,
  projection: 'EPSG:4326',
})

var map = new ol.Map({
  layers: [baseLayer, drawlayer],
  target: 'map',
  view: view,
})

//参考截图插件:https://github.com/tsayen/dom-to-image
var node = document.getElementById('map')
$('#mapexport_btn').click(function() {
  domtoimage.toJpeg(node, { quality: 1.0 }).then(function(dataUrl) {
    var link = document.createElement('a')
    link.download = '全图导出.jpeg'
    link.href = dataUrl
    link.click()
  })
})

$('#rctanglexport_btn').click(function() {
  //绘制矩形
  clearMap()
  addInteraction('Box')
})

function addInteraction(value) {
  var geometryFunction
  switch (value) {
    case 'Box':
      value = 'Circle'
      geometryFunction = ol.interaction.Draw.createBox()
      break
    case 'Polygon':
      value = 'Polygon'
      break
  }
  //map.addLayer(drawlayer);
  draw = new ol.interaction.Draw({
    source: drawsource,
    type: value,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 1,
      }),
      fill: new ol.style.Fill({
        color: [38, 155, 0, 0], //使用了一个数组，[r,g,b,a]
      }),
      image: new ol.style.Circle({
        radius: 3,
        fill: new ol.style.Fill({
          color: '#ffcc33',
        }),
      }),
    }),
    geometryFunction: geometryFunction,
  })
  map.addInteraction(draw)
  draw.on('drawend', function(evt) {
    clearMap()
    var feature = evt.feature
    var extent = feature.getGeometry().getExtent()
    //地理坐标转换屏幕坐标
    var coord = [extent[0], extent[3]]
    var leftTopPosition = map.getPixelFromCoordinate(coord)
    //地理坐标转换屏幕坐标
    var coord1 = [extent[2], extent[1]]
    var bottomRightPosition = map.getPixelFromCoordinate(coord1)
    //计算框选矩形的宽度以及高度像素
    var width = Math.abs(bottomRightPosition[0] - leftTopPosition[0])
    var height = Math.abs(bottomRightPosition[1] - leftTopPosition[1])
    //计算框选矩形的左上角屏幕坐标
    var minx = leftTopPosition[0] <= bottomRightPosition[0] ? leftTopPosition[0] : bottomRightPosition[0]
    var miny = leftTopPosition[1] <= bottomRightPosition[1] ? leftTopPosition[1] : bottomRightPosition[1]
    domtoimage
      .toPng(node)
      .then(function(dataUrl) {
        if (dataUrl.length <= 6) {
          console.log('屏幕截图结果为空,建议放大地图,重新截图操作试试看')
          return
        }
        //过渡img图片,为了截取img指定位置的截图需要
        var img = new Image()
        img.src = dataUrl
        img.onload = function() {
          //要先确保图片完整获取到，这是个异步事件
          var canvas = document.createElement('canvas') //创建canvas元素
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d').drawImage(img, minx, miny, width, height, 0, 0, width, height) //将图片绘制到canvas中
          dataUrl = canvas.toDataURL() //转换图片为dataURL
          var link = document.createElement('a')
          link.download = '框选导出.jpeg'
          link.href = dataUrl
          link.click()
          console.log('截图数据获取成功')
        }
      })
      .catch(function(error) {
        console.error('oops, something went wrong!', error)
      })
  })
}
