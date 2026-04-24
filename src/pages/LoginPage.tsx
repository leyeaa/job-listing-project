import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signInWithPassword, signUpWithPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname ?? "/";
  }, [location.state]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      toast.error(
        "Supabase env variables are missing. Check setup documentation.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCreatingAccount) {
        const { requiresEmailConfirmation } = await signUpWithPassword(
          email,
          password,
        );

        if (requiresEmailConfirmation) {
          toast.success(
            "Account created. Check your email to confirm your account before signing in.",
          );
          setIsCreatingAccount(false);
          return;
        }

        toast.success("Account created. You are now signed in.");
      } else {
        await signInWithPassword(email, password);
        toast.success("Welcome back.");
      }

      navigate(fromPath, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-indigo-50 min-h-[70vh]">
      <div className="container m-auto max-w-md py-20 px-6">
        <div className="bg-white px-6 py-8 shadow-md rounded-md border">
          <h1 className="text-3xl text-center font-semibold mb-6">
            {isCreatingAccount ? "Create Account" : "Sign In"}
          </h1>

          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800">
              Supabase is not configured. Add VITE_SUPABASE_URL and
              VITE_SUPABASE_ANON_KEY in your .env file.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-bold mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="border rounded w-full py-2 px-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 font-bold mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="border rounded w-full py-2 px-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Please wait..."
                : isCreatingAccount
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <button
            className="mt-4 w-full text-indigo-600 hover:text-indigo-800"
            onClick={() => setIsCreatingAccount((prev) => !prev)}
            type="button"
          >
            {isCreatingAccount
              ? "Already have an account? Sign in"
              : "Need an account? Create one"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
