import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Database,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  FlaskConical,
  Gauge,
  Globe2,
  Home as HomeIcon,
  ImageUp,
  Info,
  LayoutDashboard,
  Library,
  ListChecks,
  Menu,
  MessageSquareText,
  PackageSearch,
  PanelLeft,
  Plus,
  ScanLine,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

type PageId = "overview" | "assistant" | "standards" | "scanner" | "compliance" | "reports" | "admin";
type ClaimStatus = "supported" | "review" | "issue";

type NavItem = {
  id: PageId;
  label: string;
  icon: LucideIcon;
  group: "Workspace" | "Manage";
  badge?: string;
};

type Source = {
  title: string;
  url: string;
  type: string;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
};

const sources: Source[] = [
  { title: "BIS Product Certification", url: "https://www.bis.gov.in/product-certification/", type: "Official BIS" },
  { title: "Know Your Standard", url: "https://www.bis.gov.in/know-your-standard/", type: "Official BIS" },
  { title: "Product Certification Process", url: "https://www.bis.gov.in/product-certification/product-certification-process/", type: "Official BIS" },
];

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Workspace" },
  { id: "assistant", label: "BIS Assistant", icon: MessageSquareText, group: "Workspace" },
  { id: "standards", label: "Find a standard", icon: Search, group: "Workspace" },
  { id: "scanner", label: "Product scanner", icon: ScanLine, group: "Workspace", badge: "Demo" },
  { id: "compliance", label: "Compliance review", icon: ClipboardCheck, group: "Workspace" },
  { id: "reports", label: "Reports", icon: FileText, group: "Workspace" },
  { id: "admin", label: "Knowledge admin", icon: Settings2, group: "Manage" },
];

const recentQueries = [
  { query: "What BIS requirements apply to a pressure cooker?", time: "Today, 10:42 AM", status: "Answered" },
  { query: "How do I locate a testing laboratory?", time: "Yesterday, 4:18 PM", status: "Answered" },
  { query: "Is BIS certification mandatory for my product?", time: "Sep 26, 9:07 AM", status: "Needs detail" },
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    text: "Welcome to BISmart AI. I can help you navigate BIS standards, certification steps, product labels and source-backed next steps. What are you working on today?",
    sources,
  },
];

const demoClaims: { claim: string; status: ClaimStatus; evidence: string; explanation: string }[] = [
  { claim: "No added sugar", status: "supported", evidence: "Ingredients panel does not show added sugar in the demo label.", explanation: "The extracted ingredient evidence is consistent with this claim, but a regulatory review is still recommended." },
  { claim: "100% natural", status: "review", evidence: "Marketing claim detected; ingredient evidence is incomplete.", explanation: "Cannot verify this claim from the available product information." },
  { claim: "High fibre", status: "issue", evidence: "Nutrition panel shows 1.2 g fibre per serving in the demo scan.", explanation: "Potentially not supported by the available nutrition evidence. Check the applicable requirement before relying on this claim." },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="brand-mark"><span>BIS</span><div className="brand-spark" /></div>
      {!compact && <div className="leading-none"><div className="font-display text-[17px] font-bold tracking-[-0.03em] text-slate-950">BISmart <span className="text-cyan-700">AI</span></div><div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">Standards intelligence</div></div>}
    </div>
  );
}

function StatusDot({ status }: { status: ClaimStatus }) {
  const config = {
    supported: { label: "Supported", className: "status-supported", icon: CheckCircle2 },
    review: { label: "Cannot verify", className: "status-review", icon: CircleHelp },
    issue: { label: "Potential issue", className: "status-issue", icon: AlertTriangle },
  }[status];
  const Icon = config.icon;
  return <span className={`status-pill ${config.className}`}><Icon className="h-3.5 w-3.5" />{config.label}</span>;
}

function SourcePills({ items = sources }: { items?: Source[] }) {
  return <div className="mt-3 flex flex-wrap gap-2">{items.map((source) => <a key={source.title} href={source.url} target="_blank" rel="noreferrer" className="source-pill"><ShieldCheck className="h-3.5 w-3.5" />{source.title}<ExternalLink className="h-3 w-3 opacity-60" /></a>)}</div>;
}

function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex items-end justify-between gap-4"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-slate-950 md:text-[29px]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>{action}</div>;
}

