// pages/sendVerification/sendVerification.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    verification: null, // 验证消息
    nickName: null, // 昵称
    oppOpenId: null, // 对方的微信openId
    disabled: true, // 未输入验证消息不允许发送申请
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.data.oppOpenId = options.oppOpenId
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
   * 获取验证消息
   * @param {any} e 
   */
  setVerification: function (e) {
    var that = this
    if (!e.detail.value) {
      that.setData({
        disabled: true
      })
    } else {
      that.setData({
        disabled: false
      })
      that.data.verification = e.detail.value
    }
  },

  /**
   * 获取昵称
   * @param {any} e 
   */
  setNickName: function (e) {
    var that = this
    that.data.nickName = e.detail.value
  },

  submit: function () {
    var that = this
    wx.request({
      url:  app.config.serverUrl + '/api/sendApply',
      method: 'POST',
      data: {
        clientId: app.config.socket.id,
        oppOpenId: that.data.oppOpenId,
        verification: that.data.verification,
        nickName: that.data.nickName
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.ret === 0) {
          wx.navigateBack({
            delta: 1,
            success: () => {
              app.toastSuccess('成功发送申请！')
            }
          })
        }
      }
    })
  }
})