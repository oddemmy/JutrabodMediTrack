const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
const userTokenModel = require('../model/userToken.model');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Send notification to a specific user
const sendNotificationToUser = async (userId, title, body, data = {}) => {
  try {
    // Get user's FCM token
    const userToken = await userTokenModel.findOne({ userId });
    
    if (!userToken) {
      console.log(`No FCM token found for user ${userId}`);
      return null;
    }

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data,
      token: userToken.fcmToken
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    
    // If token is invalid, remove it from database
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      await userTokenModel.deleteOne({ userId });
      console.log(`Removed invalid token for user ${userId}`);
    }
    
    return null;
  }
};

// Send notification to multiple users
const sendNotificationToMultipleUsers = async (userIds, title, body, data = {}) => {
  const promises = userIds.map(userId => 
    sendNotificationToUser(userId, title, body, data)
  );
  
  return await Promise.all(promises);
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToMultipleUsers
};