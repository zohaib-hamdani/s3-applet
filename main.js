require('dotenv').config();
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('upload-file', async (event, filePath) => {
    if (!filePath) {
        event.reply('upload-response', 'No file path provided.');
        return;
    }

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });

    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
    };

    try {
        await s3.upload(params).promise();
        event.reply('upload-response', 'File uploaded successfully!');
    } catch (error) {
        console.error('Error uploading file:', error);
        event.reply('upload-response', `Error uploading file: ${error.message}`);
    }
});
