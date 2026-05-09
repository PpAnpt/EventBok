import { createContext, useContext, useState } from "react";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const raw = localStorage.getItem("customer_info");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const login = (customerData, token) => {
    localStorage.setItem("customer_token", token);
    localStorage.setItem("customer_info", JSON.stringify(customerData));
    setCustomer(customerData);
  };

  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_info");
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, login, logout, isLoggedIn: !!customer }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
