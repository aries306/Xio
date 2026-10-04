import React from "react";
import { ArrowUpRight, Check, Clock3, Lock, Sparkles } from "lucide-react";
import styles from "./CommandBlocks.module.css";

export function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className={styles.metric}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

export function SectionTitle({ index, title, note }: { index: string; title: string; note?: string }) {
  return <div className={styles.sectionTitle}><span>{index}</span><h2>{title}</h2>{note && <p>{note}</p>}</div>;
}

export function SignalCard({ eyebrow, title, body, tag, action = "Open" }: { eyebrow: string; title: string; body: string; tag: string; action?: string }) {
  return <article className={styles.card}><div className={styles.cardTop}><span>{eyebrow}</span><span className={styles.signal}><i /> {tag}</span></div><h3>{title}</h3><p>{body}</p><button>{action} <ArrowUpRight size={13} /></button></article>;
}

export function TimelineRow({ time, title, body, status }: { time: string; title: string; body: string; status: "active" | "done" | "queued" }) {
  return <article className={styles.timelineRow}><div className={styles.timelineMarker}>{status === "done" ? <Check size={13} /> : status === "active" ? <Sparkles size={13} /> : <Clock3 size={13} />}</div><div><span>{time}</span><h3>{title}</h3><p>{body}</p></div><b className={status}>{status}</b></article>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className={styles.empty}><Lock size={16} /><h3>{title}</h3><p>{body}</p></div>;
}