function StatCard({ label, value, delta, icon: Icon, tone = "blue" }: { label: string; value: string; delta: string; icon: LucideIcon; tone?: "blue" | "green" | "amber" | "slate" }) {
  return <div className="stat-card"><div className={`stat-icon tone-${tone}`}><Icon className="h-[18px] w-[18px]" /></div><div className="mt-5 flex items-end justify-between gap-3"><div><div className="text-[12px] font-medium text-slate-500">{label}</div><div className="mt-1 font-display text-[27px] font-bold tracking-[-0.04em] text-slate-950">{value}</div></div><span className="text-[11px] font-semibold text-emerald-600">{delta}</span></div></div>;
}

function Overview({ setPage }: { setPage: (page: PageId) => void }) {
  return <div className="page-wrap">
    <SectionHeading eyebrow="Workspace overview" title="Good morning, Arjun" description="A focused view of your BIS discovery, product scans and review queue." action={<button onClick={() => setPage("assistant")} className="primary-button hidden sm:flex"><MessageSquareText className="h-4 w-4" />Ask BISmart AI</button>} />
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total queries" value="24" delta="+18%" icon={MessageSquareText} /><StatCard label="Products scanned" value="08" delta="+3 this week" icon={ScanLine} tone="green" /><StatCard label="Claims analysed" value="31" delta="+12%" icon={ClipboardCheck} tone="amber" /><StatCard label="Reports generated" value="05" delta="+2 this week" icon={FileDown} tone="slate" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><div className="eyebrow">Continue where you left off</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Compliance review · Nourish granola</h2></div><span className="review-chip">Needs review</span></div><div className="p-5"><div className="mb-5 grid gap-4 md:grid-cols-[1fr_185px] md:items-center"><div><div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>Review progress</span><span>72%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[72%] rounded-full bg-cyan-600" /></div><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Three label claims extracted from the uploaded demo package. One potential issue needs evidence before you continue.</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Clock3 className="h-3.5 w-3.5 text-cyan-600" />Last activity</div><div className="mt-2 text-sm font-semibold text-slate-800">Today, 10:28 AM</div><div className="mt-1 text-xs text-slate-400">OCR + claims pass completed</div></div></div><button onClick={() => setPage("compliance")} className="secondary-button">Open review <ArrowUpRight className="h-4 w-4" /></button></div></div>
      <div className="surface-card p-5"><div className="eyebrow">Trust layer</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Knowledge base health</h2><div className="mt-5 flex items-center gap-4"><div className="health-ring"><div><span>92</span><small>%</small></div></div><div><div className="text-sm font-semibold text-slate-800">Healthy and indexed</div><p className="mt-1 text-xs leading-5 text-slate-500">Official BIS sources are prioritized for every answer.</p></div></div><div className="mt-5 space-y-3 text-xs"><div className="flex justify-between"><span className="text-slate-500">Documents indexed</span><span className="font-semibold text-slate-800">124</span></div><div className="flex justify-between"><span className="text-slate-500">Standards references</span><span className="font-semibold text-slate-800">87</span></div><div className="flex justify-between"><span className="text-slate-500">Last sync</span><span className="font-semibold text-slate-800">28 Sep 2026</span></div></div></div>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="surface-card p-5"><div className="mb-4 flex items-center justify-between"><div><div className="eyebrow">Quick actions</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Start with a focused task</h2></div><Sparkles className="h-5 w-5 text-cyan-600" /></div><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setPage("standards")} className="action-tile"><div className="action-icon bg-cyan-50 text-cyan-700"><Search className="h-5 w-5" /></div><div><div className="font-semibold text-slate-800">Find a standard</div><p>Map a product to relevant BIS guidance.</p></div><ChevronRight className="ml-auto h-4 w-4 text-slate-300" /></button><button onClick={() => setPage("scanner")} className="action-tile"><div className="action-icon bg-violet-50 text-violet-700"><ScanLine className="h-5 w-5" /></div><div><div className="font-semibold text-slate-800">Scan a product</div><p>Extract label fields and claims.</p></div><ChevronRight className="ml-auto h-4 w-4 text-slate-300" /></button><button onClick={() => setPage("assistant")} className="action-tile"><div className="action-icon bg-amber-50 text-amber-700"><Bot className="h-5 w-5" /></div><div><div className="font-semibold text-slate-800">Ask the assistant</div><p>Get source-backed BIS context.</p></div><ChevronRight className="ml-auto h-4 w-4 text-slate-300" /></button><button onClick={() => setPage("reports")} className="action-tile"><div className="action-icon bg-emerald-50 text-emerald-700"><FileText className="h-5 w-5" /></div><div><div className="font-semibold text-slate-800">View reports</div><p>Export and share your analysis.</p></div><ChevronRight className="ml-auto h-4 w-4 text-slate-300" /></button></div></div>
      <div className="surface-card p-5"><div className="mb-4 flex items-center justify-between"><div><div className="eyebrow">Recent activity</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Your latest queries</h2></div><button onClick={() => setPage("assistant")} className="text-xs font-semibold text-cyan-700 hover:text-cyan-800">View all</button></div><div className="divide-y divide-slate-100">{recentQueries.map((item) => <div key={item.query} className="flex gap-3 py-3 first:pt-0 last:pb-0"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><MessageSquareText className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-slate-700">{item.query}</div><div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400"><span>{item.time}</span><span>·</span><span className={item.status === "Answered" ? "text-emerald-600" : "text-amber-600"}>{item.status}</span></div></div></div>)}</div></div>
    </div>
  </div>;
}

