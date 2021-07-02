import React, { useState } from 'react';
import styled from 'styled-components';
import { ImageFetchMode } from '../fetch-image';
import { RgGame } from '../types';
import { createThumbnailZip, saveAs } from '../utils';
import ThumbnailTypeSelect from './ThumbNailTypeSelect';

interface ZipGeneratorProps {
  zipFilename: string;
  games: RgGame[];
}

export default function ZipGenerator({ games, zipFilename }: ZipGeneratorProps) {
  const [mode, setMode] = useState<ImageFetchMode>('library');
  const [isLoading, setLoading] = useState(false);
  const disabled = games.length === 0 || isLoading;

  return (
    <div>
      <ThumbnailTypeSelect
        disabled={disabled}
        value={mode}
        onChange={(next) => {
          return setMode(next);
        }}
      />
      <StyledButton
        disabled={disabled}
        onClick={() => {
          setLoading(true);
          createThumbnailZip(games, mode)
            .then((zip) => saveAs(zip, zipFilename))
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
        }}
      />
    </div>
  );
}

const StyledButton = styled.button``;
