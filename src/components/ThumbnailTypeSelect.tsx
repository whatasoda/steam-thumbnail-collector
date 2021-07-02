import React from 'react';
import styled from 'styled-components';
import { fetchModeLabels, ImageFetchMode } from '../fetch-image';

const items: { value: ImageFetchMode; label: string }[] = [
  { value: 'capsule', label: fetchModeLabels['capsule'] },
  { value: 'header', label: fetchModeLabels['header'] },
  { value: 'library', label: fetchModeLabels['library'] },
  { value: 'library-fallback', label: fetchModeLabels['library-fallback'] },
  { value: 'header-fallback', label: fetchModeLabels['header-fallback'] },
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
