# Similarity Comparison by Machine Learning
- [Github](git@github.com:John40066/ML_Similarity.git)
- [DataSet](https://drive.google.com/drive/u/1/folders/1cTcEDPnqRvhdwJREjrFGATDNkMoOIUAV)
- [Submit](https://drive.google.com/drive/u/1/folders/1aSsUgD15J6JUPage-CFrN-Fv0EX2SsdL)

## Installation
電腦一定要有 `Node.js` - [link](https://nodejs.org/en/download/)
沒有就麻煩下載一下
打開資料夾後在終端機輸入 `npm install`


## Execution
1. 去 DataSet 去下載你的負責部分，並解壓縮
2. 將資料放到 `./data` 底下。(若沒有這個資料夾，請自己建一個)
- 資料夾結構會長這樣 :
> ML_Similarity
>> custom_modules
>> data `你的 Case 編號們，例如負責1、3、5` 
>>> 1 
>>> 3
>>> 5
>> RESULT
>> src
>> view

3. 在終端機打 `npm start` 開始執行程式
4. 輸入負責的 Case 編號後，按下連結開始判斷相似
5. 完成判斷後會出現整體結果，黃色的是你的判斷部分，紫色的不用理會(只會有一張圖有顏色)
6. 將 RESULT 中的資料上傳到 [Submit](https://drive.google.com/drive/u/1/folders/1aSsUgD15J6JUPage-CFrN-Fv0EX2SsdL)

## Stardard
基本上覺得一樣就按綠色圈圈，反之就按紅色叉叉。若兩張只是偏移量差一點點建議按圈圈，其他的若有判斷困難的狀況發作，會偏向按叉叉。

## FQA

- Q: 遇到 Bug 且重跑一遍依然有怎麼辦?
> Ans: 在 [DataSet](https://drive.google.com/drive/u/1/folders/1cTcEDPnqRvhdwJREjrFGATDNkMoOIUAV) 雲端中有 "Bug 回報" 的共編，看看有沒有人遇到，直接打在上面，我不定期會看一下。如果不影響執行就忽視ㄅ

- Q: 按錯怎麼辦?
> Ans: 請終止執行並再重新執行 (從 Execution 的步驟3. 開始)。抱歉沒有設計防呆QAQ，我原本有設計這個的部分，但操作很不直觀，所以想說算了...

- Q: 大概會花多久
> Ans: 5~10 分鐘不等，感謝你!

## Other
感謝你的幫忙QAQ，希望後續處理順利，若不順利，並分析後發現資料蒐集有問題，就要再麻煩各位重按了。

## Cases
|Number|WebSite|Amount|
|1|[Wiki](https://zh.wikipedia.org/zh-tw/Wikipedia:%E9%A6%96%E9%A1%B5)|45|
|2|[Yahoo](https://tw.yahoo.com/)|84|
|3|[YouTube](https://www.youtube.com/)|173|
|4|[IG](https://www.instagram.com/)|169|
|5|[聯合新聞網](https://udn.com/news/breaknews/1)|133|
|6|[BBC News](https://www.bbc.com/news)|165|
|7|[蝦皮1](https://shopee.tw/)|409|
|8|[蝦皮2](https://shopee.tw/)|438|
|9|[PCHome1](https://24h.pchome.com.tw/index/)|254|
|10|[PCHome2](https://ecshweb.pchome.com.tw/search/v3.3/?q=ASUS&scope=all&f=pchome)|64|
|11|[Facebook](https://www.facebook.com/)|24|
|12|[動畫瘋](https://ani.gamer.com.tw/)|270|
|13|[Apple](https://www.apple.com/)|145|
|14|[SamSung](https://www.samsung.com/tw/)|252|
|15|[SideeX](https://sideex.io/)|292|
|16|[痞客邦](https://chill-tainan2022.events.pixnet.net/)|529|
|17|[Amazon](https://www.amazon.com/?language=en_US&currency=USD)|279|
|18|[Reddit](https://www.reddit.com/r/okdankretard/comments/fnzqqu/upvote_if_pewdeipie_is_beating_t_serie/)|274|
|19|[Weather](https://weather.com/weather/today/l/3eeab4ebe2aa4f2f76a280a37402da53d6571ebcd8fb958dc423b34e08f61eed)|189|
|20|[Fandom](https://www.fandom.com/)|315|