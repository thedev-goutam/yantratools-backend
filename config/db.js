const mysql = require('mysql2');

    // MySQL database connection configuration
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',  // Your MySQL username
        password: '',  // Your MySQL password
        database: 'yantra_new_old'  // Your MySQL database name
    });
    
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return;
        }
        console.log('Database connected');
    });

module.exports = db;