import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  name: string;
  userType: any;
}
// const API_URL = 'https://reactnativeassignment.onrender.com/api';
const API_URL = 'http://10.0.2.2:5000/api';
export const getMessages = async (userId: string): Promise<any[]> => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.get(`${API_URL}/messages/${userId}`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  return response.data;
};

export const sendMessage = async (messageData: any): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    const response = await axios.post(
      `${API_URL}/message`,
      {
        chatId: messageData.chatId,
        sender: messageData.sender,
        senderName: messageData.senderName,
        message: messageData.message,
        fileUrl: messageData.fileUrl,
        fileType: messageData.fileType,
        messageId: messageData.messageId,
        replyingMessage: messageData.replyingMessage,
      },
      {
        headers: {Authorization: `Bearer ${token}`},
      },
    );

    // console.log('Message sent successfully:', response.data);
  } catch (error: any) {
    // Log full error object
    console.error(
      'Error sending message:',
      error.response || error.message || error,
    );
  }
};

export const forward = async (
  chatId: string,
  messagesToForward: any,
  loggedUserId: string,
  loggedUserName: string,
): Promise<void> => {
  const token = await AsyncStorage.getItem('token');
  await axios.post(
    `${API_URL}/chat/forwardMessages`,
    {
      chatId: chatId,
      messages: messagesToForward,
      loggedUserId: loggedUserId,
      loggedUserName: loggedUserName,
    },
    {
      headers: {Authorization: `Bearer ${token}`},
    },
  );
};
