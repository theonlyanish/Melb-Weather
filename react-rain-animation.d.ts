declare module 'react-rain-animation' {
  import { FC } from 'react';

  interface ReactRainProps {
    numDrops?: number;
  }

  const ReactRain: FC<ReactRainProps>;
  export default ReactRain;
}

