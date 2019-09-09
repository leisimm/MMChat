const path = require('path')
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(path.join(__dirname, './mmchat.json'))
const db = lowdb(adapter)

// db.defaults({
//   messages: [],
//   users: [],
//   groups: []
// }).write()

// TODO: users里面的信息加密

db.defaults({
  messages: [
    {
      senderId: 'u16789',
      gid: 'g1000',
      time: 1521024282249,
      text: 'haha'
    },
    {
      senderId: 'u16781',
      gid: 'g1000',
      time: 1567237918238,
      text: '第二条消息'
    },
    {
      senderId: 'u16789',
      gid: 'g1000',
      time: 1567237918239,
      text: `P标签是默认是自动换行的，因此设置好宽度之后，能够较好的实现效果，但是最近的项目中发现，使用ajax加载数据之后，p标签内的内容没有换行，导致布局错乱，于是尝试着使用换行样式，虽然解决了问题，但是并没有发现本质原因，本质在于，我当时获取的数据是一长串的数字，浏览器应该是对数字和英文单词处理方式相近，不会截断。
      先给出各种方式，再具体介绍每一个属性。`
    },
    // {
    //   senderId: '04be7a2b081e749d3fc427013f133d23ca5733b1e1a6371f2892f645bf5d0cd3',
    //   gid: 'g1001',
    //   time: 1567237918239,
    //   text: `The problem you're observing happens when you float an element, which takes it out of the normal flow of the elements (by normal flow I mean the way the elements would appear with no styling). When you float an element, the other elements still in the normal flow will simply ignore it and do not make room for it, which is why your block div does not extend the full height of your image.`
    // }
    {
      "ownerId": "04be7a2b081e749d3fc427013f133d23ca5733b1e1a6371f2892f645bf5d0cd3",
      "senderId": "04be7a2b081e749d3fc427013f133d23ca5733b1e1a6371f2892f645bf5d0cd3",
      "gid": "g1001",
      "time": 1567943692706,
      "text": "Jj9OhvpHIjMXKq1uONW88aVaEz15tOyBDTAMrR9xZ3+bifhc7tszTy0tUp+QRfWmJP3DkkMthRe5d0VQ0uW7pKPqV7bEo8hrUHMBUyrfW/R/RbmysnPEkvU6XuNBJfI2/Jv2OvhrHxIEgG+NWachTs+uBZwTICIIPXj7RlhHLVN5SUPku7me49ZEiPXF1ONYuVCuQepmhPXAVU0nqLvBgwHHYHt2ITwKUIC9YSgs8RP+sO1yhGpo68wfZFieBvYMLVDb7hILJr84mK4SxAxFpqAL6zi6H2p3FYuJ6yNpDZ4WgmBBVRn+Av8XoCJh9kCTdj/Osuf990Hxgizg4KX1klrtjpg/etRkU2f2usNgduHYgI44OKjWP9RuxQ/Zv0KC8B26DXfTeInKKkyp4pTekYrysaIqiRaiYodsMEJvG0m9u+RawhwpRc7xODwSWAH6JEmAbiaNTYaMKzDFv4tHXhiiORzNmPU+gbCTUKyA8pjYFWQuWigIs2747AF1nx9RW9TXEdHeAqOMU6n7fg4drA=="
    }
  ],
  users: [
    {
      uid: 'u16789',
      username: "奶茶妹妹",
      password: 21314231234,
      groups: [ 'g1000', 'g1001' ]
    },
    {
      uid: 'u16781',
      username: "奶茶姐姐",
      password: 21314231233,
      groups: [ 'g1000', 'g1001' ]
    },
    {
      uid: 'u2322',
      username: "奶茶姐姐",
      password: 21314231233,
      groups: [ 'g1001' ]
    },
    {
      uid: '04be7a2b081e749d3fc427013f133d23ca5733b1e1a6371f2892f645bf5d0cd3',
      username: 'f',
      password: '795da4df3c2c4e27759b2f7b1103f0b86e9e647bf4760e9373f918da124f56cd',  //f
      groups: [{
        gid: 'g1001'
      }]
    },
    {
      "uid": "7639053686a285cb91115ad01ae4d497057e7f3668fe6e640b1a1916bc1cfedd",
      "username": "ff",
      "password": "0a45f2d35da84604bf532ae625b6413172daba045cb9188e6e24c70ea0127cb7",  //ff
      groups: [{
        gid: 'g1001'
      }]
    }
  ],
  serverGroups: [
    {
      gid: '',
      password: '',  // hash过后的密码
    }
  ],
  groups: [
    {
      ownerId: '',
      gid: 'g1000',
      name: '第一个群组',
      ip: '127.0.0.1',
      port: 3360,
      members: [
        {
          uid: 'u16789'
        },
        {
          uid: 'u16781'
        }
      ],
      lastMessageTime: 1521024282249,
      lastMessage: '这是第一个参与测试的最后一个消息'
    },
    {
      ownerId: '04be7a2b081e749d3fc427013f133d23ca5733b1e1a6371f2892f645bf5d0cd3',
      gid: 'g1001',
      name: 'Second group',
      ip: '127.0.0.1',
      port: 3360,
      members: [
        {
          uid: 'u16789'
        },
        {
          uid: 'u16781'
        },
        {
          uid: 'u2322'
        },
        {
          uid: '04be7a2b081e749d3fc427013f133d23ca5733b1e1a6371f2892f645bf5d0cd3'
        },
        {
          uid: '7639053686a285cb91115ad01ae4d497057e7f3668fe6e640b1a1916bc1cfedd'
        }
      ],
      // lastMessageTime: 1567237918238,
      // lastMessage: '这是第二个参与测试的最后一个消息'
    }
  ]
}).write()

module.exports = db
