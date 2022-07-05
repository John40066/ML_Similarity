const fs = require("fs");
const { Info, Warning, Err, Err_Exit } = require("./custom_modules/msg");
const imgUtils = require("./custom_modules/ImageUtils");

const size = 100;
let LoadPath = "./RESULT/00/"
let SavePath = "./Dataset/";

function saveImg(img, name = "test.png") {
    let str = imgUtils.Mat2Base64(img)
    str = str.replace(/^data:image\/png;base64,/, "")
    fs.writeFileSync(name, str, 'base64', (err) => { Err_Exit(err) })
}



async function onRuntimeInitialized() {
    try {
        Info("Load OpenCV successfully")
        for (let i = 20; i <= 20; ++i) {
            Info("Case " + i.toString() + " running...")
            let data = fs.readFileSync(LoadPath + `case${i.toString()}.json`)
            let img1_base64 = fs.readFileSync(`./data/${i.toString()}/img1.png`)
            let img2_base64 = fs.readFileSync(`./data/${i.toString()}/img2.png`)
            let im1 = await imgUtils.Base642Mat(img1_base64)
            let im2 = await imgUtils.Base642Mat(img2_base64)
            data = JSON.parse(data);

            for (let j = 0; j < data.length - 1; ++j) {
                let y = data[j][0], x = data[j][1], OX = data[j][2], pt = data[data.length - 1];

                let im_size = [im2.size().width, im2.size().height]
                let radius = 60;
                let u = Math.min(y + pt[1] - radius, y + radius); if (u < 0) u = 0;
                let l = Math.min(x + pt[0] - radius, x + radius); if (l < 0) l = 0;
                let d = Math.max(y + size + radius + pt[1], y + size + radius); if (d > im_size[1]) d = im_size[1];
                let r = Math.max(x + size + radius + pt[0], x + size + radius); if (r > im_size[0]) r = im_size[0];
                if (r - l < size) l = r - size;
                if (d - u < size) u = d - size;
                let im1_c = imgUtils.Crop(im1, x, y, size, size)
                let im2_ct = imgUtils.Crop(im2, l, u, r - l, d - u)

                let dst = new cv.Mat(), mask = new cv.Mat()
                cv.matchTemplate(im2_ct, im1_c, dst, cv.TM_CCOEFF_NORMED, mask);
                let res = cv.minMaxLoc(dst, mask);
                let maxPoint = res.maxLoc;
                let im2_c = imgUtils.Crop(im2_ct, maxPoint.x, maxPoint.y, size, size);
                let concate = new cv.Mat()
                let srcVec = new cv.MatVector();
                srcVec.push_back(im1_c); srcVec.push_back(im2_c);
                cv.vconcat(srcVec, concate);
                saveImg(concate, `./Dataset/${OX}/${i},${y.toString()},${x.toString()}.png`)
                im1_c.delete(); im2_c.delete(); im2_ct.delete(); srcVec.delete();
                dst.delete(); mask.delete(); concate.delete();
            }
            im1.delete(); im2.delete();
        }
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


