(function() {
  getRecommendList();
})();

function getRecommendList() {
  if (typeof ParadigmSDKv3 !== 'object') {
    setTimeout(getRecommendList, 0);
  } else {
    ParadigmSDKv3.init('e524d4faff1f407984eb469df1bfd272'); // ###SDK初始化
    ParadigmSDKv3.getRecommItems(69206, 77632).then(function(recommendList) {
      // #####请在这里处理推荐结果#####
      var list = recommendList.slice(0, 3);
      var oFragment = document.createDocumentFragment();
      list.forEach(function(i) {
        var itemTemplate =
          '<li class="list-item" data-load="0" data-disi="0" data-itemid="' +
          i.item_id +
          '"data-context="' +
          i.context +
          '"><a class="list-link" href="' +
          i.url +
          '?f=kdrqalist' +
          '"><div class="list-con"><div class="img-wrap fr"><img src="' +
          i.cover_url +
          '" /></div><div class="text-con"><h4 class="list-title">' +
          i.title +
          '</h4><p class="text">' +
          i.content +
          '</p></div></div></a></li>';
        var li = document.createElement('li');

        li.innerHTML = itemTemplate;
        oFragment.appendChild(li);
      });
      var parent = document.getElementById('recommendList');
      parent.appendChild(oFragment);
    });
  }
}
