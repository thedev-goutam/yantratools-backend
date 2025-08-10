const { exec } = require('child_process');
const path = require('path');

// MongoDB connection details
const username = 'yantra-user';
const password = 'YantraDb%23123';
const host = '15.206.185.95';
const port = 27016;
const database = 'yantra-tools';

// Backup output folder
const backupFolder = path.resolve(__dirname, 'backup');

// Compose the mongodump command
const command = `mongodump --uri="mongodb://${username}:${password}@${host}:${port}/${database}?authSource=yourDatabase" --out="${backupFolder}"`;

// Run the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup failed: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Backup error output: ${stderr}`);
    return;
  }
  console.log('Backup completed successfully!');
  console.log(stdout);
});
