export interface RgGame {
  appid: number;
  name: string;
}

export interface UserRoamingConfigStore {
  UserRoamingConfigStore: {
    Software: {
      Valve: {
        Steam: {
          Apps: {
            [appId: number]: {
              tags?: {
                [tagIndex: number]: string;
              };
            };
          };
        };
      };
    };
  };
}

export type ConfigApps = UserRoamingConfigStore['UserRoamingConfigStore']['Software']['Valve']['Steam']['Apps'];
