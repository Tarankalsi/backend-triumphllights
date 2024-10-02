
import aws, { SendEmailCommand, SESClient } from "@aws-sdk/client-ses"
import { ses } from "../awsConfig"


type sendEmailProp = {
    to: string,
    subject: string,
    message?: string,
    html: string
}

export const sendEmail = async ({ to, subject, message, html }: sendEmailProp) => {

    const sourceEmail = process.env.SENDER_EMAIL;
    if (!sourceEmail) {
        throw new Error('Source email address is not defined in environment variables.');
    }


    const params = {
        Source: sourceEmail,// Replace with your verified domain email
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8',
            },
            Body: {
                Text: {
                    Data: message,
                    Charset: 'UTF-8',
                },
                Html: {
                    Data: html,
                    Charset: 'UTF-8',
                },
            },

        },
    }

    try {
        const sendEmailCommand = new SendEmailCommand(params)
        const result = await ses.send(sendEmailCommand)
        return result
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

import {TransactionalEmailsApi , TransactionalEmailsApiApiKeys} from '@getbrevo/brevo';

const brevoClient = new TransactionalEmailsApi();
brevoClient.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export const sendEmailBrevo = async ({ to, subject, message, html }: sendEmailProp) => {
    const sourceEmail = process.env.SENDER_EMAIL;
    if (!sourceEmail) {
        throw new Error('Source email address is not defined in environment variables.');
    }

    try {
        const sendSmtpEmail = {
          to: [{ email: to }],
          sender: { email: sourceEmail , name: 'Triumph Lights' },
          subject: subject,
          htmlContent: html,
        };
    
        // Send the email
        const response = await brevoClient.sendTransacEmail(sendSmtpEmail);

      } catch (error) {
        console.error('Error sending test email:', error);
        throw new Error('Email sending failed');
      }
    
}