function Assistant({ language, setLanguage }: { language: string; setLanguage: (language: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [query, setQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const suggested = ["What BIS requirements apply to a pressure cooker?", "How can a manufacturer start certification?", "How do I find a testing laboratory?"];
  const ask = (value = query) => {
    const clean = value.trim();
    if (!clean || isThinking) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: clean }]);
    setQuery(""); setIsThinking(true);
    window.setTimeout(() => {
      const isPressure = clean.toLowerCase().includes("pressure") || clean.toLowerCase().includes("cooker");
      const answer = isPressure
        ? "For a pressure cooker, begin by confirming the exact product scope and current applicability in the official BIS standard lookup. BISmart’s demo knowledge base does not assert a standard number without a verified retrieval match. The practical path is: identify the product and variants, check certification applicability, confirm the applicable scheme, then review documents and testing requirements through official BIS guidance."
        : "I found a relevant guidance path in the demo knowledge base. Start with the official BIS product-certification process, then confirm the current product scope, applicable scheme, documents and laboratory requirements for your exact product. I have not treated this answer as a regulatory decision.";
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: answer, sources }]);
      setIsThinking(false);
    }, 750);
  };
  return <div className="page-wrap"><SectionHeading eyebrow="Source-backed guidance" title="BIS Assistant" description="Ask in plain language. Answers are grounded in the trusted knowledge layer and show the source trail used for the response." action={<div className="flex items-center gap-2"><label className="sr-only" htmlFor="assistant-language">Assistant language</label><select id="assistant-language" value={language} onChange={(event) => setLanguage(event.target.value)} className="select-control"><option>English</option><option>हिन्दी</option><option>ಕನ್ನಡ</option></select></div>} />
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <div className="surface-card flex min-h-[610px] flex-col overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-3"><div className="assistant-orb"><Bot className="h-5 w-5" /></div><div><div className="flex items-center gap-2"><h2 className="font-semibold text-slate-900">BISmart Copilot</h2><span className="live-chip"><span />Live demo</span></div><p className="mt-0.5 text-xs text-slate-400">Retrieval-first · facts separated from explanation</p></div></div><button className="icon-button" aria-label="Assistant settings"><SlidersHorizontal className="h-4 w-4" /></button></div><div className="flex-1 space-y-5 overflow-auto bg-[linear-gradient(180deg,#fbfdff_0%,#f7fafc_100%)] p-5">{messages.map((message) => <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>{message.role === "assistant" && <div className="message-avatar"><Bot className="h-4 w-4" /></div>}<div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-slate-900 text-white" : "rounded-tl-md border border-slate-200 bg-white text-slate-600 shadow-sm"}`}><p>{message.text}</p>{message.sources && <><div className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Retrieved sources</div><SourcePills items={message.sources} /></>}</div></div>)}{isThinking && <div className="flex gap-3"><div className="message-avatar"><Bot className="h-4 w-4" /></div><div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm"><div className="flex items-center gap-1.5"><span className="thinking-dot" /><span className="thinking-dot delay-1" /><span className="thinking-dot delay-2" /><span className="ml-2 text-xs text-slate-400">Checking BIS knowledge sources</span></div></div></div>}</div><div className="border-t border-slate-100 bg-white p-4"><div className="mb-3 flex flex-wrap gap-2">{suggested.map((item) => <button key={item} onClick={() => { setQuery(item); ask(item); }} className="suggestion-chip">{item}</button>)}</div><div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100"><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") ask(); }} placeholder="Ask about a standard, certification, licensing or testing..." className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400" /><button onClick={() => ask()} className="primary-button !rounded-xl !px-3" aria-label="Send query"><Send className="h-4 w-4" /></button></div><p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400"><Info className="h-3.5 w-3.5" />AI-assisted guidance only. Always confirm current requirements with the official BIS source.</p></div></div>
      <div className="space-y-5"><div className="surface-card p-5"><div className="eyebrow">How it works</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">A safer answer path</h2><div className="mt-5 space-y-4">{[["01", "Understand intent", "Classify your request: standard, certification, lab or product label."], ["02", "Retrieve evidence", "Search trusted BIS documents before an answer is drafted."], ["03", "Explain with context", "Separate retrieved facts, interpretation and next steps."]].map(([number, title, copy]) => <div key={number} className="flex gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-[10px] font-bold text-cyan-700">{number}</div><div><div className="text-sm font-semibold text-slate-800">{title}</div><p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p></div></div>)}</div></div><div className="surface-card border-l-4 border-l-amber-400 bg-amber-50/50 p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><div className="text-sm font-semibold text-amber-900">Insufficient information is a valid answer</div><p className="mt-1 text-xs leading-5 text-amber-800/75">BISmart will not invent standards, licensing steps or official certification decisions when the knowledge layer cannot support them.</p></div></div></div></div>
    </div>
  </div>;
}

