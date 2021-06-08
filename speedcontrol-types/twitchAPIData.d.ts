export interface TwitchAPIData {
    state: "off" | "authenticating" | "on";
    sync: boolean;
    accessToken?: string;
    refreshToken?: string;
    channelName?: string;
    channelID?: string;
    featuredChannels: string[];
    tokenExpiresAt?: number;
  }