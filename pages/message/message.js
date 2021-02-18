// pages/message/message.js
const app = getApp()
var that, message, intervalId, socket, options
var inputVal = ''
var msgList = []
var windowWidth = wx.getSystemInfoSync().windowWidth
var windowHeight = wx.getSystemInfoSync().windowHeight
var keyHeight = 0

/**
 * 初始化数据
 */
function initData(that) {
  inputVal = ''
  msgList = [{
      speaker: 'opposite',
      contentType: 'text',
      content: '欢迎来到英雄联盟，敌军还有30秒到达战场，请做好准备！'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '我怕是走错片场了...'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '1'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '2'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '3'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '4'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '5'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '6'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '7'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '8'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '9'
    },
    {
      speaker: 'me',
      contentType: 'text',
      content: '10'
    },
  ]
  that.setData({
    msgList,
    inputVal
  })
  that.blur()
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
    initData(this)
    var date = new Date()
    this.setData({
      myHeadIcon: app.globalData.userInfo.avatarUrl,
      oppoHeadIcon: options.avatarUrl,
      time: date.getHours() + ':' + date.getMinutes()
    })
  },
  socketStart: function(options) {
    // wx.setNavigationBarTitle({
    //   title: options.nickName,
    // })
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
    keyHeight = e.detail.height;
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
    // clearInterval(intervalId)
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