import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, getCurrentUser } from "../apis/authService";
import { setTokens, clearTokens } from "../utils/storage";

interface AuthState {
  user: any;
  status: "idle" | "loading" | "failed";
  error?: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log('[auth/loginUser] attempting login for', email);
      const data = await login(email, password);
      console.log('[auth/loginUser] login response received:', data);

      // Extract tokens robustly from potentially nested envelope
      const deepFind = (obj: any, keys: string[]): string | undefined => {
        try {
          const queue = [obj];
          while (queue.length) {
            const current = queue.shift();
            if (!current || typeof current !== 'object') continue;
            for (const k of Object.keys(current)) {
              const v = current[k];
              if (v && typeof v === 'object') queue.push(v);
            }
            for (const key of keys) {
              if (key in current && typeof current[key] === 'string') return current[key];
            }
          }
        } catch (_) { /* noop */ }
        return undefined;
      };
      const tokenData = (data as any)?.data?.data ?? (data as any)?.data ?? data;
      const accessToken =
        tokenData?.accessToken || tokenData?.access_token ||
        deepFind(data, ['accessToken', 'access_token']);
      const refreshToken =
        tokenData?.refreshToken || tokenData?.refresh_token ||
        deepFind(data, ['refreshToken', 'refresh_token']);

      console.log('[auth/loginUser] extracted tokens - access:', !!accessToken, 'refresh:', !!refreshToken);

      if (accessToken && refreshToken) {
        // Save tokens first
        setTokens(accessToken, refreshToken);
        console.log('[auth/loginUser] tokens saved to localStorage');
      } else {
        console.warn('[auth/loginUser] No tokens found in response, cannot save tokens');
        console.warn('[auth/loginUser] Response data keys:', Object.keys(data));
        console.warn('[auth/loginUser] Token data keys:', tokenData ? Object.keys(tokenData) : 'tokenData is null/undefined');
      }

      // Then fetch the actual user - but only if we have a token
      if (accessToken) {
        try {
          const user = await getCurrentUser();
          console.log('[auth/loginUser] fetched current user', user);

          // Extract the actual user data from nested structure
          const userData = user.data || user;
          console.log('[auth/loginUser] extracted user data for admin check:', userData);

          // Enforce admin for admin app - check the nested data
          if (userData && userData.isAdmin === true) {
            console.warn('[auth/loginUser] user is not admin, clearing tokens');
            clearTokens();
            return rejectWithValue('This is not a valid user');
          }

          console.log('[auth/loginUser] admin check passed, isAdmin:', userData?.isAdmin);
          return user;
        } catch (userError) {
          console.error('[auth/loginUser] failed to fetch current user:', userError);
          return rejectWithValue('Failed to fetch current user after login');
        }
      } else {
        console.warn('[auth/loginUser] No access token, cannot proceed to fetch user');
        return rejectWithValue('No access token received from login');
      }
    } catch (err: any) {
      // Normalize Axios/Nest error into a friendly message
      const status = err?.response?.status;
      let message: string | undefined;
      let backendMsg = err?.response?.data?.message ?? err?.response?.data?.error?.message;
      if (Array.isArray(backendMsg)) backendMsg = backendMsg.join(', ');
      if (status === 401) {
        message = 'Invalid email or password';
      } else {
        message = backendMsg || err?.message || 'Login failed';
      }
      return rejectWithValue(message);
    }
  }
);

export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
  return await getCurrentUser();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      clearTokens();
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
  state.error = null;
        console.log('[auth/loginUser] pending');
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
        console.log('[auth/loginUser] fulfilled -> user set');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        // Prefer a friendly payload provided via rejectWithValue
        state.error = (action.payload as string) || action.error?.message || 'Login failed';
        console.error('[auth/loginUser] rejected', action.error);
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        console.log('[auth/fetchUser] fulfilled');
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
