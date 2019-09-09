const db = require('./db')

exports.add = (groupInfo) => {
  db.get('groups')
    .push({
      ownerId: groupInfo.ownerId,
      gid: groupInfo.gid,
      name: groupInfo.name,
      ip: groupInfo.ip,
      port: groupInfo.port,
      members: groupInfo.members
    })
    .write()
}

exports.has = (group) => {
  return db.get('groups').find(group).value() !== undefined
}

exports.getGroupInfoByGidAndOwnerId = (gid, ownerId) => {
  return db.get('groups').filter({ gid: gid, ownerId: ownerId }).value()[0]
}

exports.modifyGroupLastMessage = (gid, ownerId, args) => {
  return db.get('groups').find({ gid: gid, ownerId: ownerId }).assign({
    lastMessageTime: args.time,
    lastMessage: args.text
  }).write()
}

exports.addMemberByGidAndOwnerId = (gid, ownerId, user) => {
  db.get('groups').find({ gid: gid, ownerId: ownerId }).update('members', members => {
    members.push({
      uid: user.uid,
      username: user.username
    })
    return members
  }).write()
}

exports.hasUserInGroupByGidAndOwnerId = (gid, ownerId, uid) => {
  return db.get('groups').find({ gid: gid, ownerId: ownerId }).get('members').find({ uid: uid }).value() !== undefined
}
