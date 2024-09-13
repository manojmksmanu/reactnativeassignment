import axios from 'axios';

// const API_URL = 'https://reactnativeassignment.onrender.com/api';
const API_URL = 'http://10.0.2.2:5000/api';
export const getAllContry = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/country/get-all`);
    return response.data;
  } catch (err: any) {
    console.error(
      'Failed to fetch users:',
      err.response ? err.response.data : err.message,
    );
    throw err;
  }
};
export const getAllSubjects = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/subject/get-all`);
    return response.data;
  } catch (err: any) {
    console.error(
      'Failed to fetch users:',
      err.response ? err.response.data : err.message,
    );
    throw err;
  }
};
