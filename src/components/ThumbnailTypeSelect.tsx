import React from 'react';
import styled from 'styled-components';
import { ImageFetchMode } from '../fetch-image';

const items: { value: ImageFetchMode; label: string }[] = [
  { value: 'capsule', label: '1. 一番小さい 横長' },
  { value: 'header', label: '2. 少し大きめ 横長' },
  { value: 'library', label: '3. 大きめ 縦長' },
  { value: 'library-fallback', label: '3 → 2 → 1 の順で画像があるものを使う' },
  { value: 'header-fallback', label: '2 → 1 の順で画像があるものを使う' },
];

interface ThumbnailTypeSelectProps {
  disabled?: boolean;
  value: ImageFetchMode;
  onChange: (mode: ImageFetchMode) => void;
}

export default function ThumbnailTypeSelect({ disabled, value, onChange }: ThumbnailTypeSelectProps) {
  return (
    <StyledLabel>
      画像サイズ:{' '}
      <select
        disabled={disabled}
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value as ImageFetchMode);
        }}
      >
        {items.map(({ value, label }) => (
          <option key={value} value={value} label={label} />
        ))}
      </select>
    </StyledLabel>
  );
}

const StyledLabel = styled.label`
  display: block;
`;
