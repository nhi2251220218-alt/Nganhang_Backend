import {
  createContext,
  useContext,
  useState
} from 'react';

const AdminAuthContext =
  createContext();

export const AdminProvider =
({ children }) => {

  const [admin, setAdmin] =
    useState(
      JSON.parse(
        localStorage.getItem('admin')
      )
    );

  const login = (data) => {

    localStorage.setItem(
      'adminToken',
      data.token
    );

    localStorage.setItem(
      'admin',
      JSON.stringify(data.admin)
    );

    setAdmin(data.admin);
  };

  const logout = () => {

    localStorage.removeItem(
      'adminToken'
    );

    localStorage.removeItem(
      'admin'
    );

    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdmin = () =>
  useContext(AdminAuthContext);