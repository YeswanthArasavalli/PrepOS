// All static V5.1 data — EXAMS, TOPICS, PIPE_STAGES, EXAM_INTEL, EVENT_TREE, NET_UNITS, JAD data

export interface Exam { id:string;n:string;s:string;days:number;role:string;hex:string;bg:string;dk:string;target:number;total:number;neg:number;pass:number; }
export const EXAMS: Exam[] = [
  {id:"cgl", n:"SSC CGL",   s:"CGL", days:60,  role:"MASTER",      hex:"#C94B2A",bg:"#FDF0EC",dk:"#7A2410",target:160,total:200,neg:0.5, pass:140},
  {id:"chsl",n:"SSC CHSL",  s:"CHSL",days:90,  role:"SECONDARY",   hex:"#1A8F68",bg:"#E8F8F3",dk:"#0C5E43",target:140,total:200,neg:0.5, pass:120},
  {id:"ntpc",n:"RRB NTPC",  s:"NTPC",days:100, role:"SECONDARY",   hex:"#1556A0",bg:"#E8F1FB",dk:"#0E3B72",target:85, total:120,neg:0.33,pass:70},
  {id:"mts", n:"SSC MTS",   s:"MTS", days:140, role:"BASELINE",    hex:"#2E6B0E",bg:"#EAF4E2",dk:"#1A4607",target:50, total:150,neg:0.5, pass:45},
  {id:"coal",n:"Coal India",s:"CI",  days:45,  role:"FAST-TRACK",  hex:"#B06B0F",bg:"#FBF1E3",dk:"#6B3E06",target:140,total:200,neg:0,   pass:120},
  {id:"net", n:"UGC NET CS",s:"NET", days:135, role:"SEPARATE",    hex:"#4B3EB5",bg:"#EEECFB",dk:"#312688",target:55, total:100,neg:0,   pass:50},
  {id:"jad", n:"UPSC JAD",  s:"JAD", days:90,  role:"SPECIALIZED", hex:"#8B2FC9",bg:"#F5EDFB",dk:"#5A1A85",target:65, total:100,neg:0,   pass:55},
];

export interface ExamIntel { prev:number;expected:number;safe:number;target:number;elite:number;note:string; }
export const EXAM_INTEL: Record<string,ExamIntel> = {
  cgl: {prev:145,expected:148,safe:170,target:185,elite:196,note:"Cutoffs rising 2-3 marks/yr. Sectional timing is the real filter."},
  chsl:{prev:132,expected:135,safe:155,target:169,elite:182,note:"CHSL Tier 1 is 10th level. CGL prep massively over-prepares."},
  ntpc:{prev:72, expected:74, safe:85, target:93, elite:100,note:"GK+Current Affairs drives cutoff. -0.33 = attempt more liberally."},
  mts: {prev:98, expected:100,safe:115,target:125,elite:135,note:"Qualifying marks only (30% UR). SSC CGL prep is overkill here."},
  coal:{prev:128,expected:132,safe:152,target:165,elite:178,note:"No negative marking. Paper II CS score separates candidates."},
  net: {prev:52, expected:53, safe:61, target:66, elite:72, note:"Cutoff = Paper I + Paper II combined. Tier A = 60-70% of Paper II."},
  jad: {prev:55, expected:57, safe:66, target:71, elite:78, note:"Written + Interview. CS overlap 70%+ — Telecom is the differentiator."},
};

