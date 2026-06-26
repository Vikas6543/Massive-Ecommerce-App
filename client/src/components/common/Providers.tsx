"use client";

import { Provider } from "react-redux";
import store from "@/store";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "./AuthProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="top-right" richColors closeButton duration={3000} />
    </Provider>
  );
}
