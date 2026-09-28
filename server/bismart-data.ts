export type BismartSource = {
  title: string;
  url: string;
  organization: "Bureau of Indian Standards";
  category: string;
};

export type KnowledgeEntry = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  source: BismartSource;
  demoOnly?: boolean;
};

export const TRUSTED_SOURCES: BismartSource[] = [
  {
    title: "BIS Product Certification",
    url: "https://www.bis.gov.in/product-certification/",
    organization: "Bureau of Indian Standards",
    category: "Certification",
  },
  {
    title: "Know Your Standard",
    url: "https://www.bis.gov.in/know-your-standard/",
    organization: "Bureau of Indian Standards",
    category: "Standards discovery",
  },
  {
    title: "Product Certification Process",
    url: "https://www.bis.gov.in/product-certification/product-certification-process/",
    organization: "Bureau of Indian Standards",
    category: "Licensing guidance",
  },
  {
    title: "Products under Compulsory Certification",
    url: "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/",
    organization: "Bureau of Indian Standards",
    category: "Conformity assessment",
  },
  {
    title: "BIS Laboratory",
    url: "https://www.bis.gov.in/laboratory/",
    organization: "Bureau of Indian Standards",
    category: "Laboratories",
  },
];

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "cert-process",
    title: "Product certification process",
    summary: "Use the official BIS product certification process to understand the sequence from product scope and applicable standard through documentation, testing, application and licensing guidance.",
    tags: ["certification", "license", "documents", "testing", "manufacturer", "msme"],
    source: TRUSTED_SOURCES[2],
  },
  {
    id: "standard-lookup",
    title: "Know Your Standard lookup",
    summary: "The official BIS lookup is the source of truth for confirming current standard references and product scope. This demo never invents a standard number when it cannot retrieve a verified match.",
    tags: ["standard", "pressure cooker", "product", "scope", "search"],
    source: TRUSTED_SOURCES[1],
  },
  {
    id: "compulsory-certification",
    title: "Compulsory certification information",
    summary: "Check the official BIS list and current notifications before concluding whether certification is compulsory for a specific product, model, or market use.",
    tags: ["mandatory", "compulsory", "certification", "product", "scheme"],
    source: TRUSTED_SOURCES[3],
  },
  {
    id: "laboratory",
    title: "BIS laboratories and testing guidance",
    summary: "Use the official BIS laboratory information to locate relevant testing and laboratory recognition guidance. Product-specific laboratory suitability must be confirmed for the exact test scope.",
    tags: ["laboratory", "testing", "test", "lab", "sample"],
    source: TRUSTED_SOURCES[4],
  },
  {
    id: "demo-granola",
    title: "Demo label evidence workflow",
    summary: "Demo-only record showing how extracted ingredients, nutrition information, detected claims and source references are assembled into an explainable review. It is not an official food compliance determination.",
    tags: ["granola", "food", "label", "sugar", "fibre", "claim", "demo"],
    source: TRUSTED_SOURCES[0],
    demoOnly: true,
  },
];

export const DEMO_PRODUCTS = [
  "Pressure Cooker",
  "Packaged Food",
  "Electrical Appliance",
  "Helmet",
  "Water Bottle",
  "Household Product",
];

const STOP_WORDS = new Set(["the", "and", "for", "with", "what", "how", "does", "this", "that", "tell", "about", "from", "into", "your", "are", "can", "you", "please", "explain"]);

export function retrieveKnowledge(query: string, limit = 3) {
  const normalized = query.toLowerCase();
  const tokens = normalized.split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  const ranked = KNOWLEDGE_BASE.map((entry) => {
    const haystack = `${entry.title} ${entry.summary} ${entry.tags.join(" ")}`.toLowerCase();
    const matched = tokens.filter((token) => haystack.includes(token));
    return { entry, score: matched.length, matchedTokens: matched };
  }).sort((a, b) => b.score - a.score);
  return ranked.filter((item) => item.score > 0).slice(0, limit);
}

export function answerWithFallback(query: string) {
  const matches = retrieveKnowledge(query);
  const aboutPressureCooker = /pressure\s*cooker|cooker/.test(query.toLowerCase());
  const response = aboutPressureCooker
    ? "For a pressure cooker, first confirm the exact product scope and current applicability in the official BIS standard lookup. This demo does not assert a standard number without a verified retrieval match. Then follow the official certification process to review documents, testing and licensing steps for the exact product."
    : matches.length
      ? "I found a relevant official BIS guidance path. Confirm the exact product scope and current applicability in the linked source before treating any step as a requirement."
      : "I could not find sufficient verified information for this query. Please refer to the official BIS source or provide more details.";
  return {
    response,
    retrieved: matches.map(({ entry, score }) => ({
      title: entry.title,
      score,
      source: entry.source,
      demoOnly: Boolean(entry.demoOnly),
    })),
    disclaimer: "BISmart AI provides guidance and does not replace official BIS certification or regulatory decisions.",
  };
}

export function recommendStandard(product: string, description: string) {
  const query = `${product} ${description}`;
  const matches = retrieveKnowledge(query);
  return {
    product,
    description,
    result: {
      standardNumber: null,
      title: `${product || "Product"} · potential BIS scope match`,
      relevance: product.toLowerCase().includes("pressure") ? 86 : 61,
      confidence: product.toLowerCase().includes("pressure") ? "High product relevance" : "Needs more detail",
      note: "Potentially relevant — verify with official BIS source. Standard number intentionally not asserted by the demo.",
    },
    sources: matches.length ? matches.map(({ entry }) => entry.source) : [TRUSTED_SOURCES[1]],
  };
}

export function demoScanResult() {
  return {
    ocrEngine: "Provider abstraction · deterministic demo fallback",
    confidence: 0.92,
    extracted: {
      productName: "Nourish Oat Granola",
      brand: "Nourish Foods",
      manufacturer: "Nourish Foods Pvt. Ltd.",
      netQuantity: "400 g",
      mrp: "₹ 249",
      countryOfOrigin: "India",
      ingredients: "Rolled oats, dates, almonds, cocoa, salt",
      nutrition: "Energy 387 kcal · Protein 10.2 g · Fibre 1.2 g per serving",
      barcode: "Detected, authenticity not confirmed",
    },
    claims: [
      { claim: "No added sugar", status: "SUPPORTED", evidence: "Ingredients panel does not show added sugar in the demo label.", explanation: "Extracted evidence is consistent with this claim; regulatory review is still recommended." },
      { claim: "100% natural", status: "CANNOT_VERIFY", evidence: "Marketing claim detected; ingredient evidence is incomplete.", explanation: "Cannot verify this claim from the available product information." },
      { claim: "High fibre", status: "POTENTIALLY_NOT_SUPPORTED", evidence: "Nutrition panel shows 1.2 g fibre per serving in the demo scan.", explanation: "Potentially not supported by available evidence. Check the applicable requirement before relying on this claim." },
    ],
    sources: [TRUSTED_SOURCES[0], TRUSTED_SOURCES[1]],
    disclaimer: "This is an AI-assisted preliminary assessment and should not be treated as official certification or regulatory approval.",
  };
}
