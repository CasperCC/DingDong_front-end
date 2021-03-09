// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    newsList: []
  },
  // 事件处理函数
  goToChatPage(e) {
    var item = e.currentTarget.dataset.item
    // console.log(e)
    wx.navigateTo({
      url: '/pages/message/message?openId='+item.openId+'&nickName='+item.nickName+'&avatarUrl='+item.avatarUrl
    })
  },
  onLoad() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onShow() {
    if (app.globalData.userInfo) {
      setInterval(() => {
        this.getNewsList()
      }, 1000);
    } else {
      setTimeout(() => {
        if (app.globalData.userInfo) {
          setInterval(() => {
            this.getNewsList()
          }, 1000)
        } else {
          app.toastSuccess('您未登录或网络超时!')
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/mine/mine',
            })
          }, 2000)
        }
      }, 2000)
    }
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
  getNewsList(id) {
    wx.request({
      url: app.config.serverUrl + '/api/getNewsList',
      method: 'POST',
      data: { clientId: app.config.socket.id },
      dataType: 'json',
      success: res => {
        this.setData({
          newsList: res.data
        })
        // console.log(app.config.socket.id)
        // console.log(res.data)
      }
    })
  }
})
