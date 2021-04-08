// pages/message/message.js
const app = getApp()
var that, message, socket, options, status
var inputVal = ''
var msgList = []
var windowWidth = wx.getSystemInfoSync().windowWidth
var windowHeight = wx.getSystemInfoSync().windowHeight
var keyHeight = 0


Page({
  /**
   * 页面的初始数据
   */
  data: {
    news: [],
    nickName: '',
    avatarUrl: '',
    imageList: [],
    pageType: false,
  },  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    this.options = options
    this.data.pageType = true
    // 设置socket连接地址
    socket = app.config.socket
    that.socketStart(options)
    that.initData(this, options)
    const oppoHeadIcon = options.avatarUrl ? options.avatarUrl : ''
    this.setData({
      myHeadIcon: app.globalData.userInfo.avatarUrl,
      oppoHeadIcon: oppoHeadIcon
    })
    if (options.group == 'true') {
      that.joinRoom()
      that.updateRecTime()
    } else {
      that.updateUnReadNum()
    }
  },
  /**
   * 初始化数据
   */
  initData: function(that, options) {
    that = this
    inputVal = ''
    options.openId ? that.getChattingRecords(options) : that.getChattingRecordsGroup(options)
    var groupData = options.group ? options.group : null
    that.setData({
      inputVal,
      group: groupData
    })
  },

  /**
   * 进入房间
   */
  joinRoom: function () {
    var that = this
    socket.emit('joinRoom', {
      roomId: that.options.groupId
    })
  },

  /**
   * 退出房间
   */
  leaveRoom: function () {
    var that = this
    socket.emit('leaveRoom', {
      roomId: that.options.groupId
    })
  },

  socketStart: function(options) {
    wx.setNavigationBarTitle({
      title: options.nickName,
    })
    options.group == 'true' ? app.watch(that.recGroup, 'recGroup') : app.watch(that.recUser, 'recUser')
  },

  recGroup: function (rec) {
    if (!rec) {
      return
    }
    if (rec.clientId != app.config.socket.id) {
      msgList.push({
        speaker: 'opposite',
        contentType: rec.contentType,
        content: rec.content,
        group: true,
        avatarUrl: rec.avatarUrl,
        wx_name: rec.wx_name
      })
      this.setData({
        msgList
      })
      this.setData({
        toView: 'msg-' + (msgList.length - 1)
      })
      if (rec.contentType === 2) {
        that.data.imageList.push(rec.content)
      }
    }
  },

  recUser: function (rec) {
    if (!rec || rec.oppOpenId != that.options.openId) {
      return
    }
    console.log(rec)
    msgList.push({
      speaker: rec.speaker,
      contentType: rec.contentType,
      content: rec.content
    })
    this.setData({
      msgList
    })
    this.setData({
      toView: 'msg-' + (msgList.length - 1)
    })
    if (rec.contentType === 2) {
      that.data.imageList.push(rec.content)
    }
    if (that.data.pageType) {
      socket.emit('isRead', {
        msgId: rec.msgId
      })
    }
    // console.log(msg)
  },

  /**
   * 预览图片
   * @param {any} e 
   */
  previewProfilePhoto: function (e) {
    var profilePhotoUrl = e.currentTarget.dataset.img
    wx.previewImage({
      current: profilePhotoUrl,
      urls: that.data.imageList,
    })
  },

  /**
   * 获取聚焦
   */
  focus: function(e) {
    status = 1
    keyHeight = e.detail.height
    this.setData({
      scrollHeight: (windowHeight - keyHeight + 43) + 'px'
    });
    this.setData({
      toView: 'msg-' + (msgList.length - 1),
      inputBottom: keyHeight + 'px'
    })
  },

  //失去聚焦(软键盘消失)
  blur: function(e) {
    status = 0
    this.setData({
      scrollHeight: '100vh',
      inputBottom: 0
    })
    this.setData({
      toView: 'msg-' + (msgList.length - 1)
    })
  },

  /**
   * 获取私聊聊天记录
   * @param {any} options 
   */
  getChattingRecords: function (options) {
    wx.request({
      url: app.config.serverUrl + '/api/getChattingRecords',
      method: 'POST',
      data: {
        clientId: app.config.socket.id,
        opposite: options.openId
      },
      dataType: 'json',
      success: res => {
        that.setData({
          msgList: res.data
        })
        msgList = res.data
        if (!status) {
          that.blur()
        }
        for (let i = 0; i < msgList.length; i++) {
          if (msgList[i].contentType === 2) {
            that.data.imageList.push(msgList[i].content)
          }
        }
      }
    })
  },

  /**
   * 获取群聊聊天记录
   * @param {any} options 
   */
  getChattingRecordsGroup: function (options) {
    wx.request({
      url: app.config.serverUrl + '/api/getChattingRecordsGroup',
      method: 'POST',
      data: {
        clientId: app.config.socket.id,
        groupId: options.groupId
      },
      dataType: 'json',
      success: res => {
        that.setData({
          msgList: res.data
        })
        msgList = res.data
        if (!status) {
          that.blur()
        }
        for (let i = 0; i < msgList.length; i++) {
          if (msgList[i].contentType === 2) {
            that.data.imageList.push(msgList[i].content)
          }
        }
      }
    })
  },

  /**
   * 发送点击监听
   */
  sendClick: function(e) {
    if (e.detail.value) {
      msgList.push({
        speaker: 'me',
        contentType: 1,
        content: e.detail.value
      })
      inputVal = ''
      this.setData({
        msgList,
        inputVal,
        toView: 'msg-' + (msgList.length - 1)
      })
      if (that.options.group == 'true') {
        socket.emit('sendMsgGroup', {
          target: that.options.groupId,
          msg: e.detail.value,
          type: 1
        })
      } else {
        socket.emit('sendMsg', {
          target: that.options.openId,
          msg: e.detail.value,
          type: 1
        })
      }
    }
  },

  /**
   * 发送图片/文件按钮
   * @param {any} e 
   */
  sendContent: function (e) {
    var that = this
    wx.showActionSheet({
      itemList: ['发送图片', '发送文件'],
      success: function (res) {
        if (res.tapIndex == 0) {
          that.sendImage()
        } else {
          that.sendFile()
        }
      }
    })
  },

  sendImage: function () {
    var that = this
    that.getUploadParams().then(options => {
      wx.chooseImage({
        count: 9,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
          // tempFilePath可以作为img标签的src属性显示图片
          const tempFilePaths = res.tempFilePaths
          for (let i = 0; i < tempFilePaths.length; i++) {
            that.uploadToOss(options, tempFilePaths[i], 2).then(url => {
              msgList.push({
                speaker: 'me',
                contentType: 2,
                content: url
              })
              that.data.imageList.push(url)
              that.setData({
                msgList: msgList,
                toView: 'msg-' + (msgList.length - 1)
              })
            })
          }
        }
      })
    })
  },

  sendFile: function () {
    
  },

  uploadToOss: function (options, tempFilePaths, type) {
    return new Promise((resolve) => {
      var d = new Date();
      var date = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+'/';
      const path = type === 2 ? app.config.imageOssPath : app.config.fileOssPath
      const key = path+date+tempFilePaths.substring(11, 60)
      wx.uploadFile({
        filePath: tempFilePaths,
        name: 'file',
        url: app.config.uploadUrl,
        formData: {
          key,
          policy: options.policy,
          OSSAccessKeyId: options.OSSAccessKeyId,
          signature: options.signature
        },
        success: res => {
          if (res.statusCode === 204) {
            if (that.options.group == 'true') {
              socket.emit('sendMsgGroup', {
                target: that.options.groupId,
                msg: key,
                type: 2
              })
            } else {
              socket.emit('sendMsg', {
                target: that.options.openId,
                msg: key,
                type: 2
              })
            }
            app.toastSuccess('发送成功！')
            that.getOssUrl(key).then(url => {
              resolve(url)
            })
          }
        },
        fail: err => {
          console.log(err)
        }
      })
    })
    
  },

  /**
   * 获取签名参数
   */
  getUploadParams: function () {
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.config.serverUrl + '/api/getUploadParams',
        method: 'POST',
        success: res => {
          resolve(res.data)
        }
      })
    })
  },

  /**
   * 获取文件临时链接
   * @param {string} key 文件在OSS的位置
   */
  getOssUrl: function (key) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.config.serverUrl + '/api/getOssUrl',
        method: 'POST',
        data: {
          objectName: key
        },
        dataType: 'json',
        success: res => {
          resolve(res.data)
        }
      })
    })
  },

  /**
   * 退回上一页
   */
  toBackClick: function() {
    
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

  updateRecTime: function () {
    wx.request({
      url: app.config.serverUrl + '/api/updateRecTime',
      method: 'POST',
      dataType: 'json',
      data: {
        clientId: app.config.socket.id,
        groupId: that.options.groupId
      },
      success: res => {
        if (res.data.ret === -1) {
          console.log('updateRecTime', '网络错误！')
        }
      }
    })
  },

  updateUnReadNum: function () {
    wx.request({
      url: app.config.serverUrl + '/api/updateUnReadNum',
      method: 'POST',
      dataType: 'json',
      data: {
        clientId: app.config.socket.id,
        oppOpenId: that.options.openId
      },
      success: res => {
        if (res.data.ret === -1) {
          console.log('网络错误！')
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.options.group == 'true') {
      this.updateRecTime()
      this.leaveRoom()
    }
    that.data.pageType = false
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