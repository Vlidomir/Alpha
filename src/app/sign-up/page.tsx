"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await signUp.email({
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password: String(formData.get("password"))
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? "Unable to create account.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <section className="auth-panel stack">
        <div className="stack">
          <h1>Create account</h1>
          <p>Registration is backed by Better Auth email/password.</p>
        </div>
        {error ? <p className="message error">{error}</p> : null}
        <form className="stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input className="input" id="name" name="name" required />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              minLength={8}
              name="password"
              type="password"
              required
            />
          </div>
          <button className="button" disabled={isSubmitting} type="submit">
            <UserPlus size={18} aria-hidden="true" />
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="muted">
          Already registered? <Link href="/sign-in">Sign in</Link>.
        </p>
      </section>
    </main>
  );
}
