'use client';

import { useEffect } from 'react';

export const LiteYTEmbed = () => {
  useEffect(() => {
    // @ts-expect-error no declaration file
    // oxlint-disable-next-line typescript/no-floating-promises
    import('lite-youtube-embed/src/lite-yt-embed.js');
  }, []);
  // biome-ignore lint/complexity/noUselessFragments: Should be a component
  return <></>;
};
