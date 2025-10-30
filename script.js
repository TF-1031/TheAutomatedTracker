// IndexedDB setup
const DB_NAME = "sparklight_offers_db_v8";
const STORE = "offers";
let db;

function openDB(){
  return new Promise((res,rej)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=e=>{
      const dbx=e.target.result;
      if(!dbx.objectStoreNames.contains(STORE)) dbx.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});
    };
    req.onsuccess=()=>{db=req.result;res();};
    req.onerror=()=>rej(req.error);
  });
}

// Simple disclaimer generator
function buildShort(){ return "Auto Pay and Paperless Billing required. Restrictions apply; see details."; }
function buildLong(m){
  let out=`Promotional rate for ${m.download}x${m.upload} is ${m.promo}/mo. for ${m.term} mos. Requires Auto Pay. `;
  if(m.stepUpPrice) out+=`Then ${m.stepUpPrice}/mo. for mos. ${m.stepUpTerm}. `;
  if(m.regRate) out+=`Regular rates from ${m.regRate}/mo. `;
  if(m.expires) out+=`Offer expires ${m.expires}. `;
  out+="Taxes, fees, and restrictions apply. ";
  if (m.eeroMentioned === 'Yes') out+="eero and all related marks are trademarks of Amazon.com, Inc. or its affiliates.";
  return out;
}

// Modal controls
const modal=document.getElementById("disclaimerModal");
const modalShort=document.getElementById("modalShort");
const modalLong=document.getElementById("modalLong");

document.getElementById("genBaseBtn").addEventListener("click",()=>{
  const model={
    download:down.value.trim()||"100 Mbps",
    upload:up.value.trim()||"10 Mbps",
    promo:promo.value.trim()||"$29.95",
    term:term.value.trim()||"12",
    stepUpPrice:suPrice.value.trim(),
    stepUpTerm:suTerm.value.trim(),
    regRate:reg.value.trim(),
    expires:expires.value
  };
  modalShort.innerText=buildShort();
  modalLong.innerText=buildLong(model);
  modal.classList.remove("hide");
});

cancelModal.onclick=()=>modal.classList.add("hide");
applyModal.onclick=()=>{
  shortDisc.value=modalShort.innerText;
  longDisc.value=modalLong.innerText;
  modal.classList.add("hide");
  updatePreview();
};

// Form & table handling
async function refreshTable(){
  const rows=await db.transaction(STORE,"readonly").objectStore(STORE).getAll();
  const tb=document.querySelector("#offersTable tbody");
  tb.innerHTML="";
  rows.forEach(r=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${r.campaign||""}</td><td>${r.offer||""}</td><td>${r.promo||""}</td><td>${r.term||""}</td>`;
    tb.appendChild(tr);
  });
}

function updatePreview(){
  pCampaign.textContent=campaign.value;
  pOffer.textContent=offer.value;
  pPromo.textContent=promo.value;
  pTerm.textContent=term.value;
  pShortDisc.textContent=shortDisc.value;
  pLongDisc.textContent=longDisc.value;
  pOfferLine.textContent = generateOfferLine();
}

offerForm.addEventListener("input",updatePreview);
offerForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const rec={
    campaign:campaign.value,offer:offer.value,promo:promo.value,term:term.value,
    shortDisc:shortDisc.value,longDisc:longDisc.value
  };
  const tx=db.transaction(STORE,"readwrite");
  tx.objectStore(STORE).add(rec);
  await refreshTable();
  offerForm.reset();
  updatePreview();
});

openDB().then(refreshTable);


const RATE_VERSION_KEY = "rate_version_list";
const DEFAULT_VERSIONS = [
  "Core",
  "Core_FMAJ",
  "Core_NoEERO",
  "Core_Equip",
  "Core_Max_VIC HHI",
  "Core_Max_Equip",
  "Core_Max_Exp",
  "Core_Max_Equip_Sioux",
  "Enhanced",
  "Enhanced_Equip",
  "Enhanced_Max",
  "Enhanced_Max_Equip",
  "Enhanced_Max_Equip_NoPromo",
  "Edge",
  "Edge_Equip",
  "Edge_Max",
  "Core_APTest_A",
  "Core_APTest_B",
  "Enhanced_APTest_A",
  "Enhanced_APTest_B",
  "Enhanced_Equip_APTest_A",
  "Enhanced_Equip_APTest_B",
  "Core_MMTest_B",
  "Enhanced_MMTest_B",
  "Enhanced_Equip_MMTest_B",
  "Enhanced_Equip",
  "General/Univeral",
  "Brand",
  "Core_His",
  "Brand_His",
  "Core Hispanic"
];

function loadRateVersions() {
  const saved = JSON.parse(localStorage.getItem(RATE_VERSION_KEY)) || DEFAULT_VERSIONS;
  const sel = document.getElementById("rateVersion");
  sel.innerHTML = "";
  saved.forEach(v => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = v;
    sel.appendChild(opt);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadRateVersions();
});

renderChannelList();

function updatePreview(){
  pCampaign.textContent=campaign.value;
  pOffer.textContent=offer.value;
  pPromo.textContent=promo.value;
  pTerm.textContent=term.value;
  pShortDisc.textContent=shortDisc.value;
  pLongDisc.textContent=longDisc.value;
  pOfferLine.textContent = generateOfferLine();
  if (document.getElementById("pChannels"))
    pChannels.textContent = [...document.querySelectorAll("#channelList input:checked")].map(i => i.value).join(", ");
}

const DEFAULT_CHANNELS = [
  "META", "Display", "CTV", "Pre-Roll", "YouTube", "Digital Audio", "Broadcast Radio",
  "Broadcast TV", "Nextdoor", "InApp Gaming", "TikTok", "Flyer FullPage", "Flyer HalfPage",
  "Doorhanger", "Yardsign", "OOH Dig Billboard", "Billboard"
];

function renderChannelList(channels = DEFAULT_CHANNELS) {
  const wrap = document.getElementById("channelList");
  if (!wrap) return;
  wrap.innerHTML = "";
  channels.forEach(c => {
    const id = "chan_" + c.replace(/\s+/g, "_");
    const div = document.createElement("div");
    div.className = "col-3";
    div.innerHTML = `<label class="row"><input type="checkbox" id="${id}" value="${c}"><span>${c}</span></label>`;
    wrap.appendChild(div);
  });
}

document.getElementById("channelAddBtn").addEventListener("click", () => {
  const val = document.getElementById("channelNew").value.trim();
  if (!val) return;
  const allLabels = [...document.querySelectorAll("#channelList input")].map(el => el.value);
  if (!allLabels.includes(val)) {
    DEFAULT_CHANNELS.push(val);
    renderChannelList(DEFAULT_CHANNELS);
  }
  document.getElementById("channelNew").value = "";
});

// Injected into form submit:
rec.channels = [...document.querySelectorAll("#channelList input:checked")].map(i => i.value);


function generateOfferLine() {
  const parts = [];

  if (offer.value) parts.push(offer.value);
  if (stepCheck.checked && suPrice.value && suTerm.value)
    parts.push(`Then ${suPrice.value}/mo. for mos. ${suTerm.value}.`);
  if (reg.value) parts.push(`Reg. ${reg.value}.`);
  if (gcCheck.checked && gcAmt.value) parts.push(`${gcAmt.value} Gift Card.`);
  if (equipIncluded.checked) parts.push(`Includes equipment.`);

  return parts.join(" ");
}
