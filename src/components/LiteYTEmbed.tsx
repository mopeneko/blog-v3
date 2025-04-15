'use client';

import { useEffect } from 'react';

export const LiteYTEmbed = () => {
  useEffect(() => {
    // @ts-expect-error no declaration file
    import('lite-youtube-embed/src/lite-yt-embed.js');
  }, []);
  return <></>;
};
