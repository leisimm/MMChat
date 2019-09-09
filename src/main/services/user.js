const db = require('./db')

// users里面保存的都是本地能登录的用户

exports.has = (user) => {
  return db.get('users').find(user).value() !== undefined
}

exports.add = (user) => {
  db.get('users').push({
    uid: user.uid,
    username: user.username,
    password: user.password,
    groups: user.groups
  }).write()
}

exports.getGroupsByUid = (uid) => {
  return db.get('users').filter({ uid: uid }).value()[0].groups
}

exports.addGidByUid = (uid, gid) => {
  db.get('users').find({ uid: uid }).update('groups', groups => {
    groups.push({
      gid: gid
    })
    return groups
  }).write()
}

exports.getUsernameByUid = (uid) => {
  return db.get('users').filter({ uid: uid }).value()[0].username
}
