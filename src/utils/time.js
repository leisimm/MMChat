
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}
// 时间戳格式化成日期

exports.getFormattedTime = (timestamp) => {
  var time = timestamp || 0;
  var t, y, m, d, h, i, s;
  t = time ? new Date(time) : new Date();

  y = t.getFullYear();    // 年
  m = t.getMonth() + 1;   // 月
  d = t.getDate();        // 日

  h = t.getHours();       // 时
  i = t.getMinutes();     // 分
  s = t.getSeconds();     // 秒

  return [y, m, d].map(formatNumber).join('/') + ' ' + [h, i, s].map(formatNumber).join(':');
}

exports.getMinMinuteFormattedTime = (timestamp) => {
  var time = timestamp || 0;
  var t, y, m, d, h, i, s;
  t = time ? new Date(time) : new Date();

  y = t.getFullYear();    // 年
  m = t.getMonth() + 1;   // 月
  d = t.getDate();        // 日

  h = t.getHours();       // 时
  i = t.getMinutes();     // 分
  s = t.getSeconds();     // 秒

  return [y, m, d].join('/') + ' ' + [h, i].map(formatNumber).join(':');
}

exports.getMinMinuteFormattedTimeFull = (timestamp) => {
  var time = timestamp || 0;
  var t, y, m, d, h, i, s;
  t = time ? new Date(time) : new Date();

  y = t.getFullYear();    // 年
  m = t.getMonth() + 1;   // 月
  d = t.getDate();        // 日

  h = t.getHours();       // 时
  i = t.getMinutes();     // 分
  s = t.getSeconds();     // 秒

  return [y, m, d].map(formatNumber).join('/') + ' ' + [h, i].map(formatNumber).join(':');
}

exports.getFormattedTimeForMessageContentFull = (time) => {
  let formattedTime = exports.getMinMinuteFormattedTimeFull(time)
  if (formattedTime.split(' ')[0] === exports.getMinMinuteFormattedTimeFull().split(' ')[0]) {
    formattedTime = formattedTime.split(' ')[1]
  } else {
    formattedTime = formattedTime.split(' ')[0].substring(2)
  }
  return formattedTime
}

exports.getFormattedTimeForChatBriefs = (time) => {
  if (time) {
    let formattedTime = exports.getMinMinuteFormattedTime(time)
    if (formattedTime.split(' ')[0] === exports.getMinMinuteFormattedTime().split(' ')[0]) {
      formattedTime = formattedTime.split(' ')[1]
    } else {
      formattedTime = formattedTime.split(' ')[0].substring(2)
    }
    return formattedTime
  } else {
    return ''
  }
}
