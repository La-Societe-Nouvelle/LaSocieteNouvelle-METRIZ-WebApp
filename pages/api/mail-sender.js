import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.FORM_SERVER_SMTP,
    port: process.env.FORM_SERVER_PORT,
    auth: {
        user: process.env.FORM_SENDER_MAIL,
        pass: process.env.FORM_SENDER_PASSWD
    }
})

export default async (req,res) => 
{
    const {objetMail, messageMail} = req.body;

    if (objetMail==="" || messageMail==="") {
        res.status(403).send("");
        return
    }

    const mailerRes = await mailer(req.body);
    res.send(mailerRes);
}

const mailer = ({objetMail,messageMail,recipientMail,attachments}) => 
{
    const mail = {
        from: "La Société Nouvelle <sender@lasocietenouvelle.org>",
        to: recipientMail,
        subject: objetMail,
        text: messageMail,
        attachments: attachments || []
    }

    return new Promise((resolve,reject) => {transporter.sendMail(mail, (error,info) => error ? reject(error) : resolve(info))})
}
