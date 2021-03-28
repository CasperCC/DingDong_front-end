// pages/message/message.js
const app = getApp()
var that, message, intervalId, socket, options, status
var inputVal = ''
var msgList = []
var windowWidth = wx.getSystemInfoSync().windowWidth
var windowHeight = wx.getSystemInfoSync().windowHeight
var keyHeight = 0

/**
 * 初始化数据
 */
function initData(that, options) {
  inputVal = ''
  intervalId = setInterval(() => {
    wx.request({
      url: app.config.serverUrl + '/api/getChattingRecords',
      method: 'POST',
      data: {
        clientId: app.config.socket.id,
        opposite: options.openId
      },
      dataType: 'json',
      success: res => {
        that.setData({
          msgList: res.data
        })
        msgList = res.data
        if (!status) {
          that.blur()
        }
        // that.setData({
        //   scrollHeight: '100vh',
        //   inputBottom: 0
        // })
        // that.setData({
        //   toView: 'msg-' + (msgList.length - 1)
        // })
        // // that.blur() 
      }
    })
  }, 1000);
  
  that.setData({
    inputVal
  })
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    news: [],
    nickName: '',
    avatarUrl: ''
  },  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    // console.log(options)
    // 设置socket连接地址
    socket = app.config.socket
    that.socketStart(options)
    initData(this, options)
    this.setData({
      myHeadIcon: app.globalData.userInfo.avatarUrl,
      oppoHeadIcon: options.avatarUrl
    })
  },
  socketStart: function(options) {
    wx.setNavigationBarTitle({
      title: options.nickName,
    })
    // 接收消息
    this.options = options
    socket.on('msg', function(msg) {
      msgList.push({
        speaker: 'opposite',
        contentType: 1,
        content: msg
      })
      this.setData({
        msgList
      })
      // console.log(msg)
    })
  },

  /**
   * 获取聚焦
   */
  focus: function(e) {
    status = 1
    keyHeight = e.detail.height
    this.setData({
      scrollHeight: (windowHeight - keyHeight + 43) + 'px'
    });
    this.setData({
      toView: 'msg-' + (msgList.length - 1),
      inputBottom: keyHeight + 'px'
    })
  },

  //失去聚焦(软键盘消失)
  blur: function(e) {
    status = 0
    this.setData({
      scrollHeight: '100vh',
      inputBottom: 0
    })
    this.setData({
      toView: 'msg-' + (msgList.length - 1)
    })
  },

  /**
   * 发送点击监听
   */
  sendClick: function(e) {
    if (e.detail.value) {
      msgList.push({
        speaker: 'me',
        contentType: 1,
        content: e.detail.value
      })
      inputVal = ''
      this.setData({
        msgList,
        inputVal,
        toView: 'msg-' + (msgList.length - 1)
      })
      socket.emit('sendMsg', {
        target: that.options.openId,
        msg: e.detail.value,
        type: 1
      })
    }
  },

  /**
   * 发送图片/文件按钮
   * @param {any} e 
   */
  sendContent: function (e) {
    var that = this
    wx.showActionSheet({
      itemList: ['发送图片', '发送文件'],
      success: function (res) {
        if (res.tapIndex == 0) {
          that.sendImage()
        } else {
          that.sendFile()
        }
      }
    })
  },

  sendImage: function () {
    var that = this
    that.getUploadParams().then(options => {
      wx.chooseImage({
        count: 9,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
          // tempFilePath可以作为img标签的src属性显示图片
          const tempFilePaths = res.tempFilePaths
          for (let i = 0; i < tempFilePaths.length; i++) {
            that.uploadToOss(options, tempFilePaths[i], 2).then(url => {
              console.log(url)
              msgList.push({
                speaker: 'me',
                contentType: 2,
                content: url
              })
              that.setData({
                msgList: msgList,
                toView: 'msg-' + (msgList.length - 1)
              })
            })
            
          }
        }
      })
    })
  },

  sendFile: function () {
    
  },

  uploadToOss: function (options, tempFilePaths, type) {
    return new Promise((resolve) => {
      var d = new Date();
      var date = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+'/';
      const path = type === 2 ? app.config.imageOssPath : app.config.fileOssPath
      const key = path+date+tempFilePaths.substring(11, 59)
      wx.uploadFile({
        filePath: tempFilePaths,
        name: 'file',
        url: app.config.uploadUrl,
        formData: {
          key,
          policy: options.policy,
          OSSAccessKeyId: options.OSSAccessKeyId,
          signature: options.signature
        },
        success: res => {
          if (res.statusCode === 204) {
            socket.emit('sendMsg', {
              target: that.options.openId,
              msg: key,
              type: 2
            })
            app.toastSuccess('发送成功！')
            that.getOssUrl(key).then(url => {
              resolve(url)
            })
          }
        },
        fail: err => {
          console.log(err)
        }
      })
    })
    
  },

  /**
   * 获取签名参数
   */
  getUploadParams: function () {
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.config.serverUrl + '/api/getUploadParams',
        method: 'POST',
        success: res => {
          resolve(res.data)
        }
      })
    })
  },

  /**
   * 获取文件临时链接
   * @param {string} key 文件在OSS的位置
   */
  getOssUrl: function (key) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.config.serverUrl + '/api/getOssUrl',
        method: 'POST',
        data: {
          objectName: key
        },
        dataType: 'json',
        success: res => {
          resolve(res.data)
        }
      })
    })
  },

  /**
   * 退回上一页
   */
  toBackClick: function() {
    wx.navigateBack({})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(intervalId)
    // console.log('onhide'+intervalId)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(intervalId)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})