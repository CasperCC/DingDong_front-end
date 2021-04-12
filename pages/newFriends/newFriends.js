// pages/newFriends/newFriends.js

const app = getApp()
var interval

Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyList: [],
    group: false,
    groupId: null,
    isShowConfirm: false,
    nameCache: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var title
    if (options.type == 'group') {
      title = '加入的群聊'
      that.setData({
        group: true
      })
      interval = setInterval(() => {
        this.getUserInGroups()
      }, 1000)
    } else {
      title = '新的朋友'
      interval = setInterval(() => {
        this.getNewFriends()
      }, 1000)
    }
    wx.setNavigationBarTitle({
      title: title,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
  },

  goToGroupInfomation: function (e) {
    var that = this
    var item = e.currentTarget.dataset.item
    wx.showActionSheet({
      itemList: ['发送消息', '修改名称'],
      success(res) {
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '/pages/message/message?groupId='+item.group_id+'&nickName='+item.name+'&group=true'
          })
        } else {
          that.setData({
            isShowConfirm: true
          })
          that.data.groupId = item.group_id
        }
      }
    })
  },

  getUserInGroups: function () {
    wx.request({
      url: app.config.serverUrl + '/api/getUserInGroups',
      method: 'POST',
      dataType: 'json',
      data: {
        clientId: app.config.socket.id
      },
      success: res => {
        this.setData({
          applyList: res.data
        })
        // console.log(res.data)
      }
    })
  },

  /**
   * 设置输入框数据缓存
   * @param {any} e 
   */
  setValue: function (e) {
    var that = this
    that.data.nameCache = e.detail.value
  },

  /**
   * 弹窗取消按钮触发事件
   */
  cancel: function () {
    var that = this
    that.setData({
      isShowConfirm: false
    })
    that.data.nameCache = null
  },

  /**
   * 弹窗确认按钮触发事件
   */
  confirmAcceptance: function(){
    var that = this
    console.log(that.data.nameCache)
    that.setData({
      isShowConfirm: false
    })
    that.updateGroupName()
  },

  updateGroupName: function () {
    var that = this
    wx.request({
      url: app.config.serverUrl + '/api/updateGroupName',
      method: 'POST',
      dataType: 'json',
      data: {
        groupId: that.data.groupId,
        name: that.data.nameCache
      },
      success: res => {
        if (res.data.ret === 0) {
          app.toastSuccess('修改成功！')
        }
      }
    })
  },

  onUnload: function () {
    
  }

})