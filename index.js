import fs  from 'fs';
import Jimp  from "jimp";
import { Canvas, createCanvas, loadImage, ImageData } from 'canvas';
import pkg from 'ag-psd';
const { writePsdBuffer } = pkg;
/*
    DEFINE CONFIG VARS
*/
const SOURCE_DIR = '/Users/mygoodgomez/Downloads/samysphotolab_38108166_2024-08-06_1625/';
const OUTPUT_PSD_DIR_PATH = SOURCE_DIR + 'output_psds';

const RESIZE_WIDTH = 3840; // pixels for a 4k video
const CROP_SIZE = {
    width: 1790, // not as wide as it could be b/c the right imgs aren't as wide as the left
    height: 2375
};
const IMG_LOCS = {
    left: { x: 0, y: 169 },
    right: { x: CROP_SIZE.width + 255, y: 169 }
};


/*
    START SCRIPT
*/

// create an output img & psd directories if it doesn't exist
if (!fs.existsSync(OUTPUT_PSD_DIR_PATH)){
    fs.mkdirSync(OUTPUT_PSD_DIR_PATH);
}

// go through all of the files in the source directory and split them up
const imageGroupsForPS = [];
const imageDataForPS = {};
var totalNumImgsToProcess = 0;
var groupIndex = 0;
fs.readdirSync(SOURCE_DIR).forEach(fileName => {
    if (fileName.indexOf('tif') === -1) return;
    totalNumImgsToProcess++;

    const leftImgFileName = fileName.replace('.tif', '-left.jpg');
    const rightImgFileName = fileName.replace('.tif', '-right.jpg');
    
    if(!imageGroupsForPS[groupIndex]) {
        imageGroupsForPS[groupIndex] = [leftImgFileName, rightImgFileName];
    } else {
        imageGroupsForPS[groupIndex].push(leftImgFileName, rightImgFileName);

        groupIndex++;
    }

    const imgFullPath = SOURCE_DIR + fileName;
    Jimp.read(imgFullPath, async (err, photo) => {
        if (err) throw err;
    
        const fileName = imgFullPath.replace(SOURCE_DIR, '');
        photo.resize(RESIZE_WIDTH, Jimp.AUTO);
    
        var leftImg = photo.clone();
        var rightImg = photo.clone();
    
        leftImg.crop(IMG_LOCS.left.x, IMG_LOCS.left.y, CROP_SIZE.width, CROP_SIZE.height);
        rightImg.crop(IMG_LOCS.right.x, IMG_LOCS.right.y, CROP_SIZE.width, CROP_SIZE.height);
    
        leftImg.quality(90);
        rightImg.quality(90);

        imageDataForPS[fileName.replace('.tif', '-left.jpg')] = leftImg;
        imageDataForPS[fileName.replace('.tif', '-right.jpg')] = rightImg;
        totalNumImgsToProcess--;

        if(totalNumImgsToProcess === 0) {
            await makeAllPhotoshopFiles();
        }
    });        
});

async function makeAllPhotoshopFiles() {
    for(var i = 0; i < imageGroupsForPS.length; i++) {
        try {
            const groupToProcess = imageGroupsForPS[i];
        
            const img1 = new ImageData(Uint8ClampedArray.from(imageDataForPS[groupToProcess[0]].bitmap.data), CROP_SIZE.width, CROP_SIZE.height);
            const canvas1 = createCanvas(CROP_SIZE.width, CROP_SIZE.height);
            const ctx1 = canvas1.getContext('2d');
            ctx1.putImageData(img1, 0, 0);
    
            const img2 = new ImageData(Uint8ClampedArray.from(imageDataForPS[groupToProcess[1]].bitmap.data), CROP_SIZE.width, CROP_SIZE.height);
            const canvas2 = createCanvas(CROP_SIZE.width, CROP_SIZE.height);
            const ctx2 = canvas2.getContext('2d');
            ctx2.putImageData(img2, 0, 0);
    
            const img3 = new ImageData(Uint8ClampedArray.from(imageDataForPS[groupToProcess[2]].bitmap.data), CROP_SIZE.width, CROP_SIZE.height);
            const canvas3 = createCanvas(CROP_SIZE.width, CROP_SIZE.height);
            const ctx3 = canvas3.getContext('2d');
            ctx3.putImageData(img3, 0, 0);
    
            const img4 = new ImageData(Uint8ClampedArray.from(imageDataForPS[groupToProcess[3]].bitmap.data), CROP_SIZE.width, CROP_SIZE.height);
            const canvas4 = createCanvas(CROP_SIZE.width, CROP_SIZE.height);
            const ctx4 = canvas4.getContext('2d');
            ctx4.putImageData(img4, 0, 0);
    
            const children = [
                { name: 'layer 1', canvas: canvas1 },
                { name: 'layer 2', canvas: canvas2 },
                { name: 'layer 3', canvas: canvas3 },
                { name: 'layer 4', canvas: canvas4 }
            ];
              
            const psd = { 
                width: CROP_SIZE.width, 
                height: CROP_SIZE.height,
            };
            const canvas = new Canvas(CROP_SIZE.width, CROP_SIZE.height);
            const newPsd = { ...psd, children, canvas: canvas };
            
            const buffer = writePsdBuffer(newPsd);
            fs.writeFileSync(OUTPUT_PSD_DIR_PATH + '/' + groupToProcess[0].replace('.jpg', '.psd'), buffer);    
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}