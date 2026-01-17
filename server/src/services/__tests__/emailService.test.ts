import dotenv from 'dotenv';
import mongoose from 'mongoose';
import EmailServiceFactory from '../EmailService.js';
import { ScheduledEmailModel, ScheduledEmailDocument } from '../../schema/scheduledEmail.js';
import { EmailTransportModel } from '../../schema/emailTransport.js';

dotenv.config();

// Mock logger for testing
const mockLogger = {
  info: (message: string, details?: any) => console.log(`[INFO] ${message}`, details || ''),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error || ''),
  warn: (message: string, details?: any) => console.warn(`[WARN] ${message}`, details || ''),
  debug: (message: string, details?: any) => console.debug(`[DEBUG] ${message}`, details || ''),
  child: () => mockLogger,
  level: 'info' as const,
  fatal: () => {},
  trace: () => {},
  silent: () => {}
} as any;

/**
 * Test function for sendEmail service
 * This function tests sending an email directly
 */
export async function testSendEmail() {
  try {
    console.log('\n========== Testing sendEmail ==========\n');

    // Connect to MongoDB
    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) {
      throw new Error('MONGODB_URL environment variable is not set');
    }

    await mongoose.connect(MONGODB_URL);
    console.log('✓ Connected to MongoDB');

    // Initialize EmailService
    const emailService = EmailServiceFactory(mockLogger);
    console.log('✓ EmailService initialized');

    // Test email options
    const testMailOptions = {
      to: 'cmuonagolu18@gmail.com',
      subject: 'Test Email - sendEmail Function',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email sent from the <strong>testSendEmail</strong> function.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Test Type:</strong> Direct sendEmail test</p>
      `,
      text: `Test Email\n\nThis is a test email sent from the testSendEmail function.\n\nTimestamp: ${new Date().toISOString()}\nTest Type: Direct sendEmail test`
    };

    console.log('\n--- Sending test email ---');
    console.log('To:', testMailOptions.to);
    console.log('Subject:', testMailOptions.subject);

    // Send the email
    const result = await emailService.sendEmail(testMailOptions, 'test');

    // Display results
    console.log('\n--- Result ---');
    if (result.success) {
      console.log('✓ Email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('Recipient Count:', result.recipientCount);
      if (result.limitInfo) {
        console.log('Limit Info:', {
          currentCount: result.limitInfo.currentCount,
          dailyLimit: result.limitInfo.dailyLimit,
          remaining: result.limitInfo.remaining,
          percentageUsed: result.limitInfo.percentageUsed
        });
      }
    } else {
      console.log('✗ Email failed to send');
      console.log('Error:', result.error);
      console.log('Code:', result.code);
      if (result.limitInfo) {
        console.log('Limit Info:', result.limitInfo);
      }
    }

    // Get current usage stats
    const stats = await emailService.getUsageStats();
    console.log('\n--- Current Usage Stats ---');
    console.log('Current Count:', stats.currentCount);
    console.log('Daily Limit:', stats.dailyLimit);
    console.log('Remaining:', stats.remaining);
    console.log('Percentage Used:', stats.percentageUsed.toFixed(2) + '%');

    console.log('\n========== Test Complete ==========\n');

  } catch (error: any) {
    console.error('\n✗ Test failed with error:', error.message);
    console.error(error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  }
}

/**
 * Test function for scheduled email functionality
 * This function tests scheduling an email to be sent later
 */
export async function testScheduleEmail() {
  try {
    console.log('\n========== Testing scheduleEmail ==========\n');

    // Connect to MongoDB
    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) {
      throw new Error('MONGODB_URL environment variable is not set');
    }

    await mongoose.connect(MONGODB_URL);
    console.log('✓ Connected to MongoDB');

    // Initialize EmailService
    const emailService = EmailServiceFactory(mockLogger);
    console.log('✓ EmailService initialized');

    // Test email options for scheduling
    const testMailOptions = {
      to: 'cmuonagolu18@gmail.com',
      subject: 'Test Scheduled Email',
      html: `
        <h2>Scheduled Test Email</h2>
        <p>This is a test email that was scheduled to be sent later.</p>
        <p><strong>Scheduled Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Actual Send Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Test Type:</strong> Scheduled email test</p>
      `,
      text: `Scheduled Test Email\n\nThis is a test email that was scheduled to be sent later.\n\nScheduled Time: ${new Date().toISOString()}\nActual Send Time: ${new Date().toISOString()}\nTest Type: Scheduled email test`
    };

    // Test 1: Schedule email for next day (simulating limit exceeded)
    console.log('\n--- Test 1: Scheduling email for next day (simulating limit exceeded) ---');
    
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0); // Set to midnight

    console.log('Scheduling for:', nextDay.toISOString());

    // Use the private scheduleEmail method by simulating a limit exceeded scenario
    // We'll directly create a scheduled email in the database
    const scheduledEmail = await ScheduledEmailModel.create({
      mailOptions: testMailOptions,
      emailType: 'test_scheduled',
      scheduledTime: nextDay,
      status: 'pending'
    });

    console.log('✓ Email scheduled successfully!');
    console.log('Scheduled Email ID:', scheduledEmail._id);
    console.log('Scheduled Time:', scheduledEmail.scheduledTime.toISOString());
    console.log('Status:', scheduledEmail.status);

    // Test 2: Check pending scheduled emails
    console.log('\n--- Test 2: Checking pending scheduled emails ---');
    
    const pendingEmails = await (ScheduledEmailModel as any).getPendingEmails(10);
    console.log(`Found ${pendingEmails.length} pending email(s):`);
    
    pendingEmails.forEach((email: ScheduledEmailDocument, index: number) => {
      console.log(`\n  ${index + 1}. Email ID: ${email._id}`);
      console.log(`     Subject: ${email.mailOptions.subject}`);
      console.log(`     Scheduled Time: ${email.scheduledTime.toISOString()}`);
      console.log(`     Status: ${email.status}`);
      console.log(`     Attempts: ${email.attempts || 0}`);
    });

    // Test 3: Schedule email for immediate sending (past time to simulate ready)
    console.log('\n--- Test 3: Scheduling email for immediate sending (past time) ---');
    
    const immediateTime = new Date(Date.now() - 1000); // 1 second ago
    const immediateEmail = await ScheduledEmailModel.create({
      mailOptions: {
        ...testMailOptions,
        subject: 'Test Immediate Scheduled Email'
      },
      emailType: 'test_immediate',
      scheduledTime: immediateTime,
      status: 'pending'
    });

    console.log('✓ Immediate email scheduled!');
    console.log('Email ID:', immediateEmail._id);
    console.log('Scheduled Time:', immediateEmail.scheduledTime.toISOString());

    // Check if the immediate email is in pending list
    const readyEmails = await (ScheduledEmailModel as any).getPendingEmails(10);
    const readyEmail = readyEmails.find((e: ScheduledEmailDocument) => e._id.toString() === immediateEmail._id.toString());
    
    if (readyEmail) {
      console.log('\n✓ Immediate email is ready to be processed (in pending list)');
    } else {
      console.log('\n✗ Immediate email is not in pending list (may have been processed)');
    }

    console.log('\n========== Test Complete ==========\n');
    console.log('Note: To actually process these scheduled emails, run the ScheduledEmailProcessor.');
    console.log('Scheduled emails will be automatically processed by the cron job running every minute.');

  } catch (error: any) {
    console.error('\n✗ Test failed with error:', error.message);
    console.error(error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  }
}

/**
 * Test function to simulate limit exceeded scenario
 * This forces an email to be scheduled instead of sent immediately
 */
export async function testLimitExceededScenario() {
  try {
    console.log('\n========== Testing Limit Exceeded Scenario ==========\n');

    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) {
      throw new Error('MONGODB_URL environment variable is not set');
    }

    await mongoose.connect(MONGODB_URL);
    console.log('✓ Connected to MongoDB');

    const emailService = EmailServiceFactory(mockLogger);
    
    // Get current usage
    const stats = await emailService.getUsageStats();
    console.log('Current Usage:', stats.currentCount, '/', stats.dailyLimit);
    console.log('Remaining:', stats.remaining);

    // Try to send an email with a very large recipient count to trigger limit
    const largeRecipientEmail = {
      to: Array(stats.remaining + 1).fill(process.env.TEST_EMAIL_TO || 'test@example.com'),
      subject: 'Test Email - Limit Exceeded Scenario',
      html: '<p>This email should be scheduled due to limit exceeded</p>',
      text: 'This email should be scheduled due to limit exceeded'
    };

    console.log('\nAttempting to send email with', largeRecipientEmail.to.length, 'recipients...');
    console.log('This should exceed the remaining limit of', stats.remaining);

    const result = await emailService.sendEmail(largeRecipientEmail, 'test_limit');

    if (!result.success && result.code === 'LIMIT_EXCEEDED') {
      console.log('\n✓ Limit exceeded scenario triggered correctly!');
      console.log('Email was scheduled for next day instead of being sent immediately.');
      
      // Check if email was scheduled
      const scheduledEmails = await ScheduledEmailModel.find({
        status: 'pending',
        'mailOptions.subject': largeRecipientEmail.subject
      }).sort({ createdAt: -1 }).limit(1);

      if (scheduledEmails.length > 0) {
        console.log('✓ Scheduled email found in database');
        console.log('  ID:', scheduledEmails[0]._id);
        console.log('  Scheduled Time:', scheduledEmails[0].scheduledTime.toISOString());
      }
    } else {
      console.log('\n✗ Limit exceeded scenario did not trigger as expected');
      console.log('Result:', result);
    }

    console.log('\n========== Test Complete ==========\n');

  } catch (error: any) {
    console.error('\n✗ Test failed with error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  }
}

// If this file is run directly, execute the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testType = process.argv[2];

  if (testType === 'send') {
    testSendEmail();
  } else if (testType === 'schedule') {
    testScheduleEmail();
  } else if (testType === 'limit') {
    testLimitExceededScenario();
  } else {
    console.log('Usage:');
    console.log('  npm run test:email send      - Test sendEmail function');
    console.log('  npm run test:email schedule  - Test scheduleEmail function');
    console.log('  npm run test:email limit     - Test limit exceeded scenario');
  }
}

