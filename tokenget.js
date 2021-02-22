var fs = require('fs');
const {execSync} = require('child_process');
const puppeteer = require('puppeteer');

var cron = require('node-cron');

cron.schedule('0 25,55 * * * *', () => {
  do_func();
});

async function do_func(){
  try{
    const jsonObject = JSON.parse(fs.readFileSync('../itemtable/public/output.json', 'utf8'));
    const startId = jsonObject.lastId;

    const newItemData = jsonObject.itemData.filter(item => {
      const sellEndTime = new Date(item.endTime);
      const date = sellEndTime.getTime() - Date.now();
      return date > 60;
    });


    (async () => {
      puppeteer.launch({
        headless: true
      }).then(
        async browser => {
          //要素確認
          //jsonObject.itemData.map((d) => { return d[col] });
          const readNum = jsonObject.itemData.length;
          let rountNum = Math.ceil(readNum / 10);

          const promiseListCheck = [];

          for (let i = 0; i < 10; i++) {
            let id = i * rountNum;
            promiseListCheck.push((async () => {
              const page = await browser.newPage()
              for (let j = id; j < id + rountNum && j < readNum; j++) {
                const res = await page.goto('https://www.tokenlink.io/market-item-detail.html?saleId=' + newItemData[j].id);
                await page.waitForTimeout(3000);

                try {
                  newItemData[j].soldDate = await page.evaluate(() => {
                    return itemInfo.soldDate;
                  });

                } catch (e) {
                  console.log(newItemData[j].id + ':終了');
                  newItemData[j].soldDate = new Date();
                  continue;
                }

              }
              await page.close();
              return;

            })().catch(e => console.error(e)));
          }
          await Promise.all(promiseListCheck).then(vList => {
            console.log('end');
          });
          jsonObject.itemData = newItemData.filter(item => {
            return item.soldDate == null;
          });
          jsonObject.lastUpdate = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
          fs.writeFileSync('../itemtable/public/output.json', JSON.stringify(jsonObject));

          //新規追加
          const page = await browser.newPage();
          await page.goto('https://www.tokenlink.io/market.html');
          await page.waitForTimeout(3000);
          await page.select('.market-sort', '2');
          await page.waitForTimeout(1000);
          await page.click('#pager_wrapper > div:nth-child(1)');
          await page.waitForTimeout(3000);
          let lastId = 0;
          try {
            lastId = await page.evaluate(() => {
              return itemInfo.saleId;
            });
          } catch (e) {
            console.log(e);
          }

          await page.close();

          const newNum = lastId - startId;
          if (newNum > 0) {
            rountNum = Math.ceil(newNum / 10);
            const promiseList = [];

            for (let i = 0; i < 10; i++) {
              let id = lastId - (i * rountNum);
              promiseList.push((async () => {
                const page = await browser.newPage()
                const results = [];
                for (let j = id; j > id - rountNum && j > startId; j--) {
                  const res = await page.goto('https://www.tokenlink.io/market-item-detail.html?saleId=' + j);
                  await page.waitForTimeout(3000);

                  try {
                    const soldDate = await page.evaluate(() => {
                      return itemInfo.soldDate;
                    });
                    if (soldDate != null) continue;
                    const result = await page.evaluate(() => {
                      return itemInfo.parameter;
                    });
                    result['itemName'] = await page.evaluate(() => {
                      return itemInfo.itemName;
                    });
                    result['endTime'] = await page.evaluate(() => {
                      return itemInfo.endTime;
                    });
                    result['price'] = await page.evaluate(() => {
                      return itemInfo.price;
                    });

                    result['totalScore'] = result.Hp + result.Atk + result.Def + result.Sp + result.Spd;
                    result['id'] = j;
                    result['url'] = "https://www.tokenlink.io/market-item-detail.html?saleId=" + j;
                    results.push(result);
                  } catch (e) {
                    console.log(id + ':終了');
                    continue;
                  }

                }
                await page.close();
                return results;

              })().catch(e => console.error(e)));
            }
            await Promise.all(promiseList).then(vList => {
              vList.forEach(list => {
                for (let i = 0; i < list.length; i++) {
                  jsonObject.itemData.push(list[i]);
                }
              });
            });
            jsonObject.lastId = lastId;
          }

          jsonObject.lastUpdate = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
          fs.writeFileSync('../itemtable/public/output.json', JSON.stringify(jsonObject));
          fs.writeFileSync('../itemtable/dist/output.json', JSON.stringify(jsonObject));

          await browser.close();
          const deploy = execSync('netlify deploy --prod');
          console.log(`deploy: ${deploy.toString()}`);
          
        }
      )
    })();
  }catch(e){
    process.exit(1);
  }
}
