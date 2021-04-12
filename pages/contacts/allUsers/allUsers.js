// 联系人通讯录
//获取应用实例
const app = getApp()
//引入汉字转拼音插件
var pinyin = require("../../../utils/pinyin/web-pinyin.js")
//此页全局即时搜索状态
var inputTimeout = null
var that

Page({
  data: {
    checkType: '', //checkbox-多选类型 radio-单选类型 其他-基本通讯录
    checkFlag: false, //是否开启确定按钮，点击时才开启
    checkAllType: false, //false-待全选 true-待反选
    staffList:[],
    staffChooseList: [],
    staffPhotoList:[/*联系人图片列表，方便预览*/],
    staffList_search: [/*搜索联系人列表*/],
    sortType: 1, //排序类型，默认1-以姓名排序 2-以职位排序
    checkAllFlag: false, //是否开启全选反选操作功能，点击时才开启
    checkAllType: false, //false-待全选 true-待反选
    searchFocus: false,
    searchText: '',
    placeholder: '搜索', 
    searchHeight: 0, //搜索栏高度，需要传入通讯录插件
    newFriendsPageUrl: '/pages/newFriends/newFriends', //新的朋友页面Url
    groupPageUrl: '/pages/newFriends/newFriends?type=group',
    companyPageUrl: '/pages/contacts/allUsers',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    this.getAllUsers()
    .then(data => {
      for (let index = 0; index < data.length; index++) {
        if (data[index].mobile == null) {
          data[index].mobile = ''
        }
        that.setData({
          [`staffList[${index}].id`]: data[index].wx_openid,
          [`staffList[${index}].name`]: data[index].wx_name,
          [`staffList[${index}].mobile`]: data[index].mobile,
          [`staffList[${index}].photo`]: data[index].avatarUrl,
          [`staffList[${index}].positionName`]: data[index].pid,
          [`staffList[${index}].checked`]: false,
          [`staffList[${index}].openId`]: data[index].wx_openid
        })
      }
      return data
    })
    .then(data => {
      return this.initstaffList()
    })
    .then((res) => {
      if (res) {
        this.initBookList()
      }
    })
  },

  getAllUsers: () => {
    return new Promise ((resolve) => {
      wx.request({
        url: app.config.serverUrl + '/api/getAllUsers',
        method: 'POST',
        dataType: 'json',
        data: {
          clientId: app.config.socket.id
        },
        success: res => {
          resolve(res.data)
        }
      })
    })
  },

  /**
   * 排序类型变换事件
   * @param {*} e 
   */
  changeSortType: function (e) {
    var that = this
    wx.showActionSheet({
      itemList: ['建 立 群 聊'],
      success(res) {
        // console.log(res.tapIndex)
        if (res.tapIndex == 1) {
          that.setData({
            checkType: 'checkbox'
          });
          wx.setNavigationBarTitle({
            title: '选择好友建立群聊',
          })
        }
      },
      fail(res) {
        console.log(res.errMsg)
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
      staffList_search: []
    })
    if (inputTimeout != null) {
      clearTimeout(inputTimeout)
      inputTimeout = null
    }
  },

  /**
   * 搜索内容输入变化
   * @param {*} e 
   */
  searchTextInput: function(e) {
    this.setData({
      searchText: e.detail.value
    })
    
    //即时搜索
    if (inputTimeout == null){
      var that = this
      inputTimeout = setTimeout(function () {
        that.searchSubmit(e)
      }, 1000)
    }
  },

  //清空搜索内容输入
  searchClearTap: function () {
    //console.log('searchClearTap e', e)
    this.setData({
      searchText: '',
      staffList_search: [],
    })
  },

  //开始搜索
  searchSubmit: function () {
    //console.log('searchSubmit e', e)
    var staffList_search = []
    var staffList = this.data.staffList
    var searchText = this.data.searchText
    //console.log('searchSubmit searchText', searchText)
    if (this.data.searchText.length > 0){
      //本地搜索，比较姓名、拼音、手机号、职位
      for (var i in staffList){
        if (staffList[i].name.indexOf(searchText) != -1 
          || searchText.indexOf(staffList[i].name) != -1
          || staffList[i].positionName.indexOf(searchText) != -1
          || searchText.indexOf(staffList[i].positionName) != -1){
          staffList_search.push(staffList[i])
        }
      }
      if (staffList_search.length == 0){
        this.setData({
          staffList_search: null
        })
        app.toastSuccess('无匹配结果')
      }
    }
    //搜索结果
    this.setData({
      staffList_search: staffList_search,
    })
    //一些处理
    if (inputTimeout != null){
      clearTimeout(inputTimeout)
      inputTimeout = null
    }
  },

  /**
   * 初始化联系人列表
   */
  initstaffList: function () {
    return new Promise((resolve) => {
      that = this
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
        searchText: '',
        staffList_search: [],
      })
      resolve(true)
    })
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
    var that = this
    // console.log(item)
    wx.showActionSheet({
      itemList: ['发送消息','复制名称'],
      success(res) {
        if (res.tapIndex == 0) {//发送消息
          wx.navigateTo({
            url: '/pages/message/message?openId='+item.openId+'&nickName='+item.name+'&avatarUrl='+item.photo
          })
        } else if (res.tapIndex == 1 && item.name) {//复制名称
          wx.setClipboardData({
            data: item.name,
            success(res) {
              wx.getClipboardData({
                success(res) {
                  app.toastSuccess(res.data + '复制成功')
                }
              })
            }
          })
        } else {

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

  //选中事件
  checkBoxChange: function (e) {
    // console.log('checkBoxChange e', e); 
    
    var item = e.detail.item ? e.detail.item : e.detail.value
    // console.log('checkBoxChange item', item);

    var staffList = this.data.staffList
    var staffChooseList = []
    for (var i in staffList) {
      for (var j in item) {
        if (item[j] == staffList[i].id) {
          staffChooseList.push(staffList[i]);
        }
      }
    }
    if (staffChooseList.length > 0) {
      that.setData({
        checkFlag: true
      })
      // app.toastSuccess('已选择[' + that.data.staffChooseList.length + ']个对象', false);
    } else {
      that.setData({
        checkFlag: false
      })
      // app.toastSuccess('已选择[' + that.data.staffChooseList.length + ']个对象', false);
    }
    that.data.staffChooseList = item
  },

  /**
   * 取消选择
   */
  cancelCheck: function () {
    that.setData({
      checkType: ''
    })
    wx.setNavigationBarTitle({
      title: '通讯录',
    })
  },

  /**
   * 确认添加好友至群组
   */
  addUserToGroup: function () {
    wx.request({
      url: app.config.serverUrl + '/api/addUserToGroup',
      method: 'POST',
      data: {
        userList: that.data.staffChooseList,
        clientId: app.config.socket.id
      },
      dataType: 'json',
      success: res => {
        if (res.data.ret === 0) {
          app.toastSuccess('创建成功！')
          that.setData({
            checkType: '',
            checkFlag: false,
          })
          wx.setNavigationBarTitle({
            title: '通讯录',
          })
        }
      }
    })
  },

  //单选
  radioChange: function (e) {
    //console.log('radioChange e', e);

    var item = e.detail.item ? e.detail.item : e.detail.value;;//"521"
    //console.log('item', item); 

    var staffList = this.data.staffList;
    var staff = null;
    for (var i in staffList) {
      if (item == staffList[i].id) {
        staff = staffList[i];
        break;
      }
    }
    //console.log('staff', staff); 

    if (staff != null) {
      app.toastSuccess('已选择[' + staff.name + ']', false);
    }

    //设置上一页选择数据
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去

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
    this.setData({
      checkType: ''
    });
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
    //初始化联系人列表
    this.initstaffList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})