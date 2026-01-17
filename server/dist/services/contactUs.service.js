import { ObjectId } from "@fastify/mongodb";
import { ContactUsModel } from "../schema/contactUs.js";
import { ReplyError } from "../interfaces/ReplyError.js";
import EmailServiceFactory from "./EmailService.js";
import { generateContactInquiryEmail } from "../util/emailTemplate.js";
import dotenv from 'dotenv';
dotenv.config();
export class ContactUsService {
    constructor(dbCollection, logger) {
        this.dbModel = ContactUsModel;
        /**
         * Update contact us service
         * @param request
         * @param reply
         */
        this.addContact = async (request, reply) => {
            try {
                const { company, firstName, subject, lastName, email, phone, message, } = request.body;
                //Validate the request 
                const contactUs = new this.dbModel({
                    company,
                    firstName,
                    lastName,
                    subject,
                    email,
                    phone,
                    message,
                });
                await contactUs.validate();
                // Save the user contact response
                const newContactUs = await this.dbCollection.insertOne(contactUs);
                const getNewContactUs = await this.dbCollection.findOne({ _id: newContactUs?.insertedId });
                if (!getNewContactUs) {
                    this.logger.error('Failed to save contact us inquiry');
                    throw new ReplyError("Failed to save contact us inquiry", 400);
                }
                try {
                    await this.sendEmail(`${firstName} ${lastName}`, subject, email, message, company, phone);
                }
                catch (error) {
                    request.log.error(error?.message ?? error.text ?? error);
                }
                return reply.code(201).send({ data: getNewContactUs, success: newContactUs.acknowledged });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.deleteContact = async (request, reply) => {
            try {
                const { id } = request.params;
                const contactUsToDelete = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
                if (contactUsToDelete.deletedCount != 1) {
                    this.logger.error('"Contact us inquiry not found');
                    throw new ReplyError("Contact us inquiry not found", 404);
                }
                return reply.status(200).send({ data: "Deleted successfuly", success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.getContactInquiryById = async (request, reply) => {
            try {
                const { id } = request.params;
                const contactUsInquiry = await this.dbCollection.findOne({ _id: new ObjectId(id) });
                if (!contactUsInquiry) {
                    this.logger.error('"Contact us inquiry not found');
                    throw new ReplyError("Contact us inquiry not found", 404);
                }
                return reply.status(200).send({ data: contactUsInquiry, success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.getAllContact = async (request, reply) => {
            try {
                const allContactUsInquiries = await this.dbCollection.find({}).sort({ createdAt: -1 }).toArray();
                return reply.status(200).send({ data: allContactUsInquiries, success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        /**
         * Reply to a contact us inquiry
         * @param request
         * @param reply
         */
        this.replyToInquiry = async (request, reply) => {
            try {
                const { id } = request.params;
                const { subject, message, html } = request.body;
                if (!subject || !message) {
                    throw new ReplyError("Subject and message are required", 400);
                }
                // Get the inquiry
                const inquiry = await this.dbCollection.findOne({ _id: new ObjectId(id) });
                if (!inquiry) {
                    throw new ReplyError("Inquiry not found", 404);
                }
                // Convert message to HTML if not provided
                const htmlContent = html || message.replace(/\n/g, '<br>');
                // Send reply email
                const result = await this.emailService.sendEmail({
                    to: inquiry.email,
                    subject: `Re: ${inquiry.subject} - ${subject}`,
                    html: htmlContent,
                    text: message,
                    from: 'info@dkmedia305.com'
                }, 'inquiry_reply');
                if (!result.success) {
                    throw new Error(result.error || "Failed to send reply email");
                }
                return reply.status(200).send({
                    success: true,
                    data: "Reply sent successfully"
                });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.sendEmail = async (senderName, subject, senderEmail, senderMessage, senderCompany, senderPhone) => {
            try {
                // Use the luxury email template matching DKMedia aesthetic
                const htmlContent = generateContactInquiryEmail({
                    senderName,
                    senderEmail,
                    subject,
                    message: senderMessage,
                    company: senderCompany,
                    phone: senderPhone,
                    timestamp: new Date()
                });
                // Generate plain text version for email clients that don't support HTML
                const textContent = `
New Contact Us Inquiry

Name: ${senderName}
Email: ${senderEmail}
${senderCompany ? `Company: ${senderCompany}` : ''}
${senderPhone ? `Phone: ${senderPhone}` : ''}
Subject: ${subject}
Message: ${senderMessage}
Time: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}

---
DKMedia305 - 𝐆𝐨𝐨𝐝 𝐦𝐮𝐬𝐢𝐜. 𝐆𝐫𝐞𝐚𝐭 𝐩𝐞𝐨𝐩𝐥𝐞. 𝐔𝐧𝐟𝐨𝐫𝐠𝐞𝐭𝐭𝐚𝐛𝐥𝐞 𝐧𝐢𝐠𝐡𝐭𝐬. ✨
© ${new Date().getFullYear()} DKMedia305. All rights reserved.
      `.trim();
                // Send email to two recipients (matching original EmailJS behavior)
                const recipients = [
                    process.env.GOOGLE_SERVICE_EMAIL || process.env.ADMIN_EMAIL || '',
                    process.env.SECONDARY_EMAIL || ''
                ].filter(Boolean);
                if (recipients.length === 0) {
                    throw new Error('No recipient email addresses configured');
                }
                // Send to each recipient
                const emailPromises = recipients.map(recipient => this.emailService.sendEmail({
                    to: recipient,
                    subject: `Contact Us: ${subject}`,
                    html: htmlContent,
                    text: textContent
                }, 'contact_us'));
                const results = await Promise.allSettled(emailPromises);
                // Check if any email failed
                const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
                if (failures.length > 0) {
                    this.logger?.error(`Some contact us emails failed to send - failures: ${failures.length}`);
                }
            }
            catch (error) {
                this.logger?.error('Error sending contact us email', error);
                throw new Error(error?.message ?? error.text ?? error);
            }
        };
        this.dbCollection = dbCollection;
        this.logger = logger;
        if (!dbCollection) {
            logger.error("Failed to load contact us collection");
            return;
        }
        // Initialize EmailService with Gmail
        this.emailService = EmailServiceFactory(logger);
    }
}