function Standards() {
  const [product, setProduct] = useState("Pressure Cooker");
  const [description, setDescription] = useState("Domestic stovetop pressure cooker for household use");
  const [searched, setSearched] = useState(true);
  const [category, setCategory] = useState("Kitchen & household");
  const result = useMemo(() => product.toLowerCase().includes("pressure") ? { title: "Pressure cooker · potential match", note: "The demo knowledge layer identifies this as a likely product scope. Verify the current standard number and certification applicability in the official BIS lookup.", confidence: "High product relevance", source: sources[1] } : { title: `${product || "Product"} · discovery result`, note: "Potentially relevant — verify with official BIS source. Add more product detail to improve retrieval confidence.", confidence: "Needs more detail", source: sources[1] }, [product]);
  return <div className="page-wrap"><SectionHeading eyebrow="Knowledge discovery" title="Find an applicable standard" description="Describe the product in your own words. BISmart will surface potentially relevant scopes without fabricating a standard number." action={<span className="demo-label"><Database className="h-3.5 w-3.5" />Demo knowledge base</span>} />
    <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]"><div className="surface-card p-5"><div className="eyebrow">Product context</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Tell us about the product</h2><div className="mt-5 space-y-4"><div><label className="field-label" htmlFor="standard-product">Product name</label><input id="standard-product" value={product} onChange={(event) => setProduct(event.target.value)} className="field-control" /></div><div><label className="field-label" htmlFor="standard-category">Category</label><select id="standard-category" value={category} onChange={(event) => setCategory(event.target.value)} className="field-control"><option>Kitchen & household</option><option>Packaged food</option><option>Electrical appliance</option><option>Personal protective equipment</option><option>Other</option></select></div><div><label className="field-label" htmlFor="standard-description">Product description</label><textarea id="standard-description" value={description} onChange={(event) => setDescription(event.target.value)} className="field-control min-h-[110px] resize-none" /></div><div className="upload-strip"><ImageUp className="h-5 w-5 text-cyan-600" /><div><div className="text-xs font-semibold text-slate-700">Optional product image</div><div className="mt-0.5 text-[11px] text-slate-400">Use Product scanner for OCR and label extraction.</div></div><button className="ml-auto text-xs font-semibold text-cyan-700">Add</button></div><button onClick={() => setSearched(true)} className="primary-button w-full justify-center"><Search className="h-4 w-4" />Find potential matches</button></div></div><div className="space-y-5">{searched && <div className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><div className="eyebrow">Retrieval result</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">{result.title}</h2></div><span className="confidence-chip"><CheckCircle2 className="h-3.5 w-3.5" />{result.confidence}</span></div><div className="p-5"><div className="grid gap-4 md:grid-cols-[1fr_150px]"><div><div className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">Standard number</div><div className="mt-2 text-sm font-semibold text-slate-800">Not asserted in demo</div><p className="mt-1 text-xs leading-5 text-slate-500">BISmart never invents a standard number. Confirm the current reference from the official source below.</p></div><div className="rounded-2xl bg-cyan-50 p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">Relevance</div><div className="mt-1 font-display text-2xl font-bold text-cyan-900">86%</div><div className="mt-1 text-[11px] text-cyan-800/70">Product scope match</div></div></div><div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><p className="text-sm leading-6 text-amber-900">{result.note}</p></div></div><div className="mt-5"><div className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">Retrieved source</div><a href={result.source.url} target="_blank" rel="noreferrer" className="source-row mt-2"><div className="source-favicon"><Library className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-slate-800">{result.source.title}</div><div className="mt-1 text-xs text-slate-400">{result.source.type} · official lookup</div></div><ExternalLink className="h-4 w-4 text-slate-400" /></a></div></div></div>}<div className="surface-card p-5"><div className="flex items-center gap-3"><div className="step-line"><span className="step-active">1</span><span /><span>2</span><span /><span>3</span></div><div><div className="text-sm font-semibold text-slate-800">What happens next?</div><p className="mt-1 text-xs text-slate-500">Confirm product scope → check applicability → follow official certification guidance.</p></div></div><SourcePills items={[sources[0], sources[1]]} /></div></div></div>
  </div>;
}

