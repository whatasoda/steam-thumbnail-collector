import React, { useMemo, useState } from 'react';
import vdf from 'vdf-parser';
import { ConfigApps, RgGame, UserRoamingConfigStore } from '../types';
import { createCategoryMap, filterGamesByCategory } from '../utils';
import createDataInput from './DataInput';
import useLocalStorage from '../hooks/useLocalStorage';
import ZipGenerator from './ZipGenerator';
import CategorySelect from './CategorySelect';
import styled from 'styled-components';
import { ImageFetchMode } from '../fetch-image';
import ThumbnailTypeSelect from './ThumbNailTypeSelect';

const ConfigAppsInput = createDataInput<ConfigApps>({
  parse: (raw) => {
    try {
      const full = vdf.parse(raw) as UserRoamingConfigStore;
      return full?.UserRoamingConfigStore?.Software?.Valve?.Steam?.Apps ?? null;
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(e);
      }
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
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(e);
      }
      return null;
    }
  },
  stringify: JSON.stringify,
});

export default function App() {
  const [apps, setApps] = useLocalStorage<ConfigApps>('apps', {});
  const [games, setGames] = useLocalStorage<RgGame[]>('rg-games', []);
  const [fetchMode, setFetchMode] = useLocalStorage<ImageFetchMode>('fetch-mode', 'library');
  const [category, setCategory] = useState<string | null>(null);

  const categoryMap = useMemo(() => {
    return createCategoryMap(apps);
  }, [apps]);

  const selectedGames = useMemo(() => {
    return category ? filterGamesByCategory(categoryMap, category, games) : [...games];
  }, [category, categoryMap, games]);

  return (
    <Wrapper>
      <h1>Steam Thumbnail Collector</h1>
      <Section1 />
      <ConfigAppsInput
        defaultValue={apps}
        onData={(data) => {
          setApps(data);
        }}
      />
      <Section2 />
      <RgGamesInput
        defaultValue={games}
        onData={(data) => {
          setGames(data);
        }}
      />
      <Section3 />
      <CategorySelect
        value={category}
        categoryMap={categoryMap}
        allItemCount={games.length}
        onChange={(category) => {
          setCategory(category);
        }}
      />
      <ThumbnailTypeSelect
        value={fetchMode}
        onChange={(next) => {
          setFetchMode(next);
        }}
      />
      <ZipGenerator fetchMode={fetchMode} zipFilename={`${category || 'AllGames'}.zip`} games={selectedGames} />
    </Wrapper>
  );
}

const Section1 = () => (
  <>
    <h2>
      1. <code>sharedconfig.vdf</code> を読み込む
    </h2>
    <Steps>
      <li>
        <code>
          "Program Files (x86)"/Steam/userdata/{'{'}StaemのユーザーID{'}'}/7/remote/
        </code>
        にある<code>sharedconfig.vdf</code>
        をメモ帳等で開く。
      </li>
      <li>その中身をすべてコピーしこのテキストボックスに貼り付ける。(すでにあるものを上書きしてください。)</li>
    </Steps>
  </>
);

const Section2 = () => (
  <>
    <h2>2. 自分のプロフィールページからゲームのデータを読み込む</h2>
    <Steps>
      <li>SteamをWebブラウザで開き、ログインする。(Chrome推奨)</li>
      <li>
        次に自分のプロフィールページに飛び、右側のメニューの中からゲーム一覧を開く。
        (自分のプロフィールページのURLの末尾に<code>/games/?tab=all</code>を追加することでも開けます。)
      </li>
      <li>
        <code>F12</code>キー（または<code>Ctrl+Alt+I</code>
        ）でブラウザの開発者ツールを開き、開発者ツール内上部のタブ一覧から
        <code>Console</code>というタブを選択する。
      </li>
      <li>
        <a href="https://raw.githubusercontent.com/whatasoda/steam-thumbnail-collector/main/collect-game-data.js">
          このページ
        </a>
        にあるスクリプトをコピーして先程開いたコンソールに貼り付ける。
      </li>
      <li>
        自動的にゲームのデータがクリップボードにコピーされるので、それをこのテキストボックスに貼り付ける。(すでにあるものを上書きしてください。)
      </li>
    </Steps>
  </>
);

const Section3 = () => (
  <>
    <h2>3. カテゴリーと画像サイズを選んで生成！</h2>
  </>
);

const Wrapper = styled.div`
  padding-bottom: 50%;
`;

const Steps = styled.ol`
  padding-left: 25px;
  code {
    white-space: pre;
    padding: 4px;
    background-color: #ccc;
    border-radius: 4px;
  }
`;
