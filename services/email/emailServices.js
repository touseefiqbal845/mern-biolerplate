
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email server error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});


const loadTemplate = (templateName, context) => {
  const filePath = path.join(__dirname, "./templates", `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, "utf8");
  const template = handlebars.compile(source);
  return template(context);
};

exports.sendMail = async ({ to, subject, templateName, context }) => {
  const html = loadTemplate(templateName, context);
  const info = await transporter.sendMail({
    from: `"Astra Protocol" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  return info;
};
