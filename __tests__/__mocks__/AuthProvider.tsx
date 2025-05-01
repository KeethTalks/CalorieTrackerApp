import React from 'react';
import { ViewProps } from 'react-native';

export interface AuthContextType {
  user: {
    uid: string;
  };
  loading: boolean;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: { uid: 'test-user' },
  loading: false,
});

export const AuthProvider: React.FC<ViewProps> = ({ children }) => {
  return (
    <AuthContext.Provider value={{
      user: { uid: 'test-user' },
      loading: false,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
