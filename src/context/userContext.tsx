import React, {createContext, useState, useContext, ReactNode} from 'react';

// Define a type for the context value
interface AuthContextType {
  loggedUser: string | null;
  setLoggedUser: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [loggedUser, setLoggedUser] = useState<string | null>(null);


  return (
    <AuthContext.Provider value={{loggedUser,setLoggedUser}}>
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
