import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

const pageSlice = createSlice({
  name: "pageSlice",
  initialState: {
    isLoading: false,
    searchQuery: '',
  },
  reducers: {
    setIsLoading: (state, action: { payload: boolean }) => {
      state.isLoading = action.payload;
    },
    setSearchQuery: (state, action: { payload: string }) => {
      state.searchQuery = action.payload.toLowerCase().trim();
    },
  }
});

const hashconnectSlice = createSlice({
  name: "hashconnectSlice",
  initialState: {
    isConnected: false,
    accountId: '',
  },
  reducers: {
    setIsConnected: (state, action: { payload: boolean }) => {
      state.isConnected = action.payload;
    },
    setAccountId: (state, action: { payload: string }) => {
      state.accountId = action.payload;
    },
  }
});


// config the store 
export const store = configureStore({
  reducer: {
    page: pageSlice.reducer,
    hashconnect: hashconnectSlice.reducer,
  }
});

export type AppStore = ReturnType<typeof store.getState>;

export const actions = {
  page: pageSlice.actions,
  hashconnect: hashconnectSlice.actions
};