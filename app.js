// app.js
var that = this
App({
  onLaunch() {
    that = this
    this.getUserInfo(that)
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
    
    // let index = '开发环境'
    // let NODE_ENV = 'pro';
    // const fileManager = wx.getFileSystemManager();
    // try{
    //   fileManager.accessSync('./env.txt');
    //   NODE_ENV = 'dev';
    // }catch(e){}
    // if( NODE_ENV === 'pro' ){
    //   that.globalData.serverUrl = 'https://cochan.tech';
    // }else{
    //   that.globalData.serverUrl = 'http://127.0.0.1:7001';
    // }
  },

  /**
   * 获取userinfo
   */
  getUserInfo: (that) => {
    return new Promise((resolve, reject) => {
      if (that.globalData.userInfo) {
        resolve(that.globalData.userInfo)
      }
    })
  },

  /**
   * socket连接
   */
  socketStart: code => {
    return new Promise((resolve, reject) => {
      const io = require('/utils/weapp.socket.io')
      const socket = io(that.config.serverUrl, { query: 'code='+code, 'reconnect': true })
      socket.on('reconnect', data => {
        console.log('reconnect')
        that.login().then(code => {
          socket.emit('reconnection', {
            code: code
          })
        })
      })
      socket.on('error', err => {
        console.log(err)
        that.onLaunch()
      })
      socket.on('connect', data => {
        console.log('connect')
      })
      socket.on('disconnect', res => {
        console.log('disconnect')
      })
      socket.on('receiveMsg', recUser => {
        // console.log('recUser', recUser)
        that.globalData.recUser = recUser
      })
      socket.on('receiveMsgGroup', recGroup => {
        // console.log('recGroup', recGroup)
        that.globalData.recGroup = recGroup
      })
      resolve({code, socket})
    })
  },

  checkUserInfo: (code, socket) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(socket.id)
        wx.request({
          url: that.config.serverUrl + '/api/checkUserInfo',
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
      }, 1500)
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
        dataType: 'json',
        data: {
          clientId: that.config.socket.id
        },
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
    }, 1500)
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
  },
  
  // 小程序相关配置
  config: {
    serverUrl: 'http://127.0.0.1:7001',
    // serverUrl: 'https://cochan.tech',
    uploadUrl: 'https://oss.cochan.tech',
    imageOssPath: 'DingDong/images/',
    fileOssPath: 'DingDong/files/',
    socket: {}
  },

  // 全局变量
  globalData: {
    code: null,
    userInfo: null,
    contacts: null,
    recUser: null,
    recGroup: null,
  }
})
