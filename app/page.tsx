"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Handle Supabase Google OAuth redirect — reads access_token from URL hash
function useGoogleAuthRedirect(setUser: (u: any) => void) {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;
    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");
    if (!accessToken) return;

    // Fetch user info from Supabase using the access token
    fetch("https://pwkfsjhursmfftkppuwa.supabase.co/auth/v1/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3a2Zzamh1cnNtZmZ0a3BwdXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NjI0MDAsImV4cCI6MjA1OTQzODQwMH0.abc",
      },
    })
      .then(r => r.json())
      .then(data => {
        const email = data.email || "user@gmail.com";
        const name  = data.user_metadata?.full_name || data.user_metadata?.name || email.split("@")[0];
        setUser({ name, email });
        window.location.hash = "";
      })
      .catch(() => {
        // Fallback: just log them in with email from token payload
        try {
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          const email   = payload.email || "user@gmail.com";
          setUser({ name: email.split("@")[0], email });
          window.location.hash = "";
        } catch {}
      });
  }, []);
}

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────

const C = {
  navy:     "#0f172a",
  navyMid:  "#1e293b",
  blue:     "#3b82f6",
  blueDark: "#2563eb",
  blueLight:"#eff6ff",
  bluePale: "#dbeafe",
  text:     "#0f172a",
  textMid:  "#475569",
  textMute: "#94a3b8",
  border:   "#e2e8f0",
  bg:       "#f8fafc",
  white:    "#ffffff",
  green:    "#22c55e",
  red:      "#ef4444",
};

// ── LOGO MARK ─────────────────────────────────────────────────────────────────

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4 L16 13"       stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M16 19 L16 28"      stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M5.5 10 L13.2 14.5"   stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M18.8 17.5 L26.5 22"  stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M5.5 22 L13.2 17.5"   stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M18.8 14.5 L26.5 10"  stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="16" cy="16"   r="3.5" fill="white"/>
      <circle cx="16" cy="4"    r="2"   fill="white" opacity="0.9"/>
      <circle cx="16" cy="28"   r="2"   fill="white" opacity="0.9"/>
      <circle cx="5"  cy="9.5"  r="2"   fill="white" opacity="0.9"/>
      <circle cx="27" cy="9.5"  r="2"   fill="white" opacity="0.9"/>
      <circle cx="5"  cy="22.5" r="2"   fill="white" opacity="0.9"/>
      <circle cx="27" cy="22.5" r="2"   fill="white" opacity="0.9"/>
    </svg>
  );
}

// ── DATA ───────────────────────────────────────────────────────────────────────

const PATHS = [
  { id:"tools",      icon:"🛠️", label:"AI Tools",   topics:[
    {id:"chatgpt",    name:"ChatGPT",           sub:"OpenAI's chatbot"},
    {id:"claude",     name:"Claude",            sub:"Anthropic assistant"},
    {id:"gemini",     name:"Gemini",            sub:"Google's AI"},
    {id:"midjourney", name:"Midjourney",        sub:"AI image creation"},
    {id:"perplexity", name:"Perplexity",        sub:"AI-powered search"},
    {id:"dalle",      name:"DALL-E",            sub:"Text-to-image"},
    {id:"canva",      name:"Canva AI",          sub:"Design with AI"},
    {id:"runway",     name:"Runway",            sub:"AI video creation"},
    {id:"elevenlabs", name:"ElevenLabs",        sub:"AI voice cloning"},
    {id:"suno",       name:"Suno AI",           sub:"AI music creation"},
  ]},
  { id:"agents",     icon:"🤖", label:"AI Agents",  topics:[
    {id:"what-agent", name:"What is an Agent?", sub:"Basics explained"},
    {id:"custom-gpt", name:"Custom GPTs",        sub:"Build your own bot"},
    {id:"claude-proj",name:"Claude Projects",    sub:"Persistent memory"},
    {id:"no-code",    name:"No-Code Agents",     sub:"No coding needed"},
    {id:"multi-agent",name:"Multi-Agent Systems",sub:"Agents working together"},
    {id:"tools-use",  name:"Giving Agents Tools",sub:"Web, email, files"},
  ]},
  { id:"automation", icon:"⚡", label:"Automation",  topics:[
    {id:"zapier",      name:"Zapier + AI",        sub:"Connect your apps"},
    {id:"make",        name:"Make.com",            sub:"Visual workflows"},
    {id:"email-auto",  name:"Email Automation",    sub:"AI in your inbox"},
    {id:"social-auto", name:"Social Media AI",     sub:"Auto-posting"},
    {id:"biz-workflow",name:"Business Workflows",  sub:"End-to-end systems"},
  ]},
  { id:"skills",     icon:"🧠", label:"AI Skills",   topics:[
    {id:"prompting",  name:"Prompt Engineering",  sub:"Get better results"},
    {id:"ai-writing", name:"AI Writing",           sub:"Blogs, emails, copy"},
    {id:"ai-research",name:"AI Research",          sub:"Find anything fast"},
    {id:"ai-images",  name:"AI Images",            sub:"Create with words"},
    {id:"ai-data",    name:"Data Analysis",        sub:"AI spreadsheets"},
  ]},
  { id:"agentic",    icon:"🚀", label:"Agentic AI",  topics:[
    {id:"what-agentic",name:"What is Agentic AI?", sub:"Next frontier"},
    {id:"bot-vs-agent",name:"Chatbots vs Agents",  sub:"Key differences"},
    {id:"plan-agents", name:"Agents That Plan",     sub:"Goal to action"},
    {id:"build-agent", name:"Build Your Agent",     sub:"Step-by-step guide"},
  ]},
];

