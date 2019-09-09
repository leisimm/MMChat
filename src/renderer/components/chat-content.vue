<template>
  <div class="chat-content">
    <div v-if="currentChatId" class="chat-content-select">
      <div class="chat-content-head">
        <div class="chat-more-options icon-more" @click="showGroupOptions()"></div>
        <div class="chat-username">{{ chatUserName }}</div>
      </div>
      <div class="group-options" ref="groupOptionsArea">
        <div class="group-option">
          <div class="group-option-name">服务器地址：</div>
          <input type="text" v-model="ip">
        </div>
        <div class="group-option">
          <div class="group-option-name">端口号：</div>
          <input type="text" v-model="port">
        </div>
        <div class="group-option">
          <div class="group-option-name">密码：</div>
          <input type="password" v-model="password">
        </div>
        <div class="group-option">
          <div class="group-option-name">连接到服务器</div>
          <div class="group-option-select" ref="groupOptionSelect" @click="linkToServerButtonClicked()" :style="{ 'background-color': isLinkToServer ? '#00bd00' : '#cbcbcb' }">
            <div class="group-option-select-button" ref="groupOptionSelectButton" :style="{ 'left': isLinkToServer ? '26px' : '4px' }"></div>
          </div>
        </div>
        <div class="group-options-hr"></div>
      </div>
      <div class="previous-messages-box" ref="previousMessagesBox">
        <div v-for="message in messageArray" :key="message.time"
          class="message-item">
          <div v-if="message.type === 'time-message'" :class="message.type">
            <div class="time-message-content">{{ message.formattedTime }}</div>
          </div>
          <div v-else :class="message.type">
            <div class="message-username">{{ message.username }}</div>
            <div class="message-content" v-html="message.content"></div>
          </div>
        </div>
      </div>
      <div class="add-message-box" ref="addMessageBox">
        <div class="box-resize-border" @mousedown="startResizing($event)"></div>
        <div class="add-message-tools">
          <div class="add-message-tool icon-smile"></div>
          <div class="add-message-tool icon-folder-open" @click="openFileDialog()"></div>
        </div>
        <div class="enter-message" ref="enterMessage" contenteditable="true"
          @dragover="dragover($event)" @drop="drop($event)" @focus="focusAddMessageBox()" @blur="blurAddMessageBox()"></div>
        <div class="send-button" @click="sendMessage()">发送(S)</div>
      </div>
    </div>
    <div v-else class="icon-M">
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
// const Mousetrap = require('mousetrap')
const crypto = require('crypto')
const salt = require('../../secret/salt.json')
const cryptUtil = require('../../utils/crypt')
const timeUtil = require('../../utils/time')

let isResizing = false
let lastY = 0