export interface Topic { id:string;n:string;p:string;roi:number;exams:string;note:string; }
export const TOPICS: Record<string,Topic[]> = {
  "Quant":[
    {id:"pct",n:"Percentage",                p:"P1",roi:12,exams:"All SSC+NTPC",  note:"4-5 Qs/exam. Foundation for P/L, Discount, SI/CI."},
    {id:"rat",n:"Ratio & Proportion",        p:"P1",roi:10,exams:"All exams",     note:"3-4 Qs. Appears inside Mixture, Partnership."},
    {id:"avg",n:"Average",                   p:"P1",roi:8, exams:"All exams",     note:"2-3 Qs. Fastest topic to master."},
    {id:"pl", n:"Profit & Loss",             p:"P1",roi:10,exams:"All SSC+NTPC", note:"3-4 Qs. Always appears."},
    {id:"si", n:"Simple & Compound Interest",p:"P1",roi:8, exams:"All SSC+NTPC", note:"2-3 Qs. Formula-based."},
    {id:"tw", n:"Time & Work",               p:"P1",roi:9, exams:"All SSC+NTPC", note:"3-4 Qs including Pipes & Cistern."},
    {id:"tsd",n:"Time Speed Distance",       p:"P1",roi:9, exams:"All SSC+NTPC", note:"3-4 Qs. Trains + Boats sub-types."},
    {id:"mix",n:"Mixture & Alligation",      p:"P2",roi:6, exams:"CGL+CHSL",     note:"2 Qs. Alligation shortcut solves in 30 sec."},
    {id:"ns", n:"Number System + HCF/LCM",   p:"P2",roi:7, exams:"All exams",    note:"2-3 Qs. Divisibility rules critical."},
    {id:"alg",n:"Algebra",                   p:"P2",roi:7, exams:"CGL+CHSL",     note:"2-3 Qs. Identities only."},
    {id:"di", n:"Data Interpretation",       p:"P2",roi:7, exams:"CGL Tier2+NET",note:"2-3 Qs. Tables + Charts."},
    {id:"m2", n:"Mensuration 2D",            p:"P3",roi:6, exams:"CGL+CHSL+NTPC",note:"2 Qs. Triangle + Circle area."},
    {id:"m3", n:"Mensuration 3D",            p:"P3",roi:5, exams:"CGL+CHSL",     note:"1-2 Qs. Cylinder, Cone, Sphere."},
    {id:"geo",n:"Geometry",                  p:"P3",roi:5, exams:"CGL+CHSL",     note:"2 Qs. Triangle + circle theorems."},
    {id:"tri",n:"Trigonometry",              p:"P4",roi:4, exams:"CGL Tier1",    note:"1-2 Qs. Basic ratios only."},
  ],
  "Reasoning":[
    {id:"ns2",n:"Number Series",             p:"P1",roi:10,exams:"All exams",     note:"3-4 Qs. Most frequent SSC topic."},
    {id:"as", n:"Alphabet Series",           p:"P1",roi:8, exams:"All SSC+NTPC", note:"2-3 Qs. Pattern + position-based."},
    {id:"ana",n:"Analogy",                   p:"P1",roi:10,exams:"All exams",     note:"3-4 Qs. Semantic + Symbolic + Figural."},
    {id:"cla",n:"Classification/Odd One Out",p:"P1",roi:8, exams:"All exams",    note:"2-3 Qs. Easiest guaranteed marks."},
    {id:"cod",n:"Coding-Decoding",           p:"P1",roi:9, exams:"All SSC+NTPC", note:"3-4 Qs. Letter shift + substitution."},
    {id:"blo",n:"Blood Relations",           p:"P2",roi:6, exams:"CGL+CHSL+NTPC",note:"2 Qs. Always draw family tree."},
    {id:"dir",n:"Directions",               p:"P2",roi:6, exams:"All SSC+NTPC", note:"1-2 Qs. Draw diagram first."},
    {id:"syl",n:"Syllogism",                 p:"P2",roi:7, exams:"CGL+CHSL",     note:"2 Qs. Venn diagram method."},
    {id:"puz",n:"Puzzles & Seating",         p:"P2",roi:7, exams:"CGL+CHSL",     note:"2-3 Qs. Linear > Circular difficulty."},
    {id:"stc",n:"Statement-Conclusion",      p:"P3",roi:5, exams:"CGL+NTPC",     note:"1-2 Qs."},
    {id:"mir",n:"Mirror & Water Images",     p:"P3",roi:5, exams:"CGL+CHSL",     note:"1-2 Qs. Practice visually."},
    {id:"pap",n:"Paper Folding/Cutting",     p:"P3",roi:4, exams:"CGL+CHSL",     note:"1-2 Qs. Daily 10-min drills."},
  ],
  "English":[
    {id:"rc", n:"Reading Comprehension",     p:"P1",roi:15,exams:"All SSC+Coal",  note:"3-5 Qs/passage. Highest single mark block."},
    {id:"err",n:"Error Spotting",            p:"P1",roi:12,exams:"All SSC+NTPC",  note:"3-4 Qs. Subject-verb + tenses."},
    {id:"fib",n:"Fill in the Blanks",        p:"P1",roi:10,exams:"All exams",     note:"3-4 Qs. Vocab + Grammar both tested."},
    {id:"syn",n:"Synonyms",                  p:"P2",roi:8, exams:"All SSC+NTPC",  note:"2-3 Qs. 30% repeat from past papers."},
    {id:"ant",n:"Antonyms",                  p:"P2",roi:8, exams:"All SSC+NTPC",  note:"2-3 Qs. Learn opposite pairs together."},
    {id:"idi",n:"Idioms & Phrases",          p:"P2",roi:7, exams:"CGL+CHSL",      note:"2-3 Qs. 200-idiom list covers 90%."},
    {id:"ows",n:"One Word Substitution",     p:"P2",roi:7, exams:"CGL+CHSL",      note:"2-3 Qs. High-frequency PYQ list."},
    {id:"clo",n:"Cloze Test",                p:"P2",roi:8, exams:"CGL+CHSL",      note:"5 Qs in one block."},
    {id:"ap", n:"Active/Passive Voice",      p:"P3",roi:5, exams:"CGL+CHSL",      note:"1-2 Qs. Rule-based."},
    {id:"di2",n:"Direct/Indirect Speech",    p:"P3",roi:5, exams:"CGL+CHSL",      note:"1-2 Qs. Tense shift rules."},
    {id:"pj", n:"Para Jumbles",              p:"P3",roi:5, exams:"CGL+CHSL",      note:"1-2 Qs. Find topic sentence."},
  ],
  "GK":[
    {id:"phy", n:"General Science: Physics",   p:"P1",roi:12,exams:"All exams",  note:"4-5 Qs. Motion, optics, electricity."},
    {id:"che", n:"General Science: Chemistry", p:"P1",roi:10,exams:"All exams",  note:"3-4 Qs. Elements, acids/bases."},
    {id:"bio", n:"General Science: Biology",   p:"P1",roi:10,exams:"All exams",  note:"3-4 Qs. Human body, diseases."},
    {id:"mh",  n:"Modern History (1857-1947)", p:"P1",roi:10,exams:"All exams",  note:"4-5 Qs. Freedom struggle = #1 history."},
    {id:"ca",  n:"Current Affairs",            p:"P1",roi:10,exams:"All exams",  note:"4-5 Qs. 45-min/day mandatory."},
    {id:"pol", n:"Indian Polity & Constitution",p:"P2",roi:8,exams:"All SSC+NTPC",note:"3-4 Qs. Articles, Amendments."},
    {id:"geo2",n:"Indian Geography",           p:"P2",roi:7,exams:"All SSC+NTPC", note:"3 Qs. Rivers, mountains, parks."},
    {id:"eco", n:"Indian Economy",             p:"P3",roi:6,exams:"All exams",   note:"2-3 Qs. GDP, RBI, Budget terms."},
    {id:"ah",  n:"Ancient History",            p:"P3",roi:5,exams:"CGL+CHSL",    note:"2 Qs. Indus Valley, Vedic, Mauryan."},
    {id:"spo", n:"Sports & Awards",            p:"P4",roi:4,exams:"All exams",   note:"1-2 Qs. Current year awards."},
  ],
  "CS -- Coal India":[
    {id:"os", n:"Operating Systems",     p:"P1",roi:18,exams:"Coal Paper II",note:"15-18 Qs. Process, Memory, Deadlock."},
    {id:"db", n:"DBMS + SQL",            p:"P1",roi:18,exams:"Coal Paper II",note:"15-18 Qs. SQL, Normalization, ER."},
    {id:"cn", n:"Computer Networks",     p:"P1",roi:16,exams:"Coal Paper II",note:"12-15 Qs. OSI, TCP/IP, Routing."},
    {id:"ds", n:"Data Structures",       p:"P1",roi:16,exams:"Coal Paper II",note:"12-15 Qs. Arrays, Trees, Sorting."},
    {id:"oop",n:"OOP Concepts",          p:"P2",roi:8, exams:"Coal Paper II",note:"6-8 Qs. Class, Inheritance."},
    {id:"coa",n:"Computer Organization", p:"P2",roi:7, exams:"Coal Paper II",note:"5-7 Qs. CPU, Memory, Pipeline."},
    {id:"se", n:"Software Engineering",  p:"P3",roi:6, exams:"Coal Paper II",note:"4-6 Qs. SDLC, Testing types."},
    {id:"sec",n:"Info Security",         p:"P3",roi:5, exams:"Coal Paper II",note:"4-5 Qs. Encryption, Firewalls."},
  ],
  "CS -- UGC NET":[
    {id:"dsa", n:"Data Structures & Algorithms",p:"P1",roi:20,exams:"NET Paper II",note:"Unit 7. Highest NET CS weightage."},
    {id:"osn", n:"Operating Systems",           p:"P1",roi:15,exams:"NET Paper II",note:"Unit 5. Tier A. Deep conceptual."},
    {id:"dbn", n:"DBMS",                        p:"P1",roi:15,exams:"NET Paper II",note:"Unit 4. Tier A. SQL + normalization."},
    {id:"cnn", n:"Computer Networks",           p:"P1",roi:14,exams:"NET Paper II",note:"Unit 9. Tier A. Protocol details."},
    {id:"dm",  n:"Discrete Mathematics",        p:"P1",roi:12,exams:"NET Paper II",note:"Unit 1. Tier A. Graph theory + logic."},
    {id:"toc", n:"TOC & Compiler Design",       p:"P2",roi:10,exams:"NET Paper II",note:"Unit 8. Tier B. DFA/NFA + parsing."},
    {id:"coan",n:"Computer Architecture",       p:"P2",roi:8, exams:"NET Paper II",note:"Unit 2. Tier B. Pipeline + memory."},
    {id:"ai",  n:"Artificial Intelligence",     p:"P3",roi:6, exams:"NET Paper II",note:"Unit 10. Tier C. Search + ANN."},
  ],
  "JAD -- CS & IT":[
    {id:"jad-cn", n:"Data Comms & Networking",   p:"P1",roi:18,exams:"JAD Written",note:"OSI, TCP/IP, OSPF, BGP. 95% overlap."},
    {id:"jad-cs", n:"Cyber Security & Crypto",   p:"P1",roi:16,exams:"JAD Written",note:"DES/AES/RSA, IPSec, SSL/TLS."},
    {id:"jad-os", n:"Operating Systems",         p:"P1",roi:14,exams:"JAD Written",note:"Identical to Coal India. No extra."},
    {id:"jad-db", n:"Database Systems",          p:"P1",roi:12,exams:"JAD Written",note:"SQL, normalization — same as DBMS."},
    {id:"jad-da", n:"Data Analytics & Big Data", p:"P2",roi:10,exams:"JAD Written",note:"Data mining, cloud. 3-day study."},
    {id:"jad-ai", n:"AI & Machine Learning",     p:"P2",roi:8, exams:"JAD Written",note:"ML basics — NET prep covers it."},
    {id:"jad-iot",n:"IoT (MQTT/CoAP)",           p:"P3",roi:7, exams:"JAD Written",note:"New for CS. 2-day study."},
  ],
  "JAD -- Telecom":[
    {id:"jad-dm",n:"Digital Modulation (ASK/FSK/PSK/QAM)",p:"P1",roi:15,exams:"JAD Written",note:"BIGGEST GAP. 5 dedicated days."},
    {id:"jad-wn",n:"Wireless Networks & Cellular",        p:"P1",roi:14,exams:"JAD Written",note:"LTE, 4G, 5G. Start from zero."},
    {id:"jad-sc",n:"Satellite Comms & VSAT",              p:"P2",roi:10,exams:"JAD Written",note:"Satellite orbits, VSAT, POLNET."},
    {id:"jad-am",n:"Analog Modulation (AM/FM/PM)",         p:"P2",roi:9, exams:"JAD Written",note:"Foundation for digital. Learn first."},
    {id:"jad-wp",n:"Wave Propagation & Antennas",          p:"P3",roi:8, exams:"JAD Written",note:"Ground/sky/space wave. Application."},
    {id:"jad-pn",n:"POLNET & Broadband PPDR",              p:"P3",roi:7, exams:"JAD Written",note:"India police network. 1 day max."},
  ],
};

