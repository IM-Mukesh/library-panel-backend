// src/services/email.service.ts
import AWS from "aws-sdk";

AWS.config.update({ region: process.env.AWS_REGION! });

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

export const sendOtpEmail = async (to: string, otp: string) => {
  const params = {
    Source: process.env.SES_EMAIL!,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: "Your OTP Code" },
      Body: {
        Text: { Data: `Your OTP is: ${otp}.\nIt expires in 5 minutes.` },
      },
    },
  };

  await ses.sendEmail(params).promise();
};
