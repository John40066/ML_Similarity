# Similarity Comparison by Machine Learning

- [Github](https://github.com/John40066/ML_Similarity)
- [DataSet](https://drive.google.com/drive/u/1/folders/1cTcEDPnqRvhdwJREjrFGATDNkMoOIUAV)
- [Submit](https://drive.google.com/drive/u/1/folders/1aSsUgD15J6JUPage-CFrN-Fv0EX2SsdL)

**這次是 21 ~ 35**，以前的 1 ~ 21 不用再按了

## Installation

- 電腦一定要有 `Node.js` | If not, Download [Here](https://nodejs.org/en/download/)。
- 打開 `ML_Similarity` 的資料夾後在終端機輸入 `npm install` $\leftarrow$ **一定要做!!**

## Execution

1. 去 DataSet 去下載你的負責部分，並解壓縮
2. 將資料放到 `./data` 底下。(Clone 時沒有這個資料夾，請自己建一個)。

- 資料夾結構會長這樣 :
- ![](https://i.imgur.com/r85IEL9.png) ![](https://i.imgur.com/mA3GWeN.png)

3. 在終端機打 `npm start` 開始執行程式
4. 輸入負責的 Case 編號後，按下連結開始判斷相似
5. 完成判斷後會出現整體結果，黃色的是你的判斷部分，紫色的不用理會(只會有一張圖有顏色)
6. 將 RESULT 中的資料上傳到 [Submit](https://drive.google.com/drive/u/1/folders/1aSsUgD15J6JUPage-CFrN-Fv0EX2SsdL)。(不用壓縮，直接傳就好)


## Stardard

基本上覺得一樣就按綠色圈圈，反之就按紅色叉叉。若兩張只是偏移量差一點點建議按圈圈，其他的若有選擇困難的狀況發作，會偏向按叉叉。

### 重要問題

- 若按錯就按下「前一個」的按鈕，就可以回到上一個重新判斷

- 若有真的超級難以判斷的，就按下叉叉

- 若卡在 loading OpenCV.js 的話，就 F5 重新整理多次就好了

- 若遇到 Bug 且重跑一遍依然有遇到(且會影響執行)的話，就在 [Bug回報區](https://docs.google.com/document/d/1wkdRQGKIioyS5cR_PwRiBkyuJ9yjP8Kg9czQDE--BQg/edit) 的共編，看看有沒有人遇到一樣的問題，或是直接把問題打在上面，我不定期會看一下。

- 裡面都有回報方式的範例，就盡量照格式打(有需要讓我聯絡你就留下名字 or Line 的名稱)。Bug回報區長這樣 :
![](https://i.imgur.com/lGzv6m5.png)

## Other

- 感謝你的幫忙QAQ，希望後續處理順利，若不順利，並分析後發現資料蒐集有問題，就要再麻煩各位重按了。
- 然後不要動到別人在 Bug回報區 留下的文字喔~

## Cases

|Number|WebSite|Amount|
|-|-|-|
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
|--| Break Line |4503|
|21|[雄獅旅遊](https://www.liontravel.com/category/zh-tw/index)|404|
|22|[遊戲天堂](https://i-gamer.net/)|234|
|23|[史萊姆](http://www.slime.com.tw/)|173|
|24|[Tourest](https://tourest.ee/en/)|202|
|25|[Disney+](https://www.disneyplus.com/zh-hant/home)|389|
|26|[Mr.Marrket](https://rich01.com/learn-stock-all/)|111|
|27|[Xbox](https://www.xbox.com/zh-TW)|489|
|28|[Switch](https://www.nintendo.tw/hardware/switch/feature/)|438|
|29|[ABCnews](https://abcnews.go.com/)|326|
|30|[Bing](https://www.bing.com/?FORM=Z9FD1)|479|
|31|[imgur](https://imgur.com/)|221|
|32|[Flaticon 1](https://www.flaticon.com/search?word=Star)|196|
|33|[Flaticon 2](https://www.flaticon.com/search?word=Game&order_by=4)|82|
|--| Break Line |3744|

- Total Amount : 8247
- Git : `git@github.com:John40066/ML_Similarity.git`

## O/X Ratio

### 7/6

- O : 2854
- X : 1457

## Temp 
Synthetic Minority Over-sampling Technique