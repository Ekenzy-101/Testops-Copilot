import { PropsWithChildren, useState } from "react";
import { MdDarkMode, MdLightMode, MdMenu } from "react-icons/md";
import { Link, useLocation } from "react-router";
import { ToastContainer } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Drawer } from "@snack-uikit/drawer";
import { useTheme, Theme } from "../../theme/ThemeProvider";
import styles from "./Layout.module.scss";
import {
  APP_NAME,
  TO_ANALYZE_DEFECT,
  TO_COMMIT_TEST_CASE,
  TO_GENERATE_AUTO_TEST_CASE,
  TO_GENERATE_MANUAL_TEST_CASE,
  TO_GENERATE_TEST_PLAN,
  TO_OPTIMIZE_TEST_CASE,
  TO_VALIDATE_TEST_CASE,
} from "../../utils";

const navItems = [
  { path: TO_ANALYZE_DEFECT, label: "Analyze" },
  { path: TO_COMMIT_TEST_CASE, label: "Commit" },
  { path: TO_GENERATE_AUTO_TEST_CASE, label: "Generate Auto" },
  { path: TO_GENERATE_MANUAL_TEST_CASE, label: "Generate Manual" },
  { path: TO_GENERATE_TEST_PLAN, label: "Generate Plan" },
  { path: TO_OPTIMIZE_TEST_CASE, label: "Optimize" },
  { path: TO_VALIDATE_TEST_CASE, label: "Validate" },
];

export const Layout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { theme, changeTheme } = useTheme();

  const getNavLinkClassName = (path: string) => {
    if (path == TO_GENERATE_MANUAL_TEST_CASE && location.pathname == "/") {
      return `${styles.navLink} ${styles.navLinkActive}`;
    }

    return `${styles.navLink} ${
      location.pathname === path ? styles.navLinkActive : ""
    }`;
  };

  const logoElement = (
    <img src="/logo.png" alt={APP_NAME} className={styles.logo} />
  );

  const navElement = (
    <nav className={styles.nav}>
      {logoElement}
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={getNavLinkClassName(item.path)}
        >
          {item.label}
        </Link>
      ))}
      <ButtonFilled
        className={styles.themeToggle}
        icon={
          theme === Theme.light ? (
            <MdLightMode size={50} />
          ) : (
            <MdDarkMode size={50} />
          )
        }
        onClick={() =>
          changeTheme(theme === Theme.light ? Theme.dark : Theme.light)
        }
        size="m"
      />
    </nav>
  );

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {logoElement}
          {navElement}
          <ButtonFilled
            className={styles.drawerToggle}
            icon={<MdMenu size={50} />}
            onClick={() => setOpen(true)}
            size="m"
          />
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <Drawer
        rootClassName={styles.drawer}
        content={navElement}
        mode="regular"
        title=""
        open={open}
        onClose={() => setOpen(false)}
      />
      <ToastContainer
        position="bottom-center"
        theme={theme}
        toastClassName={styles.toast}
      />
    </div>
  );
};
