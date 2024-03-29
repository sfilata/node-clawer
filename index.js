const superagent = require('superagent');
const chalk = require('chalk');
const inquirer = require('inquirer');
const figlet = require('figlet');
const Table = require('cli-table2');

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync('Ticket Info Collector', {
        font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
};

const askQuestion = () => {
  const questions = [
    { name: 'trainDate', type: 'input', message: '请输入出发日期:' },
    { name: 'startStation', type: 'input', message: '请输入出发站:' },
    { name: 'endStation', type: 'input', message: '请输入到达站:' }
  ];
  return inquirer.prompt(questions);
};

init();

askQuestion().then((res) => {
  run(res);
});

// data block
const map = {
  成都: 'CDW',
  徽县: 'HYY',
  北京西: 'BXP',
  广元: 'GYW',
  天水: 'TSJ',
  杭州: 'HZH',
  汉中: 'HOY',
  西安: 'XAY',
  三门峡: 'SMF',
  渑池: 'MCF',
  义马: 'YMF',
  洛阳: 'LYF',
  郑州: 'ZZF',
  民权: 'MQF',
  徐州: 'XCH',
  新沂: 'VIH',
  沭阳: 'FMH',
  淮安: 'AUH',
  盐城: 'AFH',
  泰州: 'UTH',
  扬州: 'YLH',
  宝鸡: 'BJY',
  虢镇: 'GZY',
  略阳: 'LYY',
  两当: 'LDY',
  凤县: 'FXY',
  江油: 'JFW'
};

const constructor = (dataMap) => {
  const result = {};
  Object.entries(dataMap).map(([key, value]) => {
    result[value] = key;
  });
  return result;
};
const reverseMap = constructor(map);

const ticketInfoMap = {
  trainNo: { index: 3, title: '车次' },
  flag: { index: 1, title: '售卖信息', render: (value) => value.replace('<br/>', '') },
  msg: { index: 0, title: '信息' },
  start: { index: 4, title: '始发站', render: (value) => reverseMap[value] },
  end: { index: 5, title: '终到站', render: (value) => reverseMap[value] },
  on: { index: 6, title: '出发', render: (value) => reverseMap[value] },
  off: { index: 7, title: '到达', render: (value) => reverseMap[value] },
  onBoardTime: { index: 8, title: '出发时间' },
  offBoardTime: { index: 9, title: '到达时间' },
  duringPeriod: { index: 10, title: '经历时间' },
  topBedCount: { index: 23, title: '软卧' },
  hardBedCount: { index: 28, title: '硬卧' },
  hardSetCount: { index: 29, title: '硬座' },
  secondClassCount: { index: 30, title: '二等座' },
  firstClassCount: { index: 1, title: '一等座' },
  commercialCount: { index: 32, title: '商务座' }
};

const wantedInfoKey = [
  'trainNo',
  'flag',
  'on',
  'off',
  'onBoardTime',
  'offBoardTime',
  'duringPeriod',
  'topBedCount',
  'hardBedCount',
  'hardSetCount'
];

const header = {
  'sec-ch-ua-mobile': '?0',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty',
  Cookie: 'JSESSIONID=5C707A074EE2BCCBE9F342363FF86ACF;',
  Host: 'kyfw.12306.cn'
};
// data block end

const formatTicketInfo = (data) => {
  const table = new Table({ head: wantedInfoKey.map((item) => ticketInfoMap[item].title) });
  const result = data.map((item) => {
    const infoArr = item.split('|');
    const dataMap = {};
    for (const key of wantedInfoKey) {
      dataMap[key] = {
        title: ticketInfoMap[key].title,
        data: ticketInfoMap[key].render
          ? ticketInfoMap[key].render(infoArr[ticketInfoMap[key].index])
          : infoArr[ticketInfoMap[key].index]
      };
    }
    table.push(Object.values(dataMap).map(({ data }) => data));
    return dataMap;
  });
  console.log(table.toString());
  return result;
};

const run = ({ trainDate, startStation, endStation }) => {
  const url = `https://kyfw.12306.cn/otn/leftTicket/query?leftTicketDTO.train_date=${trainDate}&leftTicketDTO.from_station=${map[startStation]}&leftTicketDTO.to_station=${map[endStation]}&purpose_codes=ADULT`;
  superagent
    .get(url)
    .set(header)
    .end((err, res) => {
      if (err) {
        console.log('Error occurred.');
      }
      try {
        const { data } = JSON.parse(res.text);
        formatTicketInfo(data.result);
      } catch (e) {
        console.log('网络出了些问题，请联系作者或者稍候再试.');
      }
    });
};
