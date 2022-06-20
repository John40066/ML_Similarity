let img1 = document.getElementById("img1")
let img2 = document.getElementById("img2")

const size = 100;
const half_size = size / 2;
const params = new URLSearchParams(window.location.search);

const num = params.get("id");
img1.src = "./data/" + num + "/img1.png"
img2.src = "./data/" + num + "/img2.png"

let row = Number(params.get("row"));
let col = Number(params.get("col"));
let pt1 = Number(params.get("pt1"));
let pt2 = Number(params.get("pt2"));

let id_ele = document.getElementById("cid"); id_ele.value = num;
let row_ele = document.getElementById("row");
let col_ele = document.getElementById("col");
let pt1_ele = document.getElementById("pt1"); pt1_ele.value = pt1;
let pt2_ele = document.getElementById("pt2"); pt2_ele.value = pt2;
let Obutton = document.getElementById("o");
let im1, im2, y = 0, x = 0;
x = half_size * col;
y = half_size * row;
for (let i = 0; i < row; i++)
    y += half_size;
for (let i = 0; i < col; i++)
    x += half_size;

function Crop(img, x, y, width, height) {
    let rect = new cv.Rect(x, y, width, height)
    let dst = img.roi(rect).clone()
    return dst
}

function HistCheck(img, thres = 90) {
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


var Module = {
    onRuntimeInitialized() {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';

        im1 = cv.imread(img1);
        im2 = cv.imread(img2);

        let im_size = [im2.size().width, im2.size().height]
        // Update next picture location
        if (x + half_size >= im_size[0] - size) {
            if (y + half_size >= im_size[1] - size) {
                col = -1;
                row = -1;
            }
            else {
                col = 0;
                row += 1;
            }
        }
        else { col += 1; }
        row_ele.value = row
        col_ele.value = col

        // Match Template
        let radius = 60;
        let u = Math.min(y + pt2 - radius, y + radius); if (u < 0) u = 0;
        let l = Math.min(x + pt1 - radius, x + radius); if (l < 0) l = 0;
        let d = Math.max(y + size + radius + pt2, y + size + radius); if (d > im_size[1]) d = im_size[1];
        let r = Math.max(x + size + radius + pt1, x + size + radius); if (r > im_size[0]) r = im_size[0];
        console.log(pt1, pt2, row, col)
        console.log(u, l, d, r)
        if (r - l < size) l = r - size;
        if (d - u < size) u = d - size;
        let im1_c = Crop(im1, x, y, size, size)
        let im2_c = Crop(im2, l, u, r - l, d - u)

        let dst = new cv.Mat()
        let mask = new cv.Mat()

        cv.matchTemplate(im2_c, im1_c, dst, cv.TM_CCOEFF_NORMED, mask);
        let res = cv.minMaxLoc(dst, mask);
        let maxPoint = res.maxLoc;
        im2_c = Crop(im2_c, maxPoint.x, maxPoint.y, size, size)
        // Histogram Checking
        if (HistCheck(im1_c)) {
            console.warn("Most Pixel are Same")
            Obutton.click();
        }

        cv.imshow("Canvas1", im1_c)
        cv.imshow("Canvas2", im2_c)
        im1.delete(); im2.delete();
        im1_c.delete(); im2_c.delete();
        dst.delete(); mask.delete();

    }
};
