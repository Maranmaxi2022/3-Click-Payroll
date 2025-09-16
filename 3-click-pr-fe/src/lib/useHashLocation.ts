import { useEffect, useState } from "react";

const getPath = () => window.location.hash.slice(1) || "/";

export function useHashLocation() {
  const [path, setPath] = useState<string>(getPath());

  useEffect(() => {
    const onChange = () => setPath(getPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = (to: string, opts?: { replace?: boolean }) => {
    const hash = to.startsWith("#") ? to.slice(1) : to;

    if (opts?.replace) {
      const url = `${window.location.pathname}${window.location.search}#${hash}`;
      window.history.replaceState(null, "", url);
      setPath(getPath()); // keep hook state in sync (replaceState doesn't fire hashchange)
    } else {
      window.location.hash = hash; // pushes a new history entry
    }
  };

  return { path, navigate };
}