export const ALL_TOPICS = Object.values(TOPICS).flat();
export const TOTAL_TOPICS = ALL_TOPICS.length;

export interface PipeStage { s:number;label:string;short:string;color:string; }
export const PIPE_STAGES: PipeStage[] = [
  {s:0,label:"Not Started",short:"-",color:"#475569"},
  {s:1,label:"Learning",   short:"L",color:"#1556A0"},
  {s:2,label:"Notes",      short:"N",color:"#B06B0F"},
  {s:3,label:"PYQs Done",  short:"Q",color:"#4B3EB5"},
  {s:4,label:"Error Log",  short:"E",color:"#C94B2A"},
  {s:5,label:"Revised",    short:"R",color:"#1A8F68"},
  {s:6,label:"Topic Test", short:"T",color:"#0F7070"},
  {s:7,label:"Mock OK",    short:"M",color:"#0C5E43"},
];

export const PRIORITY_COLORS: Record<string,{hex:string;bg:string}> = {
  P1:{hex:"#C94B2A",bg:"#FDF0EC"},
  P2:{hex:"#1A8F68",bg:"#E8F8F3"},
  P3:{hex:"#1556A0",bg:"#E8F1FB"},
  P4:{hex:"#888888",bg:"#F4F4F4"},
};

export const ERROR_TYPES = [
  {id:"concept",label:"Concept Gap",    hex:"#C94B2A",fix:"Re-study from zero. Video + notes + 10 practice Qs."},
  {id:"formula",label:"Formula Gap",    hex:"#B06B0F",fix:"Write formula 10x. Verify with 3 worked examples."},
  {id:"reading",label:"Reading Mistake",hex:"#4B3EB5",fix:"Re-read question twice. Underline key data."},
  {id:"calc",   label:"Calc Error",     hex:"#1556A0",fix:"Always use rough paper. Check units carefully."},
  {id:"time",   label:"Time Pressure",  hex:"#1A8F68",fix:"Mark-and-skip. Never spend >90 sec on any question."},
  {id:"guess",  label:"Wrong Guess",    hex:"#2E6B0E",fix:"Do not guess below 70% confidence on negative marking exams."},
];

