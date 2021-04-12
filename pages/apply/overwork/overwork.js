// pages/overwork/create/create.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
  data:{
    index: 0, // 默认显示第一条
    date: '2021-04-03',
    start: null,
    end: null,
    time: '01:30',
    UI: {
      title: "新建", current: "当前选择", datepicker: "加班日期", timepicker: "加班时长", reasonpicker: "加班理由", memo: "备注", save: "保存"
    },
    overworkReasons: [
      {id: 0, msg: "无特殊理由"}, {id: 1, msg: "客户紧急情况"}, {id: 2, msg: "项目延迟"}
    ]
    },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var now = Date.now()
    var today = util.formatDate(new Date(now), "today")
    var start = util.formatDate(new Date(now), "start")
    var end = util.formatDate(new Date(now), "end")
    this.setData({
      date: today,
      start: start,
      end: end
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){

  },
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function(e) {
    this.setData({
      time: e.detail.value
    })
  },
  formSubmit: function (e) {
    var that = this
    wx.showModal({
      title: '确认申请',
      content: '申请后不可撤销，请确认是否发送？',
      success: function(res) {
        if (res.confirm) {
          that.setOverworkApply(e.detail.value)
        }
      }
    })
  },

  /**
   * 发送加班申请
   * @param {json} data 
   */
  setOverworkApply: function (data) {
    var date = new Date(data.date)
    var timeStamp = date.getTime(date) / 1000
    var timeStrArray = data.time.split(":")
    var duration = parseInt(timeStrArray[0]) * 60 + parseInt(timeStrArray[1])
    wx.request({
      url: app.config.serverUrl + '/api/setOverworkApply',
      method: 'POST',
      dataType: 'json',
      data: {
        clientId: app.config.socket.id,
        date: timeStamp,
        duration: duration,
        reason: data.reason,
        comment: data.memo
      },
      success: (res) => {
        if (res.data.ret === 0) {
          wx.showToast({
            title: '已申请',
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
  }
})