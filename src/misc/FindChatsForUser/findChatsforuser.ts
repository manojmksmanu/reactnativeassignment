import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAllChats} from '../../services/authService';

export const fetchChats = async (
  setLoading: any,
  setChats: any,
  loggedUser: any,
) => {
  let parsedLocalChats: any[] = [];
  try {
    const localChats = await AsyncStorage.getItem('chats');
    parsedLocalChats = localChats ? JSON.parse(localChats) : [];
    if (parsedLocalChats.length === 0) {
      setLoading(true);
    } else {
      setChats(parsedLocalChats);
      setLoading(false);
    }
    const response = await getAllChats(loggedUser._id);
    if (JSON.stringify(response) !== JSON.stringify(parsedLocalChats)) {
      await AsyncStorage.setItem('chats', JSON.stringify(response));
      setChats(response);
    }
  } catch (error) {
    console.error('Failed to fetch chats:', error);
  } finally {
    if (parsedLocalChats.length === 0) {
      setLoading(false);
    }
  }
};
