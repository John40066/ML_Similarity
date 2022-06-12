const Color = ["MediumBlue", "Green"]; // set Rectangle Color of Matching pair.
// define global variable
var toShow = document.createElement("div");
var bodyStyle = window.getComputedStyle(document.body);
var bodyTop = bodyStyle.marginTop.split('px')[0] + bodyStyle.paddingTop.split('px')[0];
var bodyLeft = bodyStyle.marginLeft.split('px')[0] + bodyStyle.paddingLeft.split('px')[0];
var count1 = 0, count2 = 0; //記錄2個網站分別有幾個rectangle unmatch
var match_pair = []; // 有 Match 的資料 {d1, d2}
var average_diffx = 0, average_diffy = 0; // x, y 平均位移
var group_num = 0;

for (let i = 0; i < data1.length; i++) {
    for (let j = 0; j < data2.length; j++) {
        if (data1[i].content == data2[j].content && data1[i].line_num == data2[j].line_num && data1[i].tag_name == data2[j].tag_name) {
            if (data1[i].group != -1) {
                if (data2[j].group == -1) {
                    data2[j].group = data1[i].group
                    match_pair[data1[i].group].second.push(j)
                }
            }
            else if (data2[j].group != -1) {
                data1[i].group = data2[j].group
                match_pair[data2[j].group].first.push(i)
            }
            else {
                match_pair.push({ first: [], second: [] })
                data1[i].group = data2[j].group = group_num
                match_pair[group_num].first.push(i)
                match_pair[group_num].second.push(j)
                group_num += 1
            }
        }
    }
}

function is_match(d1, d2) {
    let xdiff = Math.abs(data1[d1].x1 - data2[d2].x1)
    let ydiff = Math.abs(data1[d1].y1 - data2[d2].y1)
    // 距離 > 150
    if (xdiff * xdiff + ydiff * ydiff > 12500) return false
    else return true
}

let match_count = 0;
let temp_list = [];
for (let i = 0; i < match_pair.length; i++) {
    if (match_pair[i].first.length == 1 && match_pair[i].second.length == 1) { // group 中各只有1個的
        if (is_match(match_pair[i].first[0], match_pair[i].second[0])) {
            average_diffx += (data1[match_pair[i].first[0]].x1 - data2[match_pair[i].second[0]].x1)
            average_diffy += (data1[match_pair[i].first[0]].y1 - data2[match_pair[i].second[0]].y1)
            match_count += 1
            data1[match_pair[i].first[0]].match = true;
            data2[match_pair[i].second[0]].match = true;
            temp_list.push({ d1: match_pair[i].first[0], d2: match_pair[i].second[0] });
        }
    }
}

if (match_count != 0) {
    average_diffx /= match_count;
    average_diffy /= match_count;
}

function factorial(n) {
    var total = 1;
    for (let i = 1; i <= n; i++) {
        total = total * i;
    }
    return total;
}

// Prevent 誤差過大
average_diffx = Math.round(average_diffx)
average_diffy = Math.round(average_diffy)
average_diffx = Math.min(average_diffx, 100)
average_diffy = Math.min(average_diffy, 100)
average_diffx = Math.max(average_diffx, -100)
average_diffy = Math.max(average_diffy, -100)


function New_order(order) {
    let len = order.length
    let j = -1, k = -1;
    for (let i = len - 1; i > 0; i--) {
        if (order[i - 1] < order[i]) {
            j = i - 1;
            break;
        }
    }
    if (j == -1) {
        console.log("No new order")
        return order
    }
    let min_num = order.length + 1
    for (let i = j + 1; i < len; i++)
        if (order[i] > order[j] && order[i] < min_num) k = i;
    let temp = order[k]
    order[k] = order[j]
    order[j] = temp;
    let n1 = j + 1, n2 = len - 1;
    while (n1 < n2) {
        temp = order[n1]
        order[n1] = order[n2]
        order[n2] = temp;
        n1++; n2--;
    }
    return order
}