export interface EventNode { id:string;icon:string;label:string;hex:string;bg:string;dk:string;effects:{exam:string;delta:number;note:string}[];actions:string[]; }
export const EVENT_TREE: EventNode[] = [
  {id:"coal_clear",  icon:"✅",label:"Coal India — Cleared",    hex:"#1A8F68",bg:"#E8F8F3",dk:"#0C5E43",effects:[{exam:"Coal India",delta:-15,note:"Reduce to maintenance"},{exam:"SSC CGL",delta:8,note:"Redirect effort"},{exam:"UGC NET",delta:7,note:"More depth"}],actions:["Switch CS study to NET depth only","Maintain Coal mock 3x/month","Boost Quant+English for CGL Tier 2"]},
  {id:"coal_fail",   icon:"❌",label:"Coal India — Failed",      hex:"#C94B2A",bg:"#FDF0EC",dk:"#7A2410",effects:[{exam:"Coal India",delta:10,note:"Increase for next attempt"}],actions:["Identify weak CS units","Increase OS+DBMS+Networks to 70%","Plan next cycle"]},
  {id:"coal_post",   icon:"⏳",label:"Coal India — Postponed",   hex:"#B06B0F",bg:"#FBF1E3",dk:"#6B3E06",effects:[{exam:"Coal India",delta:-5,note:"Less urgency"},{exam:"SSC CGL",delta:3,note:"Use freed time"},{exam:"UPSC JAD",delta:2,note:"Bonus time"}],actions:["Maintain CS 3x/week","Prioritize SSC full mocks","Add JAD telecom if bandwidth allows"]},
  {id:"ssc_t1_clear",icon:"✅",label:"SSC Tier 1 — Cleared",     hex:"#1A8F68",bg:"#E8F8F3",dk:"#0C5E43",effects:[{exam:"SSC CGL",delta:15,note:"Double down on Tier 2"},{exam:"Coal India",delta:-10,note:"Reduce temporarily"}],actions:["Tier 2 mode: Quant advanced + English advanced","Reduce reasoning to maintenance","2x English per week"]},
  {id:"ssc_t1_fail", icon:"❌",label:"SSC Tier 1 — Failed",      hex:"#C94B2A",bg:"#FDF0EC",dk:"#7A2410",effects:[{exam:"SSC CGL",delta:20,note:"Emergency rebuild"},{exam:"UGC NET",delta:-10,note:"Temporary reduction"}],actions:["Full P1 review: %, Ratio, Avg, Series, Analogy","100 PYQs daily for 2 weeks","Deep error pattern analysis"]},
  {id:"ssc_post",    icon:"⏳",label:"SSC — Postponed",           hex:"#B06B0F",bg:"#FBF1E3",dk:"#6B3E06",effects:[{exam:"SSC CGL",delta:-5,note:"Maintain"},{exam:"UPSC JAD",delta:3,note:"Extra time"},{exam:"UGC NET",delta:2,note:"Deepen"}],actions:["Continue mock cadence","Extra time in JAD telecom","Complete NET units 4-10"]},
  {id:"net_qual",    icon:"✅",label:"UGC NET — Qualified",        hex:"#1A8F68",bg:"#E8F8F3",dk:"#0C5E43",effects:[{exam:"UGC NET",delta:-20,note:"Maintenance only"},{exam:"SSC CGL",delta:10,note:"More time"},{exam:"UPSC JAD",delta:10,note:"JAD boost"}],actions:["NET maintenance: 1 mock/month","JRF attempt next cycle","Focus SSC + JAD fully"]},
  {id:"net_fail",    icon:"❌",label:"UGC NET — Failed",           hex:"#C94B2A",bg:"#FDF0EC",dk:"#7A2410",effects:[{exam:"UGC NET",delta:12,note:"Increase focus"},{exam:"SSC CGL",delta:-8,note:"Reduce slightly"}],actions:["Identify failed section","Weak unit deep revision","NET Paper I mock daily 2 weeks"]},
  {id:"jad_clear",   icon:"✅",label:"UPSC JAD — Written Cleared", hex:"#8B2FC9",bg:"#F5EDFB",dk:"#5A1A85",effects:[{exam:"UPSC JAD",delta:-20,note:"Interview prep only"},{exam:"SSC CGL",delta:10,note:"Keep active"}],actions:["Start interview prep immediately","Technical mock interviews","POLNET + Govt systems awareness"]},
  {id:"jad_post",    icon:"⏳",label:"UPSC JAD — Postponed",       hex:"#8B2FC9",bg:"#F5EDFB",dk:"#5A1A85",effects:[{exam:"UPSC JAD",delta:-8,note:"Less urgency"},{exam:"SSC CGL",delta:4,note:"More SSC"},{exam:"Coal India",delta:4,note:"More Coal"}],actions:["Maintain JAD 2x/week","Focus telecom gaps slowly","Prioritize SSC + Coal India"]},
];

