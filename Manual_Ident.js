const { Err_Exit } = require('./custom_modules/msg/msg');
const fs = require('fs');
const express = require('express');
const { exit } = require('process');
const prompt = require("prompt-sync")();
var app = express();

let CList1, CList2, dir, num, Diff1, Diff2, count = 0;
try {
    num = prompt("> Enter Case Number : ")
    dir = "./data/" + num
    if (!fs.existsSync(dir)) {
        throw { stack: "[Error] Wrong case number\nNo such File, '" + dir + "'" };
    }
    let d1_str, d2_str, m_str;
    d1_str = fs.readFileSync(dir + '/NeedCheck1.json')
    d2_str = fs.readFileSync(dir + '/NeedCheck2.json')
    CList1 = JSON.parse(d1_str)
    CList2 = JSON.parse(d2_str)
    Diff1 = CList1[CList1.length - 1]
    Diff2 = CList1[CList2.length - 1]
}
catch (err) { Err_Exit(err) }

app.use("/view", express.static("view"));
app.use("/data", express.static("data"));
app.use("/src", express.static("src"));

app.get('/', function (req, res) {
    let nextUrl = `http://localhost:8081/main?id=${num}`;
    res.redirect(nextUrl);
})

app.get('/main', function (req, res) {
    console.log("'/main' Receive [GET] Method")
    res.sendFile(__dirname + "/view/main.html");
})


app.get('/result', function (req, res) {
    console.log("'/result' Receive [GET] Method")
    res.sendFile(__dirname + "/view/result.html");
})

app.get('/select', function (req, res) {
    // console.log("'/select' Receive [GET] Method")
    res.sendFile(__dirname + "/view/select.html");
})

app.get('/reply', function (req, res) {
    // console.log("'/reply' Receive [GET] Method")
    let que = req.query
    if (que.start != 'Y') {
        CList1[count][2] = que.result;
        fs.writeFile(dir + '/NeedCheck1.json', JSON.stringify(CList1), (err) => { Err_Exit(err) })
        count += 1;
        if (count == CList1.length - 1) {
            res.redirect(`http://localhost:8081/result?id=${num}&list=${JSON.stringify(CList1)}`)
        }
    }
    let nextUrl = `http://localhost:8081/select?id=${num}&x=${CList1[count][1]}&y=${CList1[count][0]}&pt1=${Diff1[0]}&pt2=${Diff1[0]}`;
    res.redirect(nextUrl);
})

app.get('/submitResult', function (req, res) {
    fs.writeFile(`./RESULT/case${num}.json`, JSON.stringify(CList1), (err) => { Err_Exit(err) })
    exit(1);
})

var server = app.listen(8081, function () {
    var port = server.address().port
    console.log("http://%s:%s", "localhost", port)
})
