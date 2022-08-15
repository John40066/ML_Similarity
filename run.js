let webURL = "https://www.fandom.com/"
let caseNum = 20

const { Info, Warning, Err, Err_Exit } = require("./custom_modules/msg");
const { TextCompare } = require('./custom_modules/TextCompare');
const fs = require("fs");
const webdriver = require("selenium-webdriver");
const { PNG } = require("pngjs");
const Jimp = require('jimp');
const prompt = require("prompt-sync")();

Info("Running on website : " + webURL);
const size = 100
let data1, data2, Matches

async function Base642Mat(base64) {
  let imgBuf = Buffer.from(base64, 'base64')
  let jimpSrc = await Jimp.read(imgBuf)
  let src = cv.matFromImageData(jimpSrc.bitmap)
  return src
}

function Mat2Base64(mat) {
  /*
    # Function: Convert Mat of OpenCv to 
    # Parameter:
        mat: cv.Mat(), Image to be converted.
    # Return: String, Image in base64.
  */
  const size = mat.size()
  const png = new PNG({ width: size.width, height: size.height })
  png.data.set(mat.data)
  const buffer = PNG.sync.write(png)
  return 'data:image/png;base64,' + buffer.toString('base64')
}

async function Screenshot(driver, name = "") {
  /*
    # Function: Taking screenshot and store in ./data/... if name is not empty
    # Parameter:
        driver: webdriver,  Driver create by selenium.
        name:   String,     File name
    # Return: String, Image in base64.
  */
  let base64Data
  await driver.takeScreenshot().then(function (data) {
    base64Data = data.replace(/^data:image\/png;base64,/, "")
    if (name != "") fs.writeFile(name, base64Data, 'base64', (err) => { Err_Exit(err) })
  })
  return base64Data
}

function saveImg(img, name = "test.png") {
  let str = Mat2Base64(img)
  str = str.replace(/^data:image\/png;base64,/, "")
  fs.writeFile(name, str, 'base64', (err) => { Err_Exit(err) })
}

async function Waiting(time) {
  /*
    # Function: Use "await Waiting(t)" to wait t second. Can only used in async function.
    # Param:
        time: Integer, Wait how much second.
  */
  for (let t = 0; t < time; ++t)
    for (let i = 0; i < 40000; ++i)
      for (let j = 0; j < 40000; ++j)
        continue;
}

function createFolder() {
  let succeed = false
  let dir
  while (!succeed) {
    dir = './data/' + caseNum.toString();
    try {
      // Check if the directory already exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
        Info("New directory is created.")
        succeed = true;
      } else {
        Warning("Directory already exists.")
        Warning("If you want to replace the folder, type 'Y'")
        let ans = prompt("> Re-enter new case number : ")
        if (ans.toUpperCase() == 'Y') {
          fs.rmSync(dir, { recursive: true })
          Info('Deleted folder: ' + dir)
        }
        else {
          if (isNaN(Number(ans))) Warning("Input is not a number or 'Y'. Please re-enter.")
          else caseNum = Number(ans)
        }
      }
    } catch (err) { Err(err) }
  }
  return dir;
}

