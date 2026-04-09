"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/* ═══ DATA ═══ */
const QUOTES = [
  {t:"The best way to predict the future is to create it.",by:"Peter Drucker"},
  {t:"Intelligence is the ability to adapt to change.",by:"Stephen Hawking"},
  {t:"AI is probably the most important thing humanity has ever worked on.",by:"Sundar Pichai"},
  {t:"Learning never exhausts the mind.",by:"Leonardo da Vinci"},
  {t:"The illiterate of the 21st century will not be those who cannot read, but those who cannot learn, unlearn, and relearn.",by:"Alvin Toffler"},
  {t:"Technology is best when it brings people together.",by:"Matt Mullenweg"},
  {t:"Artificial intelligence would be the ultimate version of Google.",by:"Larry Page"},
  {t:"The measure of intelligence is the ability to change.",by:"Albert Einstein"},
];

const FORUMS = [
  {name:"r/ChatGPT",url:"https://reddit.com/r/ChatGPT",icon:"🔴",m:"5.2M"},
  {name:"r/ClaudeAI",url:"https://reddit.com/r/ClaudeAI",icon:"🔴",m:"180K"},
  {name:"r/artificial",url:"https://reddit.com/r/artificial",icon:"🔴",m:"1.1M"},
  {name:"r/singularity",url:"https://reddit.com/r/singularity",icon:"🔴",m:"2.8M"},
  {name:"Hacker News",url:"https://news.ycombinator.com",icon:"🟠",m:"Tech"},
  {name:"Product Hunt",url:"https://producthunt.com",icon:"🐱",m:"New Tools"},
  {name:"The Neuron",url:"https://theneuron.ai",icon:"🧠",m:"675K+"},
  {name:"Ben's Bites",url:"https://bensbites.com",icon:"📰",m:"Newsletter"},
  {name:"Futurepedia",url:"https://futurepedia.io",icon:"🚀",m:"Directory"},
  {name:"Hugging Face",url:"https://huggingface.co",icon:"🤗",m:"Open Source"},
  {name:"AI Twitter/X",url:"https://x.com/search?q=AI+tools",icon:"𝕏",m:"Real-time"},
  {name:"There's An AI For That",url:"https://theresanaiforthat.com",icon:"🔧",m:"Directory"},
  {name:"r/StableDiffusion",url:"https://reddit.com/r/StableDiffusion",icon:"🔴",m:"900K"},
  {name:"r/MachineLearning",url:"https://reddit.com/r/MachineLearning",icon:"🔴",m:"3.1M"},
];

const PATHS = [
  {id:"tools",title:"AI Tools Mastery",icon:"🛠️",color:"#1e3a5f",items:[
    {id:"chatgpt",name:"ChatGPT",sub:"OpenAI",c:"#10a37f"},{id:"claude",name:"Claude",sub:"Anthropic",c:"#1e3a5f"},
    {id:"gemini",name:"Gemini",sub:"Google",c:"#4285f4"},{id:"midjourney",name:"Midjourney",sub:"Image AI",c:"#3b82f6"},
    {id:"perplexity",name:"Perplexity",sub:"AI Search",c:"#0ea5e9"},{id:"dalle",name:"DALL-E 3",sub:"Image AI",c:"#10a37f"},
    {id:"canva",name:"Canva AI",sub:"Design",c:"#3b82f6"},{id:"runway",name:"Runway",sub:"Video AI",c:"#ef4444"},
    {id:"gamma",name:"Gamma",sub:"Presentations",c:"#2563eb"},{id:"notebooklm",name:"NotebookLM",sub:"Research",c:"#4285f4"},
    {id:"elevenlabs",name:"ElevenLabs",sub:"Voice AI",c:"#1a1a1a"},{id:"suno",name:"Suno",sub:"Music AI",c:"#ec4899"},
  ]},
  {id:"agents",title:"Creating AI Agents",icon:"🤖",color:"#3b82f6",items:[
    {id:"what-agents",name:"What Are AI Agents?",sub:"Basics",c:"#3b82f6"},{id:"gpts-custom",name:"Custom GPTs",sub:"ChatGPT",c:"#10a37f"},
    {id:"claude-proj",name:"Claude Projects",sub:"Anthropic",c:"#1e3a5f"},{id:"gems",name:"Google Gems",sub:"Gemini",c:"#4285f4"},
    {id:"copilot-ag",name:"Copilot Agents",sub:"Microsoft",c:"#0ea5e9"},{id:"nocode-ag",name:"No-Code Builders",sub:"Relevance",c:"#ef4444"},
    {id:"multi-ag",name:"Multi-Agent",sub:"CrewAI",c:"#3b82f6"},{id:"ag-tools",name:"Agent Tools",sub:"Web, APIs",c:"#2563eb"},
  ]},
  {id:"automation",title:"AI Automation",icon:"⚡",color:"#2563eb",items:[
    {id:"auto-basics",name:"Automation Basics",sub:"Start here",c:"#2563eb"},{id:"zapier",name:"Zapier + AI",sub:"6000+ apps",c:"#ff4a00"},
    {id:"make",name:"Make",sub:"Visual flows",c:"#3b82f6"},{id:"n8n",name:"n8n",sub:"Open-source",c:"#ef4444"},
    {id:"auto-email",name:"Email Auto",sub:"AI replies",c:"#4285f4"},{id:"auto-social",name:"Social Auto",sub:"Schedule",c:"#ec4899"},
    {id:"auto-data",name:"Data Auto",sub:"Sheets",c:"#10a37f"},{id:"auto-biz",name:"Business Auto",sub:"End-to-end",c:"#1e3a5f"},
  ]},
  {id:"skills",title:"Building AI Skills",icon:"🧠",color:"#0ea5e9",items:[
    {id:"prompting",name:"Prompt Engineering",sub:"#1 skill",c:"#1e3a5f"},{id:"chain",name:"Chain-of-Thought",sub:"Better answers",c:"#3b82f6"},
    {id:"ai-write",name:"AI Writing",sub:"Blogs, emails",c:"#10a37f"},{id:"ai-research",name:"AI Research",sub:"Find anything",c:"#4285f4"},
    {id:"ai-img",name:"AI Images",sub:"Prompt to art",c:"#ec4899"},{id:"ai-vid",name:"AI Video",sub:"Create clips",c:"#ef4444"},
    {id:"ai-data",name:"AI Data",sub:"Insights",c:"#2563eb"},{id:"ai-pres",name:"AI Presentations",sub:"Fast decks",c:"#0ea5e9"},
  ]},
  {id:"agentic",title:"Agentic AI",icon:"🚀",color:"#ef4444",items:[
    {id:"ag-what",name:"What Is Agentic AI?",sub:"Next frontier",c:"#ef4444"},{id:"ag-vs",name:"Chatbots vs Agents",sub:"Differences",c:"#3b82f6"},
    {id:"ag-plan",name:"Agents That Plan",sub:"Goal→action",c:"#2563eb"},{id:"ag-browse",name:"Agents That Browse",sub:"Web AI",c:"#4285f4"},
    {id:"ag-code",name:"Agents That Code",sub:"Claude Code",c:"#10a37f"},{id:"ag-work",name:"Agents at Work",sub:"Business",c:"#1e3a5f"},
    {id:"ag-build",name:"Build Your Agent",sub:"Project",c:"#ec4899"},{id:"ag-future",name:"The Future",sub:"What's next",c:"#0ea5e9"},
  ]},
];

