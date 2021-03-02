// app.js
var that
App({
  onLaunch() {
    that = this
    this.getUserInfo()
    .then(() => {
      return this.login()
    })
    .then(code => {
      return this.socketStart(code)
    })
    .then(data => {
      const {code, socket} = data
      this.config.socket = socket
      this.checkUserInfo(code, socket)
    })
    .then(() => {
      this.getContacts()
    })
  },

  /**
   * 获取userinfo
   */
  getUserInfo: () => {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                that.globalData.userInfo = res.userInfo
                console.log(that.globalData.userInfo)
                if (that.userInfoReadyCallback) {
                  that.userInfoReadyCallback(res)
                }
                resolve(res.userInfo)
              }
            })
          }
        }
      })
    })
  },

  /**
   * socket连接
   */
  socketStart: code => {
    return new Promise((resolve, reject) => {
      const io = require('/utils/weapp.socket.io')
      const socket = io(that.config.serverUrl, { query: 'code='+code })
      resolve({code, socket})
    })
  },

  checkUserInfo: (code, socket) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        wx.request({
          url: that.config.serverUrl + '/api/getUserInfo',
          method: 'POST',
          data: {
            code: code,
            nickName: that.globalData.userInfo.nickName,
            avatarUrl: that.globalData.userInfo.avatarUrl,
            clientId: socket.id
          },
          dataType: 'json',
          header: {
            'content-type': 'application/json'
          },
          success: data => {
            console.log(data.data)
          },
          fail: err => {
            console.log(err)
          }
        })
      }, 400)
    })
  },

  /**
   * 获取登录唯一凭证code
   */
  login: () => {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          resolve(res.code)
        }
      })
    })
  },

  /**
   * 获取通讯录
   */
  getContacts: () => {
    setTimeout(() => {
      wx.request({
        url: that.config.serverUrl + '/api/getContacts',
        method: 'POST',
        success(res) {
          that.globalData.contacts = res.data
          // console.log(res)
          if(that.contactsReadyCallback) {
            that.contactsReadyCallback(res)
          }
        },
        fail: err => {
          console.log(err)
        }
      })
    }, 400)
  },
  
  /**
   * 弹窗提示
   * @param {string} showTitle 
   */
  toastSuccess: showTitle => {
    wx.showToast({
      title: showTitle,
      icon: 'none',
      //image: '/images/notice.png', 
      duration: 3000,
    })
  },

  // 小程序相关配置
  config: {
    serverUrl: 'http://127.0.0.1:7001',
    // serverUrl: 'http://47.115.184.168:7001',
    heartBeat: '/heartbeat',
    socket: {}
  },

  // 全局变量
  globalData: {
    code: null,
    userInfo: null,
    contacts: null
  }
})
