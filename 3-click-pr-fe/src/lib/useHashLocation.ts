import { useEffect, useState } from "react";

const getPath = () => window.location.hash.slice(1) || "/";

export function useHashLocation() {
  const [path, setPath] = useState<string>(getPath());
  useEffect(() => {
    const onChange = () => setPath(getPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = (to: string) => {
    if (!to.startsWith("#")) window.location.hash = to;
    else window.location.hash = to.slice(1);
  };
  return { path, navigate };
}
