// pages/userInfomation/userProfile/userProfile.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowConfirm: false,
    nickNameCache: null,
    nickName: null,
    isAgree: true,
    isAgreeText: '',
    isBlackList: false,
    oppOpenId: null,
    userInfo: {},
    oppName: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '用户信息',
    })
    this.data.oppOpenId = options.oppOpenId
    this.setData({
      nickName: options.nickName
    })
    this.checkFriend(options.oppOpenId)
    this.getUserInfo(options.oppOpenId)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  getUserInfo: function (oppOpenId) {
    return new Promise((resolve, reject) => {
      var that = this
    wx.request({
      url: app.config.serverUrl + '/api/getUserInfo',
      method: 'POST',
      dataType: 'json',
      data: {
        openId: oppOpenId,
        clientId: app.config.socket.id,
      },
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
        that.data.oppName = res.data.wx_name
        resolve(res.data.wx_name)
      }
    })
    })
    
  },

  /**
   * 获取验证消息列表
   * @param {string} oppOpenId 
   */
  getVerifiList: function (oppOpenId, nickName) {
    var that = this
    if (!nickName) {
      nickName = that.data.oppName
    }
    wx.request({
      url: app.config.serverUrl + '/api/getVerification',
      data: {
        clientId: app.config.socket.id,
        oppOpenId: oppOpenId
      },
      dataType: 'json',
      method: 'POST',
      success: (res) => {
        var verifiList = res.data
        // that.data.verifiList = res.data
        if (verifiList.length == 1) {
          verifiList[0].nickName = nickName
        } else {
          for (let index = 0; index < verifiList.length; index++) {
            if (verifiList[index].from_id == oppOpenId) {
              verifiList[index].nickName = nickName
            } else {
              verifiList[index].nickName = app.globalData.userInfo.nickName
            }
          }
          // verifiList.forEach((val, index) => {
          //   console.log(val)
          //   if (val[index].from_id == oppOpenId) {
          //     val[index].nickName = nickName
          //   } else {
          //     val[index].nickName = app.globalData.userInfo.nickName
          //   }
          // })
        }
        that.setData({
          verifiList: verifiList
        })
      }
    })
  },

  sendMsg: function () {
    var that = this
    wx.navigateTo({
      url: '/pages/message/message?openId='+that.data.userInfo.wx_openid+'&nickName='+that.data.nickName+'&avatarUrl='+that.data.userInfo.avatarUrl
    })
  },

  /**
   * 验证好友关系
   * @param {string} oppOpenId 
   */
  checkFriend: function (oppOpenId) {
    var that = this
    wx.request({
      url: app.config.serverUrl + '/api/checkFriend',
      data: {
        clientId: app.config.socket.id,
        oppOpenId: oppOpenId
      },
      dataType: 'json',
      method: 'POST',
      success: (res) => {
        console.log(res.data)
        if (res.data.data[0].is_blackList == 0) {
          that.setData({
            isAgree: false,
            isBlackList: 0
          })
        } else if (res.data.data[0].is_blackList == 1) {
          that.setData({
            isAgree: true,
            isBlackList: 1
          })
        }
      }
    })
  },

  /**
   * 唤起设置备注按钮
   */
  callNickNameButton: function () {
    var that = this
    that.setData({
      isShowConfirm: true,
    })
  },

  /**
   * 设置输入框数据缓存
   * @param {any} e 
   */
  setValue: function (e) {
    var that = this
    if (that.data.isShowConfirm) {
      that.setData({
        nickNameCache: e.detail.value
      })
    }
    
  },

  /**
   * 弹窗取消按钮触发事件
   */
  cancel: function () {
    var that = this
    if (that.data.isShowConfirm) {
      that.setData({
        isShowConfirm: false,
        nickNameCache: null,
      })
    }
    
  },

  /**
   * 弹窗确认按钮触发事件
   */
  confirmAcceptance: function(){
    var that = this
    if(that.data.isShowConfirm) {
      if (!that.data.nickNameCache) {
        return
      } else {
        that.setNickName()
      }
    }
  },

  /**
   * 设置备注
   */
  setNickName: function () {
    var that = this
    wx.request({
      url: app.config.serverUrl + '/api/setNickName',
      data: {
        clientId: app.config.socket.id,
        oppOpenId: that.data.oppOpenId,
        nickName: that.data.nickNameCache
      },
      dataType: 'json',
      method: 'POST',
      success: (res) => {
        if (res.data.ret === 0) {
          app.toastSuccess('成功修改备注！')
          that.setData({
            isShowConfirm: false,
            nickName: that.data.nickNameCache
          })
          that.getVerifiList(that.data.oppOpenId, that.data.nickNameCache)
          that.setData({
            nickNameCache: null
          })
        } else {
          app.toastSuccess('系统错误！请重试！')
          that.setData({
            nickNameCache: null
          })
        }
      },
      fail: function () {
        app.toastSuccess('修改失败，请检查网络！')
        that.setData({
          nickNameCache: null
        })
      }
    })
  },

  /**
   * 拉入黑名单
   */
  setBlackList: function () {
    var that = this
    wx.showModal({
      title: '提示',
      content: '请确认将 '+that.data.oppName+' 拉入黑名单？',
      success (res) {
        if (res.confirm) {
          wx.request({
            url: app.config.serverUrl + '/api/setBlackList',
            data: {
              clientId: app.config.socket.id,
              oppOpenId: that.data.oppOpenId,
            },
            dataType: 'json',
            method: 'POST',
            success: (res) => {
              if (res.data.ret === 0) {
                that.setData({
                  isAgree: true,
                  isAgreeText: '已拉入黑名单',
                  isBlackList: 1,
                })
                app.toastSuccess('已拉入黑名单！')
              } else {
                app.toastSuccess('系统错误！请重试！')
              }
            }
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },

  /**
   * 拉出黑名单
   */
  pullOutBlackList: function () {
    var that = this
    wx.showModal({
      title: '提示',
      content: '请确认将 '+that.data.oppName+' 拉出黑名单？',
      success (res) {
        if (res.confirm) {
          wx.request({
            url: app.config.serverUrl + '/api/pullOutBlackList',
            data: {
              clientId: app.config.socket.id,
              oppOpenId: that.data.oppOpenId,
            },
            dataType: 'json',
            method: 'POST',
            success: (res) => {
              if (res.data.ret == 0) {
                that.setData({
                  isAgree: false,
                  isBlackList: 0,
                })
                app.toastSuccess('已拉出黑名单！')
              } else {
                app.toastSuccess('系统错误！请重试！')
              }
            }
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },

  /**
   * 同意好友申请
   */
  agreeApply: function () {
    var that = this
    wx.showModal({
      title: '提示',
      content: '请确认添加 '+that.data.oppName+' 为好友？',
      success (res) {
        if (res.confirm) {
          wx.request({
            url: app.config.serverUrl + '/api/agreeApply',
            data: {
              clientId: app.config.socket.id,
              oppOpenId: that.data.oppOpenId,
            },
            dataType: 'json',
            method: 'POST',
            success: (res) => {
              if (res.data.ret === 0) {
                that.setData({
                  isAgree: true,
                  isAgreeText: '已同意添加好友',
                  isBlackList: 2,
                })
                app.toastSuccess('已同意添加好友！')
              } else {
                app.toastSuccess('系统错误！请重试！')
              }
            }
          })
        } else if (res.cancel) {
          return
        }
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
  }
})