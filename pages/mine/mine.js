// 获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    list: [
      {
        id: 'notice',
        name: '公告',
        open: false,
        pages: [
          // {path: "announce", title: '发布公告'},
          {path: "history", title: '历史公告'}
        ]
      }, {
        id: 'timecard',
        name: '打卡',
        open: false,        
        pages: [
          {path: "normal", title: '正常出勤'},
          {path: "history", title: '打卡记录'}
          ]
      }, {
        id: 'apply',
        name: '各类申请',
        open: false,        
        pages: [
          {path: "overwork", title: '加班申请'},
          {path: "vacation", title: '请假申请'}
          ]
      }, {
        id: 'reply',
        name: '申请结果',
        open: false,        
        pages: [
          {path: "overwork", title: '加班批复'},
          {path: "vacation", title: '请假批复'}
          ]
      }
    ]
  },
  
  kindToggle: function (e) {        
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  },
  onLoad() {
    this.getProfile()
  },

  getProfile: function () {
    var that = this
    wx.request({
      url: app.config.serverUrl + '/api/getProfile',
      method: 'POST',
      dataType: 'json',
      data: {
        clientId: app.config.socket.id
      },
      success: res => {
        that.setData({
          userInfo: res.data
        })
      }
    })
  },

  /**
   * 预览头像👤
   * @param {any} e 
   */
  previewProfilePhoto: function (e) {
    var profilePhotoUrl = e.currentTarget.dataset.icon
    wx.previewImage({
      current: profilePhotoUrl,
      urls: [profilePhotoUrl],
    })
  },

  /**
   * 跳转公告页面
   */
  goToNoticePage: function () {
    wx.navigateTo({
      url: '/pages/notice/notice',
    })
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