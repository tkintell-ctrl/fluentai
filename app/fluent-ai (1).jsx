import { useState, useEffect, useRef, useCallback } from "react";

// ── DATA ───────────────────────────────────────────────────────────────────────

const PATHS = [
  { id:"tools",     icon:"🛠️", label:"AI Tools",     color:"#f59e0b", topics:[
    {id:"chatgpt",name:"ChatGPT",sub:"OpenAI's chatbot"},
    {id:"claude",name:"Claude",sub:"Anthropic assistant"},
    {id:"gemini",name:"Gemini",sub:"Google's AI"},
    {id:"midjourney",name:"Midjourney",sub:"AI image creation"},
    {id:"perplexity",name:"Perplexity",sub:"AI-powered search"},
    {id:"dalle",name:"DALL-E",sub:"Text-to-image"},
    {id:"canva",name:"Canva AI",sub:"Design with AI"},
    {id:"runway",name:"Runway",sub:"AI video creation"},
    {id:"elevenlabs",name:"ElevenLabs",sub:"AI voice cloning"},
    {id:"suno",name:"Suno AI",sub:"AI music creation"},
  ]},
  { id:"agents",    icon:"🤖", label:"AI Agents",    color:"#7c3aed", topics:[
    {id:"what-agent",name:"What is an Agent?",sub:"Basics explained"},
    {id:"custom-gpt",name:"Custom GPTs",sub:"Build your own bot"},
    {id:"claude-proj",name:"Claude Projects",sub:"Persistent memory"},
    {id:"no-code",name:"No-Code Agents",sub:"No coding needed"},
    {id:"multi-agent",name:"Multi-Agent Systems",sub:"Agents working together"},
    {id:"tools-use",name:"Giving Agents Tools",sub:"Web, email, files"},
  ]},
  { id:"automation",icon:"⚡", label:"Automation",   color:"#ef4444", topics:[
    {id:"zapier",name:"Zapier + AI",sub:"Connect your apps"},
    {id:"make",name:"Make.com",sub:"Visual workflows"},
    {id:"email-auto",name:"Email Automation",sub:"AI in your inbox"},
    {id:"social-auto",name:"Social Media AI",sub:"Auto-posting"},
    {id:"biz-workflow",name:"Business Workflows",sub:"End-to-end systems"},
  ]},
  { id:"skills",    icon:"🧠", label:"AI Skills",    color:"#10a37f", topics:[
    {id:"prompting",name:"Prompt Engineering",sub:"Get better results"},
    {id:"ai-writing",name:"AI Writing",sub:"Blogs, emails, copy"},
    {id:"ai-research",name:"AI Research",sub:"Find anything fast"},
    {id:"ai-images",name:"AI Images",sub:"Create with words"},
    {id:"ai-data",name:"Data Analysis",sub:"AI spreadsheets"},
  ]},
  { id:"agentic",   icon:"🚀", label:"Agentic AI",   color:"#0ea5e9", topics:[
    {id:"what-agentic",name:"What is Agentic AI?",sub:"Next frontier"},
    {id:"bot-vs-agent",name:"Chatbots vs Agents",sub:"Key differences"},
    {id:"plan-agents",name:"Agents That Plan",sub:"Goal to action"},
    {id:"build-agent",name:"Build Your Agent",sub:"Step-by-step guide"},
  ]},
];

const QUOTES = [
  {t:"The best way to predict the future is to create it.",by:"Peter Drucker"},
  {t:"Intelligence is the ability to adapt to change.",by:"Stephen Hawking"},
  {t:"Learning never exhausts the mind.",by:"Leonardo da Vinci"},
  {t:"AI is the new electricity.",by:"Andrew Ng"},
  {t:"Those who cannot learn and relearn will be left behind.",by:"Alvin Toffler"},
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

const callClaude = async (messages) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYS_PROMPT, messages }),
  });
  const d = await res.json();
  return d.content?.[0]?.text || "Something went wrong. Please try again!";
};

