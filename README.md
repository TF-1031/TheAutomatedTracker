## Overview

This internal tool manages **Sparklight Internet Offer Data** for creative, legal, and marketing operations.  
It allows the Creative Services team to easily build, preview, and export offer data to CSV or XLSX for campaign use.

All data is stored locally in your browser (via IndexedDB) and can be exported anytime.

---

## Getting Started

1. Open `index.html` in your browser or deploy it via GitHub Pages.
2. Fill in the offer form fields as you build a new promo.
3. Watch the **🧾 Offer Summary Preview** update live as you enter data.
4. Click **Save Offer** to add it to the table below.
5. Use the export buttons to download your completed data file.

---

## Field Definitions

| Field | Description |
|-------|--------------|
| **Core Enhanced** | Dropdown with predefined build versions. Selecting “Add New” reveals a custom entry field. If you check “Save this new Core Enhanced value for future offers,” that new value will persist in your dropdown (localStorage). |
| **Type (Fiber)** | Checkbox that automatically sets “Type” as `Fiber` (checked) or `HFC` (unchecked). This logic also auto-updates the “Fiber Fueled Disclaimer” internally, but no visible text is added to disclaimers. |
| **Campaign** | The campaign or flight identifier (e.g., “BFCM 11/28–12/5”). |
| **Offer** | The front-facing headline or promo line (e.g., “600 Mbps for $29.95/mo. for 6 mos.”). |
| **Promo, Term, Step-Up, Reg Rate** | Used for pricing progression. All appear in the preview to mirror final legal copy. |
| **Gift Card** | Optional incentive (e.g., `$50`, or blank). |
| **Equipment** | Notes on included or optional equipment. |
| **Expires** | Uses a calendar picker. You may leave blank if no expiration applies. |
| **Unlimited Data** | Checked by default; unchecking removes “Unlimited data” mentions from the preview and exports. |
| **Automated Tracker** | Auto-fills each time an offer is saved using current date (e.g. `Automated_Tracker_(100925)`). |
| **Status** | Hidden from the form. Always saved as “Not Started” for workflow visibility in exports. |

---

## Offer Summary Preview

This section automatically updates as you type and reflects the data entered above the table.  
It’s styled as a light card with a purple header for quick readability.

This preview helps the team verify headline, promo logic, and disclaimer-related data before saving.

---

## Disclaimers

- **Short** and **Long Disclaimers** are not manually entered in this phase.
- They default to `"Generate"` placeholders for future integration with your disclaimer builder tool.
- Fiber, eero/Plume, and Ookla logic remain supported but are hidden or automated internally.

---

## Data Handling

All data is stored **locally** using your browser’s IndexedDB.  
Nothing is uploaded to any external server.

### Export
Click “Export CSV” or “Export XLSX” to download your current data table.

### Import
In future versions, an Import button will be added to restore previously exported datasets.

---

## Versioning + Maintenance

- Version: `v3.0`
- Updated: October 2025
- Author: Alt-Caroline 💕 (Creative Services Team Support)
- Repository: `sparklight-offer-manager`

---

## Future Enhancements

- Integrate disclaimer builder (Cabo Cobbler logic)
- Add SharePoint sync for shared team storage
- Create user-level tracking (status updates, proof attachments)
- Optional API for campaign auto-loading from internal databases

---

## Support

For questions or updates to logic, reach out to:
**Creative Services – Sparklight Marketing Operations**

---

© 2025 Cable One, Inc. All Rights Reserved.
