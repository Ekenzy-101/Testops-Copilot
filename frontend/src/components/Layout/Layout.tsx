import { MouseEvent, PropsWithChildren, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdDarkMode, MdLightMode, MdMenu } from "react-icons/md";
import { Link, useLocation, redirect } from "react-router";
import { ToastContainer } from "react-toastify";
import { ButtonFilled, ButtonOutline } from "@snack-uikit/button";
import { Drawer } from "@snack-uikit/drawer";
import { useTheme, Theme } from "../../providers";
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

export const Layout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { theme, changeTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const getNavLinkClassName = (path: string) => {
    if (path == TO_GENERATE_MANUAL_TEST_CASE && location.pathname == "/") {
      return `${styles.navLink} ${styles.navLinkActive}`;
    }

    return `${styles.navLink} ${
      location.pathname === path ? styles.navLinkActive : ""
    }`;
  };

  const logoElement = (
    <img src={`/logo-${theme}.png`} alt={APP_NAME} className={styles.logo} />
  );

  const navItems = [
    {
      path: TO_ANALYZE_DEFECT,
      label: t("defect_analysis.link"),
    },
    {
      path: TO_COMMIT_TEST_CASE,
      label: t("test_case_commit.link"),
    },
    {
      path: TO_GENERATE_AUTO_TEST_CASE,
      label: t("auto_test_case_generation.link"),
    },
    {
      path: TO_GENERATE_MANUAL_TEST_CASE,
      label: t("manual_test_case_generation.link"),
    },
    {
      path: TO_GENERATE_TEST_PLAN,
      label: t("test_plan_generation.link"),
    },
    {
      path: TO_OPTIMIZE_TEST_CASE,
      label: t("test_case_optimization.link"),
    },
    {
      path: TO_VALIDATE_TEST_CASE,
      label: t("test_case_validation.link"),
    },
  ];
  const navElement = (
    <nav className={styles.nav}>
      {logoElement}
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={getNavLinkClassName(item.path)}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            redirect(item.path);
            setOpen(false);
          }}
        >
          {item.label}
        </Link>
      ))}
      <ButtonOutline
        className={styles.toggle}
        label={i18n.language === "en" ? "Русский" : "English"}
        onClick={() =>
          i18n.changeLanguage(i18n.language === "en" ? "ru" : "en")
        }
        size="m"
      />
      <ButtonFilled
        className={styles.toggle}
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