const parseQuiz = (text) => {
  const match = text.match(/QUIZ_START([\s\S]*?)QUIZ_END/);
  if (!match) return { clean: text, quiz: null };
  const block = match[1];
  const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
  const question = lines[0] || "";
  const a = block.match(/OPT_A:(.+)/)?.[1]?.trim();
  const b = block.match(/OPT_B:(.+)/)?.[1]?.trim();
  const c = block.match(/OPT_C:(.+)/)?.[1]?.trim();
  const d = block.match(/OPT_D:(.+)/)?.[1]?.trim();
  const correct = block.match(/CORRECT:\s*([ABCD])/)?.[1];
  const clean = text.replace(/QUIZ_START[\s\S]*?QUIZ_END/, "").trim();
  if (!question || !a || !b || !c || !d || !correct) return { clean: text, quiz: null };
  return { clean, quiz: { question, options: { A: a, B: b, C: c, D: d }, correct } };
};

const cleanMd = (t) => t.replace(/#{1,6}\s?/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/__/g, "").trim();

// ── QUIZ WIDGET ───────────────────────────────────────────────────────────────

function QuizWidget({ quiz, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const pick = (letter) => {
    if (revealed) return;
    setSelected(letter);
    setRevealed(true);
    setTimeout(() => onAnswer(letter, letter === quiz.correct), 800);
  };

  return (
    <div style={{ marginTop: 16, background: "#fffbeb", borderRadius: 18, padding: "20px", border: "1.5px solid #fde68a" }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: "#d97706", letterSpacing: "1px", margin: "0 0 10px" }}>QUICK QUIZ</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", lineHeight: 1.6, margin: "0 0 16px" }}>{quiz.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Object.entries(quiz.options).map(([letter, text]) => {
          let bg = "#fff", border = "#e2e8f0", color = "#1e293b", dot = "#e2e8f0";
          if (revealed) {
            if (letter === quiz.correct)              { bg="#f0fdf4"; border="#22c55e"; color="#166534"; dot="#22c55e"; }
            else if (letter === selected)             { bg="#fef2f2"; border="#ef4444"; color="#991b1b"; dot="#ef4444"; }
            else                                      { bg="#f8fafc"; border="#e2e8f0"; color="#94a3b8"; dot="#e2e8f0"; }
          }
          return (
            <button key={letter} onClick={() => pick(letter)} disabled={revealed}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderRadius:12,
                border:`1.5px solid ${border}`, background:bg, cursor:revealed?"default":"pointer",
                textAlign:"left", transition:"all .2s", width:"100%" }}>
              <span style={{ width:26, height:26, borderRadius:"50%", background:dot,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:800, fontSize:12, color:revealed&&(letter===quiz.correct||letter===selected)?"#fff":color, flexShrink:0 }}>
                {!revealed ? letter : letter===quiz.correct ? "✓" : letter===selected ? "✗" : letter}
              </span>
              <span style={{ fontSize:14, color, lineHeight:1.5 }}>{text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── CHAT MESSAGE ──────────────────────────────────────────────────────────────

function ChatMessage({ msg, onAnswer }) {
  const { clean, quiz } = parseQuiz(msg.content);
  const text = cleanMd(clean);
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  if (msg.role === "user") return (
    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
      <div style={{ maxWidth:"76%", padding:"13px 17px", borderRadius:"20px 20px 5px 20px",
        background:"#0f172a", color:"#fff", fontSize:15, lineHeight:1.7 }}>
        {msg.content}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", gap:12, marginBottom:24, alignItems:"flex-start" }}>
      <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#f59e0b,#d97706)",
        display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
        fontWeight:900, fontSize:15, flexShrink:0, marginTop:2 }}>f</div>
      <div style={{ flex:1 }}>
        <div style={{ background:"#fff", borderRadius:"5px 20px 20px 20px", padding:"16px 18px",
          boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ fontSize:15, color:"#1e293b", lineHeight:1.85, margin: i===0?"0":"12px 0 0" }}>
              {p.replace(/\n/g," ")}
            </p>
          ))}
        </div>
        {quiz && !msg.answered && <QuizWidget quiz={quiz} onAnswer={(l,r)=>onAnswer(msg.id,l,r,quiz)} />}
        {quiz && msg.answered && (
          <div style={{ marginTop:10, padding:"11px 16px", borderRadius:12,
            background: msg.answeredRight?"#f0fdf4":"#fef2f2",
            border:`1.5px solid ${msg.answeredRight?"#86efac":"#fca5a5"}` }}>
            <p style={{ fontSize:14, color: msg.answeredRight?"#166534":"#991b1b", margin:0, fontWeight:600 }}>
              {msg.answeredRight ? "✓ Correct! Well done 🎉" : `The answer was ${quiz.correct} — you've got the next one!`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }) {
  const [mode, setMode]   = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [name, setName]   = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setErr("");
    if (!email.trim())     { setErr("Please enter your email."); return; }
    if (pass.length < 6)   { setErr("Password must be at least 6 characters."); return; }
    if (mode==="signup" && !name.trim()) { setErr("Please enter your name."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    onAuth({ name: name || email.split("@")[0], email });
  };

  const Field = ({ label, value, setter, type="text", placeholder="" }) => (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#6b7280",
        letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:8 }}>{label}</label>
      <input value={value} onChange={e=>setter(e.target.value)} type={type} placeholder={placeholder}
        onKeyDown={e=>e.key==="Enter"&&handle()}
        style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"1.5px solid #e5e7eb",
          fontSize:16, color:"#111827", background:"#fafafa", outline:"none",
          boxSizing:"border-box", fontFamily:"inherit", transition:"border-color .2s" }}
        onFocus={e=>e.target.style.borderColor="#f59e0b"}
        onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#fafafa", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"32px 24px", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ width:60, height:60, borderRadius:18, background:"linear-gradient(135deg,#f59e0b,#d97706)",
          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px",
          boxShadow:"0 8px 24px rgba(245,158,11,0.35)" }}>
          <span style={{ color:"#fff", fontWeight:900, fontSize:26 }}>f</span>
        </div>
        <h1 style={{ color:"#0f172a", fontWeight:800, fontSize:26, margin:0, letterSpacing:"-0.5px" }}>
          fluent<span style={{ color:"#f59e0b" }}>AI</span>
        </h1>
        <p style={{ color:"#9ca3af", fontSize:14, margin:"6px 0 0" }}>Learn AI. Actually use it.</p>
      </div>

      {/* Card */}
      <div style={{ width:"100%", maxWidth:360, background:"#fff", borderRadius:24,
        padding:"32px 28px", boxShadow:"0 4px 40px rgba(0,0,0,0.08)", border:"1px solid #f3f4f6" }}>

        {/* Toggle */}
        <div style={{ display:"flex", background:"#f3f4f6", borderRadius:12, padding:4, marginBottom:28, gap:4 }}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{ flex:1, padding:"9px", borderRadius:9, border:"none", cursor:"pointer",
                fontWeight:700, fontSize:14, transition:"all .2s",
                background:mode===m?"#fff":"transparent",
                color:mode===m?"#0f172a":"#9ca3af",
                boxShadow:mode===m?"0 1px 6px rgba(0,0,0,0.1)":"none" }}>
              {m==="login"?"Log In":"Sign Up"}
            </button>
          ))}
        </div>

        {mode==="signup" && <Field label="Your Name" value={name} setter={setName} placeholder="e.g. Samuel" />}
        <Field label="Email Address" value={email} setter={setEmail} type="email" placeholder="you@example.com" />
        <Field label="Password" value={pass} setter={setPass} type="password" placeholder="Min. 6 characters" />

        {err && (
          <div style={{ marginBottom:16, padding:"12px 14px", background:"#fef2f2",
            border:"1px solid #fecaca", borderRadius:10, color:"#dc2626", fontSize:13, fontWeight:500 }}>
            {err}
          </div>
        )}

        <button onClick={handle} disabled={loading}
          style={{ width:"100%", padding:"15px", borderRadius:13, border:"none",
            cursor:loading?"not-allowed":"pointer",
            background:loading?"#d1d5db":"linear-gradient(135deg,#f59e0b,#d97706)",
            color:"#fff", fontWeight:800, fontSize:16,
            boxShadow:loading?"none":"0 4px 16px rgba(245,158,11,0.4)", transition:"all .2s" }}>
          {loading ? "One moment…" : mode==="login" ? "Log In →" : "Create Account →"}
        </button>

        <p style={{ textAlign:"center", margin:"20px 0 0", fontSize:13, color:"#9ca3af" }}>
          {mode==="login"
            ? <>No account? <span onClick={()=>setMode("signup")} style={{ color:"#d97706", fontWeight:700, cursor:"pointer" }}>Sign up free</span></>
            : "By signing up you agree to our Terms and Privacy Policy."
          }
        </p>
      </div>
    </div>
  );
}

