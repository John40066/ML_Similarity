function factorial(n) {
    let total = 1;
    for (let i = 1; i <= n; i++) {
        total = total * i;
    }
    return total;
}

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
        console.log("Warning: New_Order In TextCompare.")
        console.log("Warning:", order, " Can not generate new order")
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

async function TextCompare(data1, data2) {
    let match_pair = []; // 有 Match 的資料 {d1, d2}
    let average_diffx = 0, average_diffy = 0; // x, y 平均位移
    let group_num = 0;

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
    // Prevent 誤差過大
    average_diffx = Math.round(average_diffx)
    average_diffy = Math.round(average_diffy)
    average_diffx = Math.min(average_diffx, 100)
    average_diffy = Math.min(average_diffy, 100)
    average_diffx = Math.max(average_diffx, -100)
    average_diffy = Math.max(average_diffy, -100)

    for (let i = 0; i < match_pair.length; i++) {
        if (match_pair[i].first.length > 1 || match_pair[i].second.length > 1) {
            let result = []
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
            let min_diff = Number.MAX_VALUE, max_match_count = 0;
            if (R_len <= C_len) {
                while (compose_num--) {
                    let total = 0, count = 0;
                    for (let m = 0; m < R_len; m++) {
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
                    if (compose_num != 0) order = New_order(order);
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
                while (compose_num--) {
                    let total = 0, count = 0;
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

    let match_string = JSON.stringify({ MatchPair: match_pair, Avr_diff: [average_diffx, average_diffy], Unmatch: [unmatch1, unmatch2] });

    return match_string;
}

module.exports = {
    TextCompare
}