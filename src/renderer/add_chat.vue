<template>
  <div class="add-chat">
    <div class="title-bar">
      <div class="title-bar-icons">
        <div class="icon-cross" @click="closeAppWindow()"></div>
      </div>
    </div>

    <div class="button-area">
      <div v-if="wrongFromat"
        class="error-info">IP地址或端口号格式错误！</div>
      <div v-else-if="wrongFromat0"
        class="error-info">端口号格式错误！</div>
      <div v-if="isCreateUI" class="input-row">
        <input v-model="groupname" type="text" placeholder="填写群聊名">
      </div>
      <div v-else class="input-row">
        <input v-model="ip" type="text" placeholder="填写IP地址">
      </div>
      <div class="input-row">
        <input v-model="port" type="text" placeholder="填写端口号">
      </div>
      <div class="input-row">
        <input v-model="password" type="text" placeholder="填写密码">
      </div>
      <div class="button" @click="(isCreateUI ? createGroup() : joinGroup())">
        <div class="button-name">{{ isCreateUI ? '创建群聊' : '加入群聊' }}</div>
      </div>
    </div>
    <div class="ui-bottom" @click="changeCreateUI()">{{ isCreateUI ? '加入群聊' : '创建群聊' }}</div>
  </div>
</template>

<script>
const cryptUtil = require('../utils/crypt')

export default {
  data: function () {
    return {
      isCreateUI: true,
      groupname: '',
      port: '',
      password: '',
      ip: '',
      wrongFromat: false,
      wrongFromat0: false
    }
  },
  methods: {
    closeAppWindow () {
      this.$electron.ipcRenderer.send('close-add-chat-window')
    },
    changeCreateUI () {
      this.isCreateUI = !this.isCreateUI
      this.groupname = ''
      this.port = ''
      this.password = ''
      this.ip = ''
      this.wrongFromat = false
      this.wrongFromat0 = false
    },
    createGroup () {
      let port = +this.port;
      if (((Number.isInteger(port) && port > 0 && port < 65536))) {
        this.$electron.ipcRenderer.send('create-group', {
          ip: '127.0.0.1',
          port: port,
          password: cryptUtil.sha256(this.password),
          name: this.groupname
        })
        this.closeAppWindow()
      } else {
        this.wrongFromat0 = true
      }
    },
    joinGroup () {
      let port = +this.port;
      if (/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(this.ip)
        && (Number.isInteger(port) && port > 0 && port < 65536)) {
        this.$electron.ipcRenderer.send('join-group', {
          ip: this.ip,
          port: port,
          password: cryptUtil.sha256(this.password)
        })
        this.closeAppWindow()
      } else {
        this.wrongFromat = true
      }
    }
  }
}
</script>

<style>
.add-chat > .title-bar {
  height: 26px;
  background-color: #ffffff;
  color: #555555;
  font-size: 8px;
  -webkit-user-select: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  -webkit-app-region: drag;
}
.add-chat > .title-bar > .title-bar-icons {
  -webkit-app-region: no-drag;
  position: absolute;
  top: 0;
  right: 0;
}
.add-chat > .title-bar > .title-bar-icons > [class] {
  padding: 0 14px;
  line-height: 26px;
}
.add-chat > .title-bar > .title-bar-icons > .icon-cross:hover {
  background-color: rgb(255, 91, 102);
  color: white;
}

.add-chat > .button-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.add-chat > .button-area > .error-info {
  color: red;
  margin-bottom: 5px;
  font-size: 14px;
}
.add-chat > .button-area > .input-row {
  width: 210px;
  margin: 0 auto 5px;
  font-size: 14px;
}
.add-chat > .button-area > .input-row > input {
  border: none;
  height: 40px;
  width: 210px;
  padding-left: 20px;
  box-sizing: border-box;
}
.add-chat > .button-area > .input-row > input:focus {
  outline: none;
}
.add-chat > .button-area > .button {
  background-color: #1aac19;
  width: 210px;
  height: 40px;
  margin: 10px auto 0;
  color: #f1ffc6;
  position: relative;
  font-size: 14px;
  user-select: none;
}
.add-chat > .button-area > .button:hover {
  background-color: #129511;
}
.add-chat > .button-area > .button:active {
  background-color: #20aa17;
}
.add-chat > .button-area > .button > .button-name {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.add-chat > .ui-bottom {
   color: #556483;
   position: absolute;
   left: 50%;
   transform: translateX(-50%);
   bottom: 43px;
   font-size: 12px;
   cursor: pointer;
   user-select: none;
}
</style>
