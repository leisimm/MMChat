const http = require('http')
const Koa = require('koa')
const dbGroup = require('./services/group')
const cryptUtil = require('../utils/crypt')
/**
  * 1. 消息过来，for一下全部，把除发送过来的那个ip，其他全都发送一遍
  *
  * 2. 不需要在服务器保存东西。服务器做好分发就行。
*/

// TODO: group的password在sha256的时候加盐

let members = []

initServer = (port, password, gid, name, uid) => {
  const app = new Koa()
  const server = http.createServer(app.callback())
  const io = require('socket.io')(server, { serveClient: false })

  io.on('connection', (socket) => {
    socket.on('user-connection', (args) => {
      if (typeof(args.password) === 'string' && cryptUtil.sha256(args.password) === password) {
        socket.emit('has-linked')
        socket.emit('group-info', {
          gid: gid,
          name: name
        })
        socket.emit('members-info', members)
        members.push({
          uid: args.uid,
          username: args.username
        })

        // 在server处加上这个member
        dbGroup.addMemberByGidAndOwnerId(gid, uid, {
          uid: args.uid,
          username: args.username
        })

        // 给已经连上的用户传用户连接消息
        socket.broadcast.emit('add-user', {
          uid: args.uid,
          username: args.username
        })

        // 其他的on和emit
      } else {
        socket.emit('link-failed')
        socket.close()
      }
    })
  })

  server.listen(port)
}

initServer(parseInt(process.argv[2]), process.argv[3], process.argv[4], process.argv[5], process.argv[6])