const MIND_GYM = [
  {id:"handwrite",cat:"✍️",title:"Describe Your Morning",prompt:"Grab pen & paper. Write BY HAND for 5 min describing your morning.",science:"Handwriting activates focused attention (Mueller & Oppenheimer 2014).",xp:15,mins:5},
  {id:"observe",cat:"👁️",title:"60-Second Detail Scan",prompt:"Look around. Notice 10 things you've never consciously registered. Write BY HAND.",science:"Strengthens anterior cingulate cortex — attention control.",xp:10,mins:2},
  {id:"scenario",cat:"🎭",title:"The AI-Free Day",prompt:"Write BY HAND: if AI vanished, how would you handle your top 3 tasks?",science:"Klein (1998) PreMortem prevents over-reliance.",xp:20,mins:8},
  {id:"empathy",cat:"💭",title:"Write Someone's Story",prompt:"Think of someone you interacted with today. Write BY HAND their day from their perspective.",science:"Strengthens temporoparietal junction for empathy (Batson 2011).",xp:15,mins:5},
  {id:"memory",cat:"🧠",title:"Recall Without Searching",prompt:"Pick a topic you learned. Close the app. Write BY HAND everything you remember.",science:"Retrieval practice (Karpicke 2012) — effort = stronger memory.",xp:20,mins:7},
  {id:"debate",cat:"⚖️",title:"Argue Both Sides",prompt:"Pick an AI topic. Write BY HAND 3 arguments FOR and 3 AGAINST.",science:"Dialectical thinking (Basseches 1984) builds flexibility.",xp:20,mins:10},
  {id:"digital-fast",cat:"📵",title:"30-Minute AI Fast",prompt:"No AI for 30 min. Read, walk, cook, talk. Write BY HAND how it felt.",science:"Restores default mode network (Immordino-Yang 2012).",xp:20,mins:30},
  {id:"teach",cat:"🎓",title:"Teach Someone",prompt:"Explain something you learned to a real person OUT LOUD.",science:"Protégé Effect (Chase 2009) — teaching = deeper learning.",xp:25,mins:10},
];

const PM = [
  {id:"chunk",n:"Chunking",i:"🧩"},{id:"scaffold",n:"Scaffolding",i:"🪜"},{id:"recall",n:"Active Recall",i:"💡"},
  {id:"growth",n:"Growth Mindset",i:"🌱"},{id:"dual",n:"Dual Coding",i:"🎨"},{id:"elaborate",n:"Elaboration",i:"🔍"},
  {id:"difficult",n:"Challenge",i:"🏋️"},{id:"selfd",n:"Autonomy",i:"🎯"},{id:"cogload",n:"Clarity",i:"⚖️"},
  {id:"social",n:"Social Proof",i:"👥"},{id:"retrieve",n:"Retrieval",i:"🎣"},{id:"concrete",n:"Analogies",i:"🧱"},
  {id:"spaced",n:"Spacing",i:"🔁"},
];

