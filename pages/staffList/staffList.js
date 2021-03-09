//获取应用实例
const app = getApp()
//引入汉字转拼音插件
var pinyin = require("../../utils/pinyin/web-pinyin.js")
//此页全局即时搜索状态
var inputTimeout = null
var that

Page({
  data: {
    staffList:[],
    staffPhotoList:[/*联系人图片列表，方便预览*/],
    sortType: 1, //排序类型，默认1-以姓名排序 2-以职位排序
    searchFocus: false,
    searchText: '',
    placeholder: '请输入昵称/手机号/邮箱', 
    placeholder_active: '',
    searchHeight: 0, //搜索栏高度，需要传入通讯录插件
    searchInput: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    this.initstaffList()
    // console.log(options.apply)
    if (options.apply) {
      this.setData({
        apply: true
      })
      wx.setNavigationBarTitle({
        title: '新的朋友',
      })
    } else {
      wx.setNavigationBarTitle({
        title: '添加联系人',
      })
    }
  },

  searchInput: function(e) {
    this.setData({
      searchInput: e.detail.value
    })
  },

  searchSubmit: function(e) {
    // console.log(this.data.searchInput)
    wx.request({
      url: app.config.serverUrl + '/api/addContacts_search',
      method: 'POST',
      data: {
        content: this.data.searchInput
      },
      dataType: 'json',
      success: res => {
        var data = res.data
        for (let index = 0; index < data.length; index++) {
          if (data[index].mobile == null) {
            data[index].mobile = ''
          }
          that.setData({
            [`staffList[${index}].id`]: data[index].id,
            [`staffList[${index}].name`]: data[index].wx_name,
            [`staffList[${index}].mobile`]: data[index].mobile,
            [`staffList[${index}].photo`]: data[index].avatarUrl,
            [`staffList[${index}].positionName`]: data[index].pid,
            [`staffList[${index}].checked`]: false,
            [`staffList[${index}].openId`]: data[index].wx_openid
          })
        }
        if (data.length == 0) {
          this.setData({
            staffList: null
          })
          app.toastSuccess('无匹配结果')
        }
        // console.log(this.data.staffList)
      }
    })
  },

  /**
   * 排序类型变换事件
   * @param {*} e 
   */
  changeSortType: function (e) {
    var that = this
    wx.showActionSheet({
      itemList: ['以姓名排序','以职位排序'],
      success(res) {
        // console.log(res.tapIndex)
          if (res.tapIndex != that.data.sortType){
            that.setData({
              sortType: res.tapIndex,
            })
            //重新初始化
            that.onPullDownRefresh()
          }  
      }
    })
    
  },

  /**
   * 点击/取消搜索
   */
  searchTextTap: function () {
    this.setData({
      searchFocus: !this.data.searchFocus,
      searchText: '',
      staffList: null
    })
    if (inputTimeout != null) {
      clearTimeout(inputTimeout)
      inputTimeout = null
    }
  },

  //清空搜索内容输入
  searchClearTap: function () {
    //console.log('searchClearTap e', e)
    this.setData({
      searchText: '',
      staffList: []
    })
  },

  /**
   * 初始化联系人列表
   */
  initstaffList: function () {
    // 初始化联系人列表
    let staffList = this.data.staffList
    // 所有联系人照片
    let staffPhotoList = []
    staffList.map(item => {
      staffPhotoList.push(item.photo)
    })
    //更新数据结果
    this.setData({
      staffList: staffList,
      staffPhotoList: staffPhotoList,
      searchFocus: false,
      searchText: ''
    })
    //初始化通讯录列表
    this.initBookList()
    wx.stopPullDownRefresh()
  },

  //初始化数据源，并初始化通讯录列表
  initBookList: function () {
    var staffList = this.data.staffList
    var sortType = this.data.sortType || 1 //排序类型，默认1-以姓名排序 2-以职位排序
    //中文转拼音，性能还行
    try {
      for (var i in staffList) {
        //汉字转拼音
        staffList[i]['HZPY'] = pinyin(sortType == 1 ? staffList[i].name : staffList[i].positionName, {
          style: pinyin.STYLE_NORMAL, // 设置拼音风格-普通风格，即不带声调。
        }).join('')
        //格式如:[['bei'],['jing']]，join后格式如：beijing
      }
    } catch (e) {
      console.log('exception', e)
      for (var i in staffList) {
        staffList[i]['HZPY'] = sortType == 1 ? staffList[i].name : staffList[i].positionName //转换异常，默认替换
      }
    }
    //更新数据源
    this.setData({
      staffList: staffList,
    })
    //console.log('staffList', this.data.staffList)

    //初始化通讯录列表
    this.alphabet_order_list = this.selectComponent('#alphabet_order_list')
    // console.log(this.alphabet_order_list)

  },

  /**
   * 点击事件
   * @param {*} e 
   */
  itemClickEvent: function (e) {
    //console.log('itemClickEvent e', e)
    var item = e.detail.item ? e.detail.item : e.currentTarget.dataset.item
    this.itemClick(item)
  },
  
  /**
   * 点击事件
   * @param {*} item
   */
  itemClick: function (item) {
    // console.log(item)
    wx.showActionSheet({
      itemList: ['添加到通讯录'],
      success(res) {
        if (res.tapIndex == 0) {//发送消息
          
        }
      },
      fail(res) {
        // console.log(res.errMsg)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (wx.createSelectorQuery) {
      var that = this
      var query = wx.createSelectorQuery().in(this)
      //如果有搜索栏
      if (query.select('#searchBar')) {
        //添加节点的布局位置的查询请求。相对于显示区域，以像素为单位。其功能类似于 DOM 的 getBoundingClientRect。
        query.select('#searchBar').boundingClientRect(function (res) {
          //console.log('searchBar boundingClientRect', res)
          if (res != null && res != undefined) {
            //节点的高度
            that.setData({
              searchHeight: res.height ? res.height : 0,
            })
            //console.log('searchBar searchHeight', that.data.searchHeight)
          } else {
            throw ('Initialization failed.')
          }
        }).exec()
      }
    } else {
      throw ('当前基础库版本小于1.6.0，不支持createSelectorQuery')
    }
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

  }
})