function Scanner({ onComplete }: { onComplete: () => void }) {
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [activeTab, setActiveTab] = useState<"front" | "back" | "barcode">("front");
  const processFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name); setPreview(URL.createObjectURL(file)); setScanDone(false); setScanning(true);
    window.setTimeout(() => { setScanning(false); setScanDone(true); onComplete(); }, 1000);
  };
  return <div className="page-wrap"><SectionHeading eyebrow="Visual product intelligence" title="Product scanner" description="Upload a label, package or barcode image. The demo OCR flow extracts editable fields before any claim assessment." action={<span className="demo-label"><ScanLine className="h-3.5 w-3.5" />OCR demo mode</span>} />
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><div className="surface-card p-5"><div className="eyebrow">Step 01 · Upload evidence</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Capture the label clearly</h2><div className="mt-5 flex gap-1 rounded-xl bg-slate-100 p-1">{[["front", "Front label"], ["back", "Back label"], ["barcode", "Barcode / QR"]].map(([value, label]) => <button key={value} onClick={() => setActiveTab(value as typeof activeTab)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${activeTab === value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>{label}</button>)}</div><label htmlFor="product-upload" className="upload-zone mt-4 block"><input id="product-upload" type="file" accept="image/*" className="sr-only" onChange={(event) => processFile(event.currentTarget.files?.[0])} />{preview ? <img src={preview} alt="Uploaded product label" className="mx-auto h-36 w-full rounded-xl object-cover" /> : <><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><UploadCloud className="h-6 w-6" /></div><div className="mt-3 text-sm font-semibold text-slate-700">Drop an image or browse files</div><div className="mt-1 text-xs text-slate-400">JPG, PNG or WEBP · multiple images supported</div></>}</label>{fileName && <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="min-w-0 flex-1 truncate font-medium text-slate-700">{fileName}</span><button onClick={() => { setFileName(""); setPreview(""); setScanDone(false); }} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button></div>}<div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex gap-3"><Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" /><div><div className="text-xs font-semibold text-slate-700">Good scans give better evidence</div><p className="mt-1 text-[11px] leading-5 text-slate-500">Keep the label flat, well lit and in focus. OCR output stays editable so you can correct mistakes before verification.</p></div></div></div></div><div className="space-y-5"><div className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><div className="eyebrow">Step 02 · Extraction pipeline</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">{scanning ? "Processing image evidence" : scanDone ? "Extraction complete" : "Ready for a new scan"}</h2></div>{scanning ? <div className="processing-chip"><span className="processing-spinner" />Running</div> : scanDone ? <span className="success-chip"><Check className="h-3.5 w-3.5" />Ready to review</span> : <span className="neutral-chip">Waiting for upload</span>}</div><div className="p-5"><div className="pipeline">{[["Image preprocessing", "Resize · contrast · deskew"], ["OCR + barcode", "Text and code detection"], ["Field extraction", "Label data into editable fields"], ["Claims detection", "Evidence queue created"]].map(([title, detail], index) => <div key={title} className={`pipeline-step ${scanning || scanDone ? "is-active" : ""}`}><div className="pipeline-number">{scanDone ? <Check className="h-3.5 w-3.5" /> : index + 1}</div><div><div className="text-sm font-semibold text-slate-800">{title}</div><div className="mt-1 text-xs text-slate-400">{detail}</div></div></div>)}</div></div></div>{scanDone && <div className="surface-card p-5"><div className="mb-4 flex items-center justify-between"><div><div className="eyebrow">Step 03 · Editable OCR result</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Nourish Oat Granola</h2></div><span className="confidence-chip">92% OCR confidence</span></div><div className="grid gap-3 sm:grid-cols-2">{[["Product name", "Nourish Oat Granola"], ["Brand", "Nourish Foods"], ["Net quantity", "400 g"], ["MRP", "₹ 249"], ["Country of origin", "India"], ["Detected claims", "No added sugar · High fibre"]].map(([label, value]) => <div key={label}><label className="field-label">{label}</label><input defaultValue={value} className="field-control !py-2.5 text-sm" /></div>)}</div><div className="mt-4 flex flex-wrap gap-2"><span className="source-tag">Barcode detected</span><span className="source-tag">Ingredients found</span><span className="source-tag">Nutrition panel found</span></div></div>}</div></div>
  </div>;
}

function Compliance({ scanReady, onReport }: { scanReady: boolean; onReport: () => void }) {
  const [tab, setTab] = useState<"claims" | "summary">("claims");
  return <div className="page-wrap"><SectionHeading eyebrow="Preliminary assessment" title="Compliance review" description="Review extracted evidence, claims and missing information in one explainable workspace." action={<button onClick={onReport} className="secondary-button"><FileDown className="h-4 w-4" />Generate report</button>} />
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900"><AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" /><span>This is an AI-assisted preliminary assessment. It is not official BIS certification, regulatory approval or an authenticity guarantee.</span></div>
    <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]"><div className="space-y-5"><div className="surface-card p-5"><div className="eyebrow">Review snapshot</div><div className="mt-4 flex items-center gap-4"><div className="compliance-score"><span>68</span><small>/100</small></div><div><div className="text-sm font-semibold text-slate-800">Requires review</div><p className="mt-1 text-xs leading-5 text-slate-500">Evidence supports some label content; two items need follow-up.</p></div></div><div className="mt-5 space-y-3">{[["Information supports requirement", "4", "supported"], ["Requires review", "2", "review"], ["Potential issue", "1", "issue"]].map(([label, count, status]) => <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-medium text-slate-600"><span className={`mini-status ${status}`} />{label}</div><span className="text-sm font-bold text-slate-800">{count}</span></div>)}</div></div><div className="surface-card p-5"><div className="eyebrow">Product under review</div><div className="mt-3 flex items-center gap-3"><div className="product-thumb"><PackageSearch className="h-5 w-5" /></div><div><div className="text-sm font-semibold text-slate-800">Nourish Oat Granola</div><div className="mt-1 text-xs text-slate-400">400 g · scan #BS-0028</div></div></div><div className="mt-4 space-y-2 text-xs"><div className="flex justify-between"><span className="text-slate-500">Applicable standard</span><span className="font-semibold text-amber-700">Verify official lookup</span></div><div className="flex justify-between"><span className="text-slate-500">Barcode</span><span className="font-semibold text-emerald-600">Detected, not authenticated</span></div></div></div></div><div className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><div className="eyebrow">Evidence review</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Claim verification</h2></div><div className="flex rounded-xl bg-slate-100 p-1"><button onClick={() => setTab("claims")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === "claims" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>Claims</button><button onClick={() => setTab("summary")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === "summary" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>Summary</button></div></div>{tab === "claims" ? <div className="divide-y divide-slate-100">{demoClaims.map((item) => <div key={item.claim} className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div className="font-semibold text-slate-800">“{item.claim}”</div><StatusDot status={item.status} /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><div><div className="review-label">Evidence found</div><p className="mt-1 text-sm leading-6 text-slate-600">{item.evidence}</p></div><div><div className="review-label">Assessment explanation</div><p className="mt-1 text-sm leading-6 text-slate-600">{item.explanation}</p></div></div><div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><BookOpen className="h-3.5 w-3.5 text-cyan-600" />Applicable requirement: <a href={sources[1].url} target="_blank" rel="noreferrer" className="font-semibold text-cyan-700 hover:underline">retrieved official reference</a><ExternalLink className="h-3 w-3" /></div></div>)}</div> : <div className="p-5"><div className="grid gap-3 sm:grid-cols-2">{[["Detected information", "Product, brand, net quantity, MRP"], ["Detected claims", "3 claims · 1 potentially unsupported"], ["Missing information", "Current standard number and scheme"], ["Next best action", "Confirm official applicability"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="review-label">{label}</div><div className="mt-2 text-sm font-semibold leading-5 text-slate-800">{value}</div></div>)}</div><div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900">The result is intentionally explainable: every status links back to extracted evidence and a retrievable source. When evidence is insufficient, the safe result is “Cannot verify”.</div></div>}</div></div>
  </div>;
}

