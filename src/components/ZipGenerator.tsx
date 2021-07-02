import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchModeLabels, ImageFetchMode } from '../fetch-image';
import { RgGame } from '../types';
import { createThumbnailZip, FailedAppData, ProgressInfo, saveAs } from '../utils';

interface ZipGeneratorProps {
  fetchMode: ImageFetchMode;
  zipFilename: string;
  games: RgGame[];
}

export default function ZipGenerator({ fetchMode, games, zipFilename }: ZipGeneratorProps) {
  const [fails, setFails] = useState<FailedAppData[]>([]);
  const [progress, setProgress] = useState<ProgressInfo>({ image: 0, zip: 0 });
  const [isLoading, setLoading] = useState(false);
  const [zip, setZip] = useState<Blob | null>(null);
  const generateDisabled = games.length === 0 || isLoading;
  const saveDisabled = !zip || isLoading;

  return (
    <div>
      <StyledButton
        disabled={generateDisabled}
        onClick={() => {
          setLoading(true);
          createThumbnailZip(games, fetchMode, setProgress)
            .then(({ zipBlob, fails }) => {
              setZip(zipBlob);
              setFails(fails);
            })
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
        }}
        children="Generate"
      />
      <StyledButton
        disabled={saveDisabled}
        onClick={() => {
          setLoading(true);
          saveAs(zip!, zipFilename)
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
        }}
        children="Download"
      />
      <br />
      画像読み込み{progress.image}%完了
      <br />
      ZIPファイル生成{progress.zip}%完了
      <hr />
      {fails.map(({ appid, name, filename, actualType, expectedType, failType, allImageUrls }) => {
        const expectedTypeLabel = fetchModeLabels[expectedType];
        const actualTypeLabel = actualType && fetchModeLabels[actualType];
        return (
          <div key={appid}>
            '{name}'は'{expectedTypeLabel}'でのダウンロードを試みましたが
            {
              {
                FALLBACK_FOUND: `ファイルが見つからなかったため代わりに'${actualTypeLabel}'をダウンロードしました。`,
                ALL_NOT_FOUND: 'ファイルが見つかりませんでした。',
              }[failType]
            }
            必要に応じて下から別サイズの画像をダウンロードしてください。(壊れている画像もダウンロードできますが虚無がダウンロードされます。)
            <br />
            {renderAlternativeImage(filename, allImageUrls.capsule)}
            {renderAlternativeImage(filename, allImageUrls.header)}
            {renderAlternativeImage(filename, allImageUrls.library)}
            <hr />
          </div>
        );
      })}
    </div>
  );
}

const renderAlternativeImage = (filename: string, url: string) => {
  return (
    <a href={filename} download={filename}>
      <img src={url} style={{ width: '220px' }} />
    </a>
  );
};

const StyledButton = styled.button``;
