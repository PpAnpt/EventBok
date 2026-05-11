import { createContext, useContext, useState } from "react";

const OrganizerAuthContext = createContext(null);

export function OrganizerAuthProvider({ children }) {
  const [organizer, setOrganizer] = useState(() => {
    try { return JSON.parse(localStorage.getItem("organizer_info") || "null"); }
    catch { return null; }
  });

  const login = (data, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("organizer_token", token);
    localStorage.setItem("organizer_info", JSON.stringify(data));
    setOrganizer(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("organizer_token");
    localStorage.removeItem("organizer_info");
    setOrganizer(null);
  };

  return (
    <OrganizerAuthContext.Provider value={{ organizer, login, logout, isLoggedIn: !!organizer }}>
      {children}
    </OrganizerAuthContext.Provider>
  );
}

export function useOrganizerAuth() {
  return useContext(OrganizerAuthContext);
}
