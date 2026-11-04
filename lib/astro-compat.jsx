import { useEffect, useState } from "react";
import { optimizeCloudinaryImage } from "./image-url.mjs";

export function Link({ href, children, ...props }) {
  return <a href={href} {...props}>{children}</a>;
}

export function Image({ fill, priority, transformWidth, ...props }) {
  const style = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...props.style }
    : props.style;
  return (
    <img
      {...props}
      src={optimizeCloudinaryImage(props.src, transformWidth)}
      style={style}
      loading={priority ? "eager" : props.loading}
      fetchPriority={priority ? "high" : props.fetchPriority}
    />
  );
}

export function usePathname() {
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    updatePathname();
    window.addEventListener("popstate", updatePathname);
    return () => window.removeEventListener("popstate", updatePathname);
  }, []);

  return pathname;
}

export function useRouter() {
  return {
    push(path) {
      window.location.assign(path);
    },
    refresh() {
      window.location.reload();
    },
  };
}

export async function signOut({ callbackUrl = "/login" } = {}) {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.assign(callbackUrl);
}
