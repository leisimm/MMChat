<template>
  <div class="login">
    <div class="login-title-bar">
      <div class="login-title-bar-icons">
        <div class="icon-cross" @click="closeAppWindow()"></div>
      </div>
      <div class="app-name">MMChat</div>
    </div>
    <div class="login-content">
      <div v-if="signupSuccess"
        class="error-info">注册成功！</div>
      <div v-if="hasEnteredWrongInfo"
        class="error-info">账号或密码错误</div>
      <div v-else-if="userAlreadyRegistered"
        class="error-info">用户名已存在</div>
      <div v-else-if="differentPassword"
        class="error-info">两次输入的密码不一样</div>
      <div class="login-row">
        <input ref="loginUsername" v-model="username" type="text" placeholder="填写账号">
      </div>
      <div class="login-row">
        <input ref="loginPassword" v-model="password" type="password" placeholder="填写密码">
      </div>
      <div v-if="!isLoginUI"
        class="login-row comfirm-password">
        <input ref="comfirmPassword" v-model="comfirmPassword" type="password" placeholder="确认密码">
      </div>
      <div class="login-button" ref="loginButton" @click="(isLoginUI ? login() : signup())">
        <div class="button-name">{{ isLoginUI ? '登录' : '注册' }}</div>
      </div>
    </div>
    <div class="login-ui-bottom" @click="changeLoginUI()">{{ isLoginUI ? '注册' : '登录' }}</div>
  </div>
</template>

<script>
import { remote } from 'electron'
const crypto = require('crypto')
// const Mousetrap = require('mousetrap')
const salt = require('../../secret/salt.json')

export default {
  data: function () {
    return {
      username: '',
      password: '',
      comfirmPassword: '',
      isLoginUI: true,
      hasEnteredWrongInfo: false,
      differentPassword: false,
      userAlreadyRegistered: false,
      signupSuccess: false
    }
  },
  methods: {
    closeAppWindow () {
      remote.getCurrentWindow().close()
    },
    login () {
      let checkResult = this.$electron.ipcRenderer.sendSync('check-username-and-password', {
        username: this.username,
        password: crypto.createHash('sha256').update(this.password + salt.password).digest('hex')
      })
      if (checkResult === true) {
        remote.getCurrentWindow().hide()
        this.$electron.ipcRenderer.sendSync('set-user-info', {
          username: this.username,
          password: crypto.createHash('md5').update(this.password + salt.password).digest('hex')
        })
        this.$electron.ipcRenderer.sendSync('login-complete')
        this.$router.push({
          path: '/app/chat'
        }, () => {
          setTimeout(() => remote.getCurrentWindow().show(), 100)
        })
      } else {
        this.hasEnteredWrongInfo = true
      }
    },
    signup () {
      if (this.password !== this.comfirmPassword) {
        this.clearAndSet('differentPassword')
      } else if (this.$electron.ipcRenderer.sendSync('check-username', { username: this.username })) {
        this.clearAndSet('userAlreadyRegistered')
      } else {
        this.$electron.ipcRenderer.sendSync('add-user-by-username-and-password', {
          username: this.username,
          password: this.password
        })
        this.clearAndSet('signupSuccess')
      }
    },
    clearAndSet (prop) {
      this.differentPassword = false
      this.userAlreadyRegistered = false
      this.signupSuccess = false
      this[prop] = true
    },
    changeLoginUI () {
      this.isLoginUI = !this.isLoginUI
      this.username = ''
      this.password = ''
      this.comfirmPassword = ''
      this.hasEnteredWrongInfo = false
      this.differentPassword = false
      this.userAlreadyRegistered = false
      this.signupSuccess = false
    }
  },
  mounted () {
    this.$refs.loginUsername.focus()

    // Mousetrap(this.$refs.loginUsername).bind(['enter'], this.$refs.loginButton.click)
    // Mousetrap(this.$refs.loginPassword).bind(['enter'], this.$refs.loginButton.click)
    // Mousetrap(this.$refs.comfirmPassword).bind(['enter'], this.$refs.loginButton.click)
  }
}
</script>

<style scoped>
.login {
  position: relative;
  height: 100%;
  background-color: '#f5f5f5';
}
.login-title-bar {
  height: 26px;
  -webkit-app-region: drag;
}
.login-title-bar > .app-name {
  margin-left: 10px;
  height: 26px;
  line-height: 26px;
  color: #a9a9a7;
  font-size: 14px;
  user-select: none;
}
.login-title-bar > .login-title-bar-icons {
  font-size: 8px;
}
.login-title-bar > .login-title-bar-icons > [class*='icon'] {
  -webkit-app-region: no-drag;
  width: 34px;
  text-align: center;
  height: 26px;
  float: right;
  color: #5f5f5f;
  line-height: 26px;
}
.login-title-bar > .login-title-bar-icons > [class*='icon']:hover {
  background-color: #f05752;
  color: #ffebdc;
}
.login-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.login-content > .error-info {
  color: red;
  margin-bottom: 5px;
  font-size: 14px;
}
.login-content > .login-row {
  width: 210px;
  margin: 0 auto 5px;
  font-size: 14px;
}
.login-content > .login-row.comfirm-password {
  margin-top: -5px;
}
.login-content > .login-row > input {
  border: none;
  height: 40px;
  width: 210px;
  padding-left: 20px;
  box-sizing: border-box;
}
.login-content > .login-row > input:focus {
  outline: none;
}
.login-content > .login-button {
  background-color: #1aac19;
  width: 210px;
  height: 40px;
  margin: 10px auto 0;
  color: #f1ffc6;
  position: relative;
  font-size: 14px;
  user-select: none;
}
.login-content > .login-button:hover {
  background-color: #129511;
}
.login-content > .login-button:active {
  background-color: #20aa17;
}
.login-content > .login-button > .button-name {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.login > .login-ui-bottom {
   color: #556483;
   position: absolute;
   left: 50%;
   transform: translateX(-50%);
   bottom: 43px;
   font-size: 12px;
   cursor: pointer;
   user-select: none;
}
</style>
