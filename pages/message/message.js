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
        contentType: 'text',
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
        contentType: 'text',
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
        msg: e.detail.value
      })
    }
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