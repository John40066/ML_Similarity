const Color = "Orange" // set Rectangle Color
// define global variable
var toShow = document.createElement("div")
var bodyStyle = window.getComputedStyle(document.body)
var bodyTop = bodyStyle.marginTop.split("px")[0] + bodyStyle.paddingTop.split("px")[0]
var bodyLeft = bodyStyle.marginLeft.split("px")[0] + bodyStyle.paddingLeft.split("px")[0]
var elem = document.querySelectorAll("body *") // All element in body
var inViewportElem = [] // 放入在 window 大小內的 element
var validnodes = [] // 從 inViewportElem 篩出看的見的

function computeFrameOffset(win, dims, limit) {
    // initialize our result variable
    if (typeof dims === "undefined")
        dims = { top: 0, left: 0, bottom: 0, right: 0 };
    // find our <iframe> tag within our parent window
    let frames = win.parent.document.getElementsByTagName("iframe");
    // if has elements
    for (let i = 0, len = frames.length; i < len; i++) {
        if (frames[i].contentWindow == win) {
            let rect = frames[i].getBoundingClientRect();
            let style = window.getComputedStyle(frames[i])
            // 這裡做法好神奇 see: 
            // https://www.javascripttutorial.net/javascript-dom/javascript-width-height/#:~:text=To%20get%20the%20element%E2%80%99s%20width%20and%20height%20that,let%20height%20%3D%20box.offsetHeight%3B%20Code%20language%3A%20JavaScript%20%28javascript%29
            let borderTop = parseInt(style.borderTopWidth) || 0;
            let borderLeft = parseInt(style.borderLeftWidth) || 0;
            dims.left += (rect.left + borderTop);
            dims.top += (rect.top + borderLeft);
            if (win !== top) computeFrameOffset(win.parent, dims, limit); // if current window is not top
            dims.bottom = dims.top + rect.height;
            dims.right = dims.left + rect.width;
            if (typeof limit === "undefined") limit = { top: dims.top, left: dims.left, bottom: dims.top + rect.height, right: dims.left + rect.width };
            else {
                limit.top = Math.max(limit.top, dims.top)
                limit.right = Math.min(limit.right, dims.right)
                limit.left = Math.max(limit.left, dims.left)
                limit.bottom = Math.min(limit.bottom, dims.bottom)
            }
            break;
        }
    }
    return { offset: dims, limit: limit }
}

// get offset relative to the topmost viewport, return whether element is in viewport or not
function inViewport(node) {
    if (node.parentNode.ownerDocument != document) { // iframe
        let owner = node.parentNode.ownerDocument;
        let ownerWindow = owner.defaultView || owner.parentWindow;
        let frameBoundsOffset = computeFrameOffset(ownerWindow).offset;
        let range = document.createRange();
        range.selectNode(node);
        let rect = range.getBoundingClientRect();
        let relativeTop = rect.top + frameBoundsOffset.top;
        let relativeLeft = rect.left + frameBoundsOffset.left;
        if (rect.width <= 1 || rect.height <= 1) return false;
        if (relativeLeft + rect.width >= window.innerWidth || relativeTop + rect.height >= window.innerHeight) return false;
    }
    else { // not iframe
        let range = document.createRange();
        range.selectNode(node);
        let rect = range.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) return false;
        if (rect.left >= window.innerWidth || rect.top >= window.innerHeight) return false; // 改成全部在外面才是false
    }
    return true;
}

function VisibleLine(node, rects_length) { // 計算文字 visible 的行數
    let rects_line = rects_length;
    let sty = node;
    // Find "Element" type.
    while (sty.nodeName == "#text") sty = sty.parentNode;
    sty = window.getComputedStyle(sty);
    // get "..." line
    if (sty.display == "-webkit-box")
        rects_line = Math.min(Number(sty.webkitLineClamp), rects_line);
    else if (sty.textOverflow == "ellipsis")
        rects_line = 1;
    else if (node.parentNode.nodeName == "SPAN")
        rects_line = VisibleLine(node.parentNode.parentNode, rects_line);
    return rects_line;
}

// get all inner frames
function getInnerFrame(win) {
    for (let i = 0; i < win.frames.length; i++) {
        // compute all innerFrame, get all elements in iframe
        try {
            let innerAll = win.frames[i].document.querySelectorAll("body *");
            for (let j = 0; j < innerAll.length; j++) {
                if (inViewport(innerAll[j]))
                    inViewportElem.push(innerAll[j]);
            }
            getInnerFrame(win.frames[i]);
        } catch (e) { } // Skip cross-origin frame
    }
}

