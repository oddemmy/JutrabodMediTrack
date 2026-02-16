const cron = require('node-cron');
const medicationModel = require('../model/medication.model');
const { sendNotificationToUser } = require('../services/notification.service');

// Check medications and send reminders
const checkMedicationReminders = async () => {
  try {
    console.log('Checking medication reminders...');
    
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    console.log(`Current time: ${currentTime}`);
    
    // Get all active medications
    const medications = await medicationModel.find({ isActive: true });
    
    for (const medication of medications) {
      // Check if any of the medication times match current time
      if (medication.times && medication.times.length > 0) {
        for (const scheduledTime of medication.times) {
          // Extract hour and minute from scheduled time (format: "HH:MM")
          const [schedHour, schedMinute] = scheduledTime.split(':');
          const schedTimeFormatted = `${schedHour.padStart(2, '0')}:${schedMinute.padStart(2, '0')}`;
          
          if (schedTimeFormatted === currentTime) {
            // Send notification
            await sendNotificationToUser(
              medication.userId,
              '💊 Medication Reminder',
              `Time to take ${medication.medicationName} - ${medication.dosage}`,
              {
                medicationId: medication._id.toString(),
                medicationName: medication.medicationName,
                dosage: medication.dosage,
                time: scheduledTime
              }
            );
            
            console.log(`Sent reminder for ${medication.medicationName} to user ${medication.userId}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in medication reminder job:', error);
  }
};

// Run every minute to check for medication reminders
const startMedicationReminderJob = () => {
  // Cron format: * * * * * (every minute)
  cron.schedule('* * * * *', () => {
    checkMedicationReminders();
  });
  
  console.log('Medication reminder job started - checking every minute');
};

module.exports = { startMedicationReminderJob };