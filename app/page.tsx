import { strings } from "@/lib/strings";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-accent">{strings.app.name}</h1>
      <p className="text-lg text-text">{strings.app.description}</p>
      <p className="text-text-muted">{strings.app.tagline}</p>
    </main>
  );
}
