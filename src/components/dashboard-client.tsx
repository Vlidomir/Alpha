"use client";

import { ImagePlus, LogOut, RefreshCw, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signOut } from "@/lib/auth-client";

type SerializedJob = {
  id: string;
  prompt: string;
  status: "pending" | "processing" | "completed" | "failed";
  error: string | null;
  createdAt: string;
  uploadedImages: Array<{
    id: string;
    originalName: string;
    url: string;
  }>;
  generatedImages: Array<{
    id: string;
    url: string;
  }>;
};

export function DashboardClient({ userName }: { userName: string }) {
  const router = useRouter();
  const [jobs, setJobs] = useState<SerializedJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadJobs() {
    setIsLoading(true);
    setError(null);
    const response = await fetch("/api/jobs", { cache: "no-store" });
    const payload = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to load jobs.");
      return;
    }

    setJobs(payload.jobs);
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll("images").filter((value) => value instanceof File);

    if (files.length !== 2) {
      setError("Choose exactly two images.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/jobs", {
      method: "POST",
      body: formData
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to create job.");
      if (payload.job) {
        setJobs((current) => [payload.job, ...current]);
      }
      return;
    }

    form.reset();
    setSuccess("Mock result generated.");
    setJobs((current) => [payload.job, ...current]);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  }

  const sortedJobs = useMemo(
    () =>
      [...jobs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [jobs]
  );

  return (
    <main className="dashboard-page">
      <div className="shell">
        <header className="dashboard-header">
          <div className="stack">
            <h1>Image jobs</h1>
            <p>Signed in as {userName}. Upload two images and write an edit prompt.</p>
          </div>
          <div className="button-row">
            <button className="button secondary" onClick={loadJobs} type="button">
              <RefreshCw size={18} aria-hidden="true" />
              Refresh
            </button>
            <button className="button ghost" onClick={handleSignOut} type="button">
              <LogOut size={18} aria-hidden="true" />
              Log out
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="panel">
            <h2>Create job</h2>
            <form className="stack" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="images">Images</label>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="file-input"
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="prompt">Prompt</label>
                <textarea
                  className="textarea"
                  id="prompt"
                  name="prompt"
                  placeholder="Blend the two product shots into a clean studio hero image."
                  required
                />
              </div>
              <button className="button" disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <RefreshCw size={18} aria-hidden="true" />
                ) : (
                  <Wand2 size={18} aria-hidden="true" />
                )}
                {isSubmitting ? "Generating..." : "Generate mock result"}
              </button>
            </form>
            {error ? <p className="message error">{error}</p> : null}
            {success ? <p className="message success">{success}</p> : null}
          </section>

          <section className="jobs">
            <h2>Jobs</h2>
            {isLoading ? <div className="empty-state">Loading jobs...</div> : null}
            {!isLoading && sortedJobs.length === 0 ? (
              <div className="empty-state">
                <ImagePlus size={28} aria-hidden="true" />
                <p>No jobs yet.</p>
              </div>
            ) : null}
            {sortedJobs.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-topline">
                  <p className="job-prompt">{job.prompt}</p>
                  <span className={`badge ${job.status}`}>{job.status}</span>
                </div>
                {job.error ? <p className="message error">{job.error}</p> : null}
                <div className="image-grid">
                  {job.uploadedImages.map((image) => (
                    <div className="image-frame" key={image.id}>
                      <img alt={image.originalName} src={image.url} />
                    </div>
                  ))}
                </div>
                {job.generatedImages[0] ? (
                  <div className="result-frame">
                    <img alt="Generated mock result" src={job.generatedImages[0].url} />
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
