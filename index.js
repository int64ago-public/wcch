const axios = require('axios');
const moment = require('moment');
const qs = require('qs');
const chalk = require('chalk');

const config = require('./config')[parseInt(process.argv[2] || 0)];

console.log(chalk.bgMagenta(config.name));

function getCookies(am) {
    const info = {
        ClinicDeptID: '044102',
        CustomerNo: 181536,
        DocID: '4636',
        VisitTime: `\\\/Date(${moment(moment().add(7, 'days').format('YYYY-MM-DD 00:00:00')).valueOf()})\\\/`,
        VisitTimeCode: !!am ? '上午' : '下午',
        RegistrationType: 1,
    };

    const cookies = {
        cid: 'NDg3MjA2NTc=',
        'wcch.remember.auth.v20161020': 'EA2606C4145F38B76243BED75B0DCDD71AFD2F3D2C5C14B68A5E24E6F9E3FC298584DB47598AC61E6A',
        'wcch.auth.v20161020': '195FBA31345FBECDB64D72FDB831814EFEAA1E39754F6DEBDD0F789AAAA2AC39C3C7B6512FDC814860533FE4A5823BD011392174DFED0EEC2E3E830A0B9452CE073F425BA46865DB5877A3B2AB4A3DE94000785A80BC3526B7E281DD76105AABD42EC1D5EC2E3EA455CFC3B12D1725F2E27018D73599860841C9236A348E0D629BC9F7039AEA33A63F461E851DC9BEF0138DFB073E50523C346AB49F693C92701F14B2FEA96FD15B422CA841BA166B792BD07C6045FF18DE266EC00A6FE7A9F82F484239103E8BF1CFA821E23A4B0A45C1469A3078ED0848E198C67E181964C8C0C39A0B57BA9F2111A9B82F48733DF087F7F24FEAA1B3DFB4F3CE77B1A4085F83F14B13AF69FBE066AB63026F891D20803EDE600393A683DC3DA6656EAD204B5971',
        'wcch.shoppingcart.v20161020': encodeURIComponent(JSON.stringify(info).replace(/\\\\/g, '\\')),
    };

    return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

const data = {
    patientCardNo: '990900012322228',
    docID: '4636',
};

let am = true;

function reg() {
    am = !am;
    const diff = Math.abs(moment(moment().format('YYYY-MM-DD 08:00:00')).diff(moment()));
    console.log(chalk.yellow(`[当前时间] ${moment().format('HH:mm:ss SSS')} [距离挂号] ${diff / 1000} 秒 [${am ? '上午' : '下午'}]`));
    axios({
        url: 'https://wcchapp.cdwit120.com/Order/CreateOrder',
        method: 'POST',
        data: qs.stringify(data),
        headers: { cookie: getCookies(am) },
    })
    .then(res => {
        const data = res.data;
        if (typeof data === 'object') {
            console.log(data.ActionMessage || data);
        } else {
            const match = /<title>(.+?)<\/title>/g.exec(res.data)
            console.log(chalk.red(match[1]));
        }
        setTimeout(() => {
            reg();
        }, diff / 10);
    })
    .catch(err => console.log(err));
}

reg();