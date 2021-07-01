export interface RgGame {
  appid: number;
  name: string;
  name_escaped: string;
  // logo: string;
}

export interface UserRoamingConfigStore {
  UserRoamingConfigStore: {
    Software: {
      Valve: {
        Steam: {
          Apps: ConfigApps;
        };
      };
    };
  };
}

export interface ConfigApps {
  [appId: number]: {
    tags?: {
      [tagIndex: number]: string;
    };
  };
}
