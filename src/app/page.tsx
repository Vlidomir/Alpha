import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getServerSession } from "@/lib/server-auth";

export default async function HomePage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-panel stack">
        <Sparkles size={34} color="#0f766e" aria-hidden="true" />
        <div className="stack">
          <h1>Alpha Image Editor</h1>
          <p>
            Local MVP for uploading two images, writing an edit prompt, and
            generating a mock result without real AI services.
          </p>
        </div>
        <div className="button-row">
          <Link className="button" href="/sign-up">
            Create account
          </Link>
          <Link className="button secondary" href="/sign-in">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
