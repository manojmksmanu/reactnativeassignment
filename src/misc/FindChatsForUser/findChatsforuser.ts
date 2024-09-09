import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAllChats} from '../../services/authService';

export const fetchChats = async (
  setLoading: (loading: boolean) => void,
  setChats: (chats: any[]) => void,
  loggedUser: {_id: string} | null,
) => {
  let parsedLocalChats: any[] = [];

  if (!loggedUser || !loggedUser._id) {
    console.error('User is not logged in or loggedUser._id is undefined');
    setChats([]);
    setLoading(false);
    return;
  }

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
  } catch (error: any) {
    console.error('Failed to fetch chats:', error);

    if (
      error.message.includes('User not found') ||
      error.message.includes('invalid')
    ) {
      await AsyncStorage.removeItem('chats');
      setChats([]);
    }
  } finally {
    if (parsedLocalChats.length === 0) {
      setLoading(false);
    }
  }
};
