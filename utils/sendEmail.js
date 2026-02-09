const nodemailer = require('nodemailer');

const sendTicketEmail = async (email, details) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS

        }
    });

    const mailOptions = {
       from: `"HouseFull" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Ticket Confirmed: ${details.movieName}`, // Check ithe details. aselach pahije
        html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #e62e2e;">Booking Confirmed! 🎟️</h2>
                <p>Movie: <strong>${details.movieName}</strong></p> 
                <p>Show: <strong>${details.showTime}</strong></p>
                <p>Seats: <strong>${details.seats.join(', ')}</strong></p>
                <p>Amount: <strong>₹${details.totalAmount}</strong></p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendTicketEmail;