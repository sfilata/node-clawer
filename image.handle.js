const superagent = require('superagent');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const word = '星际争霸';

const getValueFromUrl = function (title, htmlText) {
  const reg = new RegExp(`"${title}":"(.*?)"`, 'g');
  const imageTitleMatches = htmlText.match(reg);

  return imageTitleMatches.map((item) => {
    const imageUrl = item.match(/:"(.*?)"/g);
    return RegExp.$1;
  });
};

const mkImageFolder = function (pathname) {
  const fullPath = path.join(__dirname, pathname);
  if (fs.existsSync(fullPath)) {
    console.log(`${pathname} exists`);
    return;
  }

  fs.mkdirSync(fullPath);
  console.log('Create Folder', fullPath);
};

const downloadImage = function (url, name, index) {
  const fullPath = path.join(__dirname, 'images', `${index}-${name}.png`);

  superagent.get(url).end((err, res) => {
    if (err) {
      console.log(err);
      return;
    }

    fs.writeFile(fullPath, res.body, 'binary', (err) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`download success, ${fullPath}`);
    });
  });
};

const headers = {
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Encoding': 'gzip, deflate, b',
  'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'
};
superagent
  .get(
    `http://image.baidu.com/search/index?tn=baiduimage&ipn=r&ct=201326592&cl=2&lm=-1&st=-1&fm=index&fr=&hs=0&xthttps=111110&sf=1&fmq=&pv=&ic=0&nc=1&z=&se=1&showtab=0&fb=0&width=&height=&face=0&istype=2&ie=utf-8&word=${encodeURIComponent(
      word
    )}oq=${encodeURIComponent(word)}rsp=-1`
  )
  .set('Accept', headers['Accept'])
  .set('Accept-Encoding', headers['Accept-Encoding'])
  .set('Accept-Language', headers['Accept-Language'])
  .set('Cache-Control', headers['Cache-Control'])
  .set('sec-ch-ua', headers['sec-ch-ua'])
  .set('User-Agent', headers['User-Agent'])
  .end((err, res) => {
    if (err) {
      console.log('Error occurred.', err);
    }

    console.log(res);

    const htmlText = res.text;

    const urlList = getValueFromUrl('objURL', htmlText);
    const titleList = getValueFromUrl('fromPageTitle', htmlText).map((item) =>
      item.replace(/<strong>/g, '').replace(/<\\\/strong>/, '')
    );
    // console.log(titleList);

    mkImageFolder('images');

    urlList.forEach((item, index) => downloadImage(item, titleList[index], index));
  });
