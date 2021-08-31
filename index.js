const superagent = require('superagent');
const cheerio = require('cheerio');

const word = '星际争霸2';
superagent
  .get(
    `https://image.baidu.com/search/index?tn=baiduimage&ipn=r&ct=201326592&cl=2&lm=-1&st=-1&fm=index&fr=&hs=0&xthttps=111110&sf=1&fmq=&pv=&ic=0&nc=1&z=&se=1&showtab=0&fb=0&width=&height=&face=0&istype=2&ie=utf-8&word=${encodeURIComponent(
      word
    )}oq=${encodeURIComponent(word)}rsp=-1`
  )
  .end((err, res) => {
    if (err) {
      console.log('Error occurred.');
    }

    const text = res.text;
    const $ = cheerio.load(text);
    $('meta').each((index, ele) => {
      console.log(index, $(ele).attr('content'));
      // /"objURL": "(.*?)",/
    });
  });
