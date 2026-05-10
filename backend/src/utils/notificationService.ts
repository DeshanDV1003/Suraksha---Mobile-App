import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (pushToken: string, title: string, body: string, data?: any) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  const messages: ExpoPushMessage[] = [{
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high',
  }];

  try {
    const chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export const broadcastNotification = async (tokens: string[], title: string, body: string, data?: any) => {
  const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));
  
  const messages: ExpoPushMessage[] = validTokens.map(token => ({
    to: token,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  for (let chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  }
};
