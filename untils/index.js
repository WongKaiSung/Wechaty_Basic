const FS = require('fs')
const FILE_LOCATION = './config/index.js'
const superagent = require('../config/superagent')
const CONFIG = require('../config/index')
const COVID_MESSAGE = './config/covid-message.txt'
const cheerio = require('cheerio')


function UpdateCovidFile(newCovid) {
    try {
        let currentFile = FS.readFileSync(COVID_MESSAGE).toString();
        if (currentFile !== newCovid) {
            FS.writeFileSync(COVID_MESSAGE, newCovid, 'utf8', function (err) {
                if (err) return console.log(err);
            });
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log('错误', err)
        return err
    }
}
async function getCovidFromFile() {
    try {
        return FS.readFileSync(COVID_MESSAGE).toString();
    } catch (err) {
        console.log('错误', err)
        return err
    }
}
async function getCovidLivePhoto() {
    try {
        let res = await superagent.req(CONFIG.COVID_LIVEPHOTOS, 'GET')
        let $ = cheerio.load(res.text)
        let todayCases = $('tr[data-key] td')
        let date = $('div[class=col-xs-8]')
        let totalCaseCount = 0;
        let allCases = []
        let allState = []
        let covidStatus = []

        covidStatus.push('Date' + '     ' + date[0].children[1].children[2].children[0].data.trim() + '\n\n');
        for (x = 0; x < todayCases.length; x++) {
            var count = x % 4;
            if (count === 0) {
                //get state
                allState.push(todayCases[x].children[0].children[0].data.trim());
            } else if (count === 1) {
                //get today cases
                allCases.push(todayCases[x].children[0].data.trim());
                totalCaseCount += parseInt(todayCases[x].children[0].data);
            }
        }
        //combine state and case
        for (x = 0; x < allCases.length; x++) {
            covidStatus.push(allState[x].toString() + '     ' + allCases[x].toString() + '\n');
        }

        covidStatus.push('Total' + '     ' + totalCaseCount + '\n');
        return covidStatus.toString().replace(/[,]/g, '');
    } catch (err) {
        console.log('错误', err)
        return err
    }
}

async function getCovidFromOutbreak() {
    try {
        let res = await superagent.req(CONFIG.COVID_OUTBREAK, 'GET')
        let $ = cheerio.load(res.text)
        let todayCases = $('td[class=text-right] .text-left')
        let state = $('td[class=text-value]')
        let date = $('.card .card-header .card-options')
        let totalCaseCount = 0;
        let allCases = []
        let allState = []
        let covidStatus = []

        covidStatus.push('Date' + '     ' + date[1].children[0].data.trim() + '\n\n');
        //get today cases
        for (x = 0; x < todayCases.length; x++) {
            if (todayCases[x].children.length > 1) {
                allCases.push(todayCases[x].children[1].children[2].data.trim());
                totalCaseCount += parseInt(todayCases[x].children[1].children[2].data);
            } else {
                allCases.push('0');
            }
        }
        //get state
        for (x = 0; x < state.length - 1; x++) {
            allState.push(state[x].children[0].data.trim());
        }
        //combine state and case
        for (x = 0; x < allCases.length; x++) {
            covidStatus.push(allState[x].toString() + '     ' + allCases[x].toString() + '\n');
        }

        covidStatus.push('Total' + '     ' + totalCaseCount + '\n');
        return covidStatus.toString().replace(/[,]/g, '');
    } catch (err) {
        console.log('错误', err)
        return err
    }
}

async function getTOTO(fourNumbers) {
    let res = await superagent.req(CONFIG._4DNUMBER, 'GET')
    let $ = cheerio.load(res.text)
    let resultDate = $('td[class=resultdrawdate]')
    let labelList = $('td[class=resultprizelable]')
    let resultList = $('td[class=resulttop]')
    let resultBottomList = $('td[class=resultbottom]')
    let resultListCount = 0
    let resultBottomCount = 0
    let resultString = ''
    let checking = 'bot: ' + fourNumbers + '没有中奖'

    for (x = 0; x < labelList.length - 5; x++) {
        if (x == 0)
            resultString += resultDate[0].children[0].data + '\nMagnum 4D 萬能\n'
        else if (x == 5)
            resultString += '\n' + resultDate[2].children[0].data + '\nDa Ma Cai 1+3D 大馬彩\n'
        else if (x == 10)
            resultString += '\n' + resultDate[4].children[0].data + '\nSportsToto 4D 多多\n'
        else if (x > 14)
            break

        if (x == 3 || x == 8 || x == 13) {
            resultString += labelList[x].children[0].data + '\n'
            for (y = 0; y < 10; y++) {
                var cData = resultBottomList[resultBottomCount].children[0].data
                if (parseInt(cData) > 0)
                    resultString += cData + ' '
                else
                    y--
                if (cData == fourNumbers)
                    checking = 'bot: ' + fourNumbers + '中了特别奖！'
                if (y == 4)
                    resultString += '\n'
                resultBottomCount++
            }
            resultString += '\n'
        }
        else if (x == 4 || x == 9 || x == 14) {
            resultString += labelList[x].children[0].data + '\n'
            for (y = 0; y < 10; y++) {
                var cData = resultBottomList[resultBottomCount].children[0].data
                if (parseInt(cData) > 0)
                    resultString += cData + ' '
                else
                    y--
                if (cData == fourNumbers)
                    checking = 'bot: ' + fourNumbers + '中了安慰奖！'
                if (y == 4)
                    resultString += '\n'
                resultBottomCount++
            }
            resultString += '\n'
        }
        else {
            resultString += labelList[x].children[0].data + ' : ' + resultList[resultListCount].children[0].data + '\n'
            if (resultList[resultListCount].children[0].data == fourNumbers)
                checking = 'bot: ' + fourNumbers + '中了头三奖！'
            resultListCount++
        }
    }
    return [resultString, checking]
}
module.exports = {
    getTOTO, getCovidFromOutbreak, getCovidLivePhoto, UpdateCovidFile
}
