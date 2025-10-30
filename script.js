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
  out+="Taxes, fees, and restrictions apply.";
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
