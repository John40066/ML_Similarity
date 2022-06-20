let webURL = "https://www.youtube.com/?gl=TW&hl=zh-TW"
let caseNum = 0

const { Info, Warning, Err, Err_Exit } = require("./custom_modules/msg");
const { TextCompare } = require('./custom_modules/TextCompare');
const fs = require("fs");
const webdriver = require("selenium-webdriver");
const { PNG } = require("pngjs");
const Jimp = require('jimp');
const { exit } = require("process");
const prompt = require("prompt-sync")();

let data1, data2, Matches

async function Base642Mat(base64) {
  let imgBuf = Buffer.from(base64, 'base64')
  let jimpSrc = await Jimp.read(imgBuf)
  let src = cv.matFromImageData(jimpSrc.bitmap)
  return src
}

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

function saveImg(img, name = "test.png") {
  let str = Mat2Base64(img)
  str = str.replace(/^data:image\/png;base64,/, "")
  fs.writeFile(name, str, 'base64', (err) => { Err_Exit(err) })
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

function createFolder() {
  let succeed = false
  let dir
  while (!succeed) {
    dir = './data/' + caseNum.toString();
    try {
      // first check if directory already exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
        Info("New directory is created.")
        succeed = true;
      } else {
        Warning("Directory already exists.")
        Warning("If you want to replace the folder, type 'Y'")
        let ans = prompt("> Re-enter new case number : ")
        if (ans == 'Y') {
          fs.rmSync(dir, { recursive: true })
          Info('Deleted folder: ' + dir)
        }
        else caseNum = Number(ans)
      }
    } catch (err) { Err(err) }
  }
  return dir;
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
    fs.writeFile(dir + '/data1.json', data_s1, (err) => { Err_Exit(err) })
    fs.writeFile(dir + '/data2.json', data_s2, (err) => { Err_Exit(err) })
    fs.writeFile(dir + '/matches.json', Matches_str, (err) => { Err_Exit(err) })
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