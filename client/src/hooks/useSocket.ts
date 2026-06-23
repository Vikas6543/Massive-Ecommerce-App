import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/constants";
import { useAppDispatch, useAppSelector } from "@/store";
import { addNotification } from "@/store/slices/notificationSlice";
import { TOKEN_KEYS } from "@/config/constants";
import { isBrowser } from "@/lib/utils";

let socketInstance: Socket | null = null;

export function useSocket() {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if logged in and in browser
    if (!isLoggedIn || !isBrowser()) return;

    const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (!token) return;

    // Prevent multiple connections
    if (socketInstance?.connected) {
      socketRef.current = socketInstance;
      return;
    }

    // CREATE SOCKET CONNECTION
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;

    // CONNECTION EVENTS
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance?.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    // NOTIFICATION EVENT — from backend
    socketInstance.on("notification", (notification) => {
      dispatch(addNotification(notification));
    });

    // CLEANUP on logout
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
    };
  }, [isLoggedIn, dispatch]);

  return socketRef;
}
