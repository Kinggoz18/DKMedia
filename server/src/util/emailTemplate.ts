/**
 * Email Template Utility for DKMedia
 * Creates luxury-themed HTML emails matching the website's aesthetic
 */

export interface EmailTemplateOptions {
  title?: string;
  heading?: string;
  content: string;
  footerText?: string;
  includeUnsubscribe?: boolean;
  unsubscribeUrl?: string;
}

/**
 * Generate a luxury-themed HTML email template matching DKMedia aesthetic
 * Uses table-based layout and inline CSS for maximum email client compatibility
 */
export function generateEmailTemplate(options: EmailTemplateOptions): string {
  const {
    title = 'DKMedia305',
    heading,
    content,
    footerText = '𝐆𝐨𝐨𝐝 𝐦𝐮𝐬𝐢𝐜. 𝐆𝐫𝐞𝐚𝐭 𝐩𝐞𝐨𝐩𝐥𝐞. 𝐔𝐧𝐟𝐨𝐫𝐠𝐞𝐭𝐭𝐚𝐛𝐥𝐞 𝐧𝐢𝐠𝐡𝐭𝐬. ✨',
    includeUnsubscribe = false,
    unsubscribeUrl
  } = options;

  // Convert content to email-friendly HTML if it's plain text
  const formattedContent = content.includes('<') ? content : content.replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Georgia, serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, 'Times New Roman', serif;">
  <!-- Main Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Email Content Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #050505; border: 1px solid rgba(201, 169, 98, 0.1);">
          
          <!-- Header Section -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid rgba(201, 169, 98, 0.1);">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; font-weight: 300; letter-spacing: 2px; color: #c9a962; text-transform: uppercase;">DKMedia305</h1>
            </td>
          </tr>

          <!-- Heading (if provided) -->
          ${heading ? `
          <tr>
            <td style="padding: 30px 40px 20px 40px; text-align: center;">
              <h2 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 400; letter-spacing: 1px; color: #c9a962; line-height: 1.4;">${heading}</h2>
            </td>
          </tr>
          ` : ''}

          <!-- Content Section -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 16px; line-height: 1.8; color: #a8a8a8; letter-spacing: 0.5px;">
                ${formattedContent}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="height: 1px; background: linear-gradient(to right, transparent, rgba(201, 169, 98, 0.2), transparent);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-family: 'Times New Roman', Georgia, serif; font-size: 13px; color: rgba(168, 168, 168, 0.7); letter-spacing: 1px; text-transform: uppercase;">
                ${footerText}
              </p>
              ${includeUnsubscribe && unsubscribeUrl ? `
              <p style="margin: 10px 0 0 0; font-family: 'Times New Roman', Georgia, serif; font-size: 11px; color: rgba(168, 168, 168, 0.5);">
                <a href="${unsubscribeUrl}" style="color: rgba(201, 169, 98, 0.7); text-decoration: underline;">Unsubscribe</a>
              </p>
              ` : ''}
              <p style="margin: 20px 0 0 0; font-family: 'Times New Roman', Georgia, serif; font-size: 11px; color: rgba(168, 168, 168, 0.4);">
                © ${new Date().getFullYear()} DKMedia305. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate a formatted contact inquiry email
 */
export function generateContactInquiryEmail(data: {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  company?: string;
  phone?: string;
  timestamp?: Date;
}): string {
  const timestamp = data.timestamp || new Date();
  const formattedTime = timestamp.toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  const detailsHTML = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(168, 168, 168, 0.1);">
          <strong style="color: #c9a962; font-weight: 600; display: inline-block; min-width: 100px;">Name:</strong>
          <span style="color: #a8a8a8;">${escapeHtml(data.senderName)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(168, 168, 168, 0.1);">
          <strong style="color: #c9a962; font-weight: 600; display: inline-block; min-width: 100px;">Email:</strong>
          <a href="mailto:${escapeHtml(data.senderEmail)}" style="color: #c9a962; text-decoration: none;">${escapeHtml(data.senderEmail)}</a>
        </td>
      </tr>
      ${data.company ? `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(168, 168, 168, 0.1);">
          <strong style="color: #c9a962; font-weight: 600; display: inline-block; min-width: 100px;">Company:</strong>
          <span style="color: #a8a8a8;">${escapeHtml(data.company)}</span>
        </td>
      </tr>
      ` : ''}
      ${data.phone ? `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(168, 168, 168, 0.1);">
          <strong style="color: #c9a962; font-weight: 600; display: inline-block; min-width: 100px;">Phone:</strong>
          <a href="tel:${escapeHtml(data.phone)}" style="color: #c9a962; text-decoration: none;">${escapeHtml(data.phone)}</a>
        </td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(168, 168, 168, 0.1);">
          <strong style="color: #c9a962; font-weight: 600; display: inline-block; min-width: 100px;">Subject:</strong>
          <span style="color: #a8a8a8;">${escapeHtml(data.subject)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <strong style="color: #c9a962; font-weight: 600; display: inline-block; min-width: 100px;">Time:</strong>
          <span style="color: #a8a8a8;">${formattedTime}</span>
        </td>
      </tr>
    </table>

    <div style="margin-top: 30px; padding: 20px; background-color: rgba(18, 18, 18, 0.5); border-left: 3px solid #c9a962;">
      <p style="margin: 0 0 10px 0; font-family: 'Times New Roman', Georgia, serif; font-size: 14px; color: #c9a962; font-weight: 600; letter-spacing: 0.5px;">Message:</p>
      <p style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 15px; color: #a8a8a8; line-height: 1.8; white-space: pre-wrap;">${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
    </div>
  `;

  return generateEmailTemplate({
    heading: 'New Contact Inquiry',
    content: detailsHTML,
    footerText: 'DKMedia305'
  });
}

/**
 * Generate plain text version of email (for fallback)
 */
export function generatePlainTextEmail(options: EmailTemplateOptions): string {
  const { heading, content, footerText } = options;
  
  let text = heading ? `${heading}\n\n` : '';
  text += content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  text += `\n\n${footerText || 'DKMedia305'}`;
  text += `\n© ${new Date().getFullYear()} DKMedia305. All rights reserved.`;
  
  if (options.includeUnsubscribe && options.unsubscribeUrl) {
    text += `\n\nUnsubscribe: ${options.unsubscribeUrl}`;
  }
  
  return text;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

