// pages/message/message.js
const io = require('../../utils/weapp.socket.io')
const socket = io('http://127.0.0.1:7001')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    socket.on('connect', function() {
      console.log('connected')
    });
    socket.emit('exchange', {
      target: 'Dkn3UXSu8_jHvKBmAAHW',
      payload: {
        msg: 'test'
      }
    });
    socket.on('news', () => {
      console.log('received news: ', news)
    });
    
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

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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