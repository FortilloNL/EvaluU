import { useState, useEffect } from "react";

const MOBILE_QUERY = "(max-width: 639px)";
const TABLET_QUERY = "(max-width: 1023px)";

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [isTablet, setIsTablet] = useState(() => window.matchMedia(TABLET_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const tql = window.matchMedia(TABLET_QUERY);
    const onMobile = (e) => setIsMobile(e.matches);
    const onTablet = (e) => setIsTablet(e.matches);
    mql.addEventListener("change", onMobile);
    tql.addEventListener("change", onTablet);
    return () => {
      mql.removeEventListener("change", onMobile);
      tql.removeEventListener("change", onTablet);
    };
  }, []);

  return { isMobile, isTablet };
}
