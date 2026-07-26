import { transporter } from "../config/email_config.js"
import { Verification_Email_Template } from "../utils/email_template.js";

export const sendVerificationCode = async (email, verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: '"Auth App Team" <mmckhine5@gmail.com>',
            to: email,
            subject: "Verify Your Email",
            text: "Verify Your Email",
            html: Verification_Email_Template.replace("{verificationCode}",verificationCode),
        });
        console.log("Email sent successfully!", response);
    } catch (e) {
        console.log("Email Error:", e);
    }
}