import { useEffect, useState } from 'react';

export function useElapsedTime(startedAt: string | undefined): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    function update() {
      setElapsed(Math.max(0, Math.floor((Date.now() - new Date(startedAt!).getTime()) / 1000)));
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return elapsed;
}
