// 联系人通讯录
//获取应用实例
const app = getApp()
//引入汉字转拼音插件
var pinyin = require("../../utils/pinyin/web-pinyin.js");
//此页全局即时搜索状态
var inputTimeout = null;
var that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkType: '', //checkbox-多选类型 radio-单选类型 其他-基本通讯录

    staffList:[ //联系人列表
      {
        id: 20,
        name: '$efff',
        mobile: '13895391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '办公室职员',
        checked: false,
      },
      {
        id: 100,
        name: '安国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '办公室职员',
        checked: false,
      },
      {
        id: 101,
        name: '邦国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '老师',
        checked: false,
      },
      {
        id: 102,
        name: '曹国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '教务处主任',
        checked: false,
      },
      {
        id: 103,
        name: '杜国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '教务处',
        checked: false,
      },
      {
        id: 104,
        name: '恩国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '班主任',
        checked: false,
      },
      {
        id: 105,
        name: '付国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '班主任',
        checked: false,
      },
      {
        id: 106,
        name: '刚国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '老师',
        checked: false,
      },
      {
        id: 107,
        name: '黄国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '老师',
        checked: false,
      },
      {
        id: 107,
        name: '艾国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '行政人员',
        checked: false,
      },
      {
        id: 108,
        name: '界国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '行政人员',
        checked: false,
      },
      {
        id: 109,
        name: '凯国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '行政人员',
        checked: false,
      },
      {
        id: 110,
        name: '罗国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '办公室职员',
        checked: false,
      },
      {
        id: 111,
        name: '蒙国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '办公室职员',
        checked: false,
      },
      {
        id: 112,
        name: '南国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '办公室职员',
        checked: false,
      },
      {
        id: 113,
        name: '欧国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '行政人员',
        checked: false,
      },
      {
        id: 114,
        name: '平国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '老师',
        checked: false,
      },
      {
        id: 115,
        name: '钱国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '老师',
        checked: false,
      },
      {
        id: 116,
        name: '任国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '办公室职员',
        checked: false,
      },
      {
        id: 117,
        name: '思国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '老师',
        checked: false,
      },
      {
        id: 118,
        name: '图国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '老师',
        checked: false,
      },
      {
        id: 119,
        name: '王国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '老师',
        checked: false,
      },
      {
        id: 120,
        name: '向国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '办公室职员',
        checked: false,
      },
      {
        id: 121,
        name: '杨国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '班主任',
        checked: false,
      },
      {
        id: 122,
        name: '增国庆',
        mobile: '13897391221',
        photo: '/utils/resources/images/head6.jpeg',
        positionName: '班主任',
        checked: false,
      }
    ],
    staffPhotoList:[ //联系人图片列表，方便预览
      
    ],
    staffList_search: [ //搜索联系人列表
      // {
      //   id: 100,
      //   name: '安国庆',
      //   mobile: '13897391221',
      //   photo: '/utils/resources/images/head6.jpeg',
      //   positionName: '办公室职员',
      //   checked: false,
      // },
    ],
    sortType: 0, //排序类型，默认0-以姓名排序 1-以职位排序
    checkAllFlag: false, //是否开启全选反选操作功能，点击时才开启
    checkAllType: false, //false-待全选 true-待反选
    searchFocus: false,
    searchText: '',
    placeholder: '搜索', 
    searchHeight: 0, //搜索栏高度，需要传入通讯录插件
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('onLoad options',options);
    // checkType：checkbox-多选类型 radio-单选类型 其他-基本通讯录
    // this.setData({
    //   checkType: options.checkType || ''
    // });
    //初始化联系人列表
    this.initstaffList();
  },

  //全选或反选事件
  changeCheckAllType: function (e) {
    //console.log('changeCheckAllType e',e);

    //标记为开启全选或反选操作功能
    this.setData({
      checkAllFlag: true,
    });

    //重新初始化联系人列表
    this.initstaffList();

  },
  
  //排序类型变换事件
  changeSortType: function (e) {
    //console.log('changeSortType e',e);
    var that = this;
    wx.showActionSheet({
      itemList: ['以姓名排序','以职位排序'],
      success(res) {
        // console.log(res.tapIndex);
        if (res.tapIndex != that.data.sortType){
          that.setData({
            sortType: res.tapIndex,
          });
          //重新初始化
          that.onPullDownRefresh();
        }
      },
      fail(res) {
        console.log(res.errMsg);
      }
    })
    
  },

  //点击/取消搜索
  searchTextTap: function (e) {
    //console.log('searchTextTap e',e);
    this.setData({
      searchFocus: !this.data.searchFocus,
      searchText: '',
      staffList_search: [],
    });
    if (inputTimeout != null) {
      clearTimeout(inputTimeout);
      inputTimeout = null;
    }
  },

  //搜索内容输入变化
  searchTextInput: function (e) {
    //console.log('searchTextInput e', e);
    this.setData({
      searchText: e.detail.value,
    });
    
    //即时搜索
    if (inputTimeout == null){
      var that = this;
      inputTimeout = setTimeout(function () {
        that.searchSubmit(e);
      }, 1000);
    }
  },

  //清空搜索内容输入
  searchClearTap: function (e) {
    //console.log('searchClearTap e', e);
    this.setData({
      searchText: '',
      staffList_search: [],
    });
  },

  //开始搜索
  searchSubmit: function (e) {
    //console.log('searchSubmit e', e);
    var staffList_search = [];
    var staffList = this.data.staffList;
    var searchText = this.data.searchText;
    //console.log('searchSubmit searchText', searchText);

    if (this.data.searchText.length > 0){
      //本地搜索，比较姓名、拼音、手机号、职位
      for (var i in staffList){
        if (staffList[i].name.indexOf(searchText) != -1 
          || searchText.indexOf(staffList[i].name) != -1
          || staffList[i]['HZPY'].indexOf(searchText) != -1
          || searchText.indexOf(staffList[i]['HZPY']) != -1
          || staffList[i].mobile.indexOf(searchText) != -1
          || searchText.indexOf(staffList[i].mobile) != -1
          || staffList[i].positionName.indexOf(searchText) != -1
          || searchText.indexOf(staffList[i].positionName) != -1){
          staffList_search.push(staffList[i]);
        }
      }
      if (staffList_search.length == 0){
        this.setData({
          staffList_search: null
        })
        app.toastSuccess('无匹配结果');
      }
    }

    //搜索结果
    this.setData({
      staffList_search: staffList_search,
    });

    console.log('this.data.staffList_search',staffList_search)
    
    //一些处理
    if (inputTimeout != null){
      clearTimeout(inputTimeout);
      inputTimeout = null;
    }
  },



  //初始化联系人列表
  initstaffList: function () {

    // 初始化联系人列表
    let staffList = this.data.staffList

    // 所有联系人照片
    let staffPhotoList = []
    staffList.map(item => {
      staffPhotoList.push(item.photo)
    })

    // 全选状态
    if (this.data.checkType == 'checkbox') {
      //已开启全选或反选操作
      if (this.data.checkAllFlag) {
        //checkAllType：false-待全选 true-待反选
        for (var i in staffList) {
          staffList[i]['checked'] = !this.data.checkAllType; //设置为全选或反选
        }
        //更新全选或反选状态
        this.setData({
          checkAllType: !this.data.checkAllType,
        })
      }
    }

    //更新数据结果
    this.setData({
      staffList: staffList,
      staffPhotoList: staffPhotoList,
      searchFocus: false,
      searchText: '',
      staffList_search: [],
    })

    //初始化通讯录列表
    this.initBookList();

    wx.stopPullDownRefresh()
  },

  //初始化数据源，并初始化通讯录列表
  initBookList: function () {

    var staffList = this.data.staffList;
    var sortType = this.data.sortType || 0; //排序类型，默认0-以姓名排序 1-以职位排序
    //中文转拼音，性能还行
    try {
      for (var i in staffList) {
        //汉字转拼音
        staffList[i]['HZPY'] = pinyin(sortType == 0 ? staffList[i].name : staffList[i].positionName, {
          style: pinyin.STYLE_NORMAL, // 设置拼音风格-普通风格，即不带声调。
        }).join('');
        //格式如:[['bei'],['jing']]，join后格式如：beijing
      }
    } catch (e) {
      console.log('exception', e);
      for (var i in staffList) {
        staffList[i]['HZPY'] = sortType == 0 ? staffList[i].name : staffList[i].positionName; //转换异常，默认替换
      }
    }
    //更新数据源
    this.setData({
      staffList: staffList,
    })
    //console.log('staffList', this.data.staffList);

    //初始化通讯录列表
    this.alphabet_order_list = this.selectComponent('#alphabet_order_list');
    // console.log(this.alphabet_order_list);

  },

  //选中事件
  checkBoxChange: function (e) {
    // console.log('checkBoxChange e', e); 
    
    var item = e.detail.item ? e.detail.item : e.detail.value;//["487", "521"]
    //console.log('checkBoxChange item', item); 

    var staffList = this.data.staffList;
    var staffChooseList = [];
    for (var i in staffList) {
      for (var j in item) {
        if (item[j] == staffList[i].id) {
          staffChooseList.push(staffList[i]);
        }
      }
    }
    //console.log('staffChooseList', staffChooseList); 
    if (staffChooseList.length > 0) {
      app.toastSuccess('已选择[' + staffChooseList.length + ']个对象', false);
    } else {
      app.toastSuccess('已选择[' + staffChooseList.length + ']个对象', false);
    }

    //设置上一页选择数据
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去

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

  //点击事件
  itemClickEvent: function (e) {
    //console.log('itemClickEvent e', e); 

    var item = e.detail.item ? e.detail.item : e.currentTarget.dataset.item;

    this.itemClick(item);

  },
  

  //点击事件
  itemClick: function (item){
    var that = this;
    wx.showActionSheet({
      itemList: ['拨打电话','复制号码','预览照片'],
      success(res) {
        if (res.tapIndex == 0 && item.mobile) {//拨打电话
          wx.makePhoneCall({
            phoneNumber: item.mobile,
          })
        } else if (res.tapIndex == 1 && item.mobile) {//复制号码
          wx.setClipboardData({
            data: item.mobile,
            success(res) {
              wx.getClipboardData({
                success(res) {
                  app.toastSuccess(res.data + '复制成功');
                }
              })
            }
          })
        } else if (res.tapIndex == 2 && item.photo) {//预览图片
          wx.previewImage({
            current: item.photo,
            urls: that.data.staffPhotoList,
            fail: function (res) {
              //console.log('previewImage fail', res);
            },
          })
        }
      },
      fail(res) {
        // console.log(res.errMsg);
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (wx.createSelectorQuery) {
      var that = this;
      var query = wx.createSelectorQuery().in(this);
      //如果有搜索栏
      if (query.select('#searchBar')) {
        //添加节点的布局位置的查询请求。相对于显示区域，以像素为单位。其功能类似于 DOM 的 getBoundingClientRect。
        query.select('#searchBar').boundingClientRect(function (res) {
          //console.log('searchBar boundingClientRect', res);
          if (res != null && res != undefined) {
            //节点的高度
            that.setData({
              searchHeight: res.height ? res.height : 0,
            })
            //console.log('searchBar searchHeight', that.data.searchHeight);
          } else {
            throw ('Initialization failed.')
          }
        }).exec();
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
    //初始化联系人列表
    this.initstaffList();
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