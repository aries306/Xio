import React from "react";
import { ArrowUpRight, CircleDot, LockKeyhole, Mic2 } from "lucide-react";
import { Button } from "./Button";
import styles from "./SiteShell.module.css";

type View = "now" | "next" | "projects" | "memory" | "intelligence" | "agents" | "learning" | "effect";

const nav: Array<{ key: View; label: string; href: string }> = [
  { key: "now", label: "Now", href: "/now" },
  { key: "next", label: "Next", href: "/next" },
  { key: "projects", label: "Projects", href: "/projects" },
  { key: "memory", label: "Memory", href: "/memory" },
  { key: "intelligence", label: "Intelligence", href: "/intelligence" },
  { key: "agents", label: "Agents", href: "/agents" },
  { key: "learning", label: "Learning", href: "/learning" },
  { key: "effect", label: "Effect", href: "/effect" },
];

export function SiteShell({ active, children, eyebrow, title, description }: { active: View; children: React.ReactNode; eyebrow: string; title: React.ReactNode; description: string }) {
  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/" aria-label="Zuna home">
          <span className={styles.mark}><span /></span>
          <span><strong>ZUNA</strong><small>ZUNOVERSE</small></span>
        </a>
        <nav className={styles.nav} aria-label="Command center">
          {nav.map((item) => <a key={item.key} className={active === item.key ? styles.active : ""} href={item.href}>{item.label}</a>)}
        </nav>
        <div className={styles.actions}>
          <span className={styles.private}><LockKeyhole size={13} /> Private by design</span>
          <Button variant="outline" size="sm" onClick={() => { window.location.href = "/intelligence"; }}>Talk to her <Mic2 size={14} /></Button>
        </div>
      </header>
      <section className={styles.pageHead}>
        <div>
          <div className={styles.eyebrow}><CircleDot size={9} /> {eyebrow}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className={styles.pageIndex}>ZY / 0{nav.findIndex((item) => item.key === active) + 1}</div>
      </section>
      <div className={styles.content}>{children}</div>
      <footer className={styles.footer}>
        <a className={styles.brand} href="/"><span className={styles.mark}><span /></span><span><strong>ZUNA</strong><small>ZUNOVERSE</small></span></a>
        <span>Zuna — a universe of possibility, with Vea beside you.</span>
        <a href="/intelligence">Meet Vea <ArrowUpRight size={13} /></a>
      </footer>
    </main>
  );
}