const detectMethods = (text: string) => {
  if (!text) return [];
  const t = text.toLowerCase(); const a: string[] = [];
  if (/\d\.\s/.test(text)) a.push("chunk");
  if (/already know|everyday|like a|think of|imagine/.test(t)) a.push("scaffold");
  if (/quiz|which of|your answer|type [abcd]/i.test(t)) a.push("recall");
  if (/great question|you're doing|don't worry|well done/.test(t)) a.push("growth");
  if (/picture this|visuali|screen looks|you'll see/.test(t)) a.push("dual");
  if (/why do you think|what would happen/.test(t)) a.push("elaborate");
  if (/try this|challenge/.test(t)) a.push("difficult");
  if (/you can choose|up to you/.test(t)) a.push("selfd");
  if (text.split('\n\n').every(p => p.length < 350)) a.push("cogload");
  if (/people use|many users|someone/.test(t)) a.push("social");
  if (/before i tell|without looking/.test(t)) a.push("retrieve");
  if (/like a|restaurant|remote|recipe|kitchen/.test(t)) a.push("concrete");
  if (/come back|tomorrow|daily|streak/.test(t)) a.push("spaced");
  ["chunk", "scaffold", "cogload", "concrete", "growth"].forEach(m => { if (!a.includes(m) && a.length < 6) a.push(m); });
  return [...new Set(a)];
};

const SYS = `You are a world-class AI tutor inside "fluentAI". You teach everyone how to use AI tools step by step.

USE ALL 15 PSYCHOLOGY METHODS VISIBLY:
1. 🧩 CHUNKING: Max 3 numbered steps
2. 🪜 SCAFFOLDING: Start from what they know
3. 💡 ACTIVE RECALL: End with MCQ quiz, DON'T reveal answer
4. 🌱 GROWTH MINDSET: Celebrate effort
5. 🎨 DUAL CODING: Include 🖼️ **Picture This:** section
6. 🔍 ELABORATION: Ask "why do you think..."
7. 🏋️ DESIRABLE DIFFICULTY: Challenging quiz
8. 🎯 SELF-DETERMINATION: Offer choices
9. ⚖️ COGNITIVE LOAD: 2-sentence paragraphs
10. 👥 SOCIAL LEARNING: Real-world examples
11. 🎣 RETRIEVAL: Ask before explaining
12. 📺 MULTIMEDIA: Text + visuals
13. 🧱 CONCRETE EXAMPLES: Everyday analogies
14. 🔀 INTERLEAVING: Connect to other tools
15. 🔁 SPACED REPETITION: "Practice today"

STRUCTURE:
💭 "Famous quote" — Author
[3 steps with **bold** actions]
🧱 **Real-World Analogy:** [comparison]
🖼️ **Picture This:** [visual]
👥 **Real People:** [example]
🎯 **Try This Now:** [action]
💡 **Did You Know?** [fact]
🔁 **Spacing:** Practice today.
📝 **Quiz — Tap Your Answer!**
A) B) C) D) — Type your letter!

When they answer: feedback, explain, offer next choice.
NO jargon without (explanation). FREE options first. Search web if unsure.`;

/* ═══ COMPONENT ═══ */
export default function FluentAI() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", pass: "" });
  const [authErr, setAuthErr] = useState("");
  const [showOnboard, setShowOnboard] = useState(false);
  const [obStep, setObStep] = useState(0);
  const [tab, setTab] = useState("learn");
  const [topic, setTopic] = useState<{ name: string; sub: string } | null>(null);
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const [streak, setStreak] = useState({ c: 0, d: "", b: 0 });
  const [xp, setXp] = useState(0);
  const [plan, setPlan] = useState("free");
  const [forumBuzz, setForumBuzz] = useState<{ content: string; ts: string } | null>(null);
  const [forumLoading, setForumLoading] = useState(false);
  const [activeMethods, setActiveMethods] = useState<string[]>([]);
  const [gymDone, setGymDone] = useState<string[]>([]);
  const [gymOpen, setGymOpen] = useState<string | null>(null);
  const [gymJournal, setGymJournal] = useState("");
  const [dailyQ] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const chatRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<{ role: string; content: string }[]>([]);

  // Auth: check session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) loadUserData(session.user.id);
      if (!localStorage.getItem("fl_ob") && session?.user) setShowOnboard(true);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) loadUserData(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (profile) { setXp(profile.xp || 0); setStreak({ c: profile.streak_count || 0, d: profile.streak_date || "", b: profile.streak_best || 0 }); setPlan(profile.plan || "free"); }
    const { data: progress } = await supabase.from("progress").select("topic_id").eq("user_id", userId);
    if (progress) setDone(progress.map((r: any) => r.topic_id));
    const { data: gym } = await supabase.from("mind_gym").select("exercise_id").eq("user_id", userId);
    if (gym) setGymDone(gym.map((r: any) => r.exercise_id));
  };

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs, loading]);
  useEffect(() => { const last = [...msgs].reverse().find(m => m.role === "assistant"); if (last) setActiveMethods(detectMethods(last.content)); }, [msgs]);

  // Auth actions
  const doAuth = async (type: string) => {
    setAuthErr("");
    if (type === "google") {
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
      return;
    }
    try {
      if (authMode === "signup") {
        if (!form.name) { setAuthErr("Enter your name"); return; }
        const { error } = await supabase.auth.signUp({ email: form.email, password: form.pass, options: { data: { name: form.name } } });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.pass });
        if (error) throw error;
      }
    } catch (e: any) { setAuthErr(e.message); }
  };

  const doSignOut = async () => { await supabase.auth.signOut(); setUser(null); setDone([]); setGymDone([]); setMsgs([]); };

  // XP & Streak
  const addXp = async (amount: number) => {
    setXp(p => p + amount);
    if (user) await supabase.rpc("add_xp", { p_user_id: user.id, p_amount: amount }).catch(() => {});
  };

  const markDone = async (id: string) => {
    if (done.includes(id)) return;
    setDone(p => [...p, id]);
    await addXp(25);
    const item = PATHS.flatMap(p => p.items).find(i => i.id === id);
    const path = PATHS.find(p => p.items.some(i => i.id === id));
    if (user) await supabase.from("progress").upsert({ user_id: user.id, topic_id: id, topic_name: item?.name, path_id: path?.id }).catch(() => {});
  };

  const completeGym = async (exId: string, xpVal: number) => {
    if (gymDone.includes(exId)) return;
    setGymDone(p => [...p, exId]);
    await addXp(xpVal);
    if (user) await supabase.from("mind_gym").upsert({ user_id: user.id, exercise_id: exId, journal_entry: gymJournal, xp_earned: xpVal }).catch(() => {});
    setGymJournal("");
  };

  // AI
  const callAI = async (msg: string, hist: any[] = []) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: hist }),
      });
      const data = await res.json();
      return data.content || "Could you rephrase?";
    } catch { return "Connection issue — try again! 😊"; }
  };

  const openTopic = async (name: string, sub: string) => {
    setTopic({ name, sub }); setMsgs([]); hRef.current = []; setTab("lesson"); setLoading(true); window.scrollTo(0,0);
    const msg = `Teach me "${name}" (${sub}). Complete beginner. Search web for latest. Use all 15 methods.`;
    const res = await callAI(msg);
    hRef.current = [{ role: "user", content: msg }, { role: "assistant", content: res }];
    setMsgs([{ role: "assistant", content: res }]); setLoading(false);
  };

  const sendChat = async (text?: string) => {
    const msg = text || input.trim(); if (!msg || loading) return; setInput("");
    if (tab !== "lesson" && tab !== "tutor") { setTab("tutor"); setMsgs([]); hRef.current = []; setTopic(null); }
    setMsgs(p => [...p, { role: "user", content: msg }]); setLoading(true);
    const res = await callAI(msg, hRef.current);
    hRef.current = [...hRef.current, { role: "user", content: msg }, { role: "assistant", content: res }];
    setMsgs(p => [...p, { role: "assistant", content: res }]); setLoading(false);
  };

  const fetchForumBuzz = async () => {
    setForumLoading(true);
    const res = await callAI("Search the web. What's trending across Reddit r/ChatGPT, r/ClaudeAI, Hacker News, Product Hunt? ## 🔥 Top 5 Trending (title + summary + source) ## 🆕 Hottest New Tool ## 💡 Tip of the Day. Plain English.", []);
    setForumBuzz({ content: res, ts: new Date().toLocaleString() }); setForumLoading(false);
  };

  // Format
  const fmt = (t: string) => {
    if (!t) return "";
    return t
      .replace(/🧱\s*\*?\*?Real-World Analogy:?\*?\*?\s*/gi, '<div style="background:#dbeafe;border:1.5px solid #fde047;border-radius:10px;padding:12px;margin:10px 0"><div style="font-weight:700;color:#1e40af;font-size:11px;margin-bottom:3px">🧱 ANALOGY</div>')
      .replace(/🖼️\s*\*?\*?Picture This:?\*?\*?\s*/gi, '<div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:10px;padding:12px;margin:10px 0"><div style="font-weight:700;color:#1d4ed8;font-size:11px;margin-bottom:3px">🖼️ PICTURE THIS</div>')
      .replace(/🎯\s*\*?\*?Try This Now:?\*?\*?\s*/gi, '<div style="background:#ecfdf5;border:1.5px solid #6ee7b7;border-radius:10px;padding:12px;margin:10px 0"><div style="font-weight:700;color:#065f46;font-size:11px;margin-bottom:3px">🎯 TRY THIS NOW</div>')
      .replace(/💡\s*\*?\*?Did You Know\??\*?\*?\s*/gi, '<div style="background:#fefce8;border:1.5px solid #fde047;border-radius:10px;padding:12px;margin:10px 0"><div style="font-weight:700;color:#1e40af;font-size:11px;margin-bottom:3px">💡 FUN FACT</div>')
      .replace(/📝\s*\*?\*?Quiz[^*]*\*?\*?\s*/gi, '<div style="background:#eff6ff;border:2px solid #60a5fa;border-radius:12px;padding:14px;margin:14px 0"><div style="font-weight:700;color:#1e40af;font-size:12px;margin-bottom:6px">📝 QUIZ!</div>')
      .replace(/\*\*(.+?)\*\*/g, '<b style="color:#1e3a5f">$1</b>')
      .replace(/^(\d+)\.\s+(.+)$/gm, '<div style="display:flex;gap:9px;padding:6px 0"><span style="background:#1e3a5f;color:#fff;min-width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">$1</span><span style="line-height:1.6">$2</span></div>')
      .replace(/^([A-D])\)\s+(.+)$/gm, '<div style="display:flex;gap:8px;align-items:center;padding:10px 12px;margin:4px 0;border-radius:10px;border:2px solid #dbeafe;cursor:pointer;font-size:13px;background:#fff"><span style="background:#eff6ff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;color:#1e40af">$1</span><span>$2</span></div>')
      .replace(/^- (.+)$/gm, '<div style="padding:2px 0 2px 14px;position:relative"><span style="position:absolute;left:1px;color:#1e3a5f">•</span>$1</div>')
      .replace(/\n\n/g, '<div style="height:6px"></div>');
  };

  const allItems = PATHS.flatMap(p => p.items.map(i => ({ ...i, path: p.title })));
  const filtered = search ? allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sub.toLowerCase().includes(search.toLowerCase())) : [];

  const ONBOARD = [
    { icon: "🎓", title: "Welcome to fluentAI!", desc: "The first app that teaches everyone how to use every AI tool — step by step, in plain English. Powered by 15 proven learning science methods." },
    { icon: "📚", title: "How It Works", desc: "5 learning paths: Tools, Agents, Automation, Skills, and Agentic AI. Tap any topic for an interactive lesson with quizzes. You'll SEE which learning methods are active." },
    { icon: "🏋️", title: "Mind Gym — Stay Human", desc: "Daily exercises to keep your brain sharp and prevent AI over-reliance. Handwriting prompts, scenario thinking, empathy exercises. Backed by neuroscience." },
    { icon: "💬", title: "AI Tutor + Forums", desc: "Ask anything anytime. Forum Buzz shows what's trending across 14 AI communities in plain English." },
    { icon: "🔥", title: "Streaks, XP & Plans", desc: "Daily streaks, XP for lessons and Mind Gym. Free tier to start. Plus (£2.99/mo) and Pro (£5.99/mo) unlock everything." },
  ];

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userAvatar = userName[0]?.toUpperCase() || "U";

  /* ═══ LOADING ═══ */
  if (authLoading) return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fafaf9" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#2563eb,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20, margin: "0 auto 12px" }}>f</div>
        <p style={{ color: "#a8a29e", fontSize: 13 }}>Loading...</p>
      </div>
    </div>
  );

  /* ═══ LOGIN ═══ */
  if (!user) return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", background: "linear-gradient(145deg,#eff6ff,#dbeafe,#93c5fd)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,.1)", width: "100%", maxWidth: 400, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#2563eb,#1e3a5f)", padding: "28px 26px 22px", textAlign: "center", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>f</div>
            <span style={{ fontWeight: 800, fontSize: 24 }}>fluentAI</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px", opacity: .95 }}>Master every AI tool — step by step</p>
          <p style={{ fontSize: 12, margin: 0, opacity: .8, lineHeight: 1.5 }}>No tech skills needed. Interactive lessons powered by 15 proven learning science methods.</p>
        </div>
        <div style={{ display: "flex", gap: 4, padding: "14px 20px 0", flexWrap: "wrap", justifyContent: "center" }}>
          {["🛠️ 12+ Tools", "🤖 Agents", "⚡ Automation", "🏋️ Mind Gym", "📝 Quizzes", "🔥 Streaks"].map(f => (
            <span key={f} style={{ padding: "3px 9px", borderRadius: 12, background: "#dbeafe", fontSize: 10, fontWeight: 600, color: "#1e3a5f" }}>{f}</span>
          ))}
        </div>
        <div style={{ margin: "12px 20px", background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 10, padding: "9px 12px" }}>
          <p style={{ fontSize: 11.5, fontStyle: "italic", color: "#1e3a5f", margin: "0 0 2px", lineHeight: 1.4 }}>&ldquo;{dailyQ.t}&rdquo;</p>
          <p style={{ fontSize: 10, color: "#1d4ed8", margin: 0, fontWeight: 600 }}>— {dailyQ.by}</p>
        </div>
        <div style={{ padding: "4px 24px 24px" }}>
          <button onClick={() => doAuth("google")} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12, color: "#1a1a1a" }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 10px" }}><div style={{ flex: 1, height: 1, background: "#e5e7eb" }} /><span style={{ fontSize: 10, color: "#a8a29e" }}>or</span><div style={{ flex: 1, height: 1, background: "#e5e7eb" }} /></div>
          {authMode === "signup" && <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, marginBottom: 7, boxSizing: "border-box" }} />}
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, marginBottom: 7, boxSizing: "border-box" }} />
          <input type="password" value={form.pass} onChange={e => setForm(p => ({ ...p, pass: e.target.value }))} placeholder="Password" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, marginBottom: 4, boxSizing: "border-box" }} />
          {authErr && <p style={{ color: "#dc2626", fontSize: 11, margin: "3px 0" }}>{authErr}</p>}
          <button onClick={() => doAuth("email")} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2563eb,#1e3a5f)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 6 }}>{authMode === "login" ? "Log In" : "Create Free Account"}</button>
          <p style={{ fontSize: 12, color: "#78716c", marginTop: 10, textAlign: "center" }}>{authMode === "login" ? "No account? " : "Have one? "}<span style={{ color: "#1e3a5f", fontWeight: 600, cursor: "pointer" }} onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>{authMode === "login" ? "Sign up free" : "Log in"}</span></p>
        </div>
      </div>
    </div>
  );

  /* ═══ ONBOARDING ═══ */
  if (showOnboard) { const s = ONBOARD[obStep]; return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", background: "linear-gradient(135deg,#eff6ff,#dbeafe)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div key={obStep} style={{ background: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,.08)", width: "100%", maxWidth: 420, padding: "30px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>{s.icon}</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>{s.title}</h2>
        <p style={{ fontSize: 13, color: "#57534e", lineHeight: 1.7, margin: "0 0 20px" }}>{s.desc}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 16 }}>{ONBOARD.map((_, i) => <div key={i} style={{ width: i === obStep ? 18 : 7, height: 7, borderRadius: 4, background: i === obStep ? "#1e3a5f" : "#e7e5e4", transition: "all .3s" }} />)}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {obStep > 0 && <button onClick={() => setObStep(p => p - 1)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #e7e5e4", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#78716c" }}>Back</button>}
          <button onClick={() => { if (obStep < ONBOARD.length - 1) setObStep(p => p + 1); else { setShowOnboard(false); localStorage.setItem("fl_ob", "1"); } }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2563eb,#1e3a5f)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{obStep < ONBOARD.length - 1 ? "Next" : "Start Learning! 🚀"}</button>
        </div>
      </div>
    </div>
  ); }

  /* ═══ MAIN APP ═══ */
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", background: "#fafaf9", color: "#1a1a1a", minHeight: "100vh", paddingBottom: 72 }}>
      {/* HEADER */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f0eeeb", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", height: 46, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }} onClick={() => { setTab("learn"); setTopic(null); }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#2563eb,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 11 }}>f</div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>fluent<span style={{ color: "#1e3a5f" }}>AI</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ padding: "2px 7px", borderRadius: 10, background: streak.c > 0 ? "#dbeafe" : "#f5f5f4", fontSize: 11, fontWeight: 700 }}>{streak.c > 0 ? "🔥" : "💤"}{streak.c}</div>
            <div style={{ padding: "2px 7px", borderRadius: 10, background: "#eff6ff", fontSize: 11, fontWeight: 700, color: "#3b82f6" }}>⚡{xp}</div>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer" }} onClick={() => setTab("profile")}>{userAvatar}</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>
        {/* LEARN */}
        {tab === "learn" && (<div>
          <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 9, padding: "8px 12px", margin: "10px 0", textAlign: "center" }}>
            <p style={{ fontSize: 11, fontStyle: "italic", color: "#1e3a5f", margin: "0 0 2px", lineHeight: 1.4 }}>&ldquo;{dailyQ.t}&rdquo;</p>
            <p style={{ fontSize: 9.5, color: "#1d4ed8", margin: 0, fontWeight: 600 }}>— {dailyQ.by}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, margin: "0 0 8px" }}>
            {[{ v: done.length, l: "Learned", i: "📚" }, { v: streak.c, l: "Streak", i: "🔥" }, { v: streak.b, l: "Best", i: "🏆" }, { v: xp, l: "XP", i: "⚡" }].map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 8, border: "1px solid #f0eeeb", padding: "6px 4px", textAlign: "center" }}><div style={{ fontSize: 11 }}>{s.i}</div><div style={{ fontSize: 14, fontWeight: 800 }}>{s.v}</div><div style={{ fontSize: 8, color: "#a8a29e", fontWeight: 600 }}>{s.l}</div></div>
            ))}
          </div>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search any AI tool, skill, topic..." style={{ width: "100%", padding: "9px 12px 9px 30px", borderRadius: 8, border: "1.5px solid #e7e5e4", background: "#fff", fontSize: 12, boxSizing: "border-box" }} />
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, opacity: .4 }}>🔍</span>
            {search && filtered.length > 0 && (<div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e7e5e4", borderRadius: 8, marginTop: 2, maxHeight: 150, overflowY: "auto", zIndex: 50, boxShadow: "0 6px 16px rgba(0,0,0,.08)" }}>{filtered.slice(0, 5).map((it, i) => <div key={i} style={{ padding: "6px 10px", cursor: "pointer", borderBottom: "1px solid #f5f5f4", fontSize: 11 }} onClick={() => { setSearch(""); openTopic(it.name, it.sub); }}><b>{it.name}</b> <span style={{ color: "#a8a29e" }}>· {it.path}</span></div>)}</div>)}
          </div>
          <button onClick={() => { setShowOnboard(true); setObStep(0); }} style={{ width: "100%", padding: "7px", borderRadius: 7, border: "1.5px dashed #1e3a5f", background: "#eff6ff", color: "#1e3a5f", fontSize: 10.5, fontWeight: 600, cursor: "pointer", marginBottom: 10 }}>❓ How does this app work?</button>
          {PATHS.map((path, pi) => (<div key={path.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
              <span style={{ fontSize: 14 }}>{path.icon}</span><h2 style={{ fontSize: 12.5, fontWeight: 700, margin: 0 }}>{path.title}</h2>
              <div style={{ marginLeft: "auto", width: 32, height: 3, borderRadius: 2, background: "#f0eeeb", overflow: "hidden" }}><div style={{ height: "100%", width: `${(path.items.filter(i => done.includes(i.id)).length / path.items.length) * 100}%`, background: path.color }} /></div>
              <span style={{ fontSize: 9, color: "#a8a29e", fontWeight: 600 }}>{path.items.filter(i => done.includes(i.id)).length}/{path.items.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 4 }}>
              {path.items.map(item => { const isDone = done.includes(item.id); return (
                <div key={item.id} style={{ background: "#fff", border: isDone ? `2px solid ${item.c}` : "1.5px solid #e7e5e4", borderRadius: 8, padding: "8px", cursor: "pointer", position: "relative" }} onClick={() => openTopic(item.name, item.sub)}>
                  {isDone && <div style={{ position: "absolute", top: 4, right: 4, width: 12, height: 12, borderRadius: "50%", background: item.c, color: "#fff", fontSize: 7, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>}
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: item.c, marginBottom: 3 }} />
                  <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>{item.name}</div>
                  <div style={{ fontSize: 9, color: "#a8a29e", marginTop: 1 }}>{item.sub}</div>
                </div>
              ); })}
            </div>
          </div>))}
        </div>)}

        {/* LESSON / TUTOR */}
        {(tab === "lesson" || tab === "tutor") && (<div>
          {topic && tab === "lesson" && (<div style={{ borderBottom: "1px solid #f0eeeb", padding: "7px 0", marginBottom: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><button onClick={() => { setTab("learn"); setTopic(null); }} style={{ background: "none", border: "none", fontSize: 11, color: "#a8a29e", cursor: "pointer", padding: 0 }}>← Back</button><div style={{ fontSize: 13, fontWeight: 700, marginTop: 1 }}>{topic.name}</div></div>
            <button onClick={() => { const id = PATHS.flatMap(p => p.items).find(i => i.name === topic.name)?.id; if (id) markDone(id); }} style={{ padding: "5px 10px", borderRadius: 7, border: "none", background: done.includes(PATHS.flatMap(p => p.items).find(i => i.name === topic?.name)?.id || "") ? "#f5f5f4" : "#1e3a5f", color: done.includes(PATHS.flatMap(p => p.items).find(i => i.name === topic?.name)?.id || "") ? "#78716c" : "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{done.includes(PATHS.flatMap(p => p.items).find(i => i.name === topic?.name)?.id || "") ? "✓ Done" : "+25XP ✓"}</button>
          </div>)}
          {tab === "tutor" && msgs.length === 0 && <button onClick={() => setTab("learn")} style={{ background: "none", border: "none", fontSize: 11, color: "#a8a29e", cursor: "pointer", padding: "7px 0" }}>← Back</button>}
          {activeMethods.length > 0 && msgs.length > 0 && (<div style={{ margin: "4px 0 6px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#3b82f6", marginBottom: 3 }}>🟣 {activeMethods.length} METHODS ACTIVE</div>
            <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>{activeMethods.map((mid) => { const m = PM.find(p => p.id === mid); return m ? <span key={mid} style={{ padding: "2px 7px", borderRadius: 10, border: "1px solid #bfdbfe", background: "#eff6ff", fontSize: 9, fontWeight: 600, color: "#3b82f6" }}>{m.i}{m.n}</span> : null; })}</div>
          </div>)}
          <div ref={chatRef} style={{ background: "#fff", border: "1px solid #f0eeeb", borderRadius: 12, minHeight: 200, maxHeight: "calc(100vh - 320px)", overflowY: "auto", padding: 10, marginBottom: 5 }}>
            {msgs.length === 0 && tab === "tutor" && (<div style={{ textAlign: "center", padding: "28px 12px", color: "#a8a29e" }}><div style={{ fontSize: 26 }}>💬</div><p style={{ fontSize: 12, fontWeight: 600, color: "#78716c", margin: "4px 0 2px" }}>AI Tutor</p><p style={{ fontSize: 10.5, margin: 0 }}>Ask about any AI tool</p></div>)}
            {msgs.map((m, i) => (<div key={i} style={{ marginBottom: 7, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "92%", padding: "9px 12px", borderRadius: m.role === "user" ? "11px 11px 3px 11px" : "3px 11px 11px 11px", background: m.role === "user" ? "#1e3a5f" : "#f8f8f8", color: m.role === "user" ? "#fff" : "#1a1a1a", fontSize: 13, lineHeight: 1.7 }}>{m.role === "assistant" ? <div dangerouslySetInnerHTML={{ __html: fmt(m.content) }} /> : m.content}</div></div>))}
            {loading && <div style={{ display: "flex" }}><div style={{ padding: "9px 12px", borderRadius: "3px 11px 11px 11px", background: "#f8f8f8", fontSize: 12, color: "#a8a29e" }}>Preparing lesson...</div></div>}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <textarea style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e7e5e4", background: "#fff", fontSize: 12.5, resize: "none", lineHeight: 1.4, boxSizing: "border-box" }} rows={2} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }} placeholder={tab === "lesson" ? "Type A, B, C, D or ask..." : "Ask anything..."} />
            <button onClick={() => sendChat()} disabled={loading} style={{ padding: "0 13px", borderRadius: 8, border: "none", background: "#1e3a5f", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? .5 : 1 }}>↑</button>
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
            {(tab === "lesson" ? ["A", "B", "C", "D", "Explain simpler", "Next lesson"] : ["Build an agent", "Best free tools", "Automate email"]).map(q => (
              <button key={q} onClick={() => sendChat(q)} style={{ padding: q.length === 1 ? "5px 12px" : "3px 8px", borderRadius: q.length === 1 ? 7 : 10, border: q.length === 1 ? "2px solid #60a5fa" : "1.5px solid #e7e5e4", background: q.length === 1 ? "#eff6ff" : "#fff", fontSize: q.length === 1 ? 12 : 10, fontWeight: q.length === 1 ? 700 : 500, color: q.length === 1 ? "#1e40af" : "#78716c", cursor: "pointer" }}>{q}</button>
            ))}
          </div>
        </div>)}

        {/* MIND GYM */}
        {tab === "gym" && (<div style={{ paddingTop: 10 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 3px" }}>🏋️ Mind Gym</h2>
          <p style={{ fontSize: 12, color: "#57534e", margin: "0 0 12px", lineHeight: 1.5 }}>Daily exercises to keep your brain sharp. Pen & paper required! {gymDone.length}/{MIND_GYM.length} done</p>
          {MIND_GYM.map((ex) => { const isDone = gymDone.includes(ex.id); const isOpen = gymOpen === ex.id; return (
            <div key={ex.id} style={{ background: "#fff", border: isDone ? "2px solid #10a37f" : isOpen ? "2px solid #1e3a5f" : "1.5px solid #e7e5e4", borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }} onClick={() => setGymOpen(isOpen ? null : ex.id)}>
                <div style={{ fontSize: 18 }}>{isDone ? "✅" : ex.cat}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{ex.title}</div><div style={{ fontSize: 10, color: "#a8a29e" }}>⏱ {ex.mins}min · ⚡+{ex.xp}XP</div></div>
                <span style={{ color: "#a8a29e", fontSize: 16, transform: isOpen ? "rotate(180deg)" : "", transition: "transform .2s" }}>▾</span>
              </div>
              {isOpen && (<div style={{ padding: "0 14px 14px", borderTop: "1px solid #f0eeeb" }}>
                <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 10, padding: "12px 14px", margin: "10px 0" }}><div style={{ fontSize: 10, fontWeight: 700, color: "#1e3a5f", marginBottom: 4 }}>📝 EXERCISE</div><p style={{ fontSize: 13, color: "#57534e", margin: 0, lineHeight: 1.6 }}>{ex.prompt}</p></div>
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", margin: "8px 0" }}><div style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", marginBottom: 3 }}>🧠 SCIENCE</div><p style={{ fontSize: 11.5, color: "#2563eb", margin: 0, lineHeight: 1.5 }}>{ex.science}</p></div>
                <textarea value={gymJournal} onChange={e => setGymJournal(e.target.value)} placeholder="Reflect here after handwriting..." style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e7e5e4", fontSize: 12, resize: "none", lineHeight: 1.5, margin: "6px 0", boxSizing: "border-box" }} rows={3} />
                <button onClick={() => completeGym(ex.id, ex.xp)} disabled={isDone} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: isDone ? "#f0fdf4" : "linear-gradient(135deg,#10a37f,#059669)", color: isDone ? "#065f46" : "#fff", fontSize: 12, fontWeight: 700, cursor: isDone ? "default" : "pointer" }}>{isDone ? "✓ Done!" : `Complete +${ex.xp}XP`}</button>
              </div>)}
            </div>
          ); })}
        </div>)}

        {/* FORUMS */}
        {tab === "forums" && (<div style={{ paddingTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>🌐 Forum Buzz</h2>
            <button onClick={fetchForumBuzz} disabled={forumLoading} style={{ padding: "5px 10px", borderRadius: 7, border: "none", background: "#1e3a5f", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{forumLoading ? "Scanning..." : "🔄 Trending"}</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 4, marginBottom: 10 }}>
            {FORUMS.map((f, i) => (<a key={i} href={f.url} target="_blank" rel="noopener noreferrer" style={{ background: "#fff", border: "1.5px solid #e7e5e4", borderRadius: 7, padding: "7px 9px", textDecoration: "none", color: "#1a1a1a" }}><div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 11 }}>{f.icon}</span><span style={{ fontSize: 10.5, fontWeight: 600 }}>{f.name}</span></div><div style={{ fontSize: 9, color: "#a8a29e", marginTop: 1 }}>{f.m} · ↗</div></a>))}
          </div>
          {forumLoading && <div style={{ textAlign: "center", padding: 20 }}><span style={{ fontSize: 22 }}>🔍</span><p style={{ fontSize: 11, color: "#78716c", marginTop: 4 }}>Scanning...</p></div>}
          {forumBuzz && !forumLoading && (<div style={{ background: "#fff", border: "1.5px solid #e7e5e4", borderRadius: 11, padding: 14, fontSize: 13, lineHeight: 1.7 }}><div dangerouslySetInnerHTML={{ __html: fmt(forumBuzz.content) }} /><button onClick={() => { setTab("tutor"); setMsgs([]); hRef.current = []; setTopic(null); setTimeout(() => sendChat("Teach me about what's trending on AI forums today."), 100); }} style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 7, border: "none", background: "#1e3a5f", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>💬 Teach me this</button></div>)}
        </div>)}

        {/* PLANS */}
        {tab === "plans" && (<div style={{ paddingTop: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 2px", textAlign: "center" }}>Plans</h2>
          <p style={{ fontSize: 11, color: "#78716c", margin: "0 0 12px", textAlign: "center" }}>7-day free trial · Cancel anytime</p>
          {[{ id: "free", n: "Free", p: "£0", pr: "", pop: false, ac: "#78716c", f: ["5 msgs/day", "All paths", "Streaks & XP", "Mind Gym"] }, { id: "plus", n: "Plus", p: "£2.99", pr: "/mo", pop: true, ac: "#1e3a5f", f: ["Unlimited tutor", "All quizzes", "Videos", "Certificates"] }, { id: "pro", n: "Pro", p: "£5.99", pr: "/mo", pop: false, ac: "#3b82f6", f: ["Everything +", "Release-day tools", "LinkedIn certs", "Family (2)"] }, { id: "teams", n: "Teams", p: "£9.99", pr: "/seat", pop: false, ac: "#0ea5e9", f: ["Everything +", "Admin", "Analytics", "SSO"] }].map(p => (
            <div key={p.id} style={{ border: p.pop ? `2px solid ${p.ac}` : "1.5px solid #e7e5e4", borderRadius: 12, padding: 13, marginBottom: 7, position: "relative", background: plan === p.id ? `${p.ac}06` : "#fff" }}>
              {p.pop && <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", background: p.ac, color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 10px", borderRadius: 10 }}>POPULAR</div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{p.n}</h3><div><span style={{ fontSize: 20, fontWeight: 800 }}>{p.p}</span><span style={{ fontSize: 10, color: "#78716c" }}>{p.pr}</span></div></div>
              <div style={{ marginTop: 6 }}>{p.f.map((f, i) => <div key={i} style={{ display: "flex", gap: 5, padding: "2px 0", fontSize: 11, color: "#57534e" }}><span style={{ color: p.ac }}>✓</span>{f}</div>)}</div>
              <button onClick={() => setPlan(p.id)} style={{ width: "100%", marginTop: 7, padding: "8px", borderRadius: 7, border: plan === p.id ? `2px solid ${p.ac}` : "none", background: plan === p.id ? "#fff" : p.pop ? `linear-gradient(135deg,#2563eb,${p.ac})` : "#f3f4f6", color: plan === p.id ? p.ac : p.pop ? "#fff" : "#57534e", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{plan === p.id ? "✓ Current" : "Free Trial"}</button>
            </div>
          ))}
        </div>)}

        {/* PROFILE */}
        {tab === "profile" && (<div style={{ paddingTop: 10 }}>
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px", fontSize: 16, color: "#fff", fontWeight: 700 }}>{userAvatar}</div>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{userName}</h2>
            <p style={{ fontSize: 10, color: "#a8a29e", margin: "2px 0 0" }}>{user?.email}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 10 }}>
            {[{ v: done.length, l: "Learned", i: "📚" }, { v: streak.c, l: "Streak", i: "🔥" }, { v: gymDone.length, l: "Gym", i: "🏋️" }, { v: xp, l: "XP", i: "⚡" }].map((s, i) => (<div key={i} style={{ background: "#fff", border: "1px solid #f0eeeb", borderRadius: 8, padding: "8px 4px", textAlign: "center" }}><div style={{ fontSize: 12 }}>{s.i}</div><div style={{ fontSize: 15, fontWeight: 800 }}>{s.v}</div><div style={{ fontSize: 8, color: "#a8a29e", fontWeight: 600 }}>{s.l}</div></div>))}
          </div>
          {PATHS.map(p => { const pct = Math.round((p.items.filter(i => done.includes(i.id)).length / p.items.length) * 100); return (<div key={p.id} style={{ background: "#fff", border: "1px solid #f0eeeb", borderRadius: 7, padding: "6px 10px", marginBottom: 3 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, marginBottom: 2 }}><span>{p.icon} {p.title}</span><span style={{ color: p.color }}>{pct}%</span></div><div style={{ height: 3, borderRadius: 2, background: "#f5f5f4", overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: p.color }} /></div></div>); })}
          <button onClick={doSignOut} style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 7, border: "1.5px solid #e7e5e4", background: "#fff", color: "#78716c", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Log Out</button>
        </div>)}
      </main>

      {/* BOTTOM NAV */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #f0eeeb", padding: "2px 0 env(safe-area-inset-bottom, 3px)", zIndex: 100 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          {[{ id: "learn", i: "📚", l: "Learn" }, { id: "tutor", i: "💬", l: "Tutor" }, { id: "gym", i: "🏋️", l: "Gym" }, { id: "forums", i: "🌐", l: "Forums" }, { id: "plans", i: "👑", l: "Plans" }, { id: "profile", i: "👤", l: "Me" }].map(n => (
            <button key={n.id} onClick={() => { setTab(n.id); window.scrollTo(0,0); if (n.id === "tutor") { setTopic(null); setMsgs([]); hRef.current = []; } if (n.id === "forums" && !forumBuzz) fetchForumBuzz(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 5px", textAlign: "center" }}>
              <div style={{ fontSize: 14 }}>{n.i}</div>
              <div style={{ fontSize: 8, fontWeight: 600, color: tab === n.id ? "#1e3a5f" : "#a8a29e" }}>{n.l}</div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
