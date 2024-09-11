import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  name: string;
  userType: any;
}
const API_URL = 'https://reactnativeassignment.onrender.com/api';
// const API_URL = 'http://10.0.2.2:5000/api';
export const getAllChats = async (userId: string): Promise<any> => {
  const token = await AsyncStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/chat/${userId}/chats`, {
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