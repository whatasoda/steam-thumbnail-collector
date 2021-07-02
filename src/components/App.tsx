import React, { useMemo, useState } from 'react';
import vdf from 'vdf-parser';
import { ConfigApps, RgGame, UserRoamingConfigStore } from '../types';
import { createCategoryMap, filterGamesByCategory } from '../utils';
import createDataInput from './DataInput';
import useLocalStorage from '../hooks/useLocalStorage';
import ZipGenerator from './ZipGenerator';
import CategorySelect from './CategorySelect';

const ConfigAppsInput = createDataInput<ConfigApps>({
  parse: (raw) => {
    try {
      const full = vdf.parse(raw) as UserRoamingConfigStore;
      return full?.UserRoamingConfigStore?.Software?.Valve?.Steam?.Apps ?? null;
    } catch (e) {
      return null;
    }
  },
  stringify: (data) => {
    const full: UserRoamingConfigStore = {
      UserRoamingConfigStore: {
        Software: {
          Valve: {
            Steam: {
              Apps: data,
            },
          },
        },
      },
    };
    return vdf.stringify(full);
  },
});

const RgGamesInput = createDataInput<RgGame[]>({
  parse: (raw) => {
    try {
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : null;
    } catch (e) {
      return null;
    }
  },
  stringify: JSON.stringify,
});

export default function App() {
  const [apps, setApps] = useLocalStorage<ConfigApps>('apps', {});
  const [games, setGames] = useLocalStorage<RgGame[]>('rg-games', []);
  const [category, setCategory] = useState<string | null>(null);

  const categoryMap = useMemo(() => {
    return createCategoryMap(apps);
  }, [apps]);

  const selectedGames = useMemo(() => {
    return category ? filterGamesByCategory(categoryMap, category, games) : [...games];
  }, [category, categoryMap, games]);

  return (
    <div>
      <ConfigAppsInput
        defaultValue={apps}
        onData={(data) => {
          setApps(data);
        }}
      />
      <RgGamesInput
        defaultValue={games}
        onData={(data) => {
          setGames(data);
        }}
      />
      <CategorySelect
        value={category}
        categoryMap={categoryMap}
        allItemCount={games.length}
        onChange={(category) => {
          setCategory(category);
        }}
      />
      <ZipGenerator zipFilename={``} games={selectedGames} />
    </div>
  );
}
