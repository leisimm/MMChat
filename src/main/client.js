const socketIOClient = require('socket.io-client')

exports.initClient = (IPAddress, port) => {
  return socketIOClient('http://' + IPAddress + ':' + port, {
    reconnection: true
  })
}
