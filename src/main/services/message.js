const db = require('./db')

exports.add = (messageInfo) => {
  db.get('messages')
    .push({
      ownerId: messageInfo.ownerId,
      senderId: messageInfo.senderId,
      gid: messageInfo.gid,
      time: messageInfo.time,
      text: messageInfo.text
    })
    .write()
}

exports.getMessagesByGid = (gid) => {
  return db.get('messages').filter({ gid: gid }).value()
}

exports.getMessagesByGidAndOwnerId = (gid, ownerId) => {
  return db.get('messages').filter({ gid: gid, ownerId: ownerId }).value()
}
