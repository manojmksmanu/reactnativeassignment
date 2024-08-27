import React, {createContext, useState, useContext, ReactNode} from 'react';

// Define a type for the context value
interface User {
  _id: string;
  username: string;
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
  setLoggedUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setLoggedUser: React.Dispatch<React.SetStateAction<User| null>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[] | null>>;
}

const API_URL = 'http://10.0.2.2:5000/api';

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[] | null>(null);

  return (
    <AuthContext.Provider
      value={{
        loggedUserId,
        setLoggedUserId,
        loggedUser,
        setLoggedUser,
        chats,
        setChats,
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
