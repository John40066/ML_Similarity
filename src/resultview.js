let img1 = document.getElementById("img1")
let img2 = document.getElementById("img2")
let img1Un = document.getElementById("img1Un")
let img2Un = document.getElementById("img2Un")

let view1 = document.getElementById("view1")
let view2 = document.getElementById("view2")

view1.addEventListener("scroll", () => {
    view2.scrollLeft = view1.scrollLeft;
    view2.scrollTop = view1.scrollTop;
});

view2.addEventListener("scroll", () => {
    view1.scrollLeft = view2.scrollLeft;
    view1.scrollTop = view2.scrollTop;
});

const size = 100;
const params = new URLSearchParams(window.location.search);

const num = params.get("id");
const RList_str = params.get("list");
let RList = JSON.parse(RList_str);
console.log(RList)
img1.src = "./data/" + num + "/img1.png"
img2.src = "./data/" + num + "/img2.png"
img1Un.src = "./data/" + num + "/img1Un.png"
img2Un.src = "./data/" + num + "/img2Un.png"

var Module = {
    onRuntimeInitialized() {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
        let im1Un = cv.imread(img1Un);
        let im1 = cv.imread(img1);
        let im2 = cv.imread(img2);
        let color = new cv.Scalar(255, 255, 0, 255);
        for (let i = 0; i < RList.length - 1; ++i) {
            if (RList[i][2] == 'X') {
                let point1 = new cv.Point(RList[i][1], RList[i][0]);
                let point2 = new cv.Point(RList[i][1] + size, RList[i][0] + size - 1);
                cv.rectangle(im1Un, point1, point2, color, -1, cv.LINE_8, 0);
            }
        }
        cv.addWeighted(im1Un, 0.2, im1, 0.8, 0, im1Un)
        cv.imshow("Canvas1", im1Un)
        cv.imshow("Canvas2", im2)
    }
};
