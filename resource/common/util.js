export function formatTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].map(formatNumber).join('-');
}

export function formatFullTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join('-') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  );
}

export function formatFeedbackTime(date, withYear) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (withYear) {
    return `${year}年${month}月${day}日 ${formatDayTime(date)}`;
  } else {
    return `${month}月${day}日 ${formatDayTime(date)}`;
  }
}

export function showTime(publishDate) {
  // 当前时间
  const currentTime = new Date();

  if (currentTime.getTime() <= publishDate.getTime()) {
    return '1分钟';
  }

  const currentYear = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth() + 1;
  const currentDay = currentTime.getDate();
  // 发布时间
  const publishYear = publishDate.getFullYear();
  const publishMonth = publishDate.getMonth() + 1;
  const publishDay = publishDate.getDate();

  if (currentYear !== publishYear) {
    return formatTime(publishDate);
  } else if (currentMonth === publishMonth) {
    const days = currentDay - publishDay;
    if (days > 7) {
      return formatTime(publishDate);
    } else if (days <= 7 && days >= 1) {
      return `${days}天前`;
    } else {
      const minuets = Math.floor(
        (currentTime.getTime() - publishDate.getTime()) / 60000
      );

      if (minuets < 1) {
        return `${Math.floor(
          (currentTime.getTime() - publishDate.getTime()) / 1000
        )}秒前`;
      } else if (minuets < 60) {
        return `${minuets}分钟前`;
      } else {
        return `${Math.floor(minuets / 60)}小时前`;
      }
    }
  } else {
    const WEEK = 60 * 60 * 24 * 7 * 1000;

    if (currentTime.getTime() - publishDate.getTime() > WEEK) {
      return formatTime(publishDate);
    } else {
      let days;
      if (
        publishMonth === 1 ||
        publishMonth === 3 ||
        publishMonth === 5 ||
        publishMonth === 7 ||
        publishMonth === 8 ||
        publishMonth === 10 ||
        publishMonth === 12
      ) {
        days = 31 - publishDay + currentDay;
      } else if (publishMonth === 2) {
        if (
          (publishYear % 4 === 0 && publishYear % 100 !== 0) ||
          publishYear % 400 === 0
        ) {
          days = 29 - publishDay + currentDay;
        } else {
          days = 28 - publishDay + currentDay;
        }
      } else {
        days = 30 - publishDay + currentDay;
      }

      if (days < 7) {
        return `${days}天前`;
      } else {
        return formatTime(publishDate);
      }
    }
  }
}

export function showHistoryTime(publishDate) {
  // 当前时间
  const currentTime = new Date();

  if (currentTime.getTime() <= publishDate.getTime()) {
    return '1分钟';
  }

  const currentYear = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth() + 1;
  const currentDay = currentTime.getDate();
  // 发布时间
  const publishYear = publishDate.getFullYear();
  const publishMonth = publishDate.getMonth() + 1;
  const publishDay = publishDate.getDate();

  if (currentYear !== publishYear) {
    return '更早';
  } else if (currentMonth === publishMonth) {
    const days = currentDay - publishDay;
    if (days > 30) {
      return '更早';
    } else if (days > 7 && days < 30) {
      return '30天内';
    } else if (days <= 7 && days > 1) {
      return `7天内`;
    } else if (days === 1) {
      return '昨天';
    } else {
      return '今天';
    }
  } else {
    const MONTH = 60 * 60 * 24 * 30 * 1000;

    if (currentTime.getTime() - publishDate.getTime() > MONTH) {
      return '更早';
    } else {
      let days;

      if (
        publishMonth === 1 ||
        publishMonth === 3 ||
        publishMonth === 5 ||
        publishMonth === 7 ||
        publishMonth === 8 ||
        publishMonth === 10 ||
        publishMonth === 12
      ) {
        days = 31 - publishDay + currentDay;
      } else if (publishMonth === 2) {
        if (
          (publishYear % 4 === 0 && publishYear % 100 !== 0) ||
          publishYear % 400 === 0
        ) {
          days = 29 - publishDay + currentDay;
        } else {
          days = 28 - publishDay + currentDay;
        }
      } else {
        days = 30 - publishDay + currentDay;
      }

      if (days === 1) {
        return '昨天';
      } else if (days < 7 && days > 1) {
        return `7天内`;
      } else if (days > 7 && days < 30) {
        return '30天内';
      } else {
        return '更早';
      }
    }
  }
}

