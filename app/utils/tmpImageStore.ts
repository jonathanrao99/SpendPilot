import React from 'react';

let tmpImage: string | null = null;

export const setTmpImage = (img: string) => {
  tmpImage = img;
};

export const getTmpImage = (): string | null => tmpImage;

export default function TmpImageStore() {
  return null;
} 