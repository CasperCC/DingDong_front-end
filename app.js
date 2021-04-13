// app.js
const regeneratorRuntime = require('./utils/runtime.min')
const io = require('/utils/weapp.socket.io')
var that
App({
  /**
   * 小程序相关配置
   */
  config: {
    // serverUrl: 'http://127.0.0.1:7001',
    serverUrl: 'https://cochan.tech',
    uploadUrl: 'https://oss.cochan.tech',
    imageOssPath: 'DingDong/images/',
    fileOssPath: 'DingDong/files/',
    socket: {}
  },
  /**
   * 全局变量
   */
  globalData: {
    code: null,
    userInfo: null,
    contacts: null,
    recUser: null,
    recGroup: null,
  },

  onLaunch() {
    that = this
    that.appStart()
  },

  async appStart() {
    await that.getUserInfo()
    var code = await that.getLoginCode()
    await that.socketStart(code)
    console.log(that.config.socket.id)
    await that.checkUserInfo()
  },

  /**
   * 获取userinfo
   */
  getUserInfo: () => {
    return new Promise((resolve) => {
      if (that.globalData.userInfo) {
        resolve(that.globalData.userInfo)
      }
    })
  },

  /**
   * socket连接
   */
  async socketStart(code) {
    return new Promise((resolve) => {
      const socket = io(that.config.serverUrl, { query: 'code='+code, 'reconnect': true })
      // 重连事件
      socket.on('reconnect', () => {
        var newCode = that.getLoginCode()
        socket.emit('reconnection', {
          code: newCode
        })
        console.log('reconnect')
      })

      // 服务器报错事件
      socket.on('error', err => {
        console.log(err)
        // that.appStart()
      })

      // 连接事件
      socket.on('connect', () => {
        console.log('connect')
        that.config.socket = socket
        resolve(socket)
      })

      // 断开连接事件
      socket.on('disconnect', () => {
        console.log('disconnect')
      })

      // 接收私聊事件
      socket.on('receiveMsg', recUser => {
        that.globalData.recUser = recUser
      })

      // 接收群聊事件
      socket.on('receiveMsgGroup', recGroup => {
        that.globalData.recGroup = recGroup
      })

    })
  },

  checkUserInfo: () => {
    return new Promise(() => {
      wx.request({
        url: that.config.serverUrl + '/api/checkUserInfo',
        method: 'POST',
        data: {
          nickName: that.globalData.userInfo.nickName,
          avatarUrl: that.globalData.userInfo.avatarUrl,
          clientId: that.config.socket.id
        },
        dataType: 'json',
        success: data => {
          console.log(data.data)
        }
      })
    })
  },

  /**
   * 获取登录唯一凭证code
   */
  getLoginCode: () => {
    return new Promise((resolve) => {
      wx.login({
        success: res => {
          resolve(res.code)
        }
      })
    })
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

  /**
   * 监听全局变量globalData中的参数变化
   * @param {string} method 函数名
   * @param {string} param  需要监听globalData中的参数名
   */
  watch: function (method, param) {
    var obj = this.globalData
    Object.defineProperty(obj, param, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        this._param = value;
        method(value);
      },
      get: function(){
        return this._param
      }
    })
  }
})
