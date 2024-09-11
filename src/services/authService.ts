import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  name: string;
  userType: any;
  // Add other properties as needed
}

// const API_URL = 'https://reactnativeassignment.onrender.com/api';
const API_URL = 'https://reactnativeassignment.onrender.com/api';
// const API_URL = 'http://10.0.2.2:5000/api';

export const signup = async (
  name: string,
  email: string,
  password: string,
  userType: string,
  phoneNumber: string,
  phoneCountry: any,
  whatsappNumber: string,
  whatsappCountry: any,
  selectedSubjects?: string[], // Subjects are optional
): Promise<void> => {
  try {
    const data: any = {
      name,
      email,
      password,
      userType,
      phoneNumber,
      phoneCountry: phoneCountry._id,
      whatsappNumber,
      whatsappCountry: whatsappCountry._id,
    };
    // Include optional fields if they are provided
    if (userType === 'Tutor') {
      data.subjects = selectedSubjects; // Include subjects only for Tutors
    }
    // Make the API request to signup
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    return response.data.message;
  } catch (error: any) {
    console.error(
      'Signup failed:',
      error.response ? error.response.data : error.message,
    );
    console.error(
      'Signup failed:',
      error.response ? error.response.data : error.message,
    ); // Re-throw the error to handle it in the component
  }
};

export const login = async (
  email: string,
  userType: string,
  password: string,
): Promise<void> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      userType,
      password,
    });
    const {token} = response.data;
    await AsyncStorage.setItem('token', token);
  } catch (error: any) {
    console.error(
      'Login failed:',
      error.response ? error.response.data : error.message,
    );
    throw error.response ? error.response.data : error.message; // Re-throw the error to handle it in the component
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
