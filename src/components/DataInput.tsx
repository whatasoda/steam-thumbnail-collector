import React, { useMemo } from 'react';
import styled from 'styled-components';

interface DataInputProps<T extends {}> {
  defaultValue?: T;
  onData: (data: T) => void;
}

export default function createDataInput<T extends {}>(adapter: {
  parse: (raw: string) => T | null;
  stringify: (data: T) => string;
}) {
  const { parse, stringify } = adapter;
  return function DataInput({ onData, defaultValue }: DataInputProps<T>) {
    const defaultValueString = useMemo(() => {
      try {
        return defaultValue ? stringify(defaultValue) : undefined;
      } catch (e) {
        return undefined;
      }
    }, []);
    return (
      <StyledTextarea
        defaultValue={defaultValueString}
        onChange={(event) => {
          try {
            const data = parse(event.currentTarget.value);
            if (data) {
              onData(data);
            }
          } catch (e) {} // eslint-disable-line no-empty
        }}
      />
    );
  };
}

const StyledTextarea = styled.textarea`
  width: 400px;
  height: 300px;
`;
