// app/template.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";

export default function Template({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <>{children}</>;
}
