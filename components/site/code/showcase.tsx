import { Heading } from "@/components/site/atoms/heading";
import { Reveal } from "@/components/site/atoms/reveal";

interface CodeShowcaseProps {
  eyebrow: string;
  heading: string;
  intro: string;
}

const K = ({ children }: { children: React.ReactNode }) => (
  <span className="text-signal">{children}</span>
);
const M = ({ children }: { children: React.ReactNode }) => (
  <span className="text-fg-subtle">{children}</span>
);
const C = ({ children }: { children: React.ReactNode }) => (
  <span className="text-muted-foreground">{children}</span>
);

const LINES: React.ReactNode[] = [
  <C key="c">// sync github &rarr; supabase, every night</C>,
  <>
    <K>export const</K> flow <M>=</M> defineFlow<M>(&#123;</M>
  </>,
  <>
    {"  "}on<M>:</M> schedule<M>(</M>
    <span className="text-foreground">&quot;0 3 * * *&quot;</span>
    <M>),</M>
  </>,
  <>
    {"  "}run<M>:</M> <K>async</K> <M>(</M>ctx<M>) =&gt; {"{"}</M>
  </>,
  <>
    {"    "}
    <K>const</K> data <M>=</M> <K>await</K> github<M>.</M>sync<M>(</M>ctx<M>.</M>
    repos<M>)</M>
  </>,
  <>
    {"    "}
    <K>await</K> supabase<M>.</M>upsert<M>(</M>
    <span className="text-foreground">&quot;projects&quot;</span>
    <M>,</M> data<M>)</M>
  </>,
  <>
    {"    "}
    <K>return</K> ctx<M>.</M>ok<M>(&#123;</M> synced<M>:</M> data<M>.</M>length{" "}
    <M>&#125;)</M>
  </>,
  <>
    {"  "}
    <M>&#125;,</M>
  </>,
  <M key="close">&#125;)</M>,
];

export function CodeShowcase({ eyebrow, heading, intro }: CodeShowcaseProps) {
  return (
    <section className="section-divider-b relative overflow-hidden">
      <div
        aria-hidden="true"
        className="glow-radial-soft pointer-events-none absolute inset-0 -z-10"
      />
      <div className="container-page section-y grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <Heading
          level="h2"
          eyebrow={eyebrow}
          title={heading}
          subtitle={intro}
        />

        <Reveal className="min-w-0">
          <div className="trace-border surface-glow overflow-hidden rounded-[var(--radius-surface)] border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-[1px] bg-accent-blue"
              />
              <span className="text-eyebrow">flow.ts</span>
            </div>

            <pre className="overflow-x-auto p-5 font-mono text-[0.8125rem] leading-[1.7]">
              <code>
                {LINES.map((line, i) => (
                  <span key={i} className="grid grid-cols-[1.75rem_1fr] gap-3">
                    <span
                      aria-hidden="true"
                      className="select-none text-right text-muted-foreground tabular-nums"
                    >
                      {i + 1}
                    </span>
                    <span className="text-foreground">{line}</span>
                  </span>
                ))}
              </code>
            </pre>

            <div className="flex items-center gap-3 border-t border-border px-5 py-3 font-mono text-[0.75rem]">
              <span className="text-signal">$</span>
              <span className="text-foreground">
                ship --prod
                <span aria-hidden="true" className="text-signal">
                  ▍
                </span>
              </span>
              <span className="text-fg-subtle">·</span>
              <span className="text-muted-foreground">types · lint · build</span>
              <span className="ml-auto text-signal">live · 1.2s</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
