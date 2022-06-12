let webURL = "https://www.youtube.com/?gl=TW&hl=zh-TW";

const { Info, Err, Err_Exit } = require("./custom_modules/msg")
const { TextCompare } = require('./custom_modules/TextCompare')
const fs = require("fs");
const webdriver = require("selenium-webdriver")
const { PNG } = require("pngjs")
const Jimp = require('jimp')
const ssim = require('ssim.js');
const { exit } = require("process");

let data1, data2, Matches

function Mat2Base64(mat) {
  /*
    Function: Convert Mat of OpenCv to 
 
    Parameter:
      mat: cv.Mat(), Image to be converted.
 
    Return: String, Image in base64.
  */
  const size = mat.size()
  const png = new PNG({ width: size.width, height: size.height })
  png.data.set(mat.data)
  const buffer = PNG.sync.write(png)
  return 'data:image/png;base64,' + buffer.toString('base64')
}

async function Screenshot(driver, name = "") {
  /*
    Function: Taking screenshot and store in ./Data/...
 
    Parameter:
      driver: webdriver,  Driver create by selenium.
      name:   String,     File name
 
    Return: String, Image in base64.
  */
  let base64Data
  await driver.takeScreenshot().then(function (data) {
    base64Data = data.replace(/^data:image\/png;base64,/, "")
    if (name != "") fs.writeFile(name, base64Data, 'base64', (err) => { Err_Exit(err) })
  })
  return base64Data
}

function CheckTouch(x, y, size, dn) {
  /*
    Function: Checking if the image touch any matched pairs.
 
    Parameter:
      x, y: Integer, Left-Top position of image.
      size: Integer, Size of image(width equal to height)
      dn:   Integer, 1 or 2. Using data1 or data2.
 
    Return: Boolean, If touch any one of matched pairs, return true. Otherwise, return false.
  */
  let data = (dn == 1 ? data1 : data2);
  for (let i = 0; i < Matches.MatchPair.length; ++i) {
    let d = (dn == 1 ? Matches.MatchPair[i].d1 : Matches.MatchPair[i].d2);
    let rec1 = { l: x, u: y, r: x + size - 1, d: y + size - 1 }
    let rec2 = { l: Math.floor(data[d].x1 * 1.25), u: Math.floor(data[d].y1 * 1.25), r: Math.ceil(data[d].x2 * 1.25), d: Math.ceil(data[d].y2 * 1.25) }
    if (!(rec1.l >= rec2.r || rec1.u >= rec2.d || rec1.r <= rec2.l || rec1.d <= rec2.u)) return true;
  }
  return false;
}

function saveImg(img, name = "test.png") {
  let str = Mat2Base64(img);
  str = str.replace(/^data:image\/png;base64,/, "")
  fs.writeFile(name, str, 'base64', (err) => { Err_Exit(err) })
}

function Crop(img, x, y, width, height) {
  /*
    Function: Crop image.
 
    Param:
      img:    cv.Mat,   Image to be cropped.
      x, y:   Integer,  Left-Top position to be cropped.
      width:  Integer,  Width of result image.
      height:  Integer,  Height of result image.
 
    Function: cv.Mat,   Crop result.
  */
  let dst = new cv.Mat();
  let rect = new cv.Rect(x, y, width, height);
  dst = img.roi(rect).clone();
  return dst
}

function HistCheck(img, thres = 90) {
  /*
    Function: Checking the image is most of single color.
 
    Parameter:
      img:    cv.Mat(), A image.
      thres:  Number,   Threshold
 
    Return: Boolean, If any one of bins is over thres%, return true. Otherwise, return false.
  */
  let src = img.clone();
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  let srcVec = new cv.MatVector();
  srcVec.push_back(src);
  let hist = new cv.Mat();
  let mask = new cv.Mat();
  // Param:   srcVec, channels, mask, hist, histSize, ranges, accumulate
  cv.calcHist(srcVec, [0], mask, hist, [16], [0, 256], false);
  let max = src.rows * src.cols;
  for (let i = 0; i < 16; i++) {
    let binVal = hist.data32F[i] * 100 / max;
    if (binVal >= thres) return true;
  }
  return false;
}

async function Waiting(time) {
  /*
    Function: Use "await Waiting(t)" to wait t second. Can only used in async function.
    
    Param:
      time: Integer, Wait how much second.
  */
  for (let t = 0; t < time; ++t)
    for (let i = 0; i < 40000; ++i)
      for (let j = 0; j < 40000; ++j)
        continue;
}

// Main Function here !
async function onRuntimeInitialized() {
  try {
    Info("Load OpenCV successfully")
    Info("Opening Drivers...")
    let driver1, driver2;
    try {
      driver1 = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build();
      driver2 = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.firefox()).
        build();
      driver1.get(webURL)
      driver2.get(webURL)
      await driver1.manage().window().maximize();
      await driver2.manage().window().maximize()
    }
    catch (err) { console.log(err.stack); exit(); }
    await Waiting(4)

    console.log("[INFO] Start Executing Location & Comparison")
    let ElementLocate = fs.readFileSync('./src/Location.js', 'utf8')
    let data_s1 = await driver1.executeScript(ElementLocate)
    let data_s2 = await driver2.executeScript(ElementLocate)
    let img1_base64 = await Screenshot(driver1)
    let img2_base64 = await Screenshot(driver2)
    data1 = JSON.parse(data_s1)
    data2 = JSON.parse(data_s2)
    driver1.close(); driver2.close();
    let Matches_str = await TextCompare(data1, data2);
    Matches = JSON.parse(Matches_str)

    Info("Tranferring Screenshot to Mat of OpenCV...")
    let imgBuf_1 = Buffer.from(img1_base64, 'base64')
    let imgBuf_2 = Buffer.from(img2_base64, 'base64')
    var jimpSrc_1 = await Jimp.read(imgBuf_1)
    var jimpSrc_2 = await Jimp.read(imgBuf_2)
    var src1 = cv.matFromImageData(jimpSrc_1.bitmap)
    var src2 = cv.matFromImageData(jimpSrc_2.bitmap)
    saveImg(src1, "./data/img1.png")
    saveImg(src2, "./data/img2.png")
    fs.writeFile('./data/data1.json', data_s1, (err) => { Err_Exit(err) })
    fs.writeFile('./data/data2.json', data_s2, (err) => { Err_Exit(err) })
    fs.writeFile('./data/matches.json', Matches_str, (err) => { Err_Exit(err) })
    Info("Finish!\n")
  }
  catch (err) {
    if (err.message === undefined) Err("Unrecognizable Error")
    else {
      Err(err.stack)
      exit(1)
    }
  }

}



Module = {
  onRuntimeInitialized
}

cv = require('./src/opencv.js')