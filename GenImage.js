const fs = require("fs");
const { Info, Warning, Err, Err_Exit } = require("./custom_modules/msg/msg");
const imgUtils = require("./custom_modules/ImageUtils");

const size = 100;
let LoadPath = "./RESULT/0"
let SavePath = "./Dataset/";

function saveImg(img, name = "test.png") {
    let str = imgUtils.Mat2Base64(img)
    str = str.replace(/^data:image\/png;base64,/, "")
    fs.writeFileSync(name, str, 'base64', (err) => { Err_Exit(err) })
}



async function onRuntimeInitialized() {
    try {
        Info("Load OpenCV successfully")
        let counter = [1710, 1022];
        for (let i = 16; i <= 20; ++i) {
            Info("Case " + i.toString() + " running...")
            let data = [];
            for (let p = 0; p < 3; ++p) {
                let d = fs.readFileSync(`${LoadPath}${p.toString()}/case${i.toString()}.json`)
                d = JSON.parse(d);
                data.push(d);
            }
            let img1_base64 = fs.readFileSync(`./data/${i.toString()}/img1.png`)
            let img2_base64 = fs.readFileSync(`./data/${i.toString()}/img2.png`)
            let im1 = await imgUtils.Base642Mat(img1_base64)
            let im2 = await imgUtils.Base642Mat(img2_base64)
            for (let j = 0; j < data[0].length - 1; ++j) {
                let y = data[0][j][0], x = data[0][j][1], pt = data[0][data[0].length - 1];
                let vote = 0;
                for (let p = 0; p < 3; ++p)
                    if (data[p][j][2] == "O") vote++;
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
                let cidx = 0;
                if (vote > 1) vote = 'O'
                else { vote = 'X'; cidx = 1; }
                saveImg(concate, `./Dataset/${vote}/${counter[cidx]}.png`)
                counter[cidx]++;
                im1_c.delete(); im2_c.delete(); im2_ct.delete(); srcVec.delete();
                dst.delete(); mask.delete(); concate.delete();
            }
            im1.delete(); im2.delete();
        }
        Info(counter);
    }
    catch (err) {
        try {
            if (err.message === undefined) Err("Unrecognizable Error")
            else Err_Exit(err)
        }
        catch (e) { console.log("> Some Error cannot be recognize.") }
    }

}



Module = {
    onRuntimeInitialized
}

cv = require('./src/opencv.js')


