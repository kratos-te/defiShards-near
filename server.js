const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const base64ToImage = require('base64-to-image');
const app = express();
app.use(cors());
app.use(express.static('./public'));

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fieldNameSize: 100,     // increase limits as per your requirement
        fieldSize: 4096 * 4096
    }
})

app.post('/api/upload', upload.array(), function (req, res) {
    const base64Data = req.body.base64Code;
    console.log('writing file...', base64Data);
    const imageName = `${Date.now()}`;
    // const imageName = toString(currentTime);
    // console.log('currentTime', currentTime);
    const base64Str = base64Data;
    const path = './public/logos/';
    console.log('imageName', imageName);
    console.log('path', path);
    console.log('newPath', path);
    const optionalObj = { 'fileName': imageName, 'type': 'png' };
    base64ToImage(base64Str, path, optionalObj);
    const newName = imageName + '.png';
    console.log('newName', newName);
    return res.json({ newName });
});

const server = app.listen(4000, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});