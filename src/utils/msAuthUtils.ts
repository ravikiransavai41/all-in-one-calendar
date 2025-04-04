import { AuthenticationResult, PublicClientApplication } from "@azure/msal-browser";

// Microsoft Authentication Configuration
const msalConfig = {
  auth: {
    clientId: "27c750cd-8d7b-45b1-9dec-c52e444eefc9",
    authority: `https://login.microsoftonline.com/b41b72d0-4e9f-4c26-8a69-f949f367c91d`,
    redirectUri: window.location.origin,
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
  "Calendars.ReadWrite",
  "Mail.Read",
  "offline_access",
  "Presence.Read.All",
  "Presence.Read",
  "OnlineMeetings.ReadWrite" // Add permission for Teams meetings
];

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
msalInstance.initialize().then(() => {
  // Handle the redirect promise and catch any errors
  msalInstance.handleRedirectPromise().catch(error => {
    console.error("Error handling redirect:", error);
  });
});

// Login with Microsoft
export const loginWithMicrosoft = async (): Promise<AuthenticationResult> => {
  try {
    // Try silent login first (if there's an existing session)
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      const silentRequest = {
        scopes,
        account: accounts[0],
      };

      try {
        console.log('Attempting silent token acquisition...');
        return await msalInstance.acquireTokenSilent(silentRequest);
      } catch (silentError) {
        console.log("Silent token acquisition failed, using popup");
        return await msalInstance.acquireTokenPopup({ scopes });
      }
    } else {
      console.log('No accounts found, initiating new login...');
      return await msalInstance.acquireTokenPopup({ scopes });
    }
  } catch (error: any) {
    console.error("Error during Microsoft login:", error);
    throw new Error(error.message || "Failed to sign in with Microsoft");
  }
};

// Get Microsoft Graph API access token
export const getMsGraphToken = async (): Promise<string> => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error("No account found");
    }

    const silentRequest = {
      scopes,
      account: accounts[0],
    };

    try {
      console.log('Attempting to acquire token silently...');
      const response = await msalInstance.acquireTokenSilent(silentRequest);
      console.log('Token acquired successfully');
      return response.accessToken;
    } catch (silentError) {
      console.log("Silent token acquisition failed, attempting popup...");
      const response = await msalInstance.acquireTokenPopup({ scopes });
      return response.accessToken;
    }
  } catch (error) {
    console.error("Error getting Microsoft Graph token:", error);
    throw error;
  }
};

// Fetch user profile from Microsoft Graph API
export const fetchMsUserProfile = async (accessToken: string) => {
  try {
    console.log('Fetching Microsoft user profile...');
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Microsoft user profile");
    }

    const profile = await response.json();
    console.log('Microsoft profile fetched:', profile);
    return profile;
  } catch (error) {
    console.error("Error fetching Microsoft profile:", error);
    throw error;
  }
};

// Logout from Microsoft
export const logoutFromMicrosoft = async () => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    await msalInstance.logoutPopup({
      account: accounts[0],
      postLogoutRedirectUri: window.location.origin,
    });
  }
};
