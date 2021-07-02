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
import { StyledCode, StyledOl } from './fragments';

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
      <Section0 />
      <Section1>
        <ConfigAppsInput
          defaultValue={apps}
          onData={(data) => {
            setApps(data);
          }}
        />
      </Section1>
      <Section2>
        <RgGamesInput
          defaultValue={games}
          onData={(data) => {
            setGames(data);
          }}
        />
      </Section2>
      <Section3>
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
      </Section3>
    </Wrapper>
  );
}

const Section0 = () => (
  <>
    <h2>0. Steamのデスクトップアプリ上で画像を集めたいゲームをカテゴリにまとめる</h2>
    Steamのデスクトップアプリを開いて、ライブラリタブでいい感じにカテゴリを作る。その際正しくデータを反映させるために、以下の点について注意して作成してください。
    <StyledOl>
      <li>
        新しくカテゴリを作るときに一番最初に割り当てたゲームについて、「他のゲームを1つ割り当てる」→「一度割り当てを解除」→「改めて割り当てる」という手順を取る。
      </li>
      <li>カテゴリの名前を途中で変更しない。</li>
    </StyledOl>
  </>
);

const Section1: React.FC = ({ children }) => (
  <div>
    <h2>
      1. <StyledCode>sharedconfig.vdf</StyledCode> を読み込む
    </h2>
    <StyledOl>
      <li>
        <StyledCode>
          "Program Files (x86)"/Steam/userdata/{'{'}StaemのユーザーID{'}'}/7/remote/
        </StyledCode>
        にある<StyledCode>sharedconfig.vdf</StyledCode>
        をメモ帳等で開く。
      </li>
      <li>
        その中身をすべてコピーしこのテキストボックスに貼り付ける。(すでにあるものを上書きしてください。データはこのページを閉じても保存されますが、最新のデータを使いたいときは改めて同じ手順でデータを貼り付けてください。)
      </li>
    </StyledOl>
    {children}
  </div>
);

const Section2: React.FC = ({ children }) => (
  <div>
    <h2>2. 自分のプロフィールページからゲームのデータを読み込む</h2>
    <StyledOl>
      <li>WebブラウザでSteamを開きログインする。(Chrome推奨)</li>
      <li>
        次に自分のプロフィールページに飛び、右側のメニューの中からゲーム一覧を開く。
        (自分のプロフィールページのURLの末尾に<StyledCode>/games/?tab=all</StyledCode>を追加することでも開けます。)
      </li>
      <li>
        <StyledCode>F12</StyledCode>キー（または<StyledCode>Ctrl+Shift+I</StyledCode>
        ）でブラウザの開発者ツールを開き、開発者ツール内上部のタブ一覧から
        <StyledCode>Console</StyledCode>というタブを選択する。
      </li>
      <li>
        <a href="https://raw.githubusercontent.com/whatasoda/steam-thumbnail-collector/main/collect-game-data.js">
          このページ
        </a>
        にあるスクリプトをコピーして先程開いたコンソールに貼り付てEnter。
      </li>
      <li>
        自動的にゲームのデータがクリップボードにコピーされるので、それをこのテキストボックスに貼り付ける。(すでにあるものを上書きしてください。データはこのページを閉じても保存されますが、最新のデータを使いたいときは改めて同じ手順でデータを貼り付けてください。)
      </li>
    </StyledOl>
    {children}
  </div>
);

const Section3: React.FC = ({ children }) => (
  <div>
    <h2>3. カテゴリーと画像サイズを選んで生成&ダウンロード！</h2>
    {children}
  </div>
);

const Wrapper = styled.div`
  padding-bottom: 50%;
`;
