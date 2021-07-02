import React, { useState } from 'react';
import styled from 'styled-components';
import { ImageFetchMode } from '../fetch-image';
import { RgGame } from '../types';
import { createThumbnailZip, FailedAppData, saveAs } from '../utils';
import ThumbnailTypeSelect from './ThumbNailTypeSelect';

interface ZipGeneratorProps {
  zipFilename: string;
  games: RgGame[];
}

export default function ZipGenerator({ games, zipFilename }: ZipGeneratorProps) {
  const [mode, setMode] = useState<ImageFetchMode>('library');
  const [fails, setFails] = useState<FailedAppData[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [zip, setZip] = useState<Blob | null>(null);
  const generateDisabled = games.length === 0 || isLoading;
  const saveDisabled = !zip || isLoading;

  return (
    <div>
      <ThumbnailTypeSelect
        disabled={generateDisabled}
        value={mode}
        onChange={(next) => {
          return setMode(next);
        }}
      />
      <StyledButton
        disabled={generateDisabled}
        onClick={() => {
          setLoading(true);
          createThumbnailZip(games, mode)
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
      <hr />
      {fails.map(({ appid, name, actualType, expectedType, failType, allImageUrls }) => (
        <div key={appid}>
          '{name}'は'{expectedType}'でのダウンロードを試みましたが
          {
            {
              FALLBACK_FOUND: `'${actualType}'をダウンロードしました。`,
              ALL_NOT_FOUND: 'ファイルが見つかりませんでした。',
            }[failType]
          }
          <img src={allImageUrls.capsule} alt="" />
          <img src={allImageUrls.header} alt="" />
          <img src={allImageUrls.library} alt="" />
          <hr />
        </div>
      ))}
    </div>
  );
}

const StyledButton = styled.button``;
