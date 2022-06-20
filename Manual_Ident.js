const { Err_Exit } = require('./custom_modules/msg/msg');
const fs = require('fs');
const express = require('express');
const prompt = require("prompt-sync")();
var app = express();
let count = 0;

let data1, data2, Matches, dir, num;
try {
    num = prompt("> Enter Case Number : ")
    dir = "./data/" + num
    if (!fs.existsSync(dir)) {
        throw { stack: "[Error] Wrong case number\nNo such File, '" + dir + "'" };
    }
    let d1_str, d2_str, m_str;
    d1_str = fs.readFileSync(dir + '/data1.json')
    d2_str = fs.readFileSync(dir + '/data2.json')
    m_str = fs.readFileSync(dir + '/matches.json')
    data1 = JSON.parse(d1_str)
    data2 = JSON.parse(d2_str)
    Matches = JSON.parse(m_str)
}
catch (err) { Err_Exit(err) }
let avr_diff_2 = [Math.round(Matches.Avr_diff[0] * 1.25), Math.round(Matches.Avr_diff[1] * 1.25)]
let avr_diff_1 = [-avr_diff_2[0], -avr_diff_2[1]]

app.use("/view", express.static("view"));
app.use("/data", express.static("data"));
app.use("/src", express.static("src"));

app.get('/', function (req, res) {
    let nextUrl = `http://localhost:8081/main?id=${num}&pt1=${avr_diff_1[0]}&pt2=${avr_diff_2[0]}`;
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
    console.log("'/select' Receive [GET] Method")
    res.sendFile(__dirname + "/view/select.html");
})

app.get('/reply', function (req, res) {
    console.log("'/reply' Receive [GET] Method")
    let que = req.query
    let nextUrl = `http://localhost:8081/select?id=${que.id}&row=${que.row}&col=${que.col}&pt1=${que.pt1}&pt2=${que.pt2}`;
    res.redirect(nextUrl);
})

var server = app.listen(8081, function () {
    // var host = server.address().address
    var port = server.address().port
    console.log("http://%s:%s", "localhost", port)
})
