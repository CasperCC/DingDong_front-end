// pages/message/message.js
const app = getApp()
const io = require('../../utils/weapp.socket.io')
// 设置socket连接地址
const socketUrl = 'http://127.0.0.1' + ':' + '7001'
const socket = io(socketUrl)
const heartbeat = io(socketUrl+'/heartbeat')
const code = app.globalData.code
var that, message, intervalId, heartBeatTimeoutId, heartBeatRes

Page({

  /**
   * 页面的初始数据
   */
  data: {
    news: [],
    code: app.globalData.code,
    nickName: app.globalData.nickName
  },

  randomString: function (len) {
    len = len || 32
    var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
    var maxPos = $chars.length
    var pwd = ''
    var i
    for (i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
  },

  searchBox: function (e) {
    message = e.detail.value.news
    socket.emit('exchange', {
      target: 'kTt7gN7b8O1mweh1AAAM',
      payload: {
        msg: message
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    that.socketStart();
    // console.log(app.globalData.code)
  },

  socketStart: function() {
    // 发送连接成功标志
    socket.emit('connection', {
      connect: 'connected!'
    })
    // 心跳检测
    intervalId = setInterval(() => {
      heartbeat.emit('heartbeat', {
        msg: 'ok'
      })
    }, 1000)
    // 接收消息
    socket.on('new', function(e) {
      var newMes = {me: e}
      let news = that.data.news
        news.push(newMes)
        that.setData({
          news: news
        })
      console.log(news)
    })
    wx.login({
      success: res => {
        wx.request({
          url: 'http://127.0.0.1:7001/api/getUserInfo',
          method: 'POST',
          data: {
            code: res.code,
            nickName: app.globalData.userInfo.nickName,
            avatarUrl: app.globalData.userInfo.avatarUrl
          },
          dataType: 'json',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success(data) {
            console.log(data.data)
          }
        })
      }
    })
    
  },

  socketReco: function() {
    heartbeat.on('heartBeatRes', (e) => {
      heartBeatRes = e
      clearTimeout(heartBeatTimeoutId)
    })
    heartBeatTimeoutId = setTimeout(() => {
      if(!heartBeatRes) {
        console.log('reconnecting...')
        that.onLoad()
      }
    }, 3000)
    
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