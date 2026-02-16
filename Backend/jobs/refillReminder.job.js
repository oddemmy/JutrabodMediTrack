const cron = require('node-cron');
const medicationModel = require('../model/medication.model');
const { sendNotificationToUser } = require('../services/notification.service');

// Check medications for low stock and send refill reminders
const checkRefillReminders = async () => {
  try {
    console.log('Checking refill reminders...');
    
    // Find active medications where remaining quantity is below threshold
    // and reminder hasn't been sent yet
    const lowStockMeds = await medicationModel.find({
      isActive: true,
      $expr: { $lte: ['$quantityRemaining', '$lowStockThreshold'] },
      quantityRemaining: { $gt: 0 },
      refillReminderSent: false
    });
    
    for (const medication of lowStockMeds) {
      await sendNotificationToUser(
        medication.userId,
        '🔔 Medication Refill Needed',
        `Low stock: ${medication.medicationName} - Only ${medication.quantityRemaining} doses left!`,
        {
          medicationId: medication._id.toString(),
          medicationName: medication.medicationName,
          quantityRemaining: medication.quantityRemaining.toString()
        }
      );
      
      // Mark reminder as sent
      medication.refillReminderSent = true;
      await medication.save();
      
      console.log(`Sent refill reminder for ${medication.medicationName} - ${medication.quantityRemaining} left`);
    }
    
    // Reset reminder flag when medication is refilled (quantity goes back up)
    await medicationModel.updateMany(
      {
        isActive: true,
        $expr: { $gt: ['$quantityRemaining', '$lowStockThreshold'] },
        refillReminderSent: true
      },
      {
        refillReminderSent: false
      }
    );
    
  } catch (error) {
    console.error('Error in refill reminder job:', error);
  }
};

// Run every hour to check for low stock
const startRefillReminderJob = () => {
  // Cron format: 0 * * * * (every hour at minute 0)
  cron.schedule('0 * * * *', () => {
    checkRefillReminders();
  });
  
  console.log('Refill reminder job started - checking every hour');
};

module.exports = { startRefillReminderJob };