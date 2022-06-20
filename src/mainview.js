let img1 = document.getElementById("img1")
let img2 = document.getElementById("img2")
// let start = document.getElementById("start")

const params = new URLSearchParams(window.location.search);

const num = params.get("id");
img1.src = "./data/" + num + "/img1.png"
img2.src = "./data/" + num + "/img2.png"
let pt1 = document.getElementById("pt1")
let pt2 = document.getElementById("pt2")
let caseid = document.getElementById("cid")
pt1.value = params.get("pt1");
pt2.value = params.get("pt2");
caseid.value = num