export default {
  data: function () {
    return {
      chatUserName: '',
      messageArray: [],
      ip: '',
      port: 0,
      password: '',
      isLinkToServer: false,
    }
  },
  computed: {
    currentChatId: function () {
      return this.$store.state.currentChatId
    }
  },
  watch: {
    currentChatId: function (newChatId, oldChatId) {
      if (newChatId === oldChatId) {
        console.log('you enter twice')
      } else {
        this.chatUserName = this.$electron.ipcRenderer.sendSync('get-chat-username', newChatId)
        this.messageArray = this.$electron.ipcRenderer.sendSync('get-message-array', newChatId)
        let groupInfo = this.$electron.ipcRenderer.sendSync('get-group-info', newChatId)
        this.ip = groupInfo.ip
        this.port = groupInfo.port
        this.password = groupInfo.password === undefined ? '' : groupInfo.password

        // TODO: 改变的时候groupOptionsArea瞬间消失
        // this.$refs.groupOptionsArea.style.transition = "0s right"
        if (this.$refs.groupOptionsArea) {
          this.$refs.groupOptionsArea.style.right = '-250px'
        }
        // this.$nextTick(() => {
        //   this.$refs.groupOptionsArea.style.transition = "0.5s right"
        // })
      }
    }
  },
  methods: {
    showGroupOptions() {
      this.$refs.groupOptionsArea.style.right = this.$refs.groupOptionsArea.style.right === '0px' ? '-250px' : '0px'
      if (this.$refs.groupOptionsArea.style.right === '0px') {
        this.isLinkToServer = this.$electron.ipcRenderer.sendSync('get-is-link-to-server', this.currentChatId)
      }
    },
    linkToServerButtonClicked () {
      if (!this.isLinkToServer) {
        this.$electron.ipcRenderer.send('link-to-server', {
          chatId: this.currentChatId,
          password: cryptUtil.sha256(this.password)
        })
      } else {
        if (this.$electron.ipcRenderer.sendSync('unlink-to-server', this.currentChatId)) {
          this.isLinkToServer = !this.isLinkToServer
        }
      }
    },
    openFileDialog () {
      this.$electron.remote.dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
    },
    sendMessage () {
      // TODO: 图片处理
      let message = {
        time: new Date().getTime(),
        gid: this.currentChatId,
        senderId: this.$electron.remote.getGlobal('userId'),
        content: this.$refs.enterMessage.innerHTML,
        username: this.$electron.remote.getGlobal('username'),
        type:'right-message'
      }
      message.formattedTime = timeUtil.getFormattedTimeForMessageContentFull(message.time)
      if (this.messageArray.length === 0 || message.formattedTime !== this.messageArray[this.messageArray.length - 1].formattedTime) {
        this.messageArray.push({
          time: message.time - 0.5,
          type: 'time-message',
          formattedTime: message.formattedTime
        })
      }
      this.$refs.enterMessage.innerHTML = ""
      this.messageArray.push(JSON.parse(JSON.stringify(message)))

      message.text = cryptUtil.aesEncrypt(this.$electron.remote.getGlobal('password') + String(message.time) + salt.message, message.content)
      // message.ownerId = this.$electron.remote.getGlobal('userId')
      this.$electron.ipcRenderer.send('send-message', message)

      let vm = this
      this.$nextTick(function () {
        vm.$refs.enterMessage.focus()
      })
    },
    dragover (e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    drop (e) {
      e.preventDefault()
      let files = e.dataTransfer.files // Array of all files
      let vm = this

      for (let i=0, file; file=files[i]; i++) {
        if (file.type.match(/image.*/)) {
          let reader = new FileReader()

          reader.onload = function(e2) {
              // finished reading file data.
              let img = document.createElement('img')
              img.src = e2.target.result
              vm.$refs.enterMessage.appendChild(img)
          }

          reader.readAsDataURL(file) // start reading the file data.
        }
      }
    },
    startResizing (e) {
      e.preventDefault()
      isResizing = true
      lastY = e.clientY
    },
    focusAddMessageBox () {
      this.$refs.addMessageBox.style.backgroundColor = '#ffffff'
    },
    blurAddMessageBox () {
      this.$refs.addMessageBox.style.backgroundColor = '#f5f5f5'
    },
    mouseMoveFunc (e) {
      if (isResizing) {
        e.preventDefault()
        let offsetY = e.clientY - lastY
        lastY = e.clientY
        let previousMessagesBox = this.$refs.previousMessagesBox
        let addMessageBox = this.$refs.addMessageBox
        if (previousMessagesBox.style.bottom) {
          previousMessagesBox.style.bottom = (Number(previousMessagesBox.style.bottom.replace('px', '')) - offsetY) + 'px'
        } else {
          previousMessagesBox.style.bottom = (145 - offsetY) + 'px'
        }

        if (addMessageBox.style.height) {
           addMessageBox.style.height = (Number(addMessageBox.style.height.replace('px', '')) - offsetY) + 'px'
        } else {
          addMessageBox.style.height = (145 - offsetY) + 'px'
        }
      }
    }
  },
  mounted () {
    // Mousetrap(this.$refs.enterMessage).bind(['cmd+enter', 'ctrl+enter'], this.sendMessage)

    document.onmousemove = this.mouseMoveFunc
    document.onmouseup = function (e) {
      isResizing = false
    }

    ipcRenderer.on('refresh-chat-content', () => {
      this.messageArray = this.$electron.ipcRenderer.sendSync('get-message-array', this.currentChatId)
    })

    ipcRenderer.on('server-linked', () => {
      this.isLinkToServer = true
    })
  }
}
</script>

<style>
.chat-content {
  margin-left: 310px;
  height: 100%;
  position: relative;
}
.chat-content > [class*='icon'] {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 100px;
  color: #ebebeb;
}
.chat-content > .chat-content-select {
  height: 100%;
  position: relative;
  overflow: hidden;
}
.chat-content > .chat-content-select > .chat-content-head {
  height: 62px;
  box-sizing: border-box;
  border-bottom: 1px solid #e5e5e5;
}
.chat-content > .chat-content-select > .chat-content-head > .chat-username {
  font-size: 18px;
  margin-top: 25px;
  margin-left: 30px;
  display: inline-block;
  overflow: hidden;
  background-color: #f5f5f5;
  cursor: pointer;
}
.chat-content > .chat-content-select > .chat-content-head > .chat-more-options {
  float: right;
  font-size: 18px;
  margin-top: 35px;
  margin-right: 18px;
  cursor: pointer;
}
.chat-content > .chat-content-select > .group-options {
  position: absolute;
  top: 62px;
  bottom: 0;
  right: -250px;
  width: 250px;
  background-color: white;
  z-index: 1;
  transition: 0.5s right;
}
.chat-content > .chat-content-select > .group-options > .group-options-hr {
  width: 200px;
  height: 1px;
  margin: 24px auto 0;
  background-color: #eeeeee;
}
.chat-content > .chat-content-select > .group-options > .group-option {
  margin-top: 24px;
  margin-left: 26px;
  font-size: 12px;
}
.chat-content > .chat-content-select > .group-options > .group-option > .group-option-name {
  color: #a2a2a2;
}
.chat-content > .chat-content-select > .group-options > .group-option > input {
  margin-top: 3px;
}
.chat-content > .chat-content-select > .group-options > .group-option > .group-option-select {
  width: 40px;
  height: 18px;
  border-radius: 7px/9px;
  position: relative;
  margin-top: 3px;
  /* background-color: #cbcbcb; */
  cursor: pointer;
}
.chat-content > .chat-content-select > .group-options > .group-option > .group-option-select > .group-option-select-button {
  position: absolute;
  /* left: 4px; */
  top: 4px;
  height: 10px;
  width: 10px;
  background-color: white;
  border-radius: 5px;
  transition: 0.5s left;
}
.chat-content > .chat-content-select > .previous-messages-box {
  background-color: #f5f5f5;
  position: absolute;
  left: 0;
  right: 0;
  top: 62px;
  bottom: 145px;
  overflow-y: overlay;
}
.chat-content > .chat-content-select > .previous-messages-box::-webkit-scrollbar {
  width: 0px;
}
.chat-content > .chat-content-select > .previous-messages-box:hover::-webkit-scrollbar {
  width: 7px;
}
.chat-content > .chat-content-select > .previous-messages-box:hover::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: #bbbbbb;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item {
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item::after {
  content: "";
  display: block;
  clear: both;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .time-message {
  margin-top: 18px;
  margin-bottom: -3px;
  text-align: center;
  user-select: none;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .time-message > .time-message-content {
  background-color: #dddddd;
  display: inline-block;
  border-radius: 2px;
  padding: 4px 5px;
  color: #fbfbfb;
  font-size: 12px;
  line-height: 1;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .left-message {
  margin-top: 16px;
  margin-left: 30px;
  position: relative;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .left-message > .message-username {
  position: absolute;
  top: -3px;
  left: 43px;
  color: #babab8;
  font-size: 12px;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .left-message > .message-content {
  margin-top: 15px;
  float: left;
  overflow: hidden;
  margin-left: 43px;
  border-radius: 2px;
  background-color: white;
  height: auto;
  padding: 10px;
  line-height: 34px;
  max-width: 50%;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .left-message > .message-content:hover {
  background-color: #f3f7f6;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .right-message {
  margin-top: 16px;
  margin-right: 30px;
  position: relative;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .right-message > .message-username {
  position: absolute;
  top: -4px;
  right: 43px;
  color: #babab8;
  font-size: 12px;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .right-message > .message-content {
  margin-top: 15px;
  float: right;
  overflow: hidden;
  margin-right: 43px;
  border-radius: 2px;
  background-color: #9fec5e;
  height: auto;
  padding: 10px;
  line-height: 34px;
  max-width: 50%;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
}
.chat-content > .chat-content-select > .previous-messages-box > .message-item > .right-message > .message-content:hover {
  background-color: #99e06a;
}
.chat-content > .chat-content-select > .add-message-box {
  background-color: #f5f5f5;
  height: 145px;
  box-sizing: border-box;
  border-top: 1px solid #ececec;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 430px;
}
.chat-content > .chat-content-select > .add-message-box:focus {
  background-color: white;
}
.chat-content > .chat-content-select > .add-message-box > .box-resize-border {
  cursor: s-resize;
  position: absolute;
  top: -4px;
  left: 0;
  right: 0;
  height: 8px;
}
.chat-content > .chat-content-select > .add-message-box > .add-message-tools {
  margin-top: 14px;
}
.chat-content > .chat-content-select > .add-message-box > .add-message-tools::after {
  content: "";
  display: block;
  clear: left;
}
.chat-content > .chat-content-select > .add-message-box > .add-message-tools > .add-message-tool {
  float: left;
  margin-right: 14px;
}
.chat-content > .chat-content-select > .add-message-box > .add-message-tools > .add-message-tool:first-of-type {
  margin-left: 28px;
}
.chat-content > .chat-content-select > .add-message-box > .add-message-tools > .add-message-tool:active {
  color: #20834c;
}
.chat-content > .chat-content-select > .add-message-box > .enter-message {
  line-height: 2;
  overflow-y: auto;
  position: absolute;
  top: 40px;
  left: 28px;
  right: 22px;
  bottom: 40px;
  font-size: 14px;
}
.chat-content > .chat-content-select > .add-message-box > .enter-message:focus {
  outline: none;
}
.chat-content > .chat-content-select > .add-message-box > .enter-message::-webkit-scrollbar {
  width: 7px;
}
.chat-content > .chat-content-select > .add-message-box > .enter-message::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: #dedede;
}
.chat-content > .chat-content-select > .add-message-box > .send-button {
  background-color: #f5f5f5;
  position: absolute;
  bottom: 10px;
  right: 30px;
  height: 24px;
  width: 66px;
  border: 1px solid #e5e5e5;
  text-align: center;
  cursor: pointer;
}
.chat-content > .chat-content-select > .add-message-box > .send-button:hover {
  background-color: #079a0e;
  color: #f5ffed;
}
.chat-content > .chat-content-select > .add-message-box > .send-button:active {
  background-color: #19ad17;
  color: #ebffe8;
}
</style>