function Reports({ reportReady, onGenerate }: { reportReady: boolean; onGenerate: () => void }) {
  return <div className="page-wrap"><SectionHeading eyebrow="Evidence packages" title="Reports" description="Keep a traceable record of product information, assessment outcomes and the sources used." action={<button onClick={onGenerate} className="primary-button"><FileDown className="h-4 w-4" />Generate PDF report</button>} />
    <div className="surface-card overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><div className="eyebrow">Your reports</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Recent analysis packages</h2></div><div className="divide-y divide-slate-100">{[["Nourish Oat Granola", "Scan + claims review", "28 Sep 2026", "Requires review"], ["Pressure cooker discovery", "Standard recommendation", "26 Sep 2026", "Reference only"], ["Home appliance label", "Product scan", "22 Sep 2026", "Draft"]].map(([title, type, date, status], index) => <div key={title} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="report-icon"><FileText className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="font-semibold text-slate-800">{title}</div><div className="mt-1 text-xs text-slate-400">{type} · {date}</div></div><span className={index === 0 ? "review-chip" : "neutral-chip"}>{status}</span><button onClick={index === 0 && reportReady ? onGenerate : undefined} className="secondary-button !px-3 !py-2 text-xs"><Download className="h-3.5 w-3.5" />{index === 0 && reportReady ? "Download" : "Open"}</button></div>)}</div></div><div className="mt-5 grid gap-5 md:grid-cols-3"><div className="surface-card p-5"><FileText className="h-5 w-5 text-cyan-600" /><div className="mt-4 text-2xl font-bold text-slate-900">05</div><div className="mt-1 text-xs text-slate-500">Reports generated</div></div><div className="surface-card p-5"><ShieldCheck className="h-5 w-5 text-emerald-600" /><div className="mt-4 text-2xl font-bold text-slate-900">18</div><div className="mt-1 text-xs text-slate-500">Sources cited</div></div><div className="surface-card p-5"><Clock3 className="h-5 w-5 text-amber-600" /><div className="mt-4 text-2xl font-bold text-slate-900">3.4m</div><div className="mt-1 text-xs text-slate-500">Avg. review time</div></div></div></div>;
}

