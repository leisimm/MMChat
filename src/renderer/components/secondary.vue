<template>
  <div class="secondary">
    <div class="search-area">
      <input type="text" placeholder="Search">
      <div class="icon-plus add-group-chat" @click="openAddChatWindow()"></div>
      <div class="icon-search search"></div>
    </div>
    <div class="chats-area">
      <div v-for="chatBrief in chatBriefArray"
        :key="chatBrief.gid" :class="{ 'chat-brief': true,  'active-chat-brief': currentChatId === chatBrief.gid }"
        @click="selectChatBrief(chatBrief.gid)">
        <div class="last-message-time">{{ chatBrief.formattedLastMessageTime }}</div>
        <div class="chat-brief-center">
          <div class="chat-name">{{ chatBrief.name }}</div>
          <div class="last-message-brief">{{ chatBrief.lastMessage }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
const timeUtil = require('../../utils/time')

// TODO: 群组创建的时候把创建的时间保存下来用于chat-briefs排序？

export default {
  data: function () {
    return {
      chatBriefArray: ipcRenderer.sendSync('get-chat-briefs')
    }
  },
  computed: {
    currentChatId: function () {
      return this.$store.state.currentChatId
    }
  },
  methods: {
    openAddChatWindow () {
      ipcRenderer.send('open-add-chat-window')
    },
    selectChatBrief (gid) {
      this.$store.commit('CHANGE_CURRENT_CHAT_ID', gid)
    }
  },
  mounted () {
    ipcRenderer.on('new-message-sent', (event, message) => {
      for (let i=0; i<this.chatBriefArray.length; ++i) {
        if (this.chatBriefArray[i].gid === message.gid) {
          this.chatBriefArray[i].formattedLastMessageTime = timeUtil.getFormattedTimeForChatBriefs(message.time)
          this.chatBriefArray[i].lastMessage = message.content
          this.chatBriefArray.unshift(this.chatBriefArray.splice(i, 1)[0])
          break;
        }
      }
    })

    ipcRenderer.on('change-current-chat-id', (event, gid) => {
      this.$store.commit('CHANGE_CURRENT_CHAT_ID', gid)

      this.chatBriefArray = ipcRenderer.sendSync('get-chat-briefs')
    })
  }
}
</script>

<style>
.secondary {
  width: 250px;
  height: 100%;
  position: relative;
  margin-left: 60px;
}
.secondary > .search-area {
  height: 62px;
  width: 250px;
  background-color: #eceae8;
  position: relative;
}
.secondary > .search-area > input {
  float: left;
  margin-top: 25px;
  margin-left: 12px;
  border-radius: 3px;
  padding-left: 24px;
  box-sizing: border-box;
  height: 25px;
  width: 190px;
  border: none;
  background-color: #dad8d8;
  -webkit-app-region: no-drag;
}
.secondary > .search-area > input:focus {
  outline: none;
}
.secondary > .search-area > .add-group-chat {
  position: absolute;
  top: 25px;
  left: 212px;
  height: 25px;
  width: 25px;
  line-height: 25px;
  background-color: #dcd9d8;
  cursor: pointer;
  text-align: center;
  border-radius: 3px;
}
.secondary > .search-area > .search {
  position: absolute;
  top: 25px;
  left: 18px;
  height: 25px;
  line-height: 25px;
}
.secondary > .chats-area {
  position: absolute;
  top: 62px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: overlay;
  background-color: #e5e5e5;
  box-sizing: border-box;
}
.secondary > .chats-area::-webkit-scrollbar {
  width: 0;
}
.secondary > .chats-area:hover::-webkit-scrollbar {
  width: 7px;
}
.secondary > .chats-area:hover::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: rgba(206, 202, 199, .5);/*#cecac7;*/
}
.secondary > .chats-area > .chat-brief {
  height: 64px;
  background-color: #e5e5e6;
  position: relative;
}
.secondary > .chats-area > .chat-brief:hover {
  background-color: #dcdbd9;
}
.secondary > .chats-area > .chat-brief.active-chat-brief {
  background-color: #cbc7c6;
}
.secondary > .chats-area > .chat-brief > .chat-brief-center {
  margin-left: 62px;
}
.secondary > .chats-area > .chat-brief > .chat-brief-center > .chat-name {
  padding-top: 15px;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.secondary > .chats-area > .chat-brief > .chat-brief-center > .last-message-brief {
  color: #99a0b1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  margin-top: 3px;
  margin-right: 40px;
}
.secondary > .chats-area > .chat-brief > .last-message-time {
  color: #999999;
  float: right;
  font-size: 12px;
  margin-top: 15px;
  margin-right: 12px;
}
</style>
