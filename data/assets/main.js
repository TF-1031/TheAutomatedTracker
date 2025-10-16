// ==============================
// IndexedDB + App Logic
// ==============================
const DB_NAME = "automatedTrackerDB";
const STORE = "offers";
const DB_VERSION = 1;

let DB = null;
let EDIT_ID = null; // current editing record id

// Open DB
function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains(STORE)){
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}

// Helpers for transactions
function tx(storeName, mode="readonly"){
  return DB.transaction(storeName, mode).objectStore(storeName);
}

function addOffer(offer){
  return new Promise((resolve, reject)=>{
    const req = tx(STORE, "readwrite").add(offer);
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}
function updateOffer(offer){
  return new Promise((resolve, reject)=>{
    const req = tx(STORE, "readwrite").put(offer);
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}
function deleteOffer(id){
  return new Promise((resolve, reject)=>{
    const req = tx(STORE, "readwrite").delete(id);
    req.onsuccess = ()=> resolve(true);
    req.onerror = ()=> reject(req.error);
  });
}
function clearAllOffers(){
  return new Promise((resolve, reject)=>{
    const req = tx(STORE, "readwrite").clear();
    req.onsuccess = ()=> resolve(true);
    req.onerror = ()=> reject(req.error);
  });
}
function getAllOffers(){
  return new Promise((resolve, reject)=>{
    const req = tx(STORE).getAll();
    req.onsuccess = ()=> resolve(req.result || []);
    req.onerror = ()=> reject(req.error);
  });
}
async function getOfferById(id){
  return new Promise((resolve, reject)=>{
    const req = tx(STORE).get(id);
    req.onsuccess = ()=> resolve(req.result || null);
    req.onerror = ()=> reject(req.error);
  });
}

// ==============================
// UI + Behavior
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const rateVersion = document.getElementById("rateVersion");
  const rateVersionNewWrap = document.getElementById("rateVersionNewWrap");
  const rateVersionNew = document.getElementById("rateVersionNew");
  const rateVersionSavePerm = document.getElementById("rateVersionSavePerm");

  const fiberCheck = document.getElementById("fiberCheck");
  const campaign = document.getElementById("campaign");
  const offer = document.getElementById("offer");
  const down = document.getElementById("down");
  const up = document.getElementById("up");
  const promo = document.getElementById("promo");
  const term = document.getElementById("term");
  const gcCheck = document.getElementById("gcCheck");
  const gcAmt = document.getElementById("gcAmt");
  const stepCheck = document.getElementById("stepCheck");
  const suTerm = document.getElementById("suTerm");
  const suPrice = document.getElementById("suPrice");
  const reg = document.getElementById("reg");
  const equipIncluded = document.getElementById("equipIncluded");
  const eeroMentioned = document.getElementById("eeroMentioned");
  const expires = document.getElementById("expires");
  const unlimitedCheck = document.getElementById("unlimitedCheck");
  const shortDisc = document.getElementById("shortDisc");
  const longDisc = document.getElementById("longDisc");
  const notes = document.getElementById("notes");
  const status = document.getElementById("status");
  const automatedTracker = document.getElementById("automatedTracker");
  const resetFormBtn = document.getElementById("resetFormBtn");
  const submitBtn = document.getElementById("submitBtn");

  const pRate = document.getElementById("pRate");
  const pType = document.getElementById("pType");
  const pCampaign = document.getElementById("pCampaign");
  const pOffer = document.getElementById("pOffer");
  const pSpeeds = document.getElementById("pSpeeds");
  const pPromo = document.getElementById("pPromo");
  const pTerm = document.getElementById("pTerm");
  const pStep = document.getElementById("pStep");
  const pReg = document.getElementById("pReg");
  const pGift = document.getElementById("pGift");
  const pEquip = document.getElementById("pEquip");
  const pEero = document.getElementById("pEero");
  const pExp = document.getElementById("pExp");
  const pUnlimited = document.getElementById("pUnlimited");

  const form = document.getElementById("offerForm");
  const offersTable = document.getElementById("offersTable").querySelector("tbody");

  const genBaseBtn = document.getElementById("genBaseBtn");
  const discModal = document.getElementById("discModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelDiscBtn = document.getElementById("cancelDiscBtn");
  const applyDiscBtn = document.getElementById("applyDiscBtn");
  const previewShort = document.getElementById("previewShort");
  const previewLong = document.getElementById("previewLong");

  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const exportXlsxBtn = document.getElementById("exportXlsxBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const toast = document.getElementById("toast");

  // --- Toast helper
  function showToast(message, ok=true){
    toast.textContent = message;
    toast.style.background = ok ? "#16a34a" : "#d32f2f";
    toast.classList.remove("hide");
    requestAnimationFrame(()=> toast.classList.add("show"));
    setTimeout(()=>{
      toast.classList.remove("show");
      setTimeout(()=> toast.classList.add("hide"), 250);
    }, 1400);
  }

  // --- Helpers
  function mmddyy(d=new Date()){
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const dd = String(d.getDate()).padStart(2,"0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}${dd}${yy}`;
  }
  function filenameBase(){ return `Automated_Tracker_(${mmddyy()})`; }

  function setTrackerField(){
    if (automatedTracker) automatedTracker.value = filenameBase();
  }
  setTrackerField();

  function toggle(el, show){ el.classList[show ? "remove" : "add"]("hide"); }
  function val(el){ return (el?.value ?? "").trim(); }
  function toType(){ return fiberCheck.checked ? "Fiber" : "HFC"; }

  // Defaults (used when blank)
  const DEFAULTS = {
    rateVersion: "Core Enhanced",
    campaign: "General Offer",
    offer: "100 Mbps for $29.95/mo. for 12 mos. w/ Auto Pay Paperless Billing.",
    down: "100 Mbps",
    up: "10 Mbps",
    promo: "$29.95",
    term: "12 mos.",
    suTerm: "mos. 7–12",
    suPrice: "$59.95",
    reg: "$75–$90",
    gift: "$100"
  };

  // Formatters for terms
  function normalizePromoTermInput(text){
    const digits = (text.match(/\d+/) || [""])[0];
    if(!digits) return DEFAULTS.term; // fallback to default
    return `${digits} mos.`;
  }
  function normalizeStepTermInput(text){
    // accepts "7–12" or "7-12" or already prefixed; ensure prefix "mos. "
    const cleaned = text.replace(/^mos\.\s*/i,"").replace(/\s*/g,"").replace("-", "–");
    if(!cleaned) return DEFAULTS.suTerm;
    return `mos. ${cleaned}`;
  }

  function formatStepPreview(){
    if(!stepCheck.checked) return "—";
    const t = val(suTerm) || "";
    const p = val(suPrice) || DEFAULTS.suPrice;
    const termTxt = t ? `for ${t}.` : `for ${DEFAULTS.suTerm}.`;
    return `${termTxt} rate increases to ${p}`;
  }

  function speedsText(){
    const d = val(down) || DEFAULTS.down;
    const u = val(up) || DEFAULTS.up;
    return `${d} / ${u}`;
  }

  function updatePreview(){
    pRate.textContent = (rateVersion.value || DEFAULTS.rateVersion);
    pType.textContent = toType();
    pCampaign.textContent = val(campaign) || DEFAULTS.campaign;
    pOffer.textContent = val(offer) || DEFAULTS.offer;
    pSpeeds.textContent = speedsText();
    pPromo.textContent = val(promo) || DEFAULTS.promo;

    // term preview "for 12 mos."
    const termInput = val(term);
    const termDisplay = termInput ? `for ${normalizePromoTermInput(termInput)}` : `for ${DEFAULTS.term}`;
    pTerm.textContent = termDisplay;

    // step preview "for mos. 7–12."
    pStep.textContent = formatStepPreview();
    pReg.textContent = val(reg) || DEFAULTS.reg;
    pGift.textContent = gcCheck.checked ? (val(gcAmt) || DEFAULTS.gift) : "—";
    pEquip.textContent = equipIncluded.checked ? "Yes" : "No";
    pEero.textContent = eeroMentioned.checked ? "Yes" : "No";
    pExp.textContent = val(expires) || "—";
    pUnlimited.textContent = unlimitedCheck.checked ? "Yes" : "No";
  }

  // Rate Version dropdown init
  const RATE_VERSIONS_KEY = "rateVersions";
  function loadRateVersions(){
    const saved = JSON.parse(localStorage.getItem(RATE_VERSIONS_KEY) || "[]");
    const defaults = [DEFAULTS.rateVersion,"Core Enhanced (Add New)"];
    const list = [...saved, ...defaults.filter(d => !saved.includes(d))];
    rateVersion.innerHTML = "";
    list.forEach(v=>{
      const opt = document.createElement("option");
      opt.value = v; opt.textContent = v;
      rateVersion.appendChild(opt);
    });
  }
  loadRateVersions();

  rateVersion.addEventListener("change", ()=>{
    if(rateVersion.value.toLowerCase().includes("add new")){
      toggle(rateVersionNewWrap, true);
      rateVersionNew.focus();
    } else {
      toggle(rateVersionNewWrap, false);
    }
    updatePreview();
  });

  rateVersionNew.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      const v = val(rateVersionNew);
      if(!v) return;
      const opt = document.createElement("option");
      opt.value = v; opt.textContent = v;
      rateVersion.insertBefore(opt, rateVersion.firstChild);
      rateVersion.value = v;
      if(rateVersionSavePerm.checked){
        const saved = JSON.parse(localStorage.getItem(RATE_VERSIONS_KEY) || "[]");
        if(!saved.includes(v)){
          saved.unshift(v);
          localStorage.setItem(RATE_VERSIONS_KEY, JSON.stringify(saved));
        }
      }
      rateVersionNew.value = "";
      rateVersionSavePerm.checked = false;
      toggle(rateVersionNewWrap, false);
      updatePreview();
    }
  });

  // Event bindings
  [fiberCheck,campaign,offer,down,up,promo,reg,expires,unlimitedCheck,equipIncluded,eeroMentioned,suTerm,suPrice].forEach(el=>{
    el.addEventListener(el.type==="checkbox"?"change":"input", updatePreview);
  });

  // Gift Card toggle
  function updateGiftCardVisibility(){
    if (gcCheck.checked){
      if(!val(gcAmt)) gcAmt.value = DEFAULTS.gift;
      toggle(gcAmt, true);
    } else {
      toggle(gcAmt, false);
      gcAmt.value = "";
    }
  }
  gcCheck.addEventListener("change", ()=>{ updateGiftCardVisibility(); updatePreview(); });
  gcAmt.addEventListener("input", updatePreview);

  // Step-Up toggle
  stepCheck.addEventListener("change", ()=>{
    const on = stepCheck.checked;
    toggle(suTerm, on); toggle(suPrice, on);
    updatePreview();
  });

  // Term formatting on blur
  term.addEventListener("blur", ()=>{
    if(val(term)){
      term.value = normalizePromoTermInput(term.value);
    }
    updatePreview();
  });
  suTerm.addEventListener("blur", ()=>{
    if(val(suTerm)){
      suTerm.value = normalizeStepTermInput(suTerm.value);
    }
    updatePreview();
  });

  resetFormBtn.addEventListener("click", ()=>{
    form.reset();
    EDIT_ID = null;
    submitBtn.textContent = "Save Offer";
    toggle(gcAmt, false);
    toggle(suTerm, false);
    toggle(suPrice, false);
    fiberCheck.checked = false;
    unlimitedCheck.checked = true;
    updatePreview();
    setTrackerField();
  });

  // Disclaimer generator modal
  function highlightVars(text){
    const patterns = [
      /\$\d+(?:\.\d{2})?/g,                // dollar amounts
      /\b\d+\s?mos\.?/gi,                  // 6 mos.
      /\bmos\.\s?\d+[\u2013-]\d+\.?/gi,    // mos. 7–12
      /\b\d+\s?Mbps\b/gi,                  // 600 Mbps
      /\b\d+\s?Gig\b/gi                    // 1 Gig
    ];
    let out = text;
    patterns.forEach(rx=>{ out = out.replace(rx, (m)=>`<span class="highlight-var">${m}</span>`); });
    return out;
  }

  function buildShortDisclaimer(){
    const promoTxt = val(promo) || DEFAULTS.promo;
    const termTxt = val(term) ? normalizePromoTermInput(val(term)) : DEFAULTS.term;
    const speeds = speedsText();
    const step = stepCheck.checked ? ` For ${normalizeStepTermInput(val(suTerm) || DEFAULTS.suTerm)}, rate increases to ${val(suPrice)||DEFAULTS.suPrice}.` : "";
    const gc = gcCheck.checked ? ` Gift card (${val(gcAmt) || DEFAULTS.gift}) issued after qualifying activation.` : "";
    const unlim = unlimitedCheck.checked ? " Unlimited data included." : "";
    return `Intro rate ${promoTxt} for ${termTxt}. Speeds up to ${speeds}.${step}${gc}${unlim}`;
  }

  function buildLongDisclaimer(){
    const type = toType();
    const rr = val(reg) || DEFAULTS.reg;
    const exp = val(expires) ? ` Offer expires ${val(expires)}.` : "";
    const equip = equipIncluded.checked ? " Equipment included for promotional term; return required if service canceled." : "";
    const eero = eeroMentioned.checked ? " eero/Plume availability varies by market." : "";
    return `Service type: ${type}. Regular rate ${rr} thereafter.${equip}${eero}${exp}`;
  }

  function openDiscModal(){
    const s = buildShortDisclaimer();
    const l = buildLongDisclaimer();
    previewShort.innerHTML = highlightVars(s);
    previewLong.innerHTML = highlightVars(l);
    const card = discModal.querySelector('.modal-card');
    card.classList.remove('animate-in');
    discModal.classList.remove("hide");
    setTimeout(()=> card.classList.add('animate-in'), 10);
  }
  function closeDiscModal(){ discModal.classList.add("hide"); }

  document.getElementById("genBaseBtn").addEventListener("click", openDiscModal);
  document.getElementById("closeModalBtn").addEventListener("click", closeDiscModal);
  document.getElementById("cancelDiscBtn").addEventListener("click", closeDiscModal);
  document.getElementById("applyDiscBtn").addEventListener("click", ()=>{
    const tmp = document.createElement("div");
    tmp.innerHTML = previewShort.innerHTML; shortDisc.value = tmp.textContent;
    tmp.innerHTML = previewLong.innerHTML; longDisc.value = tmp.textContent;
    closeDiscModal(); // auto-close after apply
    updatePreview();
  });

  // Save / Update Offer (with thumbnail)
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();

    // Resolve defaults at save time
    const _rate = rateVersion.value || DEFAULTS.rateVersion;
    const _campaign = val(campaign) || DEFAULTS.campaign;
    const _offer = val(offer) || DEFAULTS.offer;
    const _down = val(down) || DEFAULTS.down;
    const _up = val(up) || DEFAULTS.up;
    const _promo = val(promo) || DEFAULTS.promo;
    const _term = val(term) ? normalizePromoTermInput(val(term)) : DEFAULTS.term;
    const _suTerm = stepCheck.checked ? (val(suTerm) ? normalizeStepTermInput(val(suTerm)) : DEFAULTS.suTerm) : "";
    const _suPrice = stepCheck.checked ? (val(suPrice) || DEFAULTS.suPrice) : "";
    const _reg = val(reg) || DEFAULTS.reg;
    const _gift = gcCheck.checked ? (val(gcAmt) || DEFAULTS.gift) : "";
    const _expires = val(expires);

    const data = {
      id: EDIT_ID || undefined,
      rateVersion: _rate,
      type: toType(),
      campaign: _campaign,
      offer: _offer,
      downloadSpeed: _down,
      uploadSpeed: _up,
      promoPrice: _promo,
      term: _term, // e.g., "12 mos."
      stepUpPrice: _suPrice,
      stepUpTerm: _suTerm, // e.g., "mos. 7–12"
      regRate: _reg,
      giftCard: _gift,
      equipIncluded: equipIncluded.checked,
      eeroPlume: eeroMentioned.checked,
      expires: _expires,
      unlimited: unlimitedCheck.checked,
      shortDisc: val(shortDisc) || buildShortDisclaimer(),
      longDisc: val(longDisc) || buildLongDisclaimer(),
      notes: val(notes),
      status: status.value || "Not Started",
      tracker: filenameBase(),
      createdAt: new Date().toISOString(),
      thumb: "" // to be generated
    };

    // generate thumbnail from preview card
    const previewEl = document.getElementById("offerPreviewCard");
    try {
      const canvas = await html2canvas(previewEl, {scale: 0.5, backgroundColor: null});
      data.thumb = canvas.toDataURL("image/png");
    } catch(err){
      console.warn("Thumbnail generation failed:", err);
      data.thumb = "";
    }

    if(EDIT_ID){
      data.id = EDIT_ID;
      await updateOffer(data);
      await renderAllOffers();
      EDIT_ID = null;
      submitBtn.textContent = "Save Offer";
    } else {
      const newId = await addOffer(data);
      data.id = newId;
      appendOfferRow(data, true);
    }

    form.reset();
    toggle(gcAmt, false); toggle(suTerm, false); toggle(suPrice, false);
    unlimitedCheck.checked = true;
    fiberCheck.checked = false;
    updatePreview();
    setTrackerField();
  });

  function actionMenuCell(offer){
    const td = document.createElement("td");
    td.className = "actions";

    const wrapper = document.createElement("div");
    wrapper.className = "actions-menu";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-button";
    btn.textContent = "⋯";

    const list = document.createElement("div");
    list.className = "menu-list";

    const bEdit = document.createElement("button");
    bEdit.textContent = "✏️ Edit";
    bEdit.addEventListener("click", ()=> { wrapper.classList.remove("open"); startEdit(offer.id); });

    const bDup = document.createElement("button");
    bDup.textContent = "📄 Duplicate";
    bDup.addEventListener("click", async ()=>{
      wrapper.classList.remove("open");
      await duplicateOffer(offer.id);
      showToast("Offer duplicated successfully!");
    });

    const bDel = document.createElement("button");
    bDel.textContent = "🗑️ Delete";
    bDel.addEventListener("click", async ()=>{
      wrapper.classList.remove("open");
      if(confirm("Delete this offer?")){
        await deleteOffer(offer.id);
        await renderAllOffers();
      }
    });

    list.appendChild(bEdit);
    list.appendChild(bDup);
    list.appendChild(bDel);

    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      document.querySelectorAll(".actions-menu.open").forEach(m => m.classList.remove("open"));
      wrapper.classList.toggle("open");
    });

    document.addEventListener("click", ()=> wrapper.classList.remove("open"));

    wrapper.appendChild(btn);
    wrapper.appendChild(list);
    td.appendChild(wrapper);
    return td;
  }

  function appendOfferRow(o, prepend=false){
    const tr = document.createElement("tr");
    const thumbTd = document.createElement("td");
    if(o.thumb){
      const img = document.createElement("img");
      img.src = o.thumb; img.className = "thumb";
      thumbTd.appendChild(img);
    } else { thumbTd.textContent = "—"; }
    tr.appendChild(thumbTd);

    function td(text){ const td=document.createElement("td"); td.textContent=text || "—"; return td; }

    tr.appendChild(td(o.rateVersion));
    tr.appendChild(td(o.type));
    tr.appendChild(td(o.campaign));
    tr.appendChild(td(o.offer));
    tr.appendChild(td(o.promoPrice));
    tr.appendChild(td(o.term));
    tr.appendChild(td(o.regRate));
    tr.appendChild(td(o.giftCard));
    tr.appendChild(td(o.expires || "—"));
    tr.appendChild(td(o.status));

    tr.appendChild(actionMenuCell(o));

    if(prepend){
      offersTable.prepend(tr);
    } else {
      offersTable.appendChild(tr);
    }
  }

  async function renderAllOffers(){
    const all = await getAllOffers();
    offersTable.innerHTML = "";
    all.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    all.forEach(o=> appendOfferRow(o));
  }

  async function startEdit(id){
    const all = await getAllOffers();
    const rec = all.find(r=> r.id === id);
    if(!rec) return;

    EDIT_ID = id;
    submitBtn.textContent = "Update Offer";

    rateVersion.value = rec.rateVersion || DEFAULTS.rateVersion;
    fiberCheck.checked = (rec.type === "Fiber");
    campaign.value = rec.campaign || "";
    offer.value = rec.offer || "";
    down.value = rec.downloadSpeed || "";
    up.value = rec.uploadSpeed || "";
    promo.value = rec.promoPrice || "";
    term.value = rec.term ? (rec.term.match(/\d+/)?.[0] || "") : "";
    if(rec.stepUpTerm){
      const cleaned = rec.stepUpTerm.replace(/^mos\.\s*/i,"");
      stepCheck.checked = true;
      toggle(suTerm, true); toggle(suPrice, true);
      suTerm.value = cleaned || "";
      suPrice.value = rec.stepUpPrice || "";
    } else {
      stepCheck.checked = false;
      toggle(suTerm, false); toggle(suPrice, false);
      suTerm.value = ""; suPrice.value = "";
    }
    reg.value = rec.regRate || "";
    gcCheck.checked = !!rec.giftCard;
    updateGiftCardVisibility();
    gcAmt.value = rec.giftCard || "";
    equipIncluded.checked = !!rec.equipIncluded;
    eeroMentioned.checked = !!rec.eeroPlume;
    expires.value = rec.expires || "";
    unlimitedCheck.checked = !!rec.unlimited;
    shortDisc.value = rec.shortDisc || "";
    longDisc.value = rec.longDisc || "";
    notes.value = rec.notes || "";

    window.scrollTo({top: 0, behavior: "smooth"});
    updatePreview();
  }

  async function duplicateOffer(id){
    const rec = await getOfferById(id);
    if(!rec) return;
    // new record from existing (update timestamps & thumbnail)
    const copy = {...rec};
    delete copy.id;
    copy.createdAt = new Date().toISOString();
    try {
      const previewEl = document.getElementById("offerPreviewCard");
      const canvas = await html2canvas(previewEl, {scale: 0.5, backgroundColor: null});
      copy.thumb = canvas.toDataURL("image/png");
    } catch(e){
      copy.thumb = rec.thumb || "";
    }
    const newId = await addOffer(copy);
    copy.id = newId;
    appendOfferRow(copy, true);
  }

  // Exporters
  function offersToRowsArray(offers){
    return offers.map(o=>({
      "Rate Version": o.rateVersion,
      "Type": o.type,
      "Campaign": o.campaign,
      "Offer": o.offer,
      "Download": o.downloadSpeed,
      "Upload": o.uploadSpeed,
      "Promo": o.promoPrice,
      "Term": o.term,
      "Step-Up Term": o.stepUpTerm,
      "Step-Up Price": o.stepUpPrice,
      "Reg Rate": o.regRate,
      "Gift Card": o.giftCard,
      "Equipment Included": o.equipIncluded ? "Yes":"No",
      "eero/Plume": o.eeroPlume ? "Yes":"No",
      "Expires": o.expires || "",
      "Unlimited Data": o.unlimited ? "Yes":"No",
      "Short Disclaimer": o.shortDisc,
      "Long Disclaimer": o.longDisc,
      "Notes": o.notes,
      "Status": o.status,
      "Tracker": o.tracker,
      "Created At": o.createdAt
    }));
  }

  async function exportCSV(){
    const rows = offersToRowsArray(await getAllOffers());
    if(!rows.length){ alert("No offers to export yet."); return; }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map(r=>headers.map(h=>{
        const v = String(r[h]??"");
        if(v.includes(",") || v.includes("\"") || v.includes("\n")){
          return `"${v.replace(/"/g,'""')}"`;
        }
        return v;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameBase()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function exportXLSX(){
    const rows = offersToRowsArray(await getAllOffers());
    if(!rows.length){ alert("No offers to export yet."); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Offers");
    XLSX.writeFile(wb, `${filenameBase()}.xlsx`);
  }

  exportCsvBtn.addEventListener("click", exportCSV);
  exportXlsxBtn.addEventListener("click", exportXLSX);
  clearAllBtn.addEventListener("click", async ()=>{
    if(confirm("Delete ALL saved offers? This cannot be undone.")){
      await clearAllOffers();
      await renderAllOffers();
    }
  });

  // DB init and initial render
  try {
    DB = await openDB();
    showToast("Database Ready ✅", true);
    await renderAllOffers();
  } catch (e){
    console.error("DB open failed:", e);
    showToast("Database failed to open.", false);
    alert("Database failed to open. The app will run without persistence.");
  }

  // initial preview
  updatePreview();
});