for (let i = 0; i < match_pair.length; i++) {
    if (match_pair[i].first.length > 1 || match_pair[i].second.length > 1) {
        let result = []
        let match_temp = []
        let R_len = match_pair[i].first.length;
        let C_len = match_pair[i].second.length;
        for (let m = 0; m < R_len; m++) {
            result.push([])
            for (let n = 0; n < C_len; n++) {
                let dx, dy, d1 = match_pair[i].first[m], d2 = match_pair[i].second[n]
                dx = data1[d1].x1 - data2[d2].x1 - average_diffx
                dy = data1[d1].y1 - data2[d2].y1 - average_diffy
                result[m].push(Math.sqrt(dx * dx + dy * dy))
                if (result[m][n] > 300) result[m][n] = -1
            }
        }
        let order = [...Array(Math.max(R_len, C_len)).keys()];
        let compose_num = factorial(Math.max(R_len, C_len));
        let Match_array = null;
        if (R_len <= C_len) {
            let min_diff = Number.MAX_VALUE;
            let max_match_count = 0;
            while (compose_num--) {
                let total = 0;
                let count = 0;
                for (let m = 0; m < R_len; m++) {
                    console.log(result[m][order[m]]);
                    if (result[m][order[m]] >= 0) {
                        count++;
                        total += result[m][order[m]];
                    }
                }
                if (count >= max_match_count && total < min_diff) {
                    max_match_count = count;
                    total = min_diff;
                    Match_array = [...order];
                }
                order = New_order(order);
            }
            for (let m = 0; m < R_len; m++) {
                if (result[m][Match_array[m]] != -1) {
                    temp_list.push({ d1: match_pair[i].first[m], d2: match_pair[i].second[Match_array[m]] })
                    data1[match_pair[i].first[m]].match = true;
                    data2[match_pair[i].second[Match_array[m]]].match = true;
                }
            }
        }
        else {
            let min_diff = Number.MAX_VALUE;
            let max_match_count = 0;
            while (compose_num--) {
                let total = 0;
                let count = 0;
                for (let m = 0; m < C_len; m++) {
                    if (result[order[m]][m] >= 0) {
                        count++;
                        total += result[order[m]][m];
                    }
                }
                if (count >= max_match_count && total < min_diff) {
                    max_match_count = count;
                    total = min_diff;
                    Match_array = [...order];
                }
                order = New_order(order);
            }
            for (let m = 0; m < C_len; m++) {
                if (result[Match_array[m]][m] != -1) {
                    temp_list.push({ d1: match_pair[i].first[Match_array[m]], d2: match_pair[i].second[m] })
                    data1[match_pair[i].first[Match_array[m]]].match = true;
                    data2[match_pair[i].second[m]].match = true;
                }
            }
        }
    }
}
delete match_pair;
match_pair = temp_list;



//Push unmatch items into unmatch list.
let unmatch1 = [], unmatch2 = [];
for (let i = 0; i < data1.length; i++)
    if (data1[i].match == false) unmatch1.push(i);
for (let i = 0; i < data2.length; i++)
    if (data2[i].match == false) unmatch2.push(i);

// Circle matched items
let m_num = -1;
let item1 = null, item2 = null;

function circleMatch() {
    if (item1 != null) toShow.removeChild(item1);
    if (item2 != null) toShow.removeChild(item2);
    m_num += 1;
    if (m_num >= match_pair.length) m_num = 0;
    item1 = document.createElement("div");
    item1.style.visibility = "visible";
    item1.style.position = "fixed";
    item1.style.top = data1[match_pair[m_num].d1].y1 + "px";
    item1.style.left = data1[match_pair[m_num].d1].x1 + "px";
    item1.style.height = data1[match_pair[m_num].d1].height + "px";
    item1.style.width = data1[match_pair[m_num].d1].width + "px";
    item1.style.border = "3px solid " + Color[0];
    item1.style.zIndex = "2147483647";
    toShow.appendChild(item1);
    item2 = document.createElement("div");
    item2.style.visibility = "visible";
    item2.style.position = "fixed";
    item2.style.top = data2[match_pair[m_num].d2].y1 + "px";
    item2.style.left = data2[match_pair[m_num].d2].x1 + "px";
    item2.style.height = data2[match_pair[m_num].d2].height + "px";
    item2.style.width = data2[match_pair[m_num].d2].width + "px";
    item2.style.border = "3px solid " + Color[1];
    item2.style.zIndex = "2147483646";
    toShow.appendChild(item2);
}
// Circle unmatched items
function circleUnmatch(datanum = 1) {
    if (datanum == 1) {
        for (let i = 0; i < data1.length; i++) {
            if (data1[i].match == false) {
                let showdivEle = document.createElement("div");
                showdivEle.style.visibility = "visible";
                showdivEle.style.position = "fixed";
                showdivEle.style.top = data1[i].y1 + "px";
                showdivEle.style.left = data1[i].x1 + "px";
                showdivEle.style.height = data1[i].height + "px";
                showdivEle.style.width = data1[i].width + "px";
                showdivEle.style.border = "2px solid " + "Crimson";
                showdivEle.style.zIndex = "2147483647";
                showdivEle.title = data1[i].content;
                toShow.appendChild(showdivEle);
            }
        }
    }
    else {
        for (let i = 0; i < data2.length; i++) {
            if (data2[i].match == false) {
                let showdivEle = document.createElement("div");
                showdivEle.style.visibility = "visible";
                showdivEle.style.position = "fixed";
                showdivEle.style.top = window.scrollY + data2[i].y1 - bodyTop + "px";
                showdivEle.style.left = window.scrollX + data2[i].x1 - bodyLeft + "px";
                showdivEle.style.height = data2[i].height + "px";
                showdivEle.style.width = data2[i].width + "px";
                showdivEle.style.border = "2px solid " + "Crimson";
                showdivEle.style.zIndex = "2147483647";
                showdivEle.title = data2[i].content;
                toShow.appendChild(showdivEle);
            }
        }
    }

}

function cycleCircleMatch() {
    circleMatch();
    setTimeout(cycleCircleMatch, 700);
}

document.body.appendChild(toShow);

// if (ShowType == "M") {
//     cycleCircleMatch();
// }
// else if (ShowType == "U1") {
//     circleUnmatch(1);
// }
// else if (ShowType == "U2") {
//     circleUnmatch(2);
// }
let match_string = JSON.stringify({ MatchPair: match_pair, Avr_diff: [average_diffx, average_diffy], Unmatch: [unmatch1, unmatch2] });

return match_string;