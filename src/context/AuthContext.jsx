import {
  createContext,
  useState,
  useContext
} from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Lấy user an toàn
  const storedUser = localStorage.getItem('user');

  const [user, setUser] = useState(
    storedUser && storedUser !== 'undefined'
      ? JSON.parse(storedUser)
      : null
  );

  // Login
  const login = (data) => {

    localStorage.setItem(
      'token',
      data.data.token
    );

    localStorage.setItem(
      'user',
      JSON.stringify(data.data.user)
    );

    setUser(data.data.user);
  };

  // Logout
  const logout = () => {

    localStorage.clear();

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);