import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

const lightTheme = {
  colors: {
    background: "#FFFFFF", 
    card: "#F2F2F7",       
    text: "#1C1C1E",       
    textSecondary: "#6E6E73", 
    primary: "#007AFF",   
    border: "#D1D1D6",
  },
};

const darkTheme = {
  colors: {
    background: "#000000",
    card: "#1C1C1E",
    text: "#FFFFFF",
    textSecondary: "#A9A9A9",
    primary: "#0A84FF",
    border: "#3A3A3C",
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        theme: isDark ? darkTheme : lightTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
