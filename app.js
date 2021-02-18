// app.js
var io, socket, heartbeat, intervalId, that
App({
  onLaunch() {
    this.login().then(code => {
      this.globalData.code = code
      io = require('/utils/weapp.socket.io')
      socket = io(this.config.serverUrl, { query: 'code='+code})
      this.config.socket = socket
      heartbeat = io(this.config.serverUrl + this.config.heartBeat)
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res.userInfo
                // console.log(this.globalData.userInfo)
                this.socketStart()
                console.log(res.userInfo)
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            })
          }
        }
      })
    })
    // console.log(this.globalData.code)
    that = this
    // 获取用户信息
    
    wx.request({
      url: this.config.serverUrl + '/api/getContacts',
      method: 'POST',
      success(res) {
        that.globalData.contacts = res.data
        // console.log(that.globalData.contacts)
        if(that.contactsReadyCallback) {
          that.contactsReadyCallback(res)
        }
      }
    })
  },
  socketStart: function() {
    if (socket === undefined) {
      that.onLaunch()
    }
    this.config.socket = socket
    console.log(socket.id)
    wx.request({
      url: that.config.serverUrl + '/api/getUserInfo',
      method: 'POST',
      data: {
        code: that.globalData.code,
        nickName: that.globalData.userInfo.nickName,
        avatarUrl: that.globalData.userInfo.avatarUrl,
        clientId: that.config.socket.id
      },
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success(data) {
        console.log(data.data)
      }
    })
  },
  login: function () {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          resolve(res.code)
        }
      })
    })
  },
    // 登录
  toastSuccess: function (showTitle) {
    wx.showToast({
      title: showTitle,
      icon: 'none', //success loading none
      //image: '/images/notice.png', 
      duration: 3000,
    })
  },
  config: {
    serverUrl: 'http://127.0.0.1:7001',
    heartBeat: '/heartbeat',
    socket: null
  },
  globalData: {
    code: null,
    userInfo: null,
    contacts: null
  }
})
