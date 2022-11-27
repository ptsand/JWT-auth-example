import nodemailer from "nodemailer";

let _transporter;

// lazy load transporter, use env vars
const transporter = ()=>{
    if (_transporter) {
        return _transporter;
    } else {
        _transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 25,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
        });
        return _transporter;
    }
};

export const sendConfirmationMail = (to, code)=>{
    const mail = {
        from: "authbot@localhost",
        to,
        subject: "email confirmation code",
        text: `Thank you for signing up. Please confirm you email by visiting: 
                http://localhost:5173/profile/confirm-email/${code}`,
    };
    return transporter().sendMail(mail);
};