function HistCheck(img, thres = 85) {
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

function TouchText(x, y, dn) {
  /*
    Function: Checking if the image touch any text node.

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
  for (let i = 0; i < Matches.Unmatch[dn - 1].length; ++i) {
    let d = Matches.Unmatch[dn - 1][i];
    let rec1 = { l: x, u: y, r: x + size - 1, d: y + size - 1 }
    let rec2 = { l: Math.floor(data[d].x1 * 1.25), u: Math.floor(data[d].y1 * 1.25), r: Math.ceil(data[d].x2 * 1.25), d: Math.ceil(data[d].y2 * 1.25) }
    if (!(rec1.l >= rec2.r || rec1.u >= rec2.d || rec1.r <= rec2.l || rec1.d <= rec2.u)) return true;
  }
  return false;
}

function NeedtoCompare(im1, im2, pt, dn) {
  const half_size = size / 2;
  let im_size = [im2.size().width, im2.size().height]
  let remain = [];
  for (let y = 0; y < im1.size().height - size; y += half_size) {
    for (let x = 0; x < im1.size().width - size; x += half_size) {
      let radius = 60;
      let u = Math.min(y + pt[1] - radius, y + radius); if (u < 0) u = 0;
      let l = Math.min(x + pt[0] - radius, x + radius); if (l < 0) l = 0;
      let d = Math.max(y + size + radius + pt[1], y + size + radius); if (d > im_size[1]) d = im_size[1];
      let r = Math.max(x + size + radius + pt[0], x + size + radius); if (r > im_size[0]) r = im_size[0];
      if (r - l < size) l = r - size;
      if (d - u < size) u = d - size;
      let im1_c = Crop(im1, x, y, size, size)
      let im2_c = Crop(im2, l, u, r - l, d - u)

      let dst = new cv.Mat(), mask = new cv.Mat()
      cv.matchTemplate(im2_c, im1_c, dst, cv.TM_CCOEFF_NORMED, mask);
      let res = cv.minMaxLoc(dst, mask);
      let maxPoint = res.maxLoc;
      im2_c = Crop(im2_c, maxPoint.x, maxPoint.y, size, size);
      if (HistCheck(im1_c)) continue;
      // Checking if 2 images are the same
      // let sub = new cv.Mat();
      // cv.subtract(im1_c, im2_c, sub);
      // let matVec = new cv.MatVector();
      // cv.split(sub, matVec);
      // if (cv.countNonZero(matVec.get(0)) == 0 && cv.countNonZero(matVec.get(1)) == 0 && cv.countNonZero(matVec.get(2)) == 0)
      //   continue;
      if (TouchText(x, y, dn)) continue;
      else remain.push([y, x, '?']);

      im1_c.delete(); im2_c.delete();
      dst.delete(); mask.delete();
    }
  }
  return remain;
}

function Crop(img, x, y, width, height) {
  let rect = new cv.Rect(x, y, width, height)
  let dst = img.roi(rect).clone()
  return dst
}

// Main Function here !
async function onRuntimeInitialized() {
  try {
    Info("Load OpenCV successfully")
    let dir = createFolder();
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
      await driver1.manage().window().maximize()
      await driver2.manage().window().maximize()
    }
    catch (err) { Err_Exit(err) }
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
    let src1 = await Base642Mat(img1_base64)
    let src2 = await Base642Mat(img2_base64)
    saveImg(src1, dir + '/img1.png')
    saveImg(src2, dir + '/img2.png')
    // fs.writeFile(dir + '/data1.json', data_s1, (err) => { Err_Exit(err) })
    // fs.writeFile(dir + '/data2.json', data_s2, (err) => { Err_Exit(err) })
    // fs.writeFile(dir + '/matches.json', Matches_str, (err) => { Err_Exit(err) })
    Info("Checking where needed to be compared...")
    let avg_diff_2 = [Math.round(Matches.Avr_diff[0] * 1.25), Math.round(Matches.Avr_diff[1] * 1.25)]
    let avg_diff_1 = [-avg_diff_2[0], -avg_diff_2[1]]
    let Im1_Im2 = NeedtoCompare(src1, src2, avg_diff_1, 1);
    // let Im2_Im1 = NeedtoCompare(src2, src1, avg_diff_2, 2);
    Im1_Im2.push(avg_diff_1)
    // Im2_Im1.push(avg_diff_2)
    Info("Total amount is :" + Im1_Im2.length.toString())
    fs.writeFile(dir + '/NeedCheck1.json', JSON.stringify(Im1_Im2), (err) => { Err_Exit(err) })
    // fs.writeFile(dir + '/NeedCheck2.json', JSON.stringify(Im2_Im1), (err) => { Err_Exit(err) })

    Info("Drawing Unmatch Text and Saving Images...")
    let color = new cv.Scalar(255, 0, 255, 255);
    for (let i = 0; i < Matches.Unmatch[0].length; ++i) {
      let info = data1[Matches.Unmatch[0][i]];
      let point1 = new cv.Point(Math.floor(info.x1 * 1.25), Math.floor(info.y1 * 1.25));
      let point2 = new cv.Point(Math.ceil(info.x2 * 1.25), Math.ceil(info.y2 * 1.25));
      cv.rectangle(src1, point1, point2, color, -1, cv.LINE_8, 0);
    }
    for (let i = 0; i < Matches.Unmatch[1].length; ++i) {
      let info = data2[Matches.Unmatch[1][i]];
      let point1 = new cv.Point(Math.floor(info.x1 * 1.25), Math.floor(info.y1 * 1.25));
      let point2 = new cv.Point(Math.ceil(info.x2 * 1.25), Math.ceil(info.y2 * 1.25));
      cv.rectangle(src2, point1, point2, color, -1, cv.LINE_8, 0);
    }
    saveImg(src1, dir + '/img1Un.png')
    saveImg(src2, dir + '/img2Un.png')
    Info("Finish!\n")
  }
  catch (err) {
    try {
      if (err.message === undefined) Err("Unrecognizable Error")
      else {
        Err_Exit(err)
      }
    }
    catch (e) { console.log("> Some Error cannot be recognize.") }
  }

}



Module = {
  onRuntimeInitialized
}

cv = require('./src/opencv.js')