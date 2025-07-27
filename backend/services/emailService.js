const nodemailer = require('nodemailer');
const { createWinnerEmailTemplate, createWinnerEmailText } = require('../templates/winnerEmailTemplate');
const { createShortlistedEmailTemplate, createShortlistedEmailText } = require('../templates/shortlistedEmailTemplate');

// Create transporter using environment variables or default config
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || process.env.MAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.MAIL_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || process.env.MAIL_PASS || 'your-app-password'
    }
  };
  
  console.log('🔍 Email Service - SMTP Configuration:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    pass: config.auth.pass ? '***' : 'NOT_SET'
  });
  
  return nodemailer.createTransport(config);
};

// Send winner email
const sendWinnerEmail = async (winnerData, hackathonData, position, recipientEmail) => {
  try {
    console.log('🔍 Email Service - Attempting to send winner email to:', recipientEmail);
    
    const transporter = createTransporter();
    
    // Verify transporter
    await transporter.verify();
    console.log('🔍 Email Service - Transporter verified successfully');
    
    const htmlContent = createWinnerEmailTemplate(winnerData, hackathonData, position);
    const textContent = createWinnerEmailText(winnerData, hackathonData, position);
    
    const mailOptions = {
      from: `"${hackathonData.title} Team" <${process.env.SMTP_USER || process.env.MAIL_USER || 'noreply@hackathon.com'}>`,
      to: recipientEmail,
      subject: `🏆 Congratulations! You're a Winner - ${hackathonData.title}`,
      html: htmlContent,
      text: textContent
    };
    
    console.log('🔍 Email Service - Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('🔍 Email Service - Winner email sent successfully:', {
      to: recipientEmail,
      subject: mailOptions.subject,
      messageId: result.messageId
    });
    
    return result;
  } catch (error) {
    console.error('🔍 Email Service - Error sending winner email:', error);
    console.error('🔍 Email Service - Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
  }
};

// Send shortlisted participant email
const sendShortlistedEmail = async (participantData, hackathonData, winners, recipientEmail) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter
    await transporter.verify();
    console.log('🔍 Email Service - Transporter verified successfully for shortlisted email');
    
    const htmlContent = createShortlistedEmailTemplate(participantData, hackathonData, winners);
    const textContent = createShortlistedEmailText(participantData, hackathonData, winners);
    
    const mailOptions = {
      from: `"${hackathonData.title} Team" <${process.env.SMTP_USER || process.env.MAIL_USER || 'noreply@hackathon.com'}>`,
      to: recipientEmail,
      subject: `🎯 Round 2 Results - ${hackathonData.title}`,
      html: htmlContent,
      text: textContent
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('🔍 Email Service - Shortlisted email sent successfully:', {
      to: recipientEmail,
      subject: mailOptions.subject,
      messageId: result.messageId
    });
    
    return result;
  } catch (error) {
    console.error('🔍 Email Service - Error sending shortlisted email:', error);
    console.error('🔍 Email Service - Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
  }
};