const QUOTES = [
  {t:"The best way to predict the future is to create it.",        by:"Peter Drucker"},
  {t:"Intelligence is the ability to adapt to change.",            by:"Stephen Hawking"},
  {t:"Learning never exhausts the mind.",                          by:"Leonardo da Vinci"},
  {t:"AI is the new electricity.",                                 by:"Andrew Ng"},
  {t:"Those who cannot learn and relearn will be left behind.",    by:"Alvin Toffler"},
];

const SYS_PROMPT = `You are a brilliant, warm AI tutor inside "fluentAI". You teach adults 35-65+ who have ZERO tech background. Be their most patient, enthusiastic friend who happens to know everything about AI.

CRITICAL FORMATTING — the app breaks if you ignore this:
- NEVER use #, ##, **, __, or any markdown. Not one asterisk.
- NEVER use bullet points starting with - or *
- Write ONLY in plain conversational sentences.
- Separate paragraphs with a blank line.

HOW TO TEACH:
- Open with a vivid real-world story or scene that puts the learner right in the moment.
- Use one surprising, funny, or deeply relatable analogy.
- Teach ONE idea only. Never overwhelm.
- Give them ONE specific thing to try right now — doable in 60 seconds.
- Share one wow-fact they will tell someone about today.
- End EVERY message with a quiz in this EXACT format with nothing after QUIZ_END:

QUIZ_START
[Question — make it feel like a fun game show, not a test]
OPT_A:[Option A]
OPT_B:[Option B]
OPT_C:[Option C]
OPT_D:[Option D]
CORRECT:[A or B or C or D]
QUIZ_END

When they answer: celebrate loudly if correct. Be warm and safe if wrong. Then ask what they want to do next.`;

// ── HELPERS ───────────────────────────────────────────────────────────────────

const callClaude = async (messages: {role:string; content:string}[]) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYS_PROMPT, messages }),
  });
  const d = await res.json();
  return d.content?.[0]?.text || "Something went wrong. Please try again!";
};

const parseQuiz = (text: string) => {
  const match = text.match(/QUIZ_START([\s\S]*?)QUIZ_END/);
  if (!match) return { clean: text, quiz: null };
  const block = match[1];
  const lines   = block.split("\n").map((l:string) => l.trim()).filter(Boolean);
  const question = lines[0] || "";
  const a = block.match(/OPT_A:(.+)/)?.[1]?.trim();
  const b = block.match(/OPT_B:(.+)/)?.[1]?.trim();
  const c = block.match(/OPT_C:(.+)/)?.[1]?.trim();
  const d = block.match(/OPT_D:(.+)/)?.[1]?.trim();
  const correct = block.match(/CORRECT:\s*([ABCD])/)?.[1];
  const clean = text.replace(/QUIZ_START[\s\S]*?QUIZ_END/, "").trim();
  if (!question||!a||!b||!c||!d||!correct) return { clean: text, quiz: null };
  return { clean, quiz: { question, options: {A:a,B:b,C:c,D:d}, correct } };
};

