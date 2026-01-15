import { ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider, TranslationProvider } from "../providers";

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <TranslationProvider language="en">{children}</TranslationProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

export { screen } from "@testing-library/react";
export { customRender as render };
