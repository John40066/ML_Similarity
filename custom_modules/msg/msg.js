const { exit } = require("process");

Info = (msg = "") => { console.info("[INFO]", msg) }
Warning = (msg = "") => { console.warn("[WARN]", msg) }
Err = (msg = "") => { console.error("[Error]", msg) }
Err_Exit = (err, msg = "") => {
    if (err) {
        console.log(err.stack);
        if (msg != "") console.error("[Error]", msg);
        exit(1);
    }
}

module.exports = {
    Info, Warning, Err, Err_Exit
};