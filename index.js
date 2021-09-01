#!/usr/bin/env node
const superagent = require('superagent');
const cheerio = require('cheerio');
const chalk = require('chalk');
const inquirer = require('inquirer');
const figlet = require('figlet');
const Table = require('cli-table2');

// const commander = require('commander');
// const program = new commander.Command();
// program.version('0.0.1').parse(process.argv);

// program
//   .option('-d, --debug', 'output extra debugging')
//   .option('-s, --small', 'small pizza size')
//   .option('-p, --pizza-type <type>', 'flavour of pizza');

// program.parse(process.argv);

// const options = program.opts();
// if (options.debug) console.log(options);
// console.log('pizza details:');
// if (options.small) console.log('- small pizza size');
// if (options.pizzaTy console.log(`- ${options.pizzaType}`);

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
  汉中: 'HOY'
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
  flag: { index: 1, title: '售卖信息' },
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
  'hardBedCount',
  'hardSetCount',
  'commercialCount',
  'firstClassCount',
  'secondClassCount'
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
      const { data } = JSON.parse(res.text);
      formatTicketInfo(data.result);
    });
};
