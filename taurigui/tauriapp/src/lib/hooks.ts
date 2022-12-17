import { useEffect, useRef, useState } from "react";

type Size = {
  width?: number;
  height?: number;
};

export const useContainerSize = () => {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [containerSize, setContainerSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!ref?.current) {
        return;
      }
      const container = ref.current;
      setContainerSize({
        width: container.clientWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { containerSize, containerRef: ref };
};
