const admin = require('firebase-admin');
const userTokenModel = require('../model/userToken.model');

// Initialize Firebase Admin from environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

// Send notification to a specific user
const sendNotificationToUser = async (userId, title, body, data = {}) => {
  try {
    const userToken = await userTokenModel.findOne({ userId });
    
    if (!userToken) {
      console.log(`No FCM token found for user ${userId}`);
      return null;
    }

    const message = {
      notification: { title, body },
      data,
      token: userToken.fcmToken
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    
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
