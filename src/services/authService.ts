import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  username: string;
  // Add other properties as needed
}
// const API_URL = 'https://reactnativeassignment.onrender.com/api';
const API_URL = 'https://reactnativeassignment.onrender.com/api';

export const login = async (
  username: string,
  password: string,
): Promise<void> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    const {token} = response.data;

    await AsyncStorage.setItem('token', token);
  } catch (error: any) {
    console.error(
      'Login failed:',
      error.response ? error.response.data : error.message,
    );
    throw error; // Re-throw the error to handle it in the component
  }
};

// New function to get the current user's details
export const getCurrentUser = async (): Promise<any> => {
  const token = await AsyncStorage.getItem('token');

  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      // Assuming /auth/me endpoint exists
      headers: {Authorization: `Bearer ${token}`},
    });
    return response.data;
  } catch (error: any) {
    console.error(
      'Failed to fetch current user:',
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
};

export const getUsers = async (): Promise<any> => {
  const token = await AsyncStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/chat/users`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return response.data;
  } catch (err: any) {
    console.error(
      'Failed to fetch users:',
      err.response ? err.response.data : err.message,
    );
    throw err;
  }
};

export const getAllChats = async (userId: string): Promise<any> => {
  const token = await AsyncStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/chat/${userId}/chats`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    console.log(response.data, 'allchats');
    return response.data;
  } catch (err: any) {
    console.error(
      'Failed to fetch users:',
      err.response ? err.response.data : err.message,
    );
    throw err;
  }
};

export const getMessages = async (userId: string): Promise<any[]> => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.get(`${API_URL}/chat/messages/${userId}`, {
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
      `${API_URL}/chat/message`,
      {
        chatId: messageData.chatId,
        sender: messageData.sender,
        senderName: messageData.senderName,
        message: messageData.message,
        messageId: messageData.messageId,
        replyingMessage: messageData.replyingMessage,
      },
      {
        headers: {Authorization: `Bearer ${token}`},
      },
    );

    console.log('Message sent successfully:', response.data);
  } catch (error: any) {
    // Log full error object
    console.error(
      'Error sending message:',
      error.response || error.message || error,
    );
  }

  console.log('Exiting sendMessage function');
};

export const forward = async (
  chatId: string,
  messagesToForward: any,
): Promise<void> => {
  const token = await AsyncStorage.getItem('token');
  await axios.post(
    `${API_URL}/chat/forwardMessages`,
    {chatId: chatId, messages: messagesToForward},
    {
      headers: {Authorization: `Bearer ${token}`},
    },
  );
};

export const loggeduser = async (): Promise<User | null> => {
  const token = await AsyncStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/auth/loggedUser`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return response.data;
  } catch (error: any) {
    console.error(
      'Login failed:',
      error.response ? error.response.data : error.message,
    );
    throw error; // Re-throw the error to handle it in the component
  }
};
