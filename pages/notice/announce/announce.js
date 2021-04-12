// pages/notice/announce/announce.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
  data:{
    UI: {
      title: "新建", notice_title: "公告标题", content: "公告内容", save: "发布", reset: "清空"
    }
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){

  },

  formSubmit: function (e) {
    var that = this
    wx.showModal({
      title: '确认发布',
      content: '发布后将通知所有人，请确认是否发送？',
      success: function(res) {
        if (res.confirm) {
          that.setNotice(e.detail.value)
        }
      }
    })
  },

  /**
   * 发送加班申请
   * @param {json} data 
   */
  setNotice: function (data) {
    wx.request({
      url: app.config.serverUrl + '/api/setNotice',
      method: 'POST',
      dataType: 'json',
      data: {
        clientId: app.config.socket.id,
        title: data.title,
        content: data.content
      },
      success: (res) => {
        if (res.data.ret === 0) {
          wx.showToast({
            title: '已发布',
            icon: 'success',
            duration: 1000
          })
          setTimeout(() => {
            wx.navigateBack({delta: 1})
          }, 1000)
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none',
            duration: 1000
          })
        }
      }
    })
  },
  formReset: function () {
    return
  }
})