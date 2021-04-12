// pages/timecard/normal/normal.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
var amapFile = require('../../../utils/amap-wx.js');

Page({
  data:{
    latitude: 0,
    longitude: 0,
    location: null,
    displayTime: null,
    index: 0,
    title: '打卡',
    checkType: [
      {id: 0, msg: "上班"}, {id: 1, msg: "下班"}
    ],      
    loading: false, // 更新地理位置加载状态
    checkMode: {},
    UI: {
      checkType: "打卡目的", current: "当前选择", locName: "位置名称", locDesc: "详细位置", locNameContent: "等待获取", locDescContent: "等待获取", locButton: "更新定位", submitButton: "提交"
    }
  },
  onLoad:function(options){
    this.relocate()
  },

  onReady:function(){
    // 页面渲染完成
    this.setData({
        displayTime: util.currentTime()    
      });
  },

  onShow:function(){
    // 时间显示
    var that = this;
    setInterval(function(){
      that.setData({
        displayTime: util.currentTime()    
      });
    }, 1000)
  },
  
  bindPickerChange:function(e){
    this.setData({
      index: e.detail.value
    })
  },

  relocate: function () {
    this.setData({      
      loading: true
    })
    this.showRegeo()
  },

  /**
   * 显示位置信息
   */
  showRegeo: function () {
    var that = this;
    var toastTitle = '定位成功';
    var ui = that.data.UI
    this.getRegeo()
    .then((data) => {
      wx.showToast({
        title: toastTitle,
        duration: 1000
      })
      // 改写UI，反映在视图层
      ui.locNameContent =  data.name
      ui.locDescContent =  data.desc
      that.setData({
        UI: ui,
        loading: false,
        latitude: data.latitude,
        longitude: data.longitude,           
      })
      that.data.location = data
    })
  },

  /**
   * 获取用户位置信息
   */
  getRegeo: function () {
    return new Promise((resolve) => {
      var amap = new amapFile.AMapWX({key:'2f57d71b9cf91b3b4cf002e1ecefb43e'});
      amap.getRegeo({      
        success: function(data){
          //成功回调
          resolve(data[0]) 
        }
      })
    })
  },
  
  /**
   * 提交打卡信息
   */
  formSubmit: function(){
    var that = this;
    wx.showModal({
      title: '确认打卡',
      content: '打卡后不可撤销，请确认是否打卡？',        
      cancelText: '返回',
      confirmText: '去打卡',
      success: function(res){      
        if(res.confirm) {
          that.setTimeCard()
        }
      }
    })
    
  },

  /**
   * 打卡请求
   */
  setTimeCard: function () {
    var that = this
    wx.request({
      url: app.config.serverUrl + '/api/setTimeCard',
      method: 'POST',
      dataType: 'json',
      data: {
        clientId: app.config.socket.id,
        locationData: that.data.location,
        time: Math.round(new Date() / 1000),
        item: that.data.index
      },
      success: (res) => {
        if (res.data.ret === 0) {
          wx.showToast({
            title: '打卡成功',
            icon: 'success',
            duration: 1000
          })
          setTimeout(() => {
            wx.navigateBack({delta: 1})
          }, 1000)
        }
      }
    })
  }
})