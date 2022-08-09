const { PNG } = require("pngjs");
const Jimp = require('jimp');

function Crop(img, x, y, width, height) {
    let rect = new cv.Rect(x, y, width, height)
    let dst = img.roi(rect).clone()
    return dst
}

async function Base642Mat(base64) {
    let imgBuf = Buffer.from(base64, 'base64')
    let jimpSrc = await Jimp.read(imgBuf)
    let src = cv.matFromImageData(jimpSrc.bitmap)
    return src
}

function Mat2Base64(mat) {
    /*
      # Function: Convert Mat of OpenCv to 
      # Parameter:
          mat: cv.Mat(), Image to be converted.
      # Return: String, Image in base64.
    */
    const size = mat.size()
    let png = new PNG({ width: size.width, height: size.height })
    png.data.set(mat.data)
    const buffer = PNG.sync.write(png)
    return 'data:image/png;base64,' + buffer.toString('base64')
}

module.exports = {
    Crop, Mat2Base64, Base642Mat
};