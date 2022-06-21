let img1 = document.getElementById("img1")
let img2 = document.getElementById("img2")

const size = 100;
const half_size = size / 2;
const params = new URLSearchParams(window.location.search);

const num = params.get("id");
img1.src = "./data/" + num + "/img1.png"
img2.src = "./data/" + num + "/img2.png"

let x = Number(params.get("x"));
let y = Number(params.get("y"));
let pt1 = Number(params.get("pt1"));
let pt2 = Number(params.get("pt2"));

function Crop(img, x, y, width, height) {
    let rect = new cv.Rect(x, y, width, height)
    let dst = img.roi(rect).clone()
    return dst
}

var Module = {
    onRuntimeInitialized() {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';

        let im1 = cv.imread(img1);
        let im2 = cv.imread(img2);
        let im_size = [im2.size().width, im2.size().height]

        // Match Template
        let radius = 60;
        let u = Math.min(y + pt2 - radius, y + radius); if (u < 0) u = 0;
        let l = Math.min(x + pt1 - radius, x + radius); if (l < 0) l = 0;
        let d = Math.max(y + size + radius + pt2, y + size + radius); if (d > im_size[1]) d = im_size[1];
        let r = Math.max(x + size + radius + pt1, x + size + radius); if (r > im_size[0]) r = im_size[0];
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

        cv.imshow("Canvas1", im1_c)
        cv.imshow("Canvas2", im2_c)

        im1.delete(); im2.delete();
        im1_c.delete(); im2_c.delete();
        dst.delete(); mask.delete();

    }
};
