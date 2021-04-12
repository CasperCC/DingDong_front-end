// pages/overwork/create/create.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
  data:{
    index: 0, // 默认显示第一条
    startDate: '2021-04-03',
    endDate: '2021-04-03',
    start: null,
    end: null,
    UI: {
      title: "新建", current: "当前选择", startdatepicker: "休假开始日期", enddatepicker:"休假结束日期", timepicker: "休假时长", reasonpicker: "休假理由", memo: "备注", save: "保存"
    },
    overworkReasons: [
      {id: 0, msg: "调休"}, {id: 1, msg: "事假"}, {id: 2, msg: "病假"}, {id: 3, msg: "婚假"}, {id: 4, msg: "产假"}, {id: 5, msg: "探亲假"}, {id: 6, msg: "丧假"}
    ]
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var now = Date.now()
    var today = util.formatDate(new Date(now), "today")
    var end = util.formatDate(new Date(now), "end", 7)
    this.setData({
      startDate: today,
      endDate: today,
      start: today,
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
  bindStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  bindEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value
    })
  },

  /**
   * 用户点击提交按钮
   * @param {any}} e 
   */
  formSubmit: function (e) {
    var that = this
    wx.showModal({
      title: '确认申请',
      content: '申请后不可撤销，请确认是否发送？',
      success: function(res) {
        if (res.confirm) {
          that.setVacationApply(e.detail.value)
        }
      }
    })
  },

  /**
   * 发送休假申请
   * @param {JSON} data 
   */
  setVacationApply: function (data) {
    var that = this
    var startTimeStamp = that.dateToTimeStamp(data.startDate)
    var endTimeStamp = that.dateToTimeStamp(data.endDate)
    wx.request({
      url: app.config.serverUrl + '/api/setVacationApply',
      method: 'POST',
      dataType: 'json',
      data: {
        clientId: app.config.socket.id,
        startTimeStamp: startTimeStamp,
        endTimeStamp: endTimeStamp,
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
  },

  /**
   * 日期字符串转时间戳
   * @param {string}} dateStr 
   */
  dateToTimeStamp: function (dateStr) {
    var date = new Date(dateStr)
    var timeStamp = date.getTime(date) / 1000
    return timeStamp
  }
})