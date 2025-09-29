import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/axiosInstance";
import { clearTokens } from "@/utils/storage";

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post("/auth/login", { email, password });
    if (!response.data.accessToken && !response.data.access_token) {
      console.warn('[authService] No accessToken found in response, response keys:', Object.keys(response.data));
    }
    return response.data; 
  } catch (error: any) {
    throw error;
  }
};

export const refreshToken = async (refreshToken: string) => {
  const { data } = await axios.post("/auth/refresh", { refreshToken });
  return data; // { accessToken }
};
export const getCurrentUser = async () => {
  const response = await axios.get("/auth/me");
  const payload = response.data?.data ?? response.data;
  return payload; 
};

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await axios.post("/auth/logout");  
  clearTokens();                 
});




