import React, { useMemo } from 'react';
import styled from 'styled-components';
import { CategoryMap } from '../utils';

interface CategorySelectProps {
  value: string | null;
  allItemCount: number;
  categoryMap: CategoryMap;
  onChange: (category: string | null) => void;
}

export default function CategorySelect({ value, allItemCount, categoryMap, onChange }: CategorySelectProps) {
  const items = useMemo(() => {
    const acc: { value: string; label: string }[] = [{ value: '', label: `ALL - ${allItemCount} items` }];
    categoryMap.forEach(({ length: itemCount }, category) => {
      acc.push({
        value: category,
        label: `${category} - ${itemCount} items`,
      });
    });
    return acc;
  }, [allItemCount, categoryMap]);

  return (
    <StyledSelect
      value={value || ''}
      onChange={(event) => {
        onChange(event.currentTarget.value || null);
      }}
    >
      {items.map(({ value, label }) => (
        <option key={value} value={value} label={label} />
      ))}
    </StyledSelect>
  );
}

const StyledSelect = styled.select``;
