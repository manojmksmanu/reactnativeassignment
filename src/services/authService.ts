import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  } catch (error) {
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
    const response = await axios.get(`${API_URL}/auth/me`, { // Assuming /auth/me endpoint exists
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch current user:', error.response ? error.response.data : error.message);
    throw error;
  }
};


export const getUsers = async (): Promise<any[]> => {
  const token = await AsyncStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/chat/users`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return response.data;
  } catch (err) {
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

export const sendMessage = async (
  userId: string,
  content: string,
): Promise<void> => {
  const token = await AsyncStorage.getItem('token');
  await axios.post(
    `${API_URL}/chat/message`,
    {receiverId:userId, message:content},
    {
      headers: {Authorization: `Bearer ${token}`},
    },
  );
};