// Send bulk winner emails
const sendBulkWinnerEmails = async (winners, hackathonData) => {
  const emailPromises = [];
  const Submission = require('../model/SubmissionModel');
  const User = require('../model/UserModel');
  
  for (let i = 0; i < winners.length; i++) {
    const winner = winners[i];
    const position = i + 1;
    
    try {
      // Get the submission with populated data
      const submission = await Submission.findById(winner._id)
        .populate('teamId', 'name members')
        .populate('submittedBy', 'name email')
        .lean();
      
      if (!submission) {
        console.error(`🔍 Email Service - Submission not found for winner: ${winner._id}`);
        continue;
      }
      
      // Get team members or individual participant
      if (submission.teamId && submission.teamId.members && submission.teamId.members.length > 0) {
        // Send to all team members
        for (const memberId of submission.teamId.members) {
          const member = await User.findById(memberId);
          if (member && member.email) {
            console.log(`🔍 Email Service - Sending winner email to team member: ${member.email}`);
            emailPromises.push(
              sendWinnerEmail(winner, hackathonData, position, member.email)
                .catch(error => {
                  console.error(`🔍 Email Service - Failed to send winner email to ${member.email}:`, error);
                  return null;
                })
            );
          }
        }
      } else if (submission.submittedBy && submission.submittedBy.email) {
        // Send to individual participant
        console.log(`🔍 Email Service - Sending winner email to individual: ${submission.submittedBy.email}`);
        emailPromises.push(
          sendWinnerEmail(winner, hackathonData, position, submission.submittedBy.email)
            .catch(error => {
              console.error(`🔍 Email Service - Failed to send winner email to ${submission.submittedBy.email}:`, error);
              return null;
            })
        );
      } else {
        console.error(`🔍 Email Service - No valid recipient found for winner: ${winner._id}`);
      }
    } catch (error) {
      console.error(`🔍 Email Service - Error processing winner ${winner._id}:`, error);
    }
  }
  
  if (emailPromises.length === 0) {
    console.log('🔍 Email Service - No emails to send');
    return { successful: 0, failed: 0, total: 0 };
  }
  
  const results = await Promise.allSettled(emailPromises);
  const successful = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
  const failed = results.filter(result => result.status === 'rejected' || result.value === null).length;
  
  console.log('🔍 Email Service - Bulk winner emails completed:', { successful, failed, total: results.length });
  
  return { successful, failed, total: results.length };
};

// Send bulk shortlisted emails
const sendBulkShortlistedEmails = async (shortlistedParticipants, hackathonData, winners) => {
  const emailPromises = [];
  const Submission = require('../model/SubmissionModel');
  const User = require('../model/UserModel');
  
  for (const participant of shortlistedParticipants) {
    try {
      // Get the submission with populated data
      const submission = await Submission.findById(participant._id)
        .populate('teamId', 'name members')
        .populate('submittedBy', 'name email')
        .lean();
      
      if (!submission) {
        console.error(`🔍 Email Service - Submission not found for shortlisted participant: ${participant._id}`);
        continue;
      }
      
      // Get team members or individual participant
      if (submission.teamId && submission.teamId.members && submission.teamId.members.length > 0) {
        // Send to all team members
        for (const memberId of submission.teamId.members) {
          const member = await User.findById(memberId);
          if (member && member.email) {
            console.log(`🔍 Email Service - Sending shortlisted email to team member: ${member.email}`);
            emailPromises.push(
              sendShortlistedEmail(participant, hackathonData, winners, member.email)
                .catch(error => {
                  console.error(`🔍 Email Service - Failed to send shortlisted email to ${member.email}:`, error);
                  return null;
                })
            );
          }
        }
      } else if (submission.submittedBy && submission.submittedBy.email) {
        // Send to individual participant
        console.log(`🔍 Email Service - Sending shortlisted email to individual: ${submission.submittedBy.email}`);
        emailPromises.push(
          sendShortlistedEmail(participant, hackathonData, winners, submission.submittedBy.email)
            .catch(error => {
              console.error(`🔍 Email Service - Failed to send shortlisted email to ${submission.submittedBy.email}:`, error);
              return null;
            })
        );
      } else {
        console.error(`🔍 Email Service - No valid recipient found for shortlisted participant: ${participant._id}`);
      }
    } catch (error) {
      console.error(`🔍 Email Service - Error processing shortlisted participant ${participant._id}:`, error);
    }
  }
  
  if (emailPromises.length === 0) {
    console.log('🔍 Email Service - No shortlisted emails to send');
    return { successful: 0, failed: 0, total: 0 };
  }
  
  const results = await Promise.allSettled(emailPromises);
  const successful = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
  const failed = results.filter(result => result.status === 'rejected' || result.value === null).length;
  
  console.log('🔍 Email Service - Bulk shortlisted emails completed:', { successful, failed, total: results.length });
  
  return { successful, failed, total: results.length };
};

module.exports = {
  sendWinnerEmail,
  sendShortlistedEmail,
  sendBulkWinnerEmails,
  sendBulkShortlistedEmails,
  createTransporter
}; 