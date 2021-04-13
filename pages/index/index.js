// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    newsList: null
  },
  // 事件处理函数
  goToChatPage(e) {
    var item = e.currentTarget.dataset.item
    // console.log(e)
    if (item.openId) {
      wx.navigateTo({
        url: '/pages/message/message?openId='+item.openId+'&nickName='+item.nickName+'&avatarUrl='+item.avatarUrl
      })
    } else {
      wx.navigateTo({
        url: '/pages/message/message?groupId='+item.groupId+'&nickName='+item.nickName+'&group=true'
      })
    }
    
  },
  async onLoad() {
    var that = this
    var inter = await that.getSocket()
    clearInterval(inter)
    that.getNewsList()
  },
  onShow() {
    var that = this
    if (app.config.socket.id) {
      that.getNewsList()
    }
    app.watch(that.recGroup, 'recGroup')
    app.watch(that.recUser, 'recUser')
  },
  getSocket: function () {
    return new Promise((resolve) => {
      var inter = setInterval(() => {
        if (app.config.socket.id) {
          resolve(inter)
        }
      }, 1000)
    })
  },
  recGroup: function () {
    var that = this
    that.getNewsList()
  },
  recUser: function () {
    var that = this
    that.getNewsList()
  },
  getUserInfo(e) {
    // console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    app.socketStart()
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getNewsList() {
    wx.request({
      url: app.config.serverUrl + '/api/getNewsList',
      method: 'POST',
      data: { clientId: app.config.socket.id },
      dataType: 'json',
      success: res => {
        this.setData({
          newsList: res.data
        })
      }
    })
  }
})