function Admin() {
  const [active, setActive] = useState("Sources");
  return <div className="page-wrap"><SectionHeading eyebrow="Knowledge management" title="Admin console" description="Monitor trusted source coverage, ingestion status and unanswered questions from one place." action={<button className="secondary-button"><Plus className="h-4 w-4" />Add document</button>} /><div className="grid gap-5 md:grid-cols-3"><div className="surface-card p-5"><div className="flex items-center justify-between"><div className="stat-icon tone-blue"><Database className="h-[18px] w-[18px]" /></div><span className="text-[11px] font-semibold text-emerald-600">+4 this month</span></div><div className="mt-5 text-3xl font-bold tracking-[-0.04em] text-slate-900">124</div><div className="mt-1 text-xs text-slate-500">Knowledge documents</div></div><div className="surface-card p-5"><div className="flex items-center justify-between"><div className="stat-icon tone-green"><Library className="h-[18px] w-[18px]" /></div><span className="text-[11px] font-semibold text-emerald-600">Healthy</span></div><div className="mt-5 text-3xl font-bold tracking-[-0.04em] text-slate-900">87</div><div className="mt-1 text-xs text-slate-500">Standards indexed</div></div><div className="surface-card p-5"><div className="flex items-center justify-between"><div className="stat-icon tone-amber"><CircleHelp className="h-[18px] w-[18px]" /></div><span className="text-[11px] font-semibold text-amber-600">Needs triage</span></div><div className="mt-5 text-3xl font-bold tracking-[-0.04em] text-slate-900">09</div><div className="mt-1 text-xs text-slate-500">Unknown queries</div></div></div><div className="mt-5 surface-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><div className="eyebrow">Operations</div><h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-slate-900">Knowledge base activity</h2></div><div className="flex rounded-xl bg-slate-100 p-1">{["Sources", "Failed queries", "Scan history"].map((item) => <button key={item} onClick={() => setActive(item)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${active === item ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>{item}</button>)}</div></div><div className="divide-y divide-slate-100">{active === "Sources" ? [["Product Certification Process", "Official BIS", "Updated 28 Sep 2026", "Indexed"], ["Know Your Standard", "Official BIS", "Updated 28 Sep 2026", "Indexed"], ["Laboratory recognition guidance", "Official BIS", "Updated 26 Sep 2026", "Review"]].map(([title, org, date, status]) => <div key={title} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><Library className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-slate-800">{title}</div><div className="mt-1 text-xs text-slate-400">{org} · {date}</div></div><span className={status === "Indexed" ? "success-chip" : "review-chip"}>{status}</span><button className="icon-button"><ExternalLink className="h-4 w-4" /></button></div>) : <div className="p-8 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ListChecks className="h-5 w-5" /></div><div className="mt-3 text-sm font-semibold text-slate-700">{active} are available in the connected data layer</div><p className="mt-1 text-xs text-slate-400">This demo view is ready for a live database query.</p></div>}</div></div></div>;
}

export default function Home() {
  const [page, setPage] = useState<PageId>("overview");
  const [language, setLanguage] = useState("English");
  const [scanReady, setScanReady] = useState(true);
  const [reportReady, setReportReady] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const currentNav = navItems.find((item) => item.id === page) ?? navItems[0];
  const pageTitle = page === "overview" ? "Overview" : currentNav.label;
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2800); };
  const generateReport = () => { setReportReady(true); notify("Report prepared — use the browser print dialog to save as PDF."); window.setTimeout(() => window.print(), 250); };
  const openPage = (id: PageId) => { setPage(id); setMobileNav(false); };
  return <div className="app-shell">
    <aside className={`app-sidebar ${mobileNav ? "is-open" : ""}`}><div className="sidebar-top"><Logo /><button onClick={() => setMobileNav(false)} className="mobile-close"><X className="h-5 w-5" /></button></div><div className="role-switcher"><div className="role-avatar">AM</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-800">Arjun Mehta</div><div className="mt-1 text-[10px] text-slate-400">Industry / Manufacturer</div></div><ChevronRight className="h-3.5 w-3.5 text-slate-300" /></div><div className="sidebar-scroll"><div className="nav-group-label">Workspace</div>{navItems.filter((item) => item.group === "Workspace").map((item) => <button key={item.id} onClick={() => openPage(item.id)} className={`nav-item ${page === item.id ? "active" : ""}`}><item.icon className="h-[17px] w-[17px]" /><span>{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}</button>)}<div className="nav-group-label mt-7">Manage</div>{navItems.filter((item) => item.group === "Manage").map((item) => <button key={item.id} onClick={() => openPage(item.id)} className={`nav-item ${page === item.id ? "active" : ""}`}><item.icon className="h-[17px] w-[17px]" /><span>{item.label}</span></button>)}<div className="sidebar-callout"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" /><span className="text-[11px] font-bold text-slate-700">Knowledge layer online</span></div><p className="mt-2 text-[11px] leading-5 text-slate-500">Official BIS sources are prioritized in this demo.</p><button onClick={() => openPage("admin")} className="mt-3 text-[11px] font-semibold text-cyan-700">View status <ArrowUpRight className="ml-1 inline h-3 w-3" /></button></div></div><div className="sidebar-footer"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[11px] text-slate-500"><Globe2 className="h-3.5 w-3.5" />{language}</div><button onClick={() => notify("Language options are ready for English, Hindi and Kannada.")} className="text-slate-400 hover:text-slate-700"><Settings2 className="h-3.5 w-3.5" /></button></div><div className="mt-3 text-[10px] leading-4 text-slate-400">BISmart AI provides guidance and does not replace official BIS certification.</div></div></aside>
    {mobileNav && <button aria-label="Close navigation" onClick={() => setMobileNav(false)} className="mobile-overlay" />}
    <main className="app-main"><header className="app-header"><div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="mobile-menu"><Menu className="h-5 w-5" /></button><div><div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">BISmart AI <span className="mx-1 text-slate-300">/</span> {pageTitle}</div><div className="mt-1 hidden text-xs text-slate-400 sm:block">Indian Standards & Certification Intelligence</div></div></div><div className="flex items-center gap-2"><button onClick={() => notify("No new alerts. Your knowledge base is healthy.")} className="icon-button relative" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="notification-dot" /></button><div className="header-avatar">AM</div></div></header><div className="app-content">{page === "overview" && <Overview setPage={openPage} />}{page === "assistant" && <Assistant language={language} setLanguage={setLanguage} />}{page === "standards" && <Standards />}{page === "scanner" && <Scanner onComplete={() => { setScanReady(true); notify("Scan complete — extracted fields are ready to review."); }} />}{page === "compliance" && <Compliance scanReady={scanReady} onReport={generateReport} />}{page === "reports" && <Reports reportReady={reportReady} onGenerate={generateReport} />}{page === "admin" && <Admin />}</div></main>
    {toast && <div className="toast"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{toast}</div>}
  </div>;
}
