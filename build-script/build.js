const del = require('del')

function clean() {
  del.sync(['dist/electron/*'])
  process.exit()
}

clean()
