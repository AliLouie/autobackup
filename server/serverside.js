const express = require('express');
const mysql = require('mysql');
const { BackUpConfig, secretKeyMiddleware, FtpConfig, ftpupload } = require("./config");

const ftp = require('basic-ftp');
const mysqldump = require('mysqldump');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const resourceName = GetCurrentResourceName();
const resourcePath = GetResourcePath(resourceName);

const app = express();
const port = 3000;


const dbConnection = mysql.createConnection(BackUpConfig);


dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

app.use(secretKeyMiddleware);


//---- BackUp System:

// Backup settings
const backupFileName = 'backup.sql';
const backupFilePath = path.join(resourcePath, backupFileName);

cron.schedule('*/30 * * * *', async () => {
  try {
    console.log('Creating a backup...');
    await mysqldump({
      connection: BackUpConfig,
      dumpToFile: backupFilePath,
    });
    console.log('Backup created successfully.');

    if (ftpupload) {
      await uploadToFTP(backupFilePath);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

console.log('Backup script is running...');

async function uploadToFTP(localFilePath) {
  const client = new ftp.Client();

  try {
    console.log('Connecting to FTP server...');
    await client.access({
      host: FtpConfig.host,
      user: FtpConfig.user,
      password: FtpConfig.password,
    });

    console.log('Uploading to FTP...');
    await client.uploadFrom(localFilePath, `/${backupFileName}`);
    console.log('File uploaded to FTP successfully.');
  } catch (error) {
    console.error('FTP Upload Error:', error);
  } finally {
    client.close();
    console.log('FTP connection closed.');
  }
}

// Express route to serve the backup file: http://IP:3000/download?key=YOURKEY
app.get('/download', (req, res) => {
  const file = backupFilePath;

  res.download(file, backupFileName, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading file');
    }
  });
});

//---------


app.listen(port, () => {
  console.log(`AutoBackup loaded, Your Port: ${port}`);
});
