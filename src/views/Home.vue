<template>
  <div class="home">
    <div id="my-node">
      <img alt="Vue logo" src="../assets/logo.png" />
      <p>上的卡薩丁</p>
      <p>111</p>
      <p>上的卡12312薩丁</p>
      <p>d撒旦</p>
      <a-button>dxs d</a-button>
    </div>
    <a-modal
      class="rn_customModal"
      :moveOut="true"
      :dialogStyle="{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }"
      title="测试弹窗拖动"
      :visible="visible"
      okText="保存"
      @cancel="visible = false"
    >
      dsdsdsds
    </a-modal>
    <a-button @click="showModal">打开弹窗</a-button>
    <a-button @click="domToImage">截取图片</a-button>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
// import { apiGetList } from '@/api/apiAccountManagement'
import domtoimage from 'dom-to-image'
export default {
  name: 'Home',
  components: {
    // HelloWorld
  },
  data() {
    return {
      visible: false,
    }
  },
  mounted() {
    console.log('helloword')

    // apiGetList().then((res) => {
    //     console.log(res)
    // })
  },
  methods: {
    showModal() {
      this.visible = true
      this.$nextTick(() => {
        this.addEventLister()
      })
    },
    addEventLister() {
      const layero = document.querySelector('.ant-modal'),
        win = document.querySelector('window')
      const moveElem = document.querySelector('.ant-modal-header'),
        dict = {}

      console.log(layero.getAttribute('moveOut'))
      moveElem.addEventListener('mousedown', e => {
        e.preventDefault()
        dict.moveStart = true
        dict.offset = [e.clientX - parseFloat(layero.offsetLeft), e.clientY - parseFloat(layero.offsetTop)]
        // ready.moveElem.css('cursor', 'move').show()
      })
      moveElem.style.cursor = 'move'
      moveElem.addEventListener('mousemove', e => {
        e.preventDefault()
        if (dict.moveStart) {
          var X = e.clientX - dict.offset[0],
            Y = e.clientY - dict.offset[1]
          // fixed = layero.css('position') === 'fixed'

          // dict.stX = fixed ? 0 : win.scrollLeft()
          // dict.stY = fixed ? 0 : win.scrollTop()

          //控制元素不被拖出窗口外
          // if (!config.moveOut) {
          //   var setRig = win.width() - layero.outerWidth() + dict.stX,
          //     setBot = win.height() - layero.outerHeight() + dict.stY
          //   X < dict.stX && (X = dict.stX)
          //   X > setRig && (X = setRig)
          //   Y < dict.stY && (Y = dict.stY)
          //   Y > setBot && (Y = setBot)
          // }
          layero.style.left = X + 'px'
          layero.style.top = Y + 'px'
          // layero.css({
          //   left: X,
          //   top: Y,
          // })
        }
      })
      moveElem.addEventListener('mouseup', function(e) {
        e.preventDefault()
        if (dict.moveStart) {
          delete dict.moveStart
          // ready.moveElem.hide()
          // config.moveEnd && config.moveEnd(layero)
        }
        // if (dict.resizeStart) {
        //   delete dict.resizeStart
        //   ready.moveElem.hide()
        // }
      })
    },
    domToImage() {
      var node = document.getElementById('my-node')

      domtoimage
        .toPng(node, { quality: 1 })
        .then(function(dataUrl) {
          var link = document.createElement('a')
          link.download = 'my-image-name.png'
          link.href = dataUrl
          link.click()
        })
        .catch(function(error) {
          console.error('oops, something went wrong!', error)
        })
    },
  },
}
</script>
<style scoped>
p {
  /* line-height: 200px; */
}
</style>