export interface NETUnit { u:number;name:string;p:string;wt:number;topics:string[]; }
export const NET_UNITS: NETUnit[] = [
  {u:1, name:"Discrete Mathematics",   p:"P1",wt:12,topics:["Sets & Relations","Graph Theory","Logic & Prop Calc","Combinatorics","Boolean Algebra"]},
  {u:2, name:"Computer Architecture",  p:"P2",wt:8, topics:["CPU Design","Pipeline","Memory Hierarchy","Cache","I/O Systems"]},
  {u:3, name:"Programming Languages",  p:"P3",wt:5, topics:["PL Paradigms","OOP","Functional PL","Scoping","Exception Handling"]},
  {u:4, name:"DBMS",                   p:"P1",wt:15,topics:["ER Model","Normalization","SQL Queries","Transaction Mgmt","Query Optimization"]},
  {u:5, name:"Operating Systems",      p:"P1",wt:15,topics:["Process Mgmt","Threading","Scheduling","Memory Mgmt","Deadlock","File Systems"]},
  {u:6, name:"Software Engineering",   p:"P3",wt:6, topics:["SDLC Models","Requirements","Design Patterns","Testing","Project Metrics"]},
  {u:7, name:"DS & Algorithms",        p:"P1",wt:18,topics:["Arrays/Lists","Trees & Graphs","Sorting","Hashing","Dynamic Programming"]},
  {u:8, name:"TOC & Compiler Design",  p:"P2",wt:10,topics:["Finite Automata","Regular Expr","CFG & PDA","Turing Machines","Parsing"]},
  {u:9, name:"Computer Networks",      p:"P1",wt:14,topics:["OSI & TCP/IP","Routing Protocols","TCP/UDP","DNS & HTTP","Network Security"]},
  {u:10,name:"Artificial Intelligence",p:"P3",wt:7, topics:["Search Algorithms","Knowledge Repr","Planning","ML Basics","Neural Networks"]},
];

