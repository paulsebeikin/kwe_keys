import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [firstName, setFirstName] = useState(localStorage.getItem('firstName') || '');
  const [lastName, setLastName] = useState(localStorage.getItem('lastName') || '');

  const login = (newToken, userInfo = {}) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    if (userInfo.firstName) {
      setFirstName(userInfo.firstName);
      localStorage.setItem('firstName', userInfo.firstName);
    }
    if (userInfo.lastName) {
      setLastName(userInfo.lastName);
      localStorage.setItem('lastName', userInfo.lastName);
    }
  };

  const logout = () => {
    setToken(null);
    setFirstName('');
    setLastName('');
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, firstName, lastName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
