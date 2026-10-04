"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, BrainCircuit, Check, ChevronRight, CircleDot, FileText, GitBranch, LockKeyhole, Search, Sparkles } from "lucide-react";
import styles from "./IntelligenceWorkspace.module.css";

type Fabric={workspace:any;contexts:any[];memories:any[];evidence:any[];counts:Record<string,number>};
const fallback=[["E-024","Research","Contextual memory architecture","Dormant memories retain scope and return for re-evaluation when relevant context returns.",94],["E-019","Decision","Memory stays distinct from belief","Memory, belief, pattern, insight, and recommendation remain separate with provenance and lifecycle.",91],["E-011","Observation","Re-evaluation is first-class","A recalled memory is checked against its original scope before influencing a recommendation.",88]];

export function IntelligenceWorkspace(){
 const [fabric,setFabric]=useState<Fabric>({workspace:null,contexts:[],memories:[],evidence:[],counts:{}});
 const [selected,setSelected]=useState("E-024"),[verified,setVerified]=useState(false),[query,setQuery]=useState(""),[reply,setReply]=useState(""),[busy,setBusy]=useState(false),[status,setStatus]=useState("Loading fabric…");
 useEffect(()=>{fetch("/api/context").then(r=>r.ok?r.json():Promise.reject()).then(d=>{setFabric(d);setStatus(d.workspace?"Fabric connected":"Fabric offline")}).catch(()=>setStatus("Fabric offline"))},[]);
 const current=fallback.find(x=>x[0]===selected)??fallback[0];
 async function send(e:FormEvent){e.preventDefault();const text=query.trim();if(!text||busy)return;setBusy(true);try{const r=await fetch("/api/intelligence-chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:text}]})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Vea is unavailable.");setReply(d.reply);setQuery("");if(d.fabric)setStatus(`Fabric connected · ${d.fabric.memories} memories · ${d.fabric.evidence} evidence`)}catch(e){setReply(e instanceof Error?e.message:"Vea is unavailable.")}finally{setBusy(false)}}
 const active=fabric.memories.filter(m=>m.lifecycle==="active").length;
 return <main className={styles.page}>
  <header className={styles.header}><div className={styles.brand}><span className={styles.mark}><span/></span><div><strong>ZUNOVERSE</strong><small>ZUNA</small></div></div><div className={styles.headerCenter}><span className={styles.live}><CircleDot size={8}/> VEA ACTIVE</span><span>{status}</span></div><div className={styles.headerRight}><span><LockKeyhole size={13}/> Private by design</span><a href="/now">Command center <ArrowUpRight size={13}/></a></div></header>
  <section className={styles.intro}><div><div className={styles.eyebrow}><BrainCircuit size={12}/> VEA / VISUAL INTELLIGENCE</div><h1>See how understanding <em>forms.</em></h1><p>Vea works inside Zuna. Evidence stays visible, context stays scoped, and Shadow holds what we do not yet understand.</p></div><div className={styles.introStat}><strong>{active}</strong><span>active memories</span></div></section>
  <section className={styles.workspace}>
   <aside className={styles.contextPanel}><div className={styles.panelLabel}>ACTIVE CONTEXT</div><div className={styles.contextStack}>{["Current product build","Memory Fabric","Zuna universe","Active decisions"].map((c,i)=><button key={c} className={i===0?styles.contextActive:""}><span>{"0"+(i+1)}</span>{c}<ChevronRight size={13}/></button>)}</div><div className={styles.contextRule}/><div className={styles.panelLabel}>WHAT IS IN SCOPE</div><div className={styles.scope}><span>Contexts</span><b>{fabric.counts.contexts||0}</b><span>Memories</span><b>{fabric.counts.memories||0}</b><span>Evidence</span><b>{fabric.counts.evidence||0}</b><span>Shadow</span><b>—</b></div><div className={styles.contextNote}><Sparkles size={14}/><p>Dormant memory cannot influence current reasoning until its original scope is re-evaluated.</p></div></aside>
   <div className={styles.canvas}><div className={styles.canvasTop}><div><span className={styles.panelLabel}>SIGNAL MAP</span><h2>Source <span>→</span> context <span>→</span> insight</h2></div><span className={styles.trace}>ZUNA / VEA / SHADOW</span></div>
    <div className={styles.map}><div className={styles.gridGlow}/><div className={styles.connector+" "+styles.connectorA}/><div className={styles.connector+" "+styles.connectorB}/>
     <button className={styles.node+" "+styles.nodeSource} onClick={()=>setSelected("E-024")}><FileText size={18}/><span>Research</span><strong>{fabric.counts.evidence||24} sources</strong></button>
     <button className={styles.node+" "+styles.nodeContext} onClick={()=>setSelected("E-019")}><GitBranch size={18}/><span>Context</span><strong>{fabric.counts.contexts||7} linked contexts</strong></button>
     <button className={styles.node+" "+styles.nodeInsight} onClick={()=>setSelected("E-011")}><Sparkles size={18}/><span>Insight</span><strong>Vea-supported patterns</strong></button>
     <div className={styles.orb}><div/><span>VEA</span></div><div className={styles.mapCaption}><span>Every connection preserves provenance.</span><span>Shadow marks uncertainty.</span></div>
    </div>
    <form className={styles.searchBox} onSubmit={send}><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={busy?"Vea is thinking…":"Ask Vea about this context…"}/><kbd>{busy?"…":"↵"}</kbd></form>
    {reply&&<div className={styles.replyBox}><div className={styles.replyLabel}>VEA / RESPONSE</div><p>{reply}</p></div>}
   </div>
   <aside className={styles.detailPanel}><div className={styles.detailHead}><div><span className={styles.panelLabel}>SELECTED EVIDENCE</span><strong>{current[0]}</strong></div><span className={styles.confidence}>{current[4]}%</span></div><div className={styles.detailType}>{current[1]}</div><h3>{current[2]}</h3><p>{current[3]}</p><div className={styles.source}><FileText size={13}/><div><small>SOURCE</small><span>Memory Fabric</span></div></div><div className={styles.detailRule}/><div className={styles.verification}><div><span className={styles.panelLabel}>HUMAN VERIFICATION</span><p>Does this evidence still hold in the current context?</p></div><button type="button" className={verified?styles.verified:""} onClick={()=>setVerified(!verified)}>{verified?<><Check size={13}/> Verified</>:"Confirm"}</button></div><div className={styles.provenance}><span>Provenance</span><b>Preserved</b><span>Lifecycle</span><b>Explicit</b><span>Scope</span><b>Zuna</b></div></aside>
  </section>
 </main>;
}
