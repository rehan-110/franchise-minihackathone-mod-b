import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDark: false, 
  },
  reducers: {
    setDarkTheme: (state) => {
      state.isDark = true; 
    },
  },
});

export const { setDarkTheme } = themeSlice.actions;
export default themeSlice.reducer;