export function showFeedbackTime(publishDate) {
  // 当前时间
  const currentTime = new Date();
  const currentYear = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth() + 1;
  const currentDay = currentTime.getDate();
  // 发布时间
  const publishYear = publishDate.getFullYear();
  const publishMonth = publishDate.getMonth() + 1;
  const publishDay = publishDate.getDate();

  if (currentYear !== publishYear) {
    return formatFeedbackTime(publishDate, true);
  } else if (currentMonth === publishMonth) {
    const days = currentDay - publishDay;
    if (days > 7) {
      return formatTime(publishDate);
    } else if (days <= 7 && days > 1) {
      return `${days}天前`;
    } else if (days === 1) {
      return `昨天 ${formatDayTime(publishDate)}`;
    } else {
      const minuets = Math.floor(
        (currentTime.getTime() - publishDate.getTime()) / 60000
      );

      if (minuets < 60) {
        return '';
      } else {
        return formatDayTime(publishDate);
      }
    }
  } else {
    const WEEK = 60 * 60 * 24 * 7 * 1000;

    if (currentTime.getTime() - publishDate.getTime() > WEEK) {
      return formatTime(publishDate);
    } else {
      let days;
      if (
        publishMonth === 1 ||
        publishMonth === 3 ||
        publishMonth === 5 ||
        publishMonth === 7 ||
        publishMonth === 8 ||
        publishMonth === 10 ||
        publishMonth === 12
      ) {
        days = 31 - publishDay + currentDay;
      } else if (publishMonth === 2) {
        if (
          (publishYear % 4 === 0 && publishYear % 100 !== 0) ||
          publishYear % 400 === 0
        ) {
          days = 29 - publishDay + currentDay;
        } else {
          days = 28 - publishDay + currentDay;
        }
      } else {
        days = 30 - publishDay + currentDay;
      }

      if (days < 7) {
        return `${days}天前`;
      } else {
        return formatTime(publishDate);
      }
    }
  }
}

const formatDayTime = (date) => {
  const hour = date.getHours();
  const minute = date.getMinutes();

  if (hour >= 0 && hour <= 5 && minute <= 59) {
    return `凌晨${hour}点${minute}分`;
  } else if (hour >= 6 && hour <= 11 && minute <= 59) {
    return `上午${hour}点${minute}分`;
  } else if (hour >= 12 && hour <= 18 && minute <= 59) {
    return `下午${hour}点${minute}分`;
  } else {
    return `晚上${hour}点${minute}分`;
  }
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

export function isObj(x) {
  const type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

export function generateUUID() {
  let d = Date.now();

  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
    c
  ) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid.replace(/[-]/g, '');
}

export function removeHTMLTag(str) {
  if (!str) {
    return null;
  }
  str = str.replace(/<\/?[^>]*>/g, ''); // 去除HTML tag
  str = str.replace(/[ | ]*\n/g, ''); // 去除行尾空白
  str = str.replace(/\n[\s| | ]*\r/g, ''); // 去除多余空行
  str = str.replace(/&nbsp;/gi, ''); // 去掉&nbsp;
  str = str.replace(/\s/gi, ''); // 去掉&nbsp;
  return str;
}

// 定义一个深拷贝函数  接收目标target参数
export function deepClone(target) {
  // 定义一个变量
  let result;
  // 如果当前需要深拷贝的是一个对象的话
  if (typeof target === 'object') {
    // 如果是一个数组的话
    if (Array.isArray(target)) {
      result = []; // 将result赋值为一个数组，并且执行遍历
      for (const i in target) {
        // 递归克隆数组中的每一项
        result.push(deepClone(target[i]));
      }
      // 判断如果当前的值是null的话；直接赋值为null
    } else if (target === null) {
      result = null;
      // 判断如果当前的值是一个RegExp对象的话，直接赋值
    } else if (target.constructor === RegExp) {
      result = target;
    } else {
      // 否则是普通对象，直接for in循环，递归赋值对象的所有值
      result = {};
      for (const i in target) {
        result[i] = deepClone(target[i]);
      }
    }
    // 如果不是对象的话，就是基本数据类型，那么直接赋值
  } else {
    result = target;
  }
  // 返回最终结果
  return result;
}

export function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // 含最大值，含最小值
}

// 获取标准时间格式
export function formatTimeYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const yyyymmdd = [year, month, day].map(formatNumber).join('-');
  const hms = [hour, minute, second].map(formatNumber).join(':');
  return yyyymmdd + ' ' + hms;
}

export function getVideoTime(time) {
  const minutes = formatNumber(parseInt(time / 60)) || '00';
  const seconds = formatNumber(parseInt(time % 60));

  return `${minutes}:${seconds}`;
}
