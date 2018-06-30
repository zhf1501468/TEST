// run.js
var countTooGetLocation = 0;
var total_micro_second = 0;
var starRun = 0;
var oriMeters = 0.0;
/* 毫秒级倒计时 */
function count_down(that) {
  if (starRun == 0) {
    return;
  }
  if (countTooGetLocation >= 100) {
    var time = date_format(total_micro_second);
    that.updateTime(time);
  }
  if (countTooGetLocation >= 5000) { //1000为1s
    that.getLocation();
    countTooGetLocation = 0;
  }
  setTimeout
    setTimeout(function () {
      countTooGetLocation += 10;
      total_micro_second += 10;
      count_down(that);
    }
    , 10
    )
}

// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  // 秒位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60));
  return hr + ":" + min + ":" + sec + " ";
}

function getDistance(lat1, lng1, lat2, lng2) {
  var dis = 0;
  var radLat1 = toRadians(lat1);
  var radLat2 = toRadians(lat2);
  var deltaLat = radLat1 - radLat2;
  var deltaLng = toRadians(lng1) - toRadians(lng2);
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  return dis * 6378137;
  function toRadians(d) { return d * Math.PI / 180; }
}

function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clock: '',
    isLocation: false,
    latitude: 0,
    longitude: 0,
    markers: [],
    meters: 0.00,
    time: "0:00:00"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLocation()
    console.log("onLoad")
    count_down(this);
  },

  starRun: function () {
    if (starRun == 1) {
      return;
    }
    starRun = 1;
    count_down(this);
    this.getLocation();
  },

  stopRun: function () {
    starRun = 0;
    count_down(this);
  },

  clearRun: function () {
    starRun = 0;
    total_micro_second = 0;
    oriMeters = 0.0;
    this.setData ({
      markers: [],
      meters: 0.00,
      time: "0:00:00"
    })
  },

  updateTime:function (time) {
    var data = this.data;
    data.time = time;
    this.data = data;
    this.setData ({
      time : time,
    })
  },

  getLocation: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        // 增加标注点
        var newMarkers = {
          latitude: res.latitude,
          longitude: res.longitude,
          iconPath: 'redPoint.png',
        };
        var oriMarkers = that.data.markers;
        var len = oriMarkers.length;
        var lastMarkers;
        if (len == 0) {
          oriMarkers.push(newMarkers);
        }
        len = oriMarkers.length;
        var lastCover = oriMarkers[len - 1];
        var newMeters = getDistance(lastCover.latitude, lastCover.longitude, res.latitude, res.longitude) / 1000;
        if (newMeters < 0.0015) {
          newMeters = 0.0;
        }
        oriMeters = oriMeters + newMeters;
        var meters = new Number(oriMeters);
        var showMeters = meters.toFixed(2);

        oriMarkers.push(newMarkers);

        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: oriMarkers,
          meters: showMeters,
        });
      },
    })
  },

  // 这是打开当前定位的地图，这个方法暂没使用
  openLocation: function () {
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        wx.openLocation({
          latitude: res.latitude, // 纬度，范围为-90~90，负数表示南纬
          longitude: res.longitude, // 经度，范围为-180~180，负数表示西经
          scale: 28, // 缩放比例
        })
      },
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})