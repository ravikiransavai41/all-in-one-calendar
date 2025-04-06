
import { AuthenticationResult, PublicClientApplication } from "@azure/msal-browser";

// Microsoft Authentication Configuration
const msalConfig = {
  auth: {
    clientId: "27c750cd-8d7b-45b1-9dec-c52e444eefc9",
    authority: `https://login.microsoftonline.com/b41b72d0-4e9f-4c26-8a69-f949f367c91d`,
    redirectUri: window.location.origin, // This will use the current origin dynamically
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

// Authentication scopes for Microsoft Graph API
export const scopes = [
  "User.Read",
  "Calendars.Read",
  "Mail.Read",
  "offline_access",
  "Presence.Read.All",
  "Presence.Read"
];

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Login with Microsoft
export const loginWithMicrosoft = async (): Promise<AuthenticationResult> => {
  try {
    // Try silent login first (if there's an existing session)
    const silentRequest = {
      scopes,
      account: msalInstance.getAllAccounts()[0],
    };

    try {
      return await msalInstance.acquireTokenSilent(silentRequest);
    } catch (silentError) {
      console.log("Silent token acquisition failed, using popup");
      const loginRequest = { 
        scopes,
        redirectUri: window.location.origin // Ensure redirect URI is set consistently
      };
      return await msalInstance.acquireTokenPopup(loginRequest);
    }
  } catch (error: any) {
    console.error("Error during Microsoft login:", error);
    throw new Error(error.message || "Failed to sign in with Microsoft");
  }
};

// Get Microsoft Graph API access token
export const getMsGraphToken = async (): Promise<string> => {
  try {
    const account = msalInstance.getAllAccounts()[0];
    if (!account) {
      throw new Error("No account found");
    }

    const silentRequest = {
      scopes,
      account,
    };

    const response = await msalInstance.acquireTokenSilent(silentRequest);
    return response.accessToken;
  } catch (error) {
    console.error("Error getting Microsoft Graph token:", error);
    const loginRequest = {
      scopes,
      redirectUri: window.location.origin // Ensure redirect URI is set consistently
    };
    const response = await msalInstance.acquireTokenPopup(loginRequest);
    return response.accessToken;
  }
};

// Fetch user profile from Microsoft Graph API
export const fetchMsUserProfile = async (accessToken: string) => {
  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Microsoft user profile");
  }

  return await response.json();
};

// Logout from Microsoft
export const logoutFromMicrosoft = async () => {
  const logoutRequest = {
    postLogoutRedirectUri: window.location.origin
  };
  await msalInstance.logoutPopup(logoutRequest);
};
