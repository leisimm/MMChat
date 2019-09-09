<template>
  <div style="height: 100%; width: 100%;">
    <!-- TODO: secondary部分的titlebar无法拖动 -->
    <!-- TODO: title-bar的高度是26px？ -->
    <!-- TODO: 分离出公共的css -->
    <div class="title-bar">
      <div class="box-resize-border"></div>
      <div class="title-bar-icons">
        <div class="icon-minus" @click="minimizeAppWindow()"></div>
        <div v-if="maximizeType === 'maximize'"
          class="icon-checkbox-unchecked" @click="maximizeAppWindow()"></div>
        <div v-else
          class="icon-window-restore-o" @click="unmaximizeAppWindow()"></div>
        <div class="icon-cross" @click="closeAppWindow()"></div>
      </div>
    </div>
    <div class="menu">
      <div class="primary">
        <router-link
          tag="div"
          to="/app/chat"
          active-class="primary-active"
          class="icon-chat1 icon"></router-link>
        <router-link
          tag="div"
          to="/app/contact"
          active-class="primary-active"
          class="icon-contact icon"></router-link>
        <div class="icon-et-more icon" @click="openOrCloseRightMenus(0)"></div>
        <div v-if="rightMenusStatus" ref="rightMenus" @blur="openOrCloseRightMenus(1)"
          class="right-menus" tabindex="-1">
          <div class="right-menu">
            <div class="right-menu-text">设置</div>
          </div>
          <div class="right-menu" @click="logout()">
            <div class="right-menu-text">登出</div>
          </div>
        </div>
      </div>
      <keep-alive>
        <router-view name="secondary"/>
      </keep-alive>
    </div>
    <keep-alive>
      <router-view name="content"/>
    </keep-alive>
  </div>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer, remote } from 'electron'

export default {
  data: function () {
    return {
      maximizeType: 'maximize',
      rightMenusStatus: false
    }
  },
  methods: {
    minimizeAppWindow () {
      remote.getCurrentWindow().minimize()
    },
    maximizeAppWindow () {
      this.maximizeType = 'unmaximize'
      remote.getCurrentWindow().maximize()
    },
    unmaximizeAppWindow () {
      this.maximizeType = 'maximize'
      remote.getCurrentWindow().unmaximize()
    },
    closeAppWindow () {
      remote.getCurrentWindow().close()
    },
    openOrCloseRightMenus (val) {
      if (val === 1) {
        let windowPos = ipcRenderer.sendSync('get-app-window-position')
        let size = ipcRenderer.sendSync('get-app-window-size')
        let cursorPos = remote.screen.getCursorScreenPoint()
        let valX = cursorPos['x'] - windowPos[0] - 17
        let valY = cursorPos['y'] - windowPos[1] - size[1] + 15
        if (valX > 0 && valX <= 26 && valY <= 0 && valY > -20) {
          // nothing
        } else {
          this.rightMenusStatus = !this.rightMenusStatus
        }
      } else {
        this.rightMenusStatus = !this.rightMenusStatus
        if (this.rightMenusStatus) {
          let vm = this
          this.$nextTick(function () {
            vm.$refs.rightMenus.focus()
          })
        }
      }
    },
    logout () {
      remote.getCurrentWindow().hide()
      ipcRenderer.sendSync('unset-user-info')
      ipcRenderer.sendSync('logout-complete')
      this.$router.push({
        path: '/login'
      }, () => {
        setTimeout(() => remote.getCurrentWindow().show(), 100)
      })
    }
  },
  mounted: function () {
    ipcRenderer.on('maximize-app-window', (event) => {
      this.maximizeType = 'unmaximize'
    })
    ipcRenderer.on('unmaximize-app-window', (event) => {
      this.maximizeType = 'maximize'
    })
  }
}
</script>

<style>
.title-bar {
  height: 25px;
  background-color: #f5f5f5;
  color: #5e5e5e;
  font-size: 8px;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
.title-bar > .box-resize-border {
  -webkit-app-region: no-drag;
  cursor: s-resize;
  position: absolute;
  top: -4px;
  left: 0;
  right: 0;
  height: 8px;
  z-index: 1000;
}
.title-bar > .title-bar-icons {
  -webkit-app-region: no-drag;
  position: absolute;
  top: 0;
  right: 0;
}
.title-bar > .title-bar-icons > [class] {
  float: left;
  padding: 0 14px;
  line-height: 25px;
}
.title-bar > .title-bar-icons > [class]:hover {
  background-color: #e3e3e3;
}
.title-bar > .title-bar-icons > .icon-cross:hover {
  background-color: rgb(244, 84, 84);
  color: white;
}

.menu {
  float: left;
  height: 100%;
  width: 310px;
  position: relative;
  z-index: 2;
  user-select:none;
}
.menu > .primary {
  float: left;
  width: 60px;
  height: 100%;
  margin-top: 0;
  background-color: #2b2a2a;
  position: relative;
  border-radius: 2px 0 0 2px;
}
.menu > .primary > .icon {
  color: #8c8c8c;
  font-size: 26px;
  width: 26px;
  margin: 26px auto 0;
}
.menu > .primary > .icon:hover {
  filter: brightness(1.5);
  cursor: pointer;
}
.menu > .primary > .primary-active {
  color: #09bb07;
}
.menu > .primary > .icon-et-more {
  font-size: 20px;
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  margin: 0 auto;
}
.menu > .primary > .right-menus {
  width: 134px;
  position: absolute;
  left: 60px;
  bottom: 15px;
  z-index: 1000;
  outline: none;
}
.menu > .primary > .right-menus > .right-menu {
  color: #979799;
  height: 46px;
  width: 134px;
  background-color: #28282a;
  position: relative;
}
.menu > .primary > .right-menus > .right-menu > .right-menu-text {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  font-size: 14px;
}
.menu > .primary > .right-menus > .right-menu:hover {
  color: #9d999a;
  background-color: #303135;
}
</style>
