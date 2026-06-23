import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// TYPES
interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "seller" | "admin";
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

// INITIAL STATE
const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isLoading: true,
};

// SLICE
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
