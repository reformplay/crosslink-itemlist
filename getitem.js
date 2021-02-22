const axios = require('axios');
const { execSync } = require('child_process');
var fs = require('fs');
var cron = require('node-cron');

async function getAllData() {
  let allData = [];
  let pageNum = 0;
  const getItemData = async function(pageNum){
    response = await axios.post("https://api.tokenlink.io/sale/getMarketList", { "Lang": "ja", "user": "", "Data": { "SortMethod": 2, "Filter": {}, "Search": "", "Offset": pageNum * 40, "Limit": 40 } });
    const items = response.data.Data.Sales;
    allData = allData.concat(items);
    pageNum++;
    if (items.length > 0) {
      return getItemData(pageNum);
    } else {
      return allData;
    }
  }
  return getItemData(pageNum);
}

async function getTokenData(allData) {
  const newItem = [];
  responses = await Promise.all(
    allData.map(async (item) =>{
      try{
        const response = await axios.post("https://api.tokenlink.io/sale/getItemInfo", { "Lang": "ja", "User": "", "Data": { "TokenId": item.SaleData.TokenId } });
        const getitem = response.data.Data.ItemInfo.Parameters;
        getitem.id = item.SaleData.Id;
        getitem.price = item.SaleData.Price;
        getitem.itemName = item.ItemName;
        getitem.totalScore = getitem.Hp + getitem.Atk + getitem.Def + getitem.Sp + getitem.Spd;

        return getitem;
      }catch(e){}
      
    })
  );

  const json = {
    lastUpdate: new Date().toLocaleString({ timeZone: 'Asia/Tokyo' }),
    itemData: responses.filter(v => v)
  }
  fs.writeFileSync('../itemtable/public/output.json', JSON.stringify(json));
  fs.writeFileSync('../itemtable/dist/output.json', JSON.stringify(json));
  
  const deploy = execSync('netlify deploy --prod');
  console.log(`deploy: ${deploy.toString()}`);
  return;
}

async function main() {
  allData = await getAllData();
  getTokenData(allData);
}

cron.schedule('0 0,10,20,30,40,50 * * * *', () => {
  main();
});

