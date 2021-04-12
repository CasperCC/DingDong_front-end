var app = getApp()
Page({
  data:{
    applyList: []
  },
  onLoad:function(options){
    wx.showNavigationBarLoading();
    this.getOverworkApply()
  },
  getOverworkApply: function () {
    var that = this
    wx.request({
      url: app.config.serverUrl + '/api/getOverworkApply',
      method: 'POST',
      dataType: 'json',
      data: {
        clientId: app.config.socket.id
      },
      success: function(res){
        wx.hideNavigationBarLoading()
        that.setData({
          applyList: res.data
        })
      }
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})