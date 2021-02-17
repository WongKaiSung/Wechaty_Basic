const { Wechaty, Message, UrlLink } = require('wechaty')
const { FileBox } = require('file-box')
const FS = require('fs')
const qrTerm = require('qrcode-terminal')
const NODE_SCHEDULE = require('node-schedule')
const UNTILS = require('./untils/index')
const CONFIG = require('./config/index')
var dateFormat = require('dateformat');
const bot = new Wechaty({ name: 'user', puppet: 'wechaty-puppet-puppeteer' });
bot
  .on('logout', onLogout)
  .on('login', onLogin)
  .on('scan', onScan)
  .on('error', onError)
  .on('message', onMessage)

bot.start()
  .catch(async e => {
    console.error('Bot start() fail:', e)
    await bot.stop()
    process.exit(-1)
  })

function onScan(qrcode, status) {
  qrTerm.generate(qrcode, { small: true })
  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('')

  console.log(`[${status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `)
}

async function onLogin(user) {
  console.log(`${user.name()} login`)
  bot.say('Wechaty login').catch(console.error)
  await main()
}

function onLogout(user) {
  console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + ' ' + `${user.name()} logouted`)
}

function onError(e) {
  console.error('Bot error:', e)
}

async function onMessage(msg) {
  var currentTime = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + ' ';
  console.log(currentTime + msg.toString())
  const sender = msg.talker()
  const text = msg.text()
  const room = msg.room()
  const filehelper = bot.Contact.load('filehelper')

  if (msg.self()) {
    if (/^chk..../i.test(msg.text())) {
      let _4Dresult = await UNTILS.getTOTO(text.slice(3, 7))
      await filehelper.say(_4Dresult[1])
    } else if (/^成绩/i.test(msg.text())) {
      let _4Dresult = await UNTILS.getTOTO()
      await filehelper.say(_4Dresult[0])
    } if (msg.text() === 'ding') {
    }
    else if (/covid/i.test(msg.text())) {
      let covidDetailResult = await UNTILS.getCovidLivePhoto()
      await filehelper.say(covidDetailResult);
    }
    return
  }

  if (/^成绩/i.test(msg.text())) {
    let _4Dresult = await UNTILS.getTOTO()
    await msg.say(_4Dresult[0])
  }
  else if (/^chk..../i.test(msg.text())) {
    let _4Dresult = await UNTILS.getTOTO(text.slice(3, 7))
    await msg.say(_4Dresult[1])
  }
  else if (/covid/i.test(msg.text())) {
    let covidFileResult = await UNTILS.getCovidtalkerFile()
    await msg.say(covidFileResult);
  }
  return
}

async function main() {
  //scheduleJob
  var temp = NODE_SCHEDULE.scheduleJob(CONFIG.SEND4D, async function () {
    //find group
    const group = await bot.Room.find({ topic: /^groupName/i })
    //find contact
    const abc = await bot.Contact.find({ name: 'abc' });
    let _4Dresult = await UNTILS.getTOTO()
    await abc.say(_4Dresult[0]);
  });

  // var covidStatus = NODE_SCHEDULE.scheduleJob('00 * 17-19 * * *', async function () {
  //   let covidDetailResult = await UNTILS.getCovidLivePhoto();
  //   let updateResult = await UNTILS.UpdateCovidMessage(covidDetailResult);
  //   const abc = await bot.Contact.find({ name: 'abc' });
  //   var currentTime = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
  //   if (updateResult) {
  //     await abc.say(covidDetailResult);
  //   } else {
  //     console.log(currentTime + ': waiting next cycle...');
  //   }
  // });
}

const welcome = `

------------------------------------------
-Please wait... I'm trying to login in...-
------------------------------------------
`
console.log(welcome)