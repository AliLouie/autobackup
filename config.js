// Database info

const secretKey = 'YOURKEY'; // Set your secret key here This Key is very important, complexity is better than simple key.

module.exports = {

  BackUpConfig: { // Auto Backup database config
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pgrpv4', // Your Database Name
  },
  
   FtpConfig: {
    host: 'ftp.example.com',
    user: 'ftpuser',
    password: 'ftppassword',
  },
  ftpupload: false, // Set to true to enable FTP upload, false to disable

  secretKeyMiddleware: (req, res, next) => {
    const { key } = req.query;

    if (key === secretKey) {
      // If the key is valid, proceed
      next();
    } else {
      // If the key is invalid, send an unauthorized error response
      res.status(401).json({ error: 'Unauthorized' });
    }
  },

};