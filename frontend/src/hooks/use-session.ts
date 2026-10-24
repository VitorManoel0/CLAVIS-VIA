import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clearToken, getCurrentUser } from "@/lib/auth";

/** Tracks the backend JWT session in the browser. */
export function useSession() {
  const queryClient = useQueryClient();
  const { data: user = null, isPending: loading } = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  function signOut() {
    clearToken();
    queryClient.removeQueries({ queryKey: ["auth", "current-user"] });
  }

  return { user, session: user, loading, signOut };
}
