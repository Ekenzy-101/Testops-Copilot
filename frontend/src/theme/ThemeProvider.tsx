import {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { useThemeConfig } from "@snack-uikit/utils";
import DefaultBrand from "@snack-uikit/figma-tokens/build/css/brand.module.css";

export enum Theme {
  light = "light",
  dark = "dark",
}

const themeMap = {
  [Theme.light]: DefaultBrand.light,
  [Theme.dark]: DefaultBrand.dark,
};

interface ThemeContextProps {
  theme: Theme;
  themeClassName: string;
  changeTheme: (value: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: Theme.light,
  themeClassName: "",
  changeTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || Theme.light;
  });

  const { themeClassName, changeTheme: changeThemeConfig } =
    useThemeConfig<Theme>({
      themeMap,
      defaultTheme: theme,
    });

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    changeThemeConfig(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.body.className = themeClassName;
    return () => {
      document.body.className = "";
    };
  }, [themeClassName]);

  return (
    <ThemeContext.Provider value={{ theme, themeClassName, changeTheme }}>
      <div className={themeClassName}>{children}</div>
    </ThemeContext.Provider>
  );
};
