import { PropsWithChildren, useState } from "react";
import { MdMenu } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Drawer } from "@snack-uikit/drawer";
import { useTheme, Theme } from "../../theme/ThemeProvider";
import styles from "./Layout.module.scss";

export const Layout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { theme, changeTheme } = useTheme();

  const navItems = [
    { path: "/", label: "Test Case Generation" },
    { path: "/automated-tests", label: "Automated Tests" },
    { path: "/optimization", label: "Optimization" },
    { path: "/validation", label: "Validation" },
    { path: "/gitlab", label: "GitLab Commit" },
    { path: "/test-plan", label: "Test Plan" },
    { path: "/defects", label: "Defect Insights" },
  ];

  const logoElement = (
    <img src="/logo.png" alt="Kenzy QA Copilot" className={styles.logo} />
  );
  const navElement = (
    <nav className={styles.nav}>
      {logoElement}
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`${styles.navLink} ${
            location.pathname === item.path ? styles.navLinkActive : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
      <ButtonFilled
        className={styles.themeToggle}
        label={theme === Theme.light ? "🌙" : "☀️"}
        onClick={() =>
          changeTheme(theme === Theme.light ? Theme.dark : Theme.light)
        }
        size="s"
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
