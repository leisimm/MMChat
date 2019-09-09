import electron from 'electron'

function install(Vue) {
  Vue.prototype.$electron = electron
}

export default install