const cleanMd = (t: string) =>
  t.replace(/#{1,6}\s?/g,"").replace(/\*\*/g,"").replace(/\*/g,"").replace(/__/g,"").trim();

// ── QUIZ WIDGET ───────────────────────────────────────────────────────────────

function QuizWidget({ quiz, onAnswer }: { quiz:any; onAnswer:(l:string,r:boolean)=>void }) {
  const [selected, setSelected] = useState<string|null>(null);
  const [revealed, setRevealed] = useState(false);

  const pick = (letter: string) => {
    if (revealed) return;
    setSelected(letter);
    setRevealed(true);
    setTimeout(() => onAnswer(letter, letter === quiz.correct), 800);
  };

  const getColors = (letter: string) => {
    if (!revealed) return { bg:C.white, border:C.border, text:C.text, dotBg:C.blueLight, dotText:C.blue };
    if (letter===quiz.correct)  return { bg:"#f0fdf4", border:C.green, text:"#166534", dotBg:C.green, dotText:C.white };
    if (letter===selected)      return { bg:"#fef2f2", border:C.red,   text:"#991b1b", dotBg:C.red,   dotText:C.white };
    return { bg:C.bg, border:C.border, text:C.textMute, dotBg:"#f1f5f9", dotText:C.textMute };
  };

  return (
    <div style={{ marginTop:16, background:C.blueLight, borderRadius:18, padding:"20px", border:`1.5px solid ${C.bluePale}` }}>
      <p style={{ fontSize:11, fontWeight:800, color:C.blue, letterSpacing:"1px", margin:"0 0 10px", textTransform:"uppercase" }}>
        Quick Quiz
      </p>
      <p style={{ fontSize:15, fontWeight:600, color:C.text, lineHeight:1.6, margin:"0 0 16px" }}>{quiz.question}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {Object.entries(quiz.options).map(([letter, text]: [string, any]) => {
          const s = getColors(letter);
          return (
            <button key={letter} onClick={()=>pick(letter)} disabled={revealed}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderRadius:12,
                border:`1.5px solid ${s.border}`, background:s.bg,
                cursor:revealed?"default":"pointer", textAlign:"left", transition:"all .2s", width:"100%" }}>
              <span style={{ width:28, height:28, borderRadius:"50%", background:s.dotBg,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:800, fontSize:12, color:s.dotText, flexShrink:0 }}>
                {!revealed ? letter : letter===quiz.correct ? "✓" : letter===selected ? "✗" : letter}
              </span>
              <span style={{ fontSize:14, color:s.text, lineHeight:1.5 }}>{text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── CHAT MESSAGE ──────────────────────────────────────────────────────────────

function ChatMessage({ msg, onAnswer }: { msg:any; onAnswer:(id:number,l:string,r:boolean,q:any)=>void }) {
  const { clean, quiz } = parseQuiz(msg.content);
  const text = cleanMd(clean);
  const paragraphs = text.split(/\n\n+/).filter((p:string) => p.trim());

  if (msg.role==="user") return (
    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
      <div style={{ maxWidth:"76%", padding:"13px 17px", borderRadius:"20px 20px 5px 20px",
        background:C.navy, color:C.white, fontSize:15, lineHeight:1.7 }}>
        {msg.content}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", gap:12, marginBottom:24, alignItems:"flex-start" }}>
      <div style={{ width:34, height:34, borderRadius:10,
        background:`linear-gradient(135deg,${C.blue},${C.blueDark})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0, marginTop:2 }}><LogoMark size={20}/></div>
      <div style={{ flex:1 }}>
        <div style={{ background:C.white, borderRadius:"5px 20px 20px 20px", padding:"16px 18px",
          boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
          {paragraphs.map((p:string, i:number) => (
            <p key={i} style={{ fontSize:15, color:C.text, lineHeight:1.85, margin:i===0?"0":"12px 0 0" }}>
              {p.replace(/\n/g," ")}
            </p>
          ))}
        </div>
        {quiz && !msg.answered && <QuizWidget quiz={quiz} onAnswer={(l,r)=>onAnswer(msg.id,l,r,quiz)}/>}
        {quiz && msg.answered && (
          <div style={{ marginTop:10, padding:"11px 16px", borderRadius:12,
            background:msg.answeredRight?"#f0fdf4":"#fef2f2",
            border:`1.5px solid ${msg.answeredRight?"#86efac":"#fca5a5"}` }}>
            <p style={{ fontSize:14, color:msg.answeredRight?"#166534":"#991b1b", margin:0, fontWeight:600 }}>
              {msg.answeredRight ? "✓ Correct! Well done 🎉" : `The answer was ${quiz.correct} — you've got the next one!`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }: { onAuth:(u:{name:string;email:string})=>void }) {
  const [mode, setMode]   = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [name, setName]   = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setErr("");
    if (!email.trim())   { setErr("Please enter your email."); return; }
    if (pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (mode==="signup" && !name.trim()) { setErr("Please enter your name."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    onAuth({ name: name || email.split("@")[0], email });
  };

  const inputBase: React.CSSProperties = {
    width:"100%", padding:"14px 16px", borderRadius:12, border:`1.5px solid ${C.border}`,
    fontSize:16, color:C.text, background:C.bg, outline:"none",
    boxSizing:"border-box", fontFamily:"inherit", transition:"border-color .2s",
  };

  const Field = ({ label, value, setter, type="text", placeholder="" }:
    { label:string; value:string; setter:(v:string)=>void; type?:string; placeholder?:string }) => (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMid,
        letterSpacing:"0.8px", textTransform:"uppercase" as const, marginBottom:8 }}>{label}</label>
      <input value={value} onChange={e=>setter(e.target.value)} type={type} placeholder={placeholder}
        onKeyDown={e=>e.key==="Enter"&&handle()} style={inputBase}
        onFocus={e=>(e.target.style.borderColor=C.blue)}
        onBlur={e=>(e.target.style.borderColor=C.border)}/>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.navy,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"32px 24px", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div style={{ width:64, height:64, borderRadius:20,
          background:`linear-gradient(135deg,${C.blue},${C.blueDark})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 16px", boxShadow:"0 8px 32px rgba(59,130,246,0.45)" }}>
          <LogoMark size={38}/>
        </div>
        <h1 style={{ color:C.white, fontWeight:800, fontSize:28, margin:0, letterSpacing:"-0.5px" }}>
          fluent<span style={{ color:C.blue }}>AI</span>
        </h1>
        <p style={{ color:"#64748b", fontSize:14, margin:"6px 0 0" }}>Learn AI. Actually use it.</p>
      </div>

      <div style={{ width:"100%", maxWidth:360, background:C.white, borderRadius:24,
        padding:"32px 28px", boxShadow:"0 24px 60px rgba(0,0,0,0.4)" }}>

        <div style={{ display:"flex", background:C.bg, borderRadius:12, padding:4, marginBottom:28, gap:4 }}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{ flex:1, padding:"9px", borderRadius:9, border:"none", cursor:"pointer",
                fontWeight:700, fontSize:14, transition:"all .2s",
                background:mode===m?C.white:"transparent",
                color:mode===m?C.navy:C.textMute,
                boxShadow:mode===m?"0 1px 6px rgba(0,0,0,0.1)":"none" }}>
              {m==="login"?"Log In":"Sign Up"}
            </button>
          ))}
        </div>

        {mode==="signup" && <Field label="Your Name" value={name} setter={setName} placeholder="e.g. Samuel"/>}
        <Field label="Email Address" value={email} setter={setEmail} type="email" placeholder="you@example.com"/>
        <Field label="Password"      value={pass}  setter={setPass}  type="password" placeholder="Min. 6 characters"/>

        {err && (
          <div style={{ marginBottom:16, padding:"12px 14px", background:"#fef2f2",
            border:"1px solid #fecaca", borderRadius:10, color:"#dc2626", fontSize:13 }}>
            {err}
          </div>
        )}

        <button onClick={handle} disabled={loading}
          style={{ width:"100%", padding:"15px", borderRadius:13, border:"none",
            cursor:loading?"not-allowed":"pointer",
            background:loading?"#cbd5e1":`linear-gradient(135deg,${C.blue},${C.blueDark})`,
            color:C.white, fontWeight:800, fontSize:16,
            boxShadow:loading?"none":"0 4px 20px rgba(59,130,246,0.4)", transition:"all .2s" }}>
          {loading ? "One moment…" : mode==="login" ? "Log In →" : "Create Account →"}
        </button>

        <p style={{ textAlign:"center", margin:"20px 0 0", fontSize:13, color:C.textMute }}>
          {mode==="login"
            ? <><span>No account? </span><span onClick={()=>setMode("signup")} style={{ color:C.blue, fontWeight:700, cursor:"pointer" }}>Sign up free</span></>
            : "By signing up you agree to our Terms and Privacy Policy."
          }
        </p>

        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0" }}>
          <div style={{ flex:1, height:1, background:C.border }}/>
          <span style={{ fontSize:12, color:C.textMute, fontWeight:500 }}>or continue with</span>
          <div style={{ flex:1, height:1, background:C.border }}/>
        </div>

        <button
          onClick={()=>{ window.location.href = "https://pwkfsjhursmfftkppuwa.supabase.co/auth/v1/authorize?provider=google"; }}
          style={{ width:"100%", padding:"14px", borderRadius:13, border:`1.5px solid ${C.border}`,
            background:C.white, cursor:"pointer", display:"flex", alignItems:"center",
            justifyContent:"center", gap:10, fontSize:15, fontWeight:600, color:C.text,
            boxShadow:"0 1px 4px rgba(0,0,0,0.06)", transition:"all .2s" }}
          onMouseEnter={e=>(e.currentTarget.style.borderColor=C.blue)}
          onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

// ── HOME TAB ──────────────────────────────────────────────────────────────────

function HomeTab({ user, streak, onPickPath }: { user:any; streak:any; onPickPath:(p:any)=>void }) {
  const q = QUOTES[new Date().getDay() % QUOTES.length];
  return (
    <div style={{ paddingBottom:32 }}>
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,
        padding:"32px 20px 36px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-40, width:180, height:180,
          borderRadius:"50%", background:"rgba(59,130,246,0.12)" }}/>
        <div style={{ position:"relative" }}>
          <p style={{ color:"#64748b", fontSize:13, margin:"0 0 4px" }}>Welcome back,</p>
          <h1 style={{ color:C.white, fontSize:26, fontWeight:800, margin:"0 0 22px", letterSpacing:"-0.5px" }}>
            {user.name} 👋
          </h1>
          <div style={{ display:"flex", gap:12 }}>
            {[
              { val:`${streak.count} 🔥`, label:"Day Streak" },
              { val:`${streak.xp} XP`,   label:"Earned"     },
            ].map(s=>(
              <div key={s.label} style={{ background:"rgba(59,130,246,0.15)", borderRadius:14,
                padding:"12px 16px", border:"1px solid rgba(59,130,246,0.25)" }}>
                <div style={{ color:C.white, fontWeight:800, fontSize:18 }}>{s.val}</div>
                <div style={{ color:"#64748b", fontSize:11, marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding:"24px 20px 0" }}>
        <div style={{ background:C.blueLight, borderRadius:16, padding:"18px 20px",
          borderLeft:`3px solid ${C.blue}`, marginBottom:28 }}>
          <p style={{ color:C.navyMid, fontSize:14, fontStyle:"italic", margin:"0 0 6px", lineHeight:1.6 }}>"{q.t}"</p>
          <p style={{ color:C.blue, fontSize:12, fontWeight:700, margin:0 }}>— {q.by}</p>
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:C.textMute, letterSpacing:"1px", textTransform:"uppercase", margin:"0 0 14px" }}>
          Learning Paths
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {PATHS.map(p=>(
            <button key={p.id} onClick={()=>onPickPath(p)}
              style={{ display:"flex", alignItems:"center", gap:16, background:C.white,
                borderRadius:18, padding:"18px 20px", border:`1.5px solid ${C.border}`,
                cursor:"pointer", textAlign:"left", width:"100%",
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"all .15s" }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=C.blue)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
              <span style={{ fontSize:26 }}>{p.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{p.label}</div>
                <div style={{ fontSize:12, color:C.textMute, marginTop:2 }}>{p.topics.length} topics</div>
              </div>
              <span style={{ color:C.border, fontSize:20 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PATH SCREEN ───────────────────────────────────────────────────────────────

function PathScreen({ path, onBack, onPickTopic }:
  { path:any; onBack:()=>void; onPickTopic:(t:any,p:any)=>void }) {
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"20px 20px 28px" }}>
        <button onClick={onBack}
          style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"#94a3b8",
            borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:13, marginBottom:18 }}>
          ← Back
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:32 }}>{path.icon}</span>
          <div>
            <h2 style={{ color:C.white, fontWeight:800, fontSize:22, margin:0 }}>{path.label}</h2>
            <p style={{ color:"#64748b", fontSize:13, margin:"3px 0 0" }}>{path.topics.length} topics</p>
          </div>
        </div>
      </div>
      <div style={{ padding:"20px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {path.topics.map((t:any, i:number)=>(
            <button key={t.id} onClick={()=>onPickTopic(t,path)}
              style={{ display:"flex", alignItems:"center", gap:16, background:C.white,
                borderRadius:16, padding:"18px 20px", border:`1.5px solid ${C.border}`,
                cursor:"pointer", textAlign:"left", width:"100%",
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"all .15s" }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=C.blue)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
              <span style={{ width:32, height:32, borderRadius:10, background:C.blueLight,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:700, color:C.blue, flexShrink:0 }}>{i+1}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:15, color:C.text }}>{t.name}</div>
                <div style={{ fontSize:12, color:C.textMute, marginTop:2 }}>{t.sub}</div>
              </div>
              <span style={{ color:C.border, fontSize:18 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TUTOR TAB ─────────────────────────────────────────────────────────────────

let msgCounter = 0;

function TutorTab({ initTopic, onXP, onClearTopic }:
  { initTopic:any; onXP:(n:number)=>void; onClearTopic:()=>void }) {
  const [msgs, setMsgs]       = useState<any[]>([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgsRef   = useRef<any[]>([]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);
  useEffect(()=>{
    if (initTopic && !started) { setStarted(true); runAI(`Teach me about: ${initTopic.name}`, []); }
  },[initTopic]);

  const runAI = useCallback(async (text:string, history:any[]) => {
    const userMsg = { id:++msgCounter, role:"user", content:text };
    const next = [...history, userMsg];
    msgsRef.current = next; setMsgs([...next]); setInput(""); setLoading(true);
    try {
      const reply = await callClaude(next.map(m=>({ role:m.role==="assistant"?"assistant":"user", content:m.content })));
      const aiMsg = { id:++msgCounter, role:"assistant", content:reply, answered:false, answeredRight:false };
      msgsRef.current = [...next, aiMsg]; setMsgs([...msgsRef.current]); onXP(5);
    } catch {
      msgsRef.current = [...next, { id:++msgCounter, role:"assistant", content:"Something went wrong — please try again!", answered:false }];
      setMsgs([...msgsRef.current]);
    }
    setLoading(false);
  },[onXP]);

  const send = () => { if (!input.trim()||loading) return; runAI(input, msgsRef.current); };

  const handleAnswer = useCallback(async (msgId:number, letter:string, isRight:boolean, quiz:any) => {
    const updated = msgsRef.current.map(m=>m.id===msgId?{...m,answered:true,answeredRight:isRight}:m);
    msgsRef.current = updated; setMsgs([...updated]); onXP(isRight?20:5);
    await new Promise(r=>setTimeout(r,700));
    runAI(`My answer is ${letter}: ${quiz.options[letter]}`, updated);
  },[onXP,runAI]);

  const starters = [
    { label:"Explain ChatGPT to me",  text:"Teach me about ChatGPT — I have never used it before" },
    { label:"Write better AI prompts", text:"Teach me how to write better prompts for AI" },
    { label:"Automate tasks at work",  text:"How can I use AI to automate my work tasks?" },
    { label:"What is an AI Agent?",    text:"Explain AI Agents in a way I will never forget" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 108px)" }}>
      <div style={{ padding:"14px 20px", background:C.white, borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10,
            background:`linear-gradient(135deg,${C.blue},${C.blueDark})`,
            display:"flex", alignItems:"center", justifyContent:"center" }}><LogoMark size={22}/></div>
          <div>
            <p style={{ margin:0, fontWeight:700, fontSize:15, color:C.text }}>AI Tutor</p>
            <p style={{ margin:0, fontSize:11, color:C.green, fontWeight:600 }}>● Online</p>
          </div>
        </div>
        {msgs.length>0 && (
          <button onClick={()=>{ setMsgs([]); msgsRef.current=[]; setStarted(false); onClearTopic(); }}
            style={{ background:C.bg, border:`1px solid ${C.border}`, color:C.textMid,
              borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            New chat
          </button>
        )}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"24px 20px", background:C.bg, display:"flex", flexDirection:"column" }}>
        {msgs.length===0 ? (
          <div>
            <div style={{ textAlign:"center", padding:"32px 0 28px" }}>
              <div style={{ fontSize:52, marginBottom:14 }}>🤖</div>
              <p style={{ color:C.text, fontSize:18, fontWeight:800, margin:"0 0 6px" }}>What do you want to learn?</p>
              <p style={{ color:C.textMute, fontSize:14, margin:0 }}>Tap a topic or type anything below</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {starters.map(s=>(
                <button key={s.label} onClick={()=>runAI(s.text,[])}
                  style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:14,
                    padding:"16px 18px", cursor:"pointer", textAlign:"left",
                    fontSize:15, color:C.text, fontWeight:500,
                    boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"all .15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background=C.blueLight; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.white; }}>
                  {s.label} →
                </button>
              ))}
            </div>
          </div>
        ) : msgs.map(m=><ChatMessage key={m.id} msg={m} onAnswer={handleAnswer}/>)}

        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:34, height:34, borderRadius:10,
              background:`linear-gradient(135deg,${C.blue},${C.blueDark})`,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><LogoMark size={20}/></div>
            <div style={{ background:C.white, borderRadius:"5px 18px 18px 18px",
              padding:"13px 18px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)",
              display:"flex", gap:5, alignItems:"center" }}>
              {[0,1,2].map(i=>(
                <span key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.blue,
                  display:"inline-block", animation:`bounce .8s ${i*.16}s infinite ease-in-out` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{ background:C.white, borderTop:`1px solid ${C.border}`, padding:"12px 16px", flexShrink:0, display:"flex", gap:10 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask anything about AI…"
          style={{ flex:1, padding:"13px 16px", borderRadius:13, border:`1.5px solid ${C.border}`,
            fontSize:15, color:C.text, background:C.bg, outline:"none", fontFamily:"inherit", transition:"border-color .2s" }}
          onFocus={e=>(e.target.style.borderColor=C.blue)}
          onBlur={e=>(e.target.style.borderColor=C.border)}/>
        <button onClick={send} disabled={loading||!input.trim()}
          style={{ width:48, height:48, borderRadius:13, flexShrink:0, border:"none", fontSize:20, color:C.white,
            background:input.trim()&&!loading?`linear-gradient(135deg,${C.blue},${C.blueDark})`:"#e2e8f0",
            cursor:input.trim()&&!loading?"pointer":"not-allowed" }}>↑</button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}`}</style>
    </div>
  );
}

// ── PLANS TAB ─────────────────────────────────────────────────────────────────

function PlansTab() {
  const [billing, setBilling] = useState("monthly");
  const plans = [
    { name:"Free",    price:{monthly:0, yearly:0},  badge:"Always free",  accent:"#94a3b8", disabled:true,
      features:["5 learning paths","5 AI Tutor messages/day","Streak & XP tracking"], cta:"Current Plan" },
    { name:"Starter", price:{monthly:3, yearly:25}, badge:"Most popular", accent:C.blue, highlight:true,
      features:["Unlimited AI Tutor","All topics unlocked","Interactive quizzes","Certificates","7-day free trial"], cta:"Start Free Trial" },
    { name:"Pro",     price:{monthly:5, yearly:40}, badge:"Best value",   accent:"#7c3aed",
      features:["Everything in Starter","New lessons first","Personalised path","Family sharing (2 accounts)","Build your own agent"], cta:"Go Pro" },
  ];

  return (
    <div style={{ paddingBottom:32 }}>
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"32px 20px 36px", textAlign:"center" }}>
        <h2 style={{ color:C.white, fontWeight:800, fontSize:24, margin:"0 0 6px" }}>Plans</h2>
        <p style={{ color:"#64748b", fontSize:14, margin:"0 0 22px" }}>Start free. Upgrade anytime.</p>
        <div style={{ display:"inline-flex", background:"rgba(255,255,255,0.07)", borderRadius:12, padding:4, gap:4 }}>
          {["monthly","yearly"].map(b=>(
            <button key={b} onClick={()=>setBilling(b)}
              style={{ padding:"8px 18px", borderRadius:9, border:"none", cursor:"pointer",
                fontWeight:700, fontSize:13, transition:"all .2s",
                background:billing===b?C.blue:"transparent", color:billing===b?C.white:"#64748b" }}>
              {b==="monthly"?"Monthly":"Yearly — Save 30%"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding:"20px" }}>
        {plans.map((p:any)=>(
          <div key={p.name} style={{ marginBottom:12, background:C.white, borderRadius:20, padding:"22px 20px",
            border:`1.5px solid ${p.highlight?C.bluePale:C.border}`,
            boxShadow:p.highlight?"0 4px 24px rgba(59,130,246,0.12)":"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <p style={{ margin:0, fontWeight:800, fontSize:18, color:C.text }}>{p.name}</p>
                <p style={{ margin:"3px 0 0", fontSize:12, color:p.accent, fontWeight:600 }}>{p.badge}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ margin:0, fontWeight:900, fontSize:28, color:C.text, lineHeight:1 }}>
                  {p.price[billing]===0?"Free":`£${p.price[billing]}`}
                </p>
                {p.price[billing]>0&&<p style={{ margin:"3px 0 0", fontSize:12, color:C.textMute }}>/{billing==="monthly"?"mo":"yr"}</p>}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:18 }}>
              {p.features.map((f:string)=>(
                <p key={f} style={{ margin:0, fontSize:14, color:C.textMid, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:p.accent, fontWeight:800 }}>✓</span>{f}
                </p>
              ))}
            </div>
            <button disabled={p.disabled}
              style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", fontWeight:700, fontSize:15,
                background:p.disabled?C.bg:p.highlight?`linear-gradient(135deg,${C.blue},${C.blueDark})`:C.navy,
                color:p.disabled?C.textMute:C.white, cursor:p.disabled?"default":"pointer",
                boxShadow:p.highlight&&!p.disabled?"0 4px 16px rgba(59,130,246,0.35)":"none" }}>
              {p.cta}
            </button>
          </div>
        ))}
        <p style={{ textAlign:"center", color:C.textMute, fontSize:12, marginTop:4 }}>
          Cancel anytime · No hidden fees · Stripe payments
        </p>
      </div>
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────

function ProfileTab({ user, streak, onLogout }: { user:any; streak:any; onLogout:()=>void }) {
  return (
    <div style={{ paddingBottom:40 }}>
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"32px 20px 36px", textAlign:"center" }}>
        <div style={{ width:70, height:70, borderRadius:"50%",
          background:`linear-gradient(135deg,${C.blue},${C.blueDark})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 14px", color:C.white, fontWeight:900, fontSize:30,
          boxShadow:"0 8px 24px rgba(59,130,246,0.4)" }}>
          {user.name[0].toUpperCase()}
        </div>
        <p style={{ margin:0, fontWeight:800, fontSize:20, color:C.white }}>{user.name}</p>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"#64748b" }}>{user.email}</p>
        <div style={{ display:"flex", justifyContent:"center", gap:28, marginTop:20 }}>
          {[
            { val:`${streak.count} 🔥`, label:"Day Streak" },
            { val:streak.xp,            label:"Total XP"   },
            { val:streak.best,          label:"Best Streak" },
          ].map(s=>(
            <div key={s.label} style={{ textAlign:"center" }}>
              <p style={{ margin:0, fontWeight:900, fontSize:22, color:C.white }}>{s.val}</p>
              <p style={{ margin:"3px 0 0", fontSize:11, color:"#64748b" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"20px" }}>
        {[
          { icon:"🔔", label:"Notifications"   },
          { icon:"🔒", label:"Change Password"  },
          { icon:"📋", label:"My Certificates"  },
          { icon:"❓", label:"Help and Support"  },
          { icon:"⭐", label:"Rate the App"      },
        ].map(item=>(
          <button key={item.label}
            style={{ display:"flex", alignItems:"center", gap:14, background:"transparent",
              borderRadius:12, padding:"16px 4px", border:"none", borderBottom:`1px solid ${C.border}`,
              cursor:"pointer", textAlign:"left", width:"100%" }}>
            <span style={{ fontSize:18, width:28 }}>{item.icon}</span>
            <span style={{ flex:1, fontWeight:500, fontSize:15, color:C.text }}>{item.label}</span>
            <span style={{ color:C.border, fontSize:18 }}>›</span>
          </button>
        ))}
        <button onClick={onLogout}
          style={{ marginTop:20, width:"100%", background:"#fff0f0", borderRadius:14, padding:"15px",
            border:"1.5px solid #fee2e2", cursor:"pointer", color:"#ef4444", fontWeight:700, fontSize:15 }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

// ── ROOT PAGE ──────────────────────────────────────────────────────────────────

export default function Page() {
  const [user, setUser]               = useState<any>(null);
  const [tab, setTab]                 = useState("home");
  const [activePath, setActivePath]   = useState<any>(null);
  const [activeTopic, setActiveTopic] = useState<any>(null);
  const [streak, setStreak]           = useState({ count:3, xp:120, best:7 });

  // Handles redirect back from Google OAuth
  useGoogleAuthRedirect(setUser);

  const addXP = useCallback((n:number) => setStreak(s=>({...s, xp:s.xp+n})), []);

  if (!user) return <AuthScreen onAuth={setUser}/>;

  const NAV = [
    { id:"home",    icon:"🏠", label:"Home"     },
    { id:"tutor",   icon:"🤖", label:"AI Tutor" },
    { id:"plans",   icon:"⭐", label:"Plans"    },
    { id:"profile", icon:"👤", label:"Profile"  },
  ];

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", maxWidth:430, margin:"0 auto", background:C.bg, minHeight:"100vh" }}>

      {/* Top bar */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:C.navy, height:52,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={()=>setTab("home")}>
          <div style={{ width:30, height:30, borderRadius:9,
            background:`linear-gradient(135deg,${C.blue},${C.blueDark})`,
            display:"flex", alignItems:"center", justifyContent:"center" }}><LogoMark size={18}/></div>
          <span style={{ color:C.white, fontWeight:800, fontSize:17 }}>
            fluent<span style={{ color:C.blue }}>AI</span>
          </span>
        </div>
        <span style={{ fontSize:13, color:"#64748b", fontWeight:600 }}>
          🔥 {streak.count} &nbsp;·&nbsp; {streak.xp} XP
        </span>
      </div>

      {/* Content */}
      <div style={{ minHeight:"calc(100vh - 110px)", overflowY:"auto" }}>
        {tab==="home"    && <HomeTab user={user} streak={streak} onPickPath={p=>{setActivePath(p);setTab("path");}}/>}
        {tab==="path"    && activePath && <PathScreen path={activePath} onBack={()=>setTab("home")} onPickTopic={(t,p)=>{setActivePath(p);setActiveTopic(t);setTab("tutor");}}/>}
        {tab==="tutor"   && <TutorTab initTopic={activeTopic} onXP={addXP} onClearTopic={()=>setActiveTopic(null)}/>}
        {tab==="plans"   && <PlansTab/>}
        {tab==="profile" && <ProfileTab user={user} streak={streak} onLogout={()=>setUser(null)}/>}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:430, background:C.white, borderTop:`1px solid ${C.border}`,
        display:"flex", zIndex:50, paddingBottom:"env(safe-area-inset-bottom)" }}>
        {NAV.map(n=>{
          const active = tab===n.id||(n.id==="home"&&tab==="path");
          return (
            <button key={n.id} onClick={()=>{ setTab(n.id); if(n.id==="tutor") setActiveTopic(null); }}
              style={{ flex:1, padding:"11px 0 9px", border:"none", background:"transparent",
                cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:20, opacity:active?1:0.35 }}>{n.icon}</span>
              <span style={{ fontSize:10, fontWeight:active?700:400, color:active?C.blue:C.textMute }}>{n.label}</span>
              {active && <div style={{ width:20, height:2, borderRadius:2, background:C.blue }}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
