const fs = require('fs');
var Jimp = require("jimp");

const SOURCE_DIR = '/Users/mygoodgomez/Downloads/samysphotolab_38108166_2024-08-06_1625/';
const OUTPUT_DIR_PATH = SOURCE_DIR + 'output_imgs';

const RESIZE_WIDTH = 3840; // pixels for a 4k video
const CROP_SIZE = {
    width: 1790, // not as wide as it could be b/c the right imgs aren't as wide as the left
    height: 2375
};
const IMG_LOCS = {
    left: { x: 0, y: 169 },
    right: { x: CROP_SIZE.width + 255, y: 169 }
};



if (!fs.existsSync(OUTPUT_DIR_PATH)){
    fs.mkdirSync(OUTPUT_DIR_PATH);
}

fs.readdirSync(SOURCE_DIR).forEach(fileName => {
    if (fileName.indexOf('tif') === -1) return;

    const imgFullPath = SOURCE_DIR + fileName;
    Jimp.read(imgFullPath, (err, photo) => {
        if (err) throw err;
    
        photo.resize(RESIZE_WIDTH, Jimp.AUTO);
    
        var leftImg = photo.clone();
        var rightImg = photo.clone();
    
        leftImg.crop(IMG_LOCS.left.x, IMG_LOCS.left.y, CROP_SIZE.width, CROP_SIZE.height);
        rightImg.crop(IMG_LOCS.right.x, IMG_LOCS.right.y, CROP_SIZE.width, CROP_SIZE.height);
    
        leftImg.quality(90);
        rightImg.quality(90);

        leftImg.write(OUTPUT_DIR_PATH + '/' + fileName.replace('.tif', '-1.jpg'));
        rightImg.write(OUTPUT_DIR_PATH + '/' + fileName.replace('.tif', '-2.jpg'));
    });        
});
    

