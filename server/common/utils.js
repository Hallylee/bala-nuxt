const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

module.exports = {
  generateUUID() {
    let d = Date.now();

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function(c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid.replace(/[-]/g, '');
  },

  formatFullTime(date) {
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
};
