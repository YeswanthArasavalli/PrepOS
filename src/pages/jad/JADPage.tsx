import { useState }    from "react";
import { usePrepData } from "../../hooks/usePrepData";
import { JAD_OVERLAP, JAD_INTERVIEW, NET_UNITS, EVENT_TREE, EXAM_INTEL } from "../../lib/constants";
import type { EventId } from "../../hooks/usePrepData";

type Sub = "overview"|"overlap"|"telecom"|"cyber"|"netunits"|"interview"|"events";

export default function JADPage() {
  const { jadProgress, updateJADProgress, netUnitMap, updateNETUnit, occurredEventIds, toggleEvent } = usePrepData();
  const [sub, setSub] = useState<Sub>("overview");
  const intel = EXAM_INTEL["jad"];
  const SUBS: {id:Sub;l:string}[] = [
    {id:"overview",l:"Overview"},{id:"overlap",l:"Overlap"},{id:"telecom",l:"Telecom"},
    {id:"cyber",l:"Cyber Sec"},{id:"netunits",l:"NET Units"},{id:"interview",l:"Interview"},{id:"events",l:"Events"},
  ];

  return (
    <div className="space-y-3">
      <div className="bg-violet-950 border border-violet-900 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">UPSC JAD Track</h2>
            <p className="text-xs text-violet-300 mt-0.5">Joint Assistant Director — Specialized Preparation</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-violet-400">Expected Cutoff</div>
            <div className="text-2xl font-semibold text-violet-300">{intel.expected}/100</div>
          </div>
        </div>
        <div className="flex gap-3">
          {[{l:"Safe",v:intel.safe},{l:"Target",v:intel.target},{l:"Elite",v:intel.elite},{l:"Neg Marks",v:"None"}].map(s=>(
            <div key={s.l} className="flex-1 text-center">
              <div className="text-xs text-violet-400">{s.l}</div>
              <div className={`text-base font-semibold ${s.l==="Neg Marks"?"text-emerald-400":"text-white"}`}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {SUBS.map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sub===t.id?"bg-violet-600 text-white":"bg-slate-800 text-slate-400 hover:text-white"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {sub==="overview"&&(
        <div className="space-y-2">
          {[{a:"CS & Networking (CN/OS/DBMS)",roi:95,d:0,desc:"Existing prep covers entirely. Zero extra study."},
            {a:"Cyber Security & Crypto",roi:85,d:5,desc:"DES/AES/RSA/IPSec/SSL. 5 days to deepen."},
            {a:"AI & Data Analytics",roi:60,d:3,desc:"ML basics + Big Data. NET prep partly covers."},
            {a:"IoT (MQTT/CoAP)",roi:30,d:2,desc:"New for CS. 2 dedicated days fills the gap."},
            {a:"Digital Modulation (PSK/QAM)",roi:10,d:5,desc:"BIGGEST GAP. High weightage. Must study from zero."},
            {a:"Wireless Comms / 5G",roi:10,d:4,desc:"Cellular, LTE, 4G, 5G from scratch — 4 days."},
            {a:"Satellite / VSAT / POLNET",roi:5,d:3,desc:"Very JAD-specific. 3 focused days."},
          ].map(r=>(
            <div key={r.a} className="flex gap-3 items-start bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">{r.a}</p>
                <p className="text-xs text-slate-400">{r.desc}</p>
              </div>
              <div className="text-center flex-shrink-0 w-14">
                <div className="text-lg font-bold" style={{color:r.roi>70?"#1A8F68":r.roi>30?"#B06B0F":"#C94B2A"}}>{r.roi}%</div>
                <div className="text-[9px] text-slate-500">{r.d>0?`${r.d}d study`:"Free"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sub==="overlap"&&(
        <div className="space-y-2">
          {JAD_OVERLAP.map(r=>(
            <div key={r.topic} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-1">{r.topic}</p>
                  <p className="text-xs text-slate-400 mb-2">{r.note}</p>
                  <div className="flex gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">Coal: {r.coal}%</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">NET: {r.net}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border-2"
                  style={{borderColor:r.coal>70?"#1A8F68":r.coal>30?"#B06B0F":"#C94B2A",background:r.coal>70?"#052e16":r.coal>30?"#2d1a08":"#2d0e0e"}}>
                  <span className="text-xs font-bold" style={{color:r.coal>70?"#1A8F68":r.coal>30?"#B06B0F":"#C94B2A"}}>{r.coal}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sub==="telecom"&&(
        <div className="space-y-3">
          <div className="px-3 py-2.5 bg-red-950 border border-red-900 rounded-xl text-xs text-red-300">
            Biggest knowledge gap. Order: Analog → Digital → Wireless → Satellite. 20 days total.
          </div>
          {[{t:"Step 1: Analog Modulation (3 days)",i:["AM — carrier + message signal, bandwidth","FM — frequency deviation, Carson rule","PM — phase changes, relation to FM","Compare AM vs FM vs PM"]},
            {t:"Step 2: Digital Modulation (5 days — MOST IMPORTANT)",i:["ASK — amplitude represents bits","FSK — frequency represents bits","PSK/QPSK — phase represents bits","QAM — amplitude + phase combined","Bit rate vs Baud rate, BER comparison"]},
            {t:"Step 3: Wireless & Cellular (4 days)",i:["Cellular arch: BTS, BSC, MSC","Frequency reuse, FDMA/TDMA/CDMA","LTE (4G): OFDMA, MIMO, EPC","5G: mmWave, beamforming, network slicing","Wi-Fi 802.11: a/b/g/n/ac/ax"]},
            {t:"Step 4: Satellite & VSAT (3 days)",i:["Orbit types: LEO, MEO, GEO (36000km)","VSAT: hub, terminal, transponder","POLNET: India police network, TETRA","Broadband PPDR: LTE-based public safety","INSAT, GSAT series"]},
            {t:"Step 5: Wave Propagation (2 days)",i:["Ground wave: surface propagation, low freq","Sky wave: ionospheric, HF 3-30 MHz","Space wave: line of sight, VHF/UHF","Dipole, Yagi, parabolic dish antennas","Antenna gain, radiation pattern, EIRP"]},
          ].map((s,i)=>(
            <div key={i} className="bg-slate-900 border border-violet-900 rounded-xl p-3">
              <p className="text-sm font-semibold text-violet-300 mb-2">{s.t}</p>
              {s.i.map((item,j)=><div key={j} className="flex gap-2 mb-1"><span className="text-violet-600 flex-shrink-0">›</span><span className="text-xs text-slate-300">{item}</span></div>)}
            </div>
          ))}
        </div>
      )}

      {sub==="cyber"&&(
        <div className="space-y-3">
          {[{t:"P1: Cryptography (2 days)",i:["Symmetric: DES (56-bit), AES (128/192/256-bit)","Asymmetric: RSA — public/private key pair","Hash: MD5 (128-bit), SHA-256","Digital Signatures: sign private, verify public","PKI, Digital Certificates, CA trust chain"]},
            {t:"P2: Network Security (2 days)",i:["IPSec: AH/ESP, tunnel vs transport mode","SSL/TLS: handshake, certificate verification","SSH, HTTPS, SFTP — secure protocols","Firewall: packet filter, stateful, application","VPN: site-to-site, remote access, IKEv2"]},
            {t:"P3: Attacks (1 day)",i:["Malware: virus, worm, trojan, ransomware","DDoS: volumetric, protocol, application layer","Phishing, social engineering tactics","SQL Injection, XSS, CSRF web vulns","Password: brute force, dictionary, rainbow table"]},
            {t:"P4: Defense & Compliance (1 day)",i:["IDS vs IPS — detect vs prevent","SIEM: log aggregation, correlation rules","Defense in depth, zero trust","IT Act 2000: sections 43, 66, 67, 69","CERT-In mandate and reporting"]}
          ].map((s,i)=>(
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <p className="text-sm font-semibold text-violet-300 mb-2">{s.t}</p>
              {s.i.map((item,j)=><div key={j} className="flex gap-2 mb-1"><span className="text-violet-600 flex-shrink-0">›</span><span className="text-xs text-slate-300">{item}</span></div>)}
            </div>
          ))}
        </div>
      )}

      {sub==="netunits"&&(
        <div className="space-y-2">
          {NET_UNITS.map(u=>{
            const stage=(netUnitMap[u.u]??0) as 0|1|2|3;
            const pc=u.p==="P1"?"#C94B2A":u.p==="P2"?"#B06B0F":"#1556A0";
            return(
              <div key={u.u} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:pc}}>U{u.u}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{u.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{color:pc,background:`${pc}20`}}>{u.p}</span>
                      <span className="text-[10px] text-slate-500">~{u.wt}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {([{v:0,l:"-"},{v:1,l:"L"},{v:2,l:"N"},{v:3,l:"✓"}] as const).map(opt=>(
                      <button key={opt.v} onClick={()=>updateNETUnit(u.u,opt.v)}
                        className="w-6 h-6 rounded text-[10px] font-bold transition-colors"
                        style={{background:opt.v<=stage?pc:`${pc}20`,color:opt.v<=stage?"#fff":pc}}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {u.topics.map((t,i)=><span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{t}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sub==="interview"&&(
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 mb-2">
            {JAD_INTERVIEW.map(area=>{
              const stars=(jadProgress as any)?.[`${area.key}_stars`]??0;
              return(
                <div key={area.key} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-slate-400 mb-2">{area.area.split(" ").slice(0,2).join(" ")}</div>
                  <div className="flex justify-center gap-0.5 mb-1.5">
                    {[1,2,3,4,5].map(v=>(
                      <button key={v} onClick={()=>updateJADProgress({[`${area.key}_stars`]:v})}
                        className="text-sm transition-opacity" style={{opacity:v<=stars?1:0.2,color:"#8B2FC9"}}>★</button>
                    ))}
                  </div>
                  <div className="text-[10px] text-violet-400">{stars}/5 · {area.wt}%</div>
                </div>
              );
            })}
          </div>
          {JAD_INTERVIEW.map((area,i)=>(
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-violet-300">{area.area}</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950 text-violet-400">{area.wt}%</span>
              </div>
              {area.qs.map((q,j)=><div key={j} className="flex gap-2 mb-1.5"><span className="text-violet-500 text-xs flex-shrink-0">Q:</span><span className="text-xs text-slate-300">{q}</span></div>)}
            </div>
          ))}
        </div>
      )}

      {sub==="events"&&(
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Mark events as they happen. System shows recommended allocation changes.</p>
          {EVENT_TREE.map(ev=>{
            const active=occurredEventIds.has(ev.id as EventId);
            return(
              <div key={ev.id} className="rounded-xl border transition-colors"
                style={active?{borderColor:`${ev.hex}80`,background:`${ev.bg}15`}:{borderColor:"#1e293b",background:"#0f172a"}}>
                <div className="flex items-center gap-3 p-3">
                  <span className="text-xl flex-shrink-0">{ev.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{color:active?ev.dk:"#e2e8f0"}}>{ev.label}</p>
                    {active&&(
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {ev.effects.map((ef,i)=>(
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{background:ef.delta>0?"#FDF0EC":"#E8F8F3",color:ef.delta>0?"#C94B2A":"#1A8F68"}}>
                            {ef.exam}: {ef.delta>0?"+":""}{ef.delta}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={()=>toggleEvent(ev.id as EventId)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-colors"
                    style={active?{background:ev.hex,color:"#fff"}:{border:"0.5px solid #334155",color:"#94a3b8"}}>
                    {active?"✓ Active":"Mark"}
                  </button>
                </div>
                {active&&ev.actions.length>0&&(
                  <div className="px-4 pb-3 space-y-1">
                    {ev.actions.map((a,i)=><div key={i} className="flex gap-2"><span className="flex-shrink-0" style={{color:ev.hex}}>›</span><span className="text-xs text-slate-300">{a}</span></div>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
