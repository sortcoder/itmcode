import path from 'path';
import fs from 'fs';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_APIKEY);

class Mail {

    // Method to get html from the mail template
    static async getHtml(text, name) {
        const templateDir = path.join(
            __dirname,
            '../../',
            'src/templates',
            'Mail.html'
        );
        if (fs.existsSync(templateDir)) {
            // read file content
            let html = await fs.readFileSync(templateDir, { encoding: 'utf-8' });
            // Replace dynamic content (name and url) in the mail template
            html = html.replace(/{{ name }}/, name);
            html = html.replace(/{{ text }}/, text);
            return html;
        }
    }
    /**
     * send email using template
     * @param {string} to - Email
     * @param {string} subject  - Subject
     * @param text
     * @param name
     */
    async send(to, subject, text, name) {
        try {
            // Get HTML
            const html = await Mail.getHtml(text, name);
            // Generate msg to send on mail
            const msg = {
                to: to,
                from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_SMTP_USERNAME}>`, // Use the email address or domain you verified above
                subject: subject,
                html: html,
            };
            // Returns mail response
            return await sgMail.send(msg);
        } catch (err) {
            console.log("maileroor",err)
            return err;
        }
    }
}

export default new Mail();
