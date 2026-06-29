"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { setCredentials, setLoading } from "@/store/slices/authSlice";
import { isBrowser } from "@/lib/utils";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const user = isBrowser() ? localStorage.getItem("user") : null;

      if (user) {
        dispatch(setCredentials(JSON.parse(user)));
      } else {
        dispatch(setLoading(false));
      }
    } catch {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return <>{children}</>;
}
