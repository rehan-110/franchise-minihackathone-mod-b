import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, 
    role: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      if (action.payload.user) {
        state.user = {
          uid: action.payload.user.uid,
          email: action.payload.user.email,
          displayName: action.payload.user.displayName,
          photoURL: action.payload.user.photoURL,
          emailVerified: action.payload.user.emailVerified,
        };
      } else {
        state.user = null;
      }
      state.role = action.payload.role;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
    },
  },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;