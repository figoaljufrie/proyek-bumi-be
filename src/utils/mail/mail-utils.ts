import sgMail from "@sendgrid/mail";
import fs from "fs/promises";
import Handlebars from "handlebars";
import path from "path";

export class MailUtility {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  sendEmail = async (
    to: string,
    subject: string,
    templateName: string,
    context: any
  ) => {
    const templateDir = path.resolve(__dirname, "templates");
    const templatePath = path.join(templateDir, `${templateName}.hbs`);
    const templateSource = await fs.readFile(templatePath, "utf-8");
    const compiledTemplate = Handlebars.compile(templateSource);
    const html = compiledTemplate(context);

    const msg = {
      from: process.env.SENDGRID_SEND_EMAIL!,
      to,
      subject,
      html,
      replyTo: "figoaldjoeffri@gmail.com",
    };

    try {
      await Promise.race([
        sgMail.send(msg),
        new Promise((_resolve, reject) =>
          setTimeout(() => reject(new Error("Email send timeout")))
        ),
      ]);
      console.log("Email successfully sent to", to);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };
}