// check visibility of element
function isVisible(element) {
    try {
        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.display == "none !important") return false;
        if (style.visibility !== "visible") return false;
        if (element.offsetParent == null) return false;
        if (style.opacity < 0.1) return false;
        if (element.offsetWidth + element.offsetHeight + element.getBoundingClientRect().height + element.getBoundingClientRect().width === 0) {
            return false;
        }
    } catch (e) { } // Skip if it is other type element.
    return true;
}

// 劃出方框(只要 rect 中包含 "x1"(left)、"y1"(top)、"width"、"height")
function drawRect(rect, color) {
    let showdivEle = document.createElement("div");
    showdivEle.style.visibility = "visible";
    showdivEle.style.top = rect.y1 + "px";
    showdivEle.style.left = rect.x1 + "px";
    showdivEle.style.position = "fixed";
    showdivEle.style.height = rect.height + "px";
    showdivEle.style.width = rect.width + "px";
    showdivEle.style.border = "1px solid " + color;
    showdivEle.style.zIndex = "2147483646";
    showdivEle.title = rect.content;
    toShow.appendChild(showdivEle);
}

//取得element的xpath
function getPathTo(element, content, parent) {
    if (element.id !== "") {
        try {
            return getPathTo(element.parentNode) + "/" + "id(\'" + element.id + "\')";

        } catch (e) {
            return "id(\'" + element.id + "\')";
        }
    }
    if (element === document.body)
        return element.tagName;
    let child_num = 0;
    let ix = 0;
    let siblings = element.parentNode.childNodes;
    if (parent == true) {
        for (let j = 0; j < element.childNodes.length; j++) {
            let range = document.createRange();
            range.selectNode(element.childNodes[j]);
            let child_content = range.toString();
            if (child_content == content) {
                child_num = j;
            }
        }
    }
    for (let i = 0; i < siblings.length; i++) {
        let sibling = siblings[i];
        if (sibling === element)
            return getPathTo(element.parentNode) + "/" + element.tagName + "[" + (ix + 1) + "]" + "/" + child_num;
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName)
            ix++;
    }
}

// get offset relative to the topmost viewport, return dimensions
function getRealDimension(node) {
    let dims = [];
    if (node.nodeName == "#text") {
        //有文字的但 height 與 width 都為1px => invisible,不記錄
        try {
            let style = window.getComputedStyle(node.parentNode);
            if (style.height == "1px" && style.width == "1px") return dims;
        } catch (e) { }
    }
    else if (node.nodeName == "INPUT") {
        node.placeholder = ""
        node.value = ""
    }
    let range = document.createRange();
    range.selectNode(node);
    let content = range.toString(); //記錄文字內容
    if (content == "") return dims;
    if (node.childNodes.length == 0) { // 只畫 leaf nodes，以免重複
        let rects = range.getClientRects();
        let rects_line = VisibleLine(node, rects.length);
        let inView = false;
        let limit = [];
        let n_tmp = node;
        let frameBoundsOffset
        if (node.parentNode.ownerDocument != document) { //判斷是否在iframe中
            let owner = node.parentNode.ownerDocument
            let frame_result = computeFrameOffset(owner.defaultView || owner.parentWindow)
            frameBoundsOffset = frame_result.offset
            limit.push(frame_result.limit)
        }
        else frameBoundsOffset = { left: 0, top: 0 } // 不在 iframe 裡面，所以不用位移
        while (n_tmp.nodeName != "HTML") { // 找 overflow 是 hidden 的
            n_tmp = n_tmp.parentNode
            let style_tmp = window.getComputedStyle(n_tmp)
            if (style_tmp.overflow == "hidden") {
                let pos = n_tmp.getBoundingClientRect()
                limit.push({ left: frameBoundsOffset.left + pos.x, top: frameBoundsOffset.top + pos.y, right: frameBoundsOffset.left + pos.x + pos.width, bottom: frameBoundsOffset.top + pos.y + pos.height })
            }
        }
        for (let i = 0; i < rects_line; i++) {
            let dimension = { x1: window.innerWidth, y1: window.innerHeight, x2: 0, y2: 0, width: 0, height: 0, match: false, content: content, group: -1, line_num: i, tag_name: "" };
            let relativeTop = rects[i].top + frameBoundsOffset.top;
            let relativeLeft = rects[i].left + frameBoundsOffset.left;
            let relativeBottom = rects[i].bottom + frameBoundsOffset.top;
            let relativeRight = rects[i].right + frameBoundsOffset.left;
            inView = true;
            dimension.x1 = Math.min(dimension.x1, relativeLeft);
            dimension.x2 = Math.max(dimension.x2, relativeRight);
            dimension.y1 = Math.min(dimension.y1, relativeTop);
            dimension.y2 = Math.max(dimension.y2, relativeBottom);
            for (let i = 0; i < limit.length; ++i) {
                dimension.x1 = Math.max(dimension.x1, limit[i].left);
                dimension.x2 = Math.min(dimension.x2, limit[i].right);
                dimension.y1 = Math.max(dimension.y1, limit[i].top);
                dimension.y2 = Math.min(dimension.y2, limit[i].bottom);
            }
            dimension.width = dimension.x2 - dimension.x1;
            dimension.height = dimension.y2 - dimension.y1;
            if (dimension.width <= 3 || dimension.height <= 3) continue // 太小了或是是負數
            if (node.nodeName == "#text") {
                dimension.tag_name = node.parentNode.nodeName;
                // dimension.xpath = getPathTo(node.parentNode, content, true);
            }
            else {
                dimension.tag_name = node.nodeName;
                // dimension.xpath = getPathTo(node, content, false);
            }
            dims.push(dimension);
            // drawRect(dimension, Color); // 畫方框
        }
    }
    return dims;
}