// ── HOME TAB ──────────────────────────────────────────────────────────────────

function HomeTab({ user, streak, onPickPath }) {
  const q = QUOTES[new Date().getDay() % QUOTES.length];

  return (
    <div style={{ padding:"32px 20px 32px" }}>

      {/* Greeting */}
      <div style={{ marginBottom:28 }}>
        <p style={{ color:"#9ca3af", fontSize:13, margin:"0 0 4px" }}>Good to see you,</p>
        <h1 style={{ color:"#0f172a", fontSize:26, fontWeight:800, margin:0, letterSpacing:"-0.5px" }}>{user.name} 👋</h1>
      </div>

      {/* Streak card — simple, single row */}
      <div style={{ display:"flex", gap:12, marginBottom:28 }}>
        {[
          { val:`${streak.count} 🔥`, label:"Day Streak", c:"#f59e0b" },
          { val:`${streak.xp} XP`,   label:"Earned",      c:"#10a37f" },
        ].map(s=>(
          <div key={s.label} style={{ flex:1, background:"#fff", border:"1.5px solid #f3f4f6",
            borderRadius:16, padding:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize:22, fontWeight:800, color:s.c }}>{s.val}</div>
            <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div style={{ background:"#fffbeb", borderRadius:16, padding:"18px 20px",
        borderLeft:"3px solid #f59e0b", marginBottom:32 }}>
        <p style={{ color:"#78350f", fontSize:14, fontStyle:"italic", margin:"0 0 6px", lineHeight:1.6 }}>
          "{q.t}"
        </p>
        <p style={{ color:"#d97706", fontSize:12, fontWeight:700, margin:0 }}>— {q.by}</p>
      </div>

      {/* Paths — clean list, lots of breathing room */}
      <h2 style={{ fontSize:13, fontWeight:700, color:"#9ca3af", letterSpacing:"1px",
        textTransform:"uppercase", margin:"0 0 16px" }}>Learning Paths</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {PATHS.map(p=>(
          <button key={p.id} onClick={()=>onPickPath(p)}
            style={{ display:"flex", alignItems:"center", gap:16, background:"#fff",
              borderRadius:18, padding:"18px 20px", border:"1.5px solid #f3f4f6",
              cursor:"pointer", textAlign:"left", width:"100%",
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"all .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=p.color}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#f3f4f6"}>
            <span style={{ fontSize:26 }}>{p.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15, color:"#0f172a" }}>{p.label}</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{p.topics.length} topics</div>
            </div>
            <span style={{ color:"#d1d5db", fontSize:20 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── PATH SCREEN ───────────────────────────────────────────────────────────────

function PathScreen({ path, onBack, onPickTopic }) {
  return (
    <div style={{ padding:"24px 20px 32px" }}>
      <button onClick={onBack}
        style={{ background:"none", border:"none", color:"#9ca3af", cursor:"pointer",
          fontSize:14, fontWeight:600, padding:0, marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>
        ← Back
      </button>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <span style={{ fontSize:32 }}>{path.icon}</span>
        <div>
          <h2 style={{ color:"#0f172a", fontWeight:800, fontSize:22, margin:0 }}>{path.label}</h2>
          <p style={{ color:"#9ca3af", fontSize:13, margin:"3px 0 0" }}>{path.topics.length} topics</p>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {path.topics.map((t, i) => (
          <button key={t.id} onClick={()=>onPickTopic(t, path)}
            style={{ display:"flex", alignItems:"center", gap:16, background:"#fff",
              borderRadius:16, padding:"18px 20px", border:"1.5px solid #f3f4f6",
              cursor:"pointer", textAlign:"left", width:"100%",
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"all .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=path.color}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#f3f4f6"}>
            <span style={{ width:32, height:32, borderRadius:10, background:"#f9fafb",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, fontWeight:700, color:path.color, flexShrink:0, border:`1.5px solid #f3f4f6` }}>
              {i+1}
            </span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:15, color:"#0f172a" }}>{t.name}</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{t.sub}</div>
            </div>
            <span style={{ color:"#d1d5db", fontSize:18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── TUTOR TAB ─────────────────────────────────────────────────────────────────

let msgCounter = 0;

function TutorTab({ initTopic, onXP, onClearTopic }) {
  const [msgs, setMsgs]     = useState([]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const msgsRef   = useRef([]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  useEffect(()=>{
    if (initTopic && !started) { setStarted(true); runAI(`Teach me about: ${initTopic.name}`, []); }
  },[initTopic]);

  const runAI = useCallback(async (text, history) => {
    const uid = ++msgCounter;
    const userMsg = {id:uid, role:"user", content:text};
    const next = [...history, userMsg];
    msgsRef.current = next;
    setMsgs([...next]);
    setInput("");
    setLoading(true);
    try {
      const apiMsgs = next.map(m=>({role:m.role==="assistant"?"assistant":"user", content:m.content}));
      const reply = await callClaude(apiMsgs);
      const aiMsg = {id:++msgCounter, role:"assistant", content:reply, answered:false, answeredRight:false};
      msgsRef.current = [...next, aiMsg];
      setMsgs([...msgsRef.current]);
      onXP(5);
    } catch {
      msgsRef.current = [...next, {id:++msgCounter, role:"assistant", content:"Something went wrong — please try again!", answered:false}];
      setMsgs([...msgsRef.current]);
    }
    setLoading(false);
  },[onXP]);

  const send = () => { if (!input.trim()||loading) return; runAI(input, msgsRef.current); };

  const handleAnswer = useCallback(async (msgId, letter, isRight, quiz) => {
    const updated = msgsRef.current.map(m=>m.id===msgId?{...m,answered:true,answeredRight:isRight}:m);
    msgsRef.current = updated; setMsgs([...updated]); onXP(isRight?20:5);
    await new Promise(r=>setTimeout(r,700));
    runAI(`My answer is ${letter}: ${quiz.options[letter]}`, updated);
  },[onXP,runAI]);

  const starters = [
    {label:"Explain ChatGPT to me", text:"Teach me about ChatGPT — I have never used it before"},
    {label:"Write better AI prompts", text:"Teach me how to write better prompts for AI"},
    {label:"Automate tasks at work",  text:"How can I use AI to automate my work tasks?"},
    {label:"What is an AI Agent?",    text:"Explain AI Agents in a way I will never forget"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 108px)"}}>

      {/* Header */}
      <div style={{padding:"16px 20px",background:"#fff",borderBottom:"1px solid #f3f4f6",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#f59e0b,#d97706)",
            display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:16}}>f</div>
          <div>
            <p style={{margin:0,fontWeight:700,fontSize:15,color:"#0f172a"}}>AI Tutor</p>
            <p style={{margin:0,fontSize:11,color:"#22c55e",fontWeight:600}}>● Online</p>
          </div>
        </div>
        {msgs.length>0&&(
          <button onClick={()=>{setMsgs([]);msgsRef.current=[];setStarted(false);onClearTopic();}}
            style={{background:"#f3f4f6",border:"none",color:"#6b7280",borderRadius:8,
              padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>
            New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"24px 20px",background:"#fafafa",display:"flex",flexDirection:"column"}}>
        {msgs.length===0?(
          <div>
            <div style={{textAlign:"center",padding:"32px 0 28px"}}>
              <div style={{fontSize:52,marginBottom:14}}>🤖</div>
              <p style={{color:"#0f172a",fontSize:18,fontWeight:800,margin:"0 0 6px"}}>What do you want to learn?</p>
              <p style={{color:"#9ca3af",fontSize:14,margin:0}}>Tap a topic or type anything below</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {starters.map(s=>(
                <button key={s.label} onClick={()=>runAI(s.text,[])}
                  style={{background:"#fff",border:"1.5px solid #f3f4f6",borderRadius:14,
                    padding:"16px 18px",cursor:"pointer",textAlign:"left",fontSize:15,
                    color:"#0f172a",fontWeight:500,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#f59e0b";e.currentTarget.style.background="#fffbeb";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#f3f4f6";e.currentTarget.style.background="#fff";}}>
                  {s.label} →
                </button>
              ))}
            </div>
          </div>
        ):(
          msgs.map(m=><ChatMessage key={m.id} msg={m} onAnswer={handleAnswer}/>)
        )}
        {loading&&(
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#f59e0b,#d97706)",
              display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:15,flexShrink:0}}>f</div>
            <div style={{background:"#fff",borderRadius:"5px 18px 18px 18px",padding:"13px 18px",
              boxShadow:"0 1px 8px rgba(0,0,0,0.06)",display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=>(
                <span key={i} style={{width:7,height:7,borderRadius:"50%",background:"#fde68a",
                  display:"inline-block",animation:`bounce .8s ${i*.16}s infinite ease-in-out`}}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{background:"#fff",borderTop:"1px solid #f3f4f6",padding:"12px 16px",flexShrink:0,display:"flex",gap:10}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask anything about AI…"
          style={{flex:1,padding:"13px 16px",borderRadius:13,border:"1.5px solid #e5e7eb",
            fontSize:15,color:"#111827",background:"#fafafa",outline:"none",fontFamily:"inherit",transition:"border-color .2s"}}
          onFocus={e=>e.target.style.borderColor="#f59e0b"}
          onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
        <button onClick={send} disabled={loading||!input.trim()}
          style={{width:48,height:48,borderRadius:13,flexShrink:0,border:"none",fontSize:20,color:"#fff",
            background:input.trim()&&!loading?"linear-gradient(135deg,#f59e0b,#d97706)":"#e5e7eb",
            cursor:input.trim()&&!loading?"pointer":"not-allowed"}}>↑</button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}`}</style>
    </div>
  );
}

// ── PLANS TAB ─────────────────────────────────────────────────────────────────

function PlansTab() {
  const [billing, setBilling] = useState("monthly");
  const plans = [
    { name:"Free",    price:{monthly:0,yearly:0},   badge:"Always free",   accent:"#9ca3af", disabled:true,
      features:["5 learning paths","5 AI Tutor messages/day","Streak & XP tracking"], cta:"Current Plan" },
    { name:"Starter", price:{monthly:3,yearly:25},  badge:"Most popular",  accent:"#f59e0b", highlight:true,
      features:["Unlimited AI Tutor","All topics","Quizzes & certificates","7-day free trial"], cta:"Start Free Trial" },
    { name:"Pro",     price:{monthly:5,yearly:40},  badge:"Best value",    accent:"#7c3aed",
      features:["Everything in Starter","New lessons first","Personalised path","Family sharing (2 accounts)","Build your own agent"], cta:"Go Pro" },
  ];

  return (
    <div style={{padding:"32px 20px",background:"#fafafa",minHeight:"100%"}}>
      <h2 style={{fontSize:24,fontWeight:800,color:"#0f172a",margin:"0 0 6px"}}>Plans</h2>
      <p style={{fontSize:14,color:"#9ca3af",margin:"0 0 24px"}}>Start free. Upgrade anytime.</p>

      {/* Billing toggle */}
      <div style={{display:"inline-flex",background:"#f3f4f6",borderRadius:12,padding:4,gap:4,marginBottom:24}}>
        {["monthly","yearly"].map(b=>(
          <button key={b} onClick={()=>setBilling(b)}
            style={{padding:"8px 18px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all .2s",
              background:billing===b?"#fff":"transparent",color:billing===b?"#0f172a":"#9ca3af",
              boxShadow:billing===b?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>
            {b==="monthly"?"Monthly":"Yearly — Save 30%"}
          </button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {plans.map(p=>(
          <div key={p.name} style={{background:"#fff",borderRadius:20,padding:"22px 20px",
            border:`1.5px solid ${p.highlight?"#fde68a":"#f3f4f6"}`,
            boxShadow:p.highlight?"0 4px 20px rgba(245,158,11,0.12)":"0 1px 4px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <p style={{margin:0,fontWeight:800,fontSize:18,color:"#0f172a"}}>{p.name}</p>
                <p style={{margin:"3px 0 0",fontSize:12,color:p.accent,fontWeight:600}}>{p.badge}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{margin:0,fontWeight:900,fontSize:28,color:"#0f172a",lineHeight:1}}>
                  {p.price[billing]===0?"Free":`£${p.price[billing]}`}
                </p>
                {p.price[billing]>0&&<p style={{margin:"3px 0 0",fontSize:12,color:"#9ca3af"}}>/{billing==="monthly"?"mo":"yr"}</p>}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
              {p.features.map(f=>(
                <p key={f} style={{margin:0,fontSize:14,color:"#374151",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:p.accent,fontWeight:800}}>✓</span>{f}
                </p>
              ))}
            </div>
            <button disabled={p.disabled}
              style={{width:"100%",padding:"14px",borderRadius:12,border:"none",fontWeight:700,fontSize:15,
                background:p.disabled?"#f3f4f6":p.highlight?"linear-gradient(135deg,#f59e0b,#d97706)":"#0f172a",
                color:p.disabled?"#9ca3af":"#fff",cursor:p.disabled?"default":"pointer"}}>
              {p.cta}
            </button>
          </div>
        ))}
        <p style={{textAlign:"center",color:"#9ca3af",fontSize:12,marginTop:4}}>
          Cancel anytime · No hidden fees · Stripe payments
        </p>
      </div>
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────

function ProfileTab({ user, streak, onLogout }) {
  return (
    <div style={{padding:"32px 20px 40px"}}>
      {/* Avatar */}
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",
          display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",
          color:"#fff",fontWeight:900,fontSize:30,boxShadow:"0 6px 20px rgba(245,158,11,0.3)"}}>
          {user.name[0].toUpperCase()}
        </div>
        <p style={{margin:0,fontWeight:800,fontSize:20,color:"#0f172a"}}>{user.name}</p>
        <p style={{margin:"4px 0 0",fontSize:13,color:"#9ca3af"}}>{user.email}</p>
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:12,marginBottom:32}}>
        {[
          {val:`${streak.count} 🔥`,label:"Day Streak",c:"#f59e0b"},
          {val:streak.xp,label:"Total XP",c:"#10a37f"},
          {val:streak.best,label:"Best Streak",c:"#7c3aed"},
        ].map(s=>(
          <div key={s.label} style={{flex:1,background:"#fff",border:"1.5px solid #f3f4f6",
            borderRadius:16,padding:"16px 12px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            <p style={{margin:0,fontWeight:800,fontSize:20,color:s.c}}>{s.val}</p>
            <p style={{margin:"4px 0 0",fontSize:11,color:"#9ca3af"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        {[
          {icon:"🔔",label:"Notifications"},
          {icon:"🔒",label:"Change Password"},
          {icon:"📋",label:"My Certificates"},
          {icon:"❓",label:"Help and Support"},
          {icon:"⭐",label:"Rate the App"},
        ].map(item=>(
          <button key={item.label}
            style={{display:"flex",alignItems:"center",gap:14,background:"transparent",
              borderRadius:12,padding:"16px 4px",border:"none",borderBottom:"1px solid #f3f4f6",
              cursor:"pointer",textAlign:"left",width:"100%"}}>
            <span style={{fontSize:18,width:28}}>{item.icon}</span>
            <span style={{flex:1,fontWeight:500,fontSize:15,color:"#0f172a"}}>{item.label}</span>
            <span style={{color:"#d1d5db",fontSize:18}}>›</span>
          </button>
        ))}
      </div>

      <button onClick={onLogout}
        style={{marginTop:24,width:"100%",background:"#fff",borderRadius:14,padding:"15px",
          border:"1.5px solid #fee2e2",cursor:"pointer",color:"#ef4444",fontWeight:700,fontSize:15}}>
        Log Out
      </button>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser]             = useState(null);
  const [tab, setTab]               = useState("home");
  const [activePath, setActivePath] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [streak, setStreak]         = useState({count:3, xp:120, best:7});

  const addXP = useCallback(n => setStreak(s=>({...s,xp:s.xp+n})),[]);

  if (!user) return <AuthScreen onAuth={setUser}/>;

  const NAV = [
    {id:"home",   icon:"🏠", label:"Home"},
    {id:"tutor",  icon:"🤖", label:"AI Tutor"},
    {id:"plans",  icon:"⭐", label:"Plans"},
    {id:"profile",icon:"👤", label:"Profile"},
  ];

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:430,margin:"0 auto",
      background:"#fafafa",minHeight:"100vh"}}>

      {/* Minimal top bar */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"#fff",height:52,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 20px",borderBottom:"1px solid #f3f4f6"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setTab("home")}>
          <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#f59e0b,#d97706)",
            display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:14}}>f</div>
          <span style={{color:"#0f172a",fontWeight:800,fontSize:17}}>fluent<span style={{color:"#f59e0b"}}>AI</span></span>
        </div>
        <div style={{fontSize:13,fontWeight:700,color:"#9ca3af"}}>🔥 {streak.count} &nbsp; {streak.xp} XP</div>
      </div>

      {/* Content */}
      <div style={{minHeight:"calc(100vh - 110px)",overflowY:"auto"}}>
        {tab==="home"    && <HomeTab user={user} streak={streak} onPickPath={p=>{setActivePath(p);setTab("path");}}/>}
        {tab==="path"    && activePath && <PathScreen path={activePath} onBack={()=>setTab("home")} onPickTopic={(t,p)=>{setActivePath(p);setActiveTopic(t);setTab("tutor");}}/>}
        {tab==="tutor"   && <TutorTab initTopic={activeTopic} onXP={addXP} onClearTopic={()=>setActiveTopic(null)}/>}
        {tab==="plans"   && <PlansTab/>}
        {tab==="profile" && <ProfileTab user={user} streak={streak} onLogout={()=>setUser(null)}/>}
      </div>

      {/* Bottom nav — clean, minimal */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #f3f4f6",
        display:"flex",zIndex:50,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {NAV.map(n=>{
          const active = tab===n.id||(n.id==="home"&&tab==="path");
          return (
            <button key={n.id} onClick={()=>{setTab(n.id);if(n.id==="tutor")setActiveTopic(null);}}
              style={{flex:1,padding:"11px 0 9px",border:"none",background:"transparent",
                cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20,opacity:active?1:0.4}}>{n.icon}</span>
              <span style={{fontSize:10,fontWeight:active?700:400,color:active?"#f59e0b":"#9ca3af"}}>{n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
