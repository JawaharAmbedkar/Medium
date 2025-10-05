// hooks/useCurrentUser.ts
import { useEffect, useState } from "react";
import axiosPrivate from "./Middleware";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosPrivate.get("/api/v1/user/me");
        setUser(res.data.user); // ✅ unwrap here
      } catch (err) {
        console.error("Error fetching /me", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}
