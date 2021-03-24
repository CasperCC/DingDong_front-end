// pages/newFriends/newFriends.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    setInterval(() => {
      this.getNewFriends()
    }, 1000)
  },

  /**
   * 
   */
  getNewFriends: function () {
    wx.request({
      url: app.config.serverUrl + '/api/getNewFriends',
      method: 'POST',
      data: { clientId: app.config.socket.id },
      dataType: 'json',
      success: res => {
        this.setData({
          applyList: res.data
        })
        // console.log(app.config.socket.id)
        // console.log(res.data)
      }
    })
  },

  goToUserInfomation: function (e) {
    var item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/userInfomation/userInfomation?oppOpenId=' + item.wx_openid + '&is_applicant=' + item.is_applicant
    })
  }

})