export interface JADInterviewArea { area:string;key:string;wt:number;qs:string[]; }
export const JAD_INTERVIEW: JADInterviewArea[] = [
  {area:"Core CS & Networks",  key:"tech",    wt:35,qs:["Explain OSI vs TCP/IP with JAD context","How does OSPF differ from BGP?","Explain IPSec tunnel vs transport mode","SSL/TLS handshake process","Describe TCP 3-way handshake"]},
  {area:"Telecom & Wireless",  key:"wireless",wt:30,qs:["Explain FDMA vs TDMA vs CDMA","LTE vs 5G key differences","How does VSAT work?","Types of wave propagation","POLNET architecture overview"]},
  {area:"Cyber Security",      key:"cyber",   wt:20,qs:["How does RSA encryption work?","What is Man-in-Middle attack?","IDS vs IPS","Digital signature vs certificate","DDoS mitigation approaches"]},
  {area:"Current Affairs/Govt",key:"ca",      wt:10,qs:["Recent govt cyber security initiatives","Digital India and BharatNet","CERT-In role in national security","5G rollout in India status"]},
  {area:"Personality",         key:"polnet",  wt:5, qs:["Why government service?","Handle a network outage in crisis?","Approach to learning new technology","What motivates you?"]},
];

export const JAD_OVERLAP = [
  {topic:"Computer Networks",       coal:95,net:92,note:"OSI/TCP/IP/routing — near-identical. Highest ROI."},
  {topic:"Cyber Security",          coal:85,net:70,note:"Crypto+attacks+defense — strong overlap."},
  {topic:"Operating Systems",       coal:90,net:88,note:"Process/memory/scheduling — same content. No extra study."},
  {topic:"Database Systems",        coal:88,net:85,note:"SQL+normalization — identical syllabus."},
  {topic:"Computer Architecture",   coal:80,net:75,note:"CPU/pipeline/memory — same as COA."},
  {topic:"AI & ML Basics",          coal:50,net:65,note:"Basics only. NET prep covers it."},
  {topic:"Data Analytics/Big Data", coal:30,net:25,note:"Moderate new territory. 3-day study."},
  {topic:"IoT Architecture",        coal:10,net:5, note:"Nearly new. MQTT, CoAP. 2-day study."},
  {topic:"Digital Modulation",      coal:0, net:0, note:"COMPLETE GAP. ASK/FSK/PSK/QAM. Must study."},
  {topic:"Wireless/Cellular/5G",    coal:5, net:5, note:"Very weak for CS. LTE/4G/5G from scratch."},
  {topic:"Satellite & VSAT",        coal:0, net:0, note:"Unique to JAD. Satellite, VSAT, POLNET."},
  {topic:"Analog Modulation",       coal:0, net:0, note:"AM/FM/PM — prerequisite for digital."},
  {topic:"POLNET & PPDR",           coal:0, net:0, note:"India police network. 1 dedicated day."},
];
