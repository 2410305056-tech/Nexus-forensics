/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS FORENSICS — CONTACT FORM API
 * Vercel Serverless Function
 * ═══════════════════════════════════════════════════════════
 */

import nodemailer from 'nodemailer';

// Initialize email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Validates email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes input to prevent injection attacks
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 500);
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, organization, case_type, priority, message } = req.body;

    // Validate required fields
    if (!name || !email || !case_type || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, case_type, message',
      });
    }

    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Sanitize inputs
    const sanitized = {
      name: sanitizeInput(name),
      email: email.toLowerCase().trim(),
      organization: sanitizeInput(organization || ''),
      case_type: sanitizeInput(case_type),
      priority: ['standard', 'high', 'critical'].includes(priority) ? priority : 'standard',
      message: sanitizeInput(message),
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    };

    // Store in database (if configured)
    if (process.env.DATABASE_URL) {
      // Example: would connect to Supabase, MongoDB, PostgreSQL, etc.
      // This is a placeholder for database integration
      console.log('Storing in database:', sanitized);
    }

    // Send email notification
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const emailSubject = `[NEXUS] New ${sanitized.priority.toUpperCase()} Investigation Request - ${sanitized.case_type}`;
      const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 NEXUS FORENSICS — NEW CASE SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIMESTAMP: ${sanitized.timestamp}
PRIORITY: ${sanitized.priority.toUpperCase()}

CLIENT IDENTIFICATION:
  Name: ${sanitized.name}
  Email: ${sanitized.email}
  Organization: ${sanitized.organization || 'N/A'}

CASE INFORMATION:
  Case Type: ${sanitized.case_type}
  Priority Level: ${sanitized.priority}

BRIEFING:
${sanitized.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STATUS: SUBMITTED TO CASE MANAGEMENT QUEUE
RESPONSE TIME TARGET: 4 hours
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.NEXUS_EMAIL || 'ops@nexusforensics.io',
        subject: emailSubject,
        text: emailBody,
        html: `<pre>${emailBody}</pre>`,
      });

      // Send confirmation to client
      const confirmationBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXUS FORENSICS — SUBMISSION CONFIRMED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${sanitized.name},

Your investigation request has been successfully received and 
is now in our case management queue.

CASE DETAILS:
  Submitted: ${sanitized.timestamp}
  Case Type: ${sanitized.case_type}
  Priority: ${sanitized.priority.toUpperCase()}

You can expect a response from our senior analysts within 4 hours.
For emergencies, call our secure line: +1 (800) NXS-FRNS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXUS FORENSICS
ops@nexusforensics.io
"Truth in every byte."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: sanitized.email,
        subject: '✓ NEXUS FORENSICS — Submission Confirmed',
        text: confirmationBody,
        html: `<pre>${confirmationBody}</pre>`,
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Case submission received and queued for analysis',
      caseId: `NX-${Date.now()}`,
      timestamp: sanitized.timestamp,
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error processing request',
    });
  }
}
