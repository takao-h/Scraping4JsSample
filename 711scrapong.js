var REGION = '関東'
var REGIONS = {
  '北海道' : 'hokkaido',
  '東北' : 'touhoku',
  '甲信越・北陸' : 'koushinetu',
  '東海' : 'toukai',
  '近畿' : 'kinki',
  '中国・四国' : 'chugoku',
  '九州' : 'kyushu'
}

var ORIGIN = 'http://www.sej.co.jp'
var NEW_ITEN_DIR = '/i/product/thisweek'
var NEW_ITEN_URL = ORIGIN + NEW_ITEN_DIR
var QUERY = 'page=1&sort=f&limit=100'

var SLACK_INCOMING_URL = ''

var SEVNE_COLOR = {
'#f58220', // セブンオレンジ
'#00a54f', // セブングリーン
'#ee1c23', // セブンレッド
}

function main(){
  var attachments = []
  var html = UrlFetchApp.fetch(NEW_ITEN_URL + REGIONS[REGION] + QUERY.getContentText())
  var items = Parser.data(html).from('<li class="item">').to('</div>\n</li>').iterate()
  for(i=0; i<items.length; ++i){
  var link = ORIGIN + items[i].match(/<a href="(.+)">/)[1]
  var image = items[i].match(/src="([^"]+)" alt="商品画像")[1]
  var name = items[i].match(/<div class="itemName">(.+?)<\/li>)[1]
  var price = items[i].match(/<div class="price">(.+?)<\/li>)[1]
  var launch = items[i].match(/<div class="launch">(.+?)<\/li>)[1]
  var region = items[i].match(/<div class="reagion">(.+?)<\/li>)[1].replace(/<\/?em>/g, '')
  attachments.push(makeAttachment(link, image, ,name, price, launch, region, i))
  }
  sendSlack(attachments)
}

function makeAttachment(link, image, name, price, launch, region, i){
  return {
    color: SEVEN_COLOR[i % SEVEN_COLOR.length],
    title: name,
    title_link: link,
    thumb_url: image,
    fields: [
      {
      title: '値段',
      values: price,
      short: true,
      },
      {
      title: '販売時間',
      values: launch,
      short: true,
      },
      {
      title: '販売地域',
      values: region,
      short: true,
      }
    ]
  }
}

function sendSlack(attachments) {
  var jsonData = {
    username: 'セブンイレブン商品紹介BOT',
    icon_emoji: ':711',
    channel: '711',
    attachments: attachments
  }
  payload =JSON.stringify(jsonData);
  options = {
    "method": "post",
    "contentType": "application/json",
    "payload": payload
  };
  UrlFetchApp.fetch(SLACK_INCOMING_URL, options)
}
