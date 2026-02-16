const cron = require('node-cron');
const appointmentModel = require('../model/appointment.model');
const { sendNotificationToUser } = require('../services/notification.service');

// Check appointments and send reminders
const checkAppointmentReminders = async () => {
  try {
    console.log('Checking appointment reminders...');
    
    const now = new Date();
    
    // Get appointments in the next 24 hours that are upcoming
    const tomorrow = new Date(now);
    tomorrow.setHours(now.getHours() + 24);
    
    const upcomingAppointments = await appointmentModel.find({
      status: 'upcoming',
      appointmentDate: {
        $gte: now,
        $lte: tomorrow
      }
    });
    
    for (const appointment of upcomingAppointments) {
      const appointmentTime = new Date(appointment.appointmentDate);
      const timeDiff = appointmentTime - now;
      const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      // Send reminder 24 hours before
      if (hoursUntil === 24 && minutesUntil < 5) {
        await sendNotificationToUser(
          appointment.userId,
          '📅 Appointment Tomorrow',
          `Don't forget: Dr. ${appointment.doctorName} - ${appointmentTime.toLocaleString()}`,
          {
            appointmentId: appointment._id.toString(),
            doctorName: appointment.doctorName,
            time: appointmentTime.toISOString()
          }
        );
        console.log(`Sent 24hr reminder for appointment with Dr. ${appointment.doctorName}`);
      }
      
      // Send reminder 1 hour before
      if (hoursUntil === 1 && minutesUntil < 5) {
        await sendNotificationToUser(
          appointment.userId,
          '⏰ Appointment in 1 Hour',
          `Dr. ${appointment.doctorName} at ${appointment.location || 'clinic'}`,
          {
            appointmentId: appointment._id.toString(),
            doctorName: appointment.doctorName,
            time: appointmentTime.toISOString()
          }
        );
        console.log(`Sent 1hr reminder for appointment with Dr. ${appointment.doctorName}`);
      }
    }
  } catch (error) {
    console.error('Error in appointment reminder job:', error);
  }
};

// Run every 5 minutes to check for appointment reminders
const startAppointmentReminderJob = () => {
  cron.schedule('*/5 * * * *', () => {
    checkAppointmentReminders();
  });
  
  console.log('Appointment reminder job started - checking every 5 minutes');
};

module.exports = { startAppointmentReminderJob };