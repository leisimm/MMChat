const db = require('./db')

exports.add = (serverGroup) => {
  db.get('serverGroups').push({
    gid: serverGroup.gid,
    password: serverGroup.password
  }).write()
}
