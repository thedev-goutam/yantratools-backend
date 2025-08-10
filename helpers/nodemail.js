const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "yantratools@gmail.com", 
        pass: "vayuiqgdjrhrvavf"

    }

//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: 'admin@yantratools.com',
//     pass: 'Yantra@gmail1*', // leave empty if no password
//   },
})

module.exports = transporter