import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import io, {Socket} from 'socket.io-client';
import {loggeduser} from '../services/authService';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {fetchChats} from '../misc/FindChatsForUser/findChatsforuser';
// Define a type for the context value
interface User {
  _id: string;
  name: string;
  userType: any;
  // Add other properties as needed
}

interface Chat {
  _id: string;
  users: User[];

  // Add other properties as needed
}
interface AuthContextType {
  loggedUserId: string | null;
  loggedUser: User | null;
  chats: Chat[] | null;
  selectedChat: Chat[] | null;
  fetchAgain: boolean | false;
  onlineUsers: any[] | null;
  loading: boolean | false;
  setLoggedUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setLoggedUser: React.Dispatch<React.SetStateAction<User | null>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[] | null>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat[] | null>>;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean | false>>;
  socket: Socket | null; // Add socket
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>; // Add setSocket
  FetchChatsAgain: () => void; // Add this line
}

interface Message {
  _id: string;
  chatId: string;
  sender: string;
  senderName: string;
  message: string;
  messageId: string;
  replyingMessage?: any;
}
interface SocketEvents {
  receiveMessage: (messageData: Message) => void;
  forwarMessageReceived: (newMessages: Message[]) => void;
}

type RootStackParamList = {
  ChatList: undefined;
  ChatWindow: {chatId: string};
  Login: undefined;
};

const API_URL = 'http://10.0.2.2:5000';
// const API_URL = 'https://reactnativeassignment.onrender.com';

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat[] | null>(null);
  const [fetchAgain, setFetchAgain] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'ChatList'>>();

  const FetchChatsAgain = () => {
    setFetchAgain(prev => !prev);
  };
  // useEffect(() => {
  //   console.log(fetchAgain, '👀👀👀 Updated fetchAgain');
  // }, [fetchAgain]);
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUserInfo = await AsyncStorage.getItem('userInfo');
        if (storedUserInfo) {
          const user = JSON.parse(storedUserInfo);
          setLoggedUser(user);
        } else {
          const user: any = await loggeduser();
          await AsyncStorage.setItem('userInfo', JSON.stringify(user));
          setLoggedUser(user);
        }
      } catch (error) {
        console.error('Failed to fetch logged users:', error);
      }
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.navigate('ChatList');
      } else {
        navigation.navigate('Login');
      }
    };

    fetchUserInfo();
  }, [navigation]);

  // Initialize socket connection here or elsewhere as needed
  useEffect(() => {
    const socketInstance = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    setSocket(socketInstance);
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
    });
    return () => {
      socket?.disconnect();
      console.log('Socket disconnected');
    };
  }, []);

  // add user to online and offline status
  useEffect(() => {
    if (socket && loggedUser?._id) {
      socket.emit('userOnline', loggedUser._id);
      socket.on('getOnlineUsers', res => {
        setOnlineUsers(res);
      });
      return () => {
        socket.off('getOnlineUsers');
      };
    }
  }, [socket, loggedUser]);
  // -------------------------------------------

  // Fetch chats
  useEffect(() => {
    if (loggedUser) {
      fetchChats(setLoading, setChats, loggedUser);
    }
  }, [fetchAgain, loggedUser]);
  // Fetch Chats end here

  return (
    <AuthContext.Provider
      value={{
        loggedUserId,
        setLoggedUserId,
        loggedUser,
        setLoggedUser,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchAgain,
        setFetchAgain,
        FetchChatsAgain,
        socket,
        setSocket,
        onlineUsers,
        loading,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