// get all rectangles, 將 validnodes 的 node 畫出 rectangle 並記錄其資訊
function getAllRectangles(nodes) {
    let allRects = [];
    for (let i = 0; i < nodes.length; i++) {
        //把每個 node 的 rectangle 畫出來並回傳 rectangle 的資訊
        let rects = getRealDimension(nodes[i]);
        for (let j = 0; j < rects.length; j++)
            allRects.push(rects[j]);
    }
    document.body.appendChild(toShow); // 將 Rectangle 加入 body 中顯示
    return allRects;
}

/*********************************
 * Main Function start from here *
 *********************************/

//只push在viewport內的element
for (let i = 0; i < elem.length; i++)
    if (inViewport(elem[i])) // if element is in viewport
        inViewportElem.push(elem[i]);

//push inner frame中 在viewport內的element
getInnerFrame(this.window);

// traverse all elements
for (let i = 0; i < inViewportElem.length; i++) {
    //若為視覺上看不見的element,continue
    /* Why toLowerCase() ? 是不是可以不用，然後大寫判斷 */
    if (inViewportElem[i].parentElement.tagName.toLowerCase() === "select" || inViewportElem[i].tagName.toLowerCase() === "script" || inViewportElem[i].tagName.toLowerCase() === "style")
        continue;
    if (!isVisible(inViewportElem[i])) continue; // 若為視覺上看不見的element
    for (let j = 0; j < inViewportElem[i].childNodes.length; j++) {
        let curNode = inViewportElem[i].childNodes[j];
        //若掉 space 與 \n 後為 ""，則 continue
        if (curNode.nodeName == "#text") {
            let str, allBlank = true;
            str = curNode.textContent;
            str = str.trim();
            str = str.split("\n");
            for (let i = 0; i < str.length; ++i)
                if (str[i] != "") allBlank = false;
            if (allBlank) continue;
        }
        if (!isVisible(curNode)) continue;
        //其餘的 push 進 validnodes
        validnodes.push(curNode);
    }
}

let rects = getAllRectangles(validnodes); //將 valid 的 node 畫出 rectangle 並記錄其資訊
let rects_string = JSON.stringify(rects); //將記錄完的rectangle資訊以json格式印出

/*
Rectangle 的資訊:
x1, y1, x2, y2 -> 四個頂點
width, height -> 寬,高
match -> 用於 Compare.js 表示是否找到對應 Element 預設 false
content -> 文字內容
tag_name -> tag 類型(a、div、p...)
line_num -> 第幾行
// xpath -> DOM tree 路徑 (先不用)
*/

// 回傳所有 Rectangle 的資訊。
return rects_string;

