const path = require('path')
const crypto = require('crypto')
const child_process = require('child_process')
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const macaddress = require('macaddress')
const dbMessage = require('./services/message')
const dbUser = require('./services/user')
const dbGroup = require('./services/group')
const dbServerGroup = require('./services/server-group')
const timeUtil = require('../utils/time')
const cryptUtil = require('../utils/crypt')
const salt = require('../secret/salt.json')
const client = require('./client')

function calcUserId(username) {
  return new Promise((resolve, reject) => {
    macaddress.one((err, addr) => {
      if (err) {
        reject(err)
      }
      // uid = sha256(md5(addr) + username + salt.userId)
      resolve(
        crypto.createHash('sha256').update(
          crypto.createHash('md5').update(addr).digest('hex')
          + username
          + salt.userId
        ).digest('hex')
      )
    })
  })
}

app.on('ready', () => {
  Menu.setApplicationMenu(null)

  // TODO: 窗口的圆角
  let win = new BrowserWindow({
    width: 280,
    height: 400,
    resizable: false,
    transparent: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true
    },
    show: false,
    frame: false,
    backgroundColor: '#f5f5f5'
  })
  win.setMaximizable(false)
  win.loadFile(path.join(__dirname, './index.html'))
  win.once('ready-to-show', () => {
    win.show()
  })
  win.on('maximize', () => {
    win.webContents.send('maximize-app-window')
  })
  win.on('unmaximize', () => {
    win.webContents.send('unmaximize-app-window')
  })
  // win.webContents.openDevTools()

  ipcMain.on('get-app-window-position', (event) => {
    event.returnValue = win.getPosition()
  })
  ipcMain.on('get-app-window-size', (event) => {
    event.returnValue = win.getSize()
  })
  ipcMain.on('check-username-and-password', (event, args) => {
    calcUserId(args.username).then((uid) => {
      event.returnValue = dbUser.has({ uid: uid, username: args.username, password: args.password })
    })
  })
  ipcMain.on('check-username', (event, args) => {
    calcUserId(args.username).then((uid) => {
      event.returnValue = dbUser.has({ uid: uid, username: args.username })
    })
  })
  ipcMain.on('add-user-by-username-and-password', (event, args) => {
    calcUserId(args.username).then((uid) => {
      dbUser.add({
        uid: uid,
        username: cryptUtil.aesEncrypt(args.password, args.username),
        password: crypto.createHash('sha256').update(args.password + salt.password).digest('hex'),
        groups: []
      })
      event.returnValue = true
    })
  })
  ipcMain.on('set-user-info', (event, args) => {
    calcUserId(args.username).then((uid) => {
      global.userId = uid
      global.username = args.username
      global.password = args.password
      event.returnValue = true
    })
  })
  ipcMain.on('unset-user-info', (event, args) => {
    global.userId = undefined
    global.username = undefined
    global.password = undefined
    event.returnValue = true
  })
  ipcMain.on('login-complete', (event) => {
    win.setSize(860, 638)
    win.center()
    win.setResizable(true)
    win.setMaximizable(true)
    win.setMinimumSize(710, 500)
    event.returnValue = true
  })
  ipcMain.on('logout-complete', (event) => {
    win.setMinimumSize(1, 1)
    win.setSize(280, 400)
    win.center()
    win.setResizable(false)
    win.setMaximizable(false)
    event.returnValue = true
  })
  ipcMain.on('get-chat-briefs', (event) => {
    groups = dbUser.getGroupsByUid(global.userId)

    chatBriefArray = []
    for (let i=0; i<groups.length; ++i) {
      let groupInfo = dbGroup.getGroupInfoByGidAndOwnerId(groups[i].gid, global.userId)
      if (groupInfo) {
        chatBriefArray.push({
          gid: groups[i].gid,
          name: groupInfo.name,
          lastMessageTime:
            groupInfo.lastMessageTime ? groupInfo.lastMessageTime : 0,
          lastMessage:
            groupInfo.lastMessage
            ? cryptUtil.aesDecrypt(global.password + String(groupInfo.lastMessageTime) + salt.message, groupInfo.lastMessage)
            : undefined
        })
      }
    }
    chatBriefArray.sort((a, b) => {
      return b.lastMessageTime - a.lastMessageTime
    })

    for (let i=0; i<chatBriefArray.length; ++i) {
      chatBriefArray[i].formattedLastMessageTime = timeUtil.getFormattedTimeForChatBriefs(chatBriefArray[i].lastMessageTime)
    }
    event.returnValue = chatBriefArray
  })
  ipcMain.on('get-message-array', (event, chatId) => {
    let messages = dbMessage.getMessagesByGidAndOwnerId(chatId, global.userId)
    let messageArray = []

    let preTime
    for (let i=0; i<messages.length; ++i) {
      let formattedTime = timeUtil.getFormattedTimeForMessageContentFull(messages[i].time)
      if (messageArray.length === 0 || formattedTime !== preTime) {
        messageArray.push({
          time: messages[i].time - 0.5,
          type: 'time-message',
          formattedTime: formattedTime
        })
      }
      messageArray.push({
        time: messages[i].time,
        formattedTime: formattedTime,
        type: global.userId === messages[i].senderId ? 'right-message' : 'left-message',
        username: dbUser.getUsernameByUid(messages[i].senderId),
        content: cryptUtil.aesDecrypt(global.password + String(messages[i].time) + salt.message, messages[i].text)
      })
      preTime = formattedTime
    }

    event.returnValue = messageArray
  })
  ipcMain.on('get-group-info', (event, chatId) => {
    let groupInfo = dbGroup.getGroupInfoByGidAndOwnerId(chatId, global.userId)
    event.returnValue = groupInfo
  })
  ipcMain.on('get-chat-username', (event, chatId) => {
    let groupInfo = dbGroup.getGroupInfoByGidAndOwnerId(chatId, global.userId)
    event.returnValue = groupInfo.name
  })
  ipcMain.on('send-message', (event, message) => {
    dbMessage.add({
      ownerId: global.userId,
      senderId: message.senderId,
      gid: message.gid,
      time: message.time,
      text: message.text
    })
    dbGroup.modifyGroupLastMessage(message.gid, global.userId, {
      lastMessageTime: message.time,
      lastMessage: message.text
    })
    win.webContents.send('new-message-sent', message)

    // TODO: 把信息内容加密后传输出去
  })
  ipcMain.on('get-is-link-to-server', (event, chatId) => {
    if (global.clients === undefined) {
      event.returnValue = false
    } else {
      for (let i=0; i<global.clients.length; ++i) {
        if (global.clients[i].groupId === chatId) {
          event.returnValue = true
        }
      }
      event.returnValue = false
    }
  })
  ipcMain.on('link-to-server', (event, args) => {
    if (global.clients) {
      for (let i=0; i<global.clients.length; ++i) {
        if (global.clients[i].groupId === args.chatId) {
          return
        }
      }
    }
    let groupInfo = dbGroup.getGroupInfoByGidAndOwnerId(args.chatId, global.userId)
    if (global.clients === undefined) {
      global.clients = []
    }
    let socket = client.initClient(groupInfo.ip, groupInfo.port)
    let count = 0
    let interval = setInterval(() => {
      if (socket.connected) {
        socket.emit('user-connection', {
          password: args.password,
          uid: global.userId,
          username: global.username
        })
        socket.on('has-linked', () => {
          global.clients.push({
            groupId: args.chatId,
            socket: socket
          })
          win.webContents.send('server-linked')
        })
        clearInterval(interval)
      } else {
        count += 1
        if (count === 10) {
          clearInterval(interval)
          socket.close()
        }
      }
    }, 100)
  })
  ipcMain.on('unlink-to-server', (event, chatId) => {
    if (global.clients === undefined) {
      event.returnValue = false
      console.error('unlink error: unlink while no server linked.')
    }
    for (let i=0; i<global.clients.length; ++i) {
      if (global.clients[i].groupId === chatId) {
        global.clients[i].socket.close()
        global.clients.splice(i, 1)
        event.returnValue = true
        break;
      }
    }
  })

  let addChatWin
  ipcMain.on('open-add-chat-window', (event) => {
    addChatWin = new BrowserWindow({
      width: 280,
      height: 400,
      webPreferences: {
        nodeIntegration: true
      },
      show: false,
      frame: false,
      backgroundColor: '#ffffff',
      parent: win,
      modal: true,
      x: parseInt(win.getPosition()[0] + (win.getSize()[0] - 280) / 2),
      y: parseInt(win.getPosition()[1] + (win.getSize()[1] - 400) / 2)
    })
    addChatWin.setResizable(false)
    addChatWin.loadFile(path.join(__dirname, './add_chat.html'))
    addChatWin.once('ready-to-show', () => {
      addChatWin.show()
    })
    // addChatWin.webContents.openDevTools()
  })

  ipcMain.on('close-add-chat-window', (event) => {
    addChatWin.close()
    addChatWin = null
  })
  ipcMain.on('create-group', (event, group) => {

    // 生成gid
    let gid = cryptUtil.sha256(global.userId + String(new Date().getTime()))
    let password = cryptUtil.sha256(group.password)  // 这是第二次hash

    // 写数据库
    dbGroup.add({
      ownerId: global.userId,
      gid: gid,
      name: group.name,
      ip: group.ip,
      port: group.port,
      members: [
        {
          uid: global.userId,
          username: global.username
        }
      ]
    })
    dbServerGroup.add({
      gid: gid,
      password: password
    })
    dbUser.addGidByUid(global.userId, gid)

    // 起server
    serverProcess = child_process.spawn('node', [path.join(__dirname, 'server.js'), group.port, password, gid, group.name, global.userId])
    serverProcess.stdout.on('data', (data) => {
      console.log('server stdout:\n' + data)
    })
    serverProcess.stderr.on('data', (data) => {
      console.error(`server stderr:\n${data}`)
    })

    // 在内存中保存server和client的信息
    if (global.servers === undefined) {
      global.servers = []
    }
    global.servers.push({
      process: serverProcess,
      groupId: gid,
      password: password
    })

    if (global.clients === undefined) {
      global.clients = []
    }
    let socket = client.initClient('127.0.0.1', group.port)
    global.clients.push({
      groupId: gid,
      socket: socket
    })

    // 连接
    socket.emit('user-connection', {
      password: group.password,
      uid: global.userId,
      username: global.username
    })
    socket.on('add-user', (user) => {
      if (!dbGroup.hasUserInGroupByGidAndOwnerId(gid, global.userId, user.uid)) {
        dbGroup.addMemberByGidAndOwnerId(gid, global.userId, {
          uid: user.id,
          username: user.username
        })
      }
    })

    // UI上的更改
    win.webContents.send('change-current-chat-id', gid)
  })
  ipcMain.on('join-group', (event, group) => {
    if (global.clients === undefined) {
      global.clients = []
    }
    let socket = client.initClient(group.ip, group.port)
    socket.emit('user-connection', {
      password: group.password,
      uid: global.userId,
      username: global.username
    })
    socket.on('group-info', (groupInfo) => {
      global.clients.push({
        groupId: groupInfo.gid,
        socket: socket
      })
      if (!dbGroup.has({ gid: groupInfo.gid, ownerId: global.userId })) {
        dbGroup.add({
          ownerId: global.userId,
          gid: groupInfo.gid,
          name: groupInfo.name,
          ip: group.ip,
          port: group.port,
          members: [
            {
              uid: global.userId,
              username: global.username
            }
          ]
        })
      }
    })
  })
})

app.on('quit', () => {
  if (global.servers) {
    for (let i=0; i<global.servers.length; ++i) {
      global.servers[i].process.kill('SIGINT')
    }
  }
})
