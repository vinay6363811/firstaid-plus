/**
 * First Aid Kit Checklist & Inventory Tracker
 */

const DEFAULT_KIT_ITEMS = [
  { id: "c1", category: "Dressings & Bandages", name: "Sterile gauze pads (assorted sizes)", checked: true },
  { id: "c2", category: "Dressings & Bandages", name: "Adhesive bandages (Band-Aids)", checked: true },
  { id: "c3", category: "Dressings & Bandages", name: "Elastic crepe bandage (3 & 4 inch)", checked: true },
  { id: "c4", category: "Dressings & Bandages", name: "Triangular bandages (for slings)", checked: false },
  { id: "c5", category: "Dressings & Bandages", name: "Medical adhesive micropore tape", checked: true },
  { id: "c6", category: "Antiseptics & Cleaners", name: "Povidone-iodine / Chlorhexidine solution", checked: true },
  { id: "c7", category: "Antiseptics & Cleaners", name: "Sterile saline water (for eye flush)", checked: false },
  { id: "c8", category: "Antiseptics & Cleaners", name: "Antiseptic wipes / alcohol prep pads", checked: true },
  { id: "c9", category: "Tools & Equipment", name: "Medical scissors (blunt tip)", checked: true },
  { id: "c10", category: "Tools & Equipment", name: "Tweezers (for splinters/ticks)", checked: true },
  { id: "c11", category: "Tools & Equipment", name: "Disposable nitrile gloves (3 pairs)", checked: true },
  { id: "c12", category: "Tools & Equipment", name: "CPR face shield / pocket mask", checked: false },
  { id: "c13", category: "Tools & Equipment", name: "Emergency thermal foil blanket", checked: false },
  { id: "c14", category: "Tools & Equipment", name: "Digital clinical thermometer", checked: true },
  { id: "c15", category: "Medicines & Relief", name: "Paracetamol 500mg tablets (pain/fever)", checked: true },
  { id: "c16", category: "Medicines & Relief", name: "Oral Rehydration Salts (ORS packets)", checked: true },
  { id: "c17", category: "Medicines & Relief", name: "Soluble Aspirin 300mg (for adult chest pain)", checked: false },
  { id: "c18", category: "Medicines & Relief", name: "Antihistamine tablets (Cetirizine)", checked: true },
  { id: "c19", category: "Medicines & Relief", name: "Hydrocortisone cream 1% (for bites/rashes)", checked: false }
];

class KitChecklistController {
  constructor() {
    this.items = this.loadItems();
    this.listContainer = document.getElementById("kit-items-container");
    this.progressEl = document.getElementById("kit-progress-text");
    this.render();
  }

  loadItems() {
    try {
      const saved = localStorage.getItem("firstaid_kit_items");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_KIT_ITEMS;
  }

  saveItems() {
    try {
      localStorage.setItem("firstaid_kit_items", JSON.stringify(this.items));
    } catch (e) {}
  }

  toggleItem(id) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.checked = !item.checked;
      this.saveItems();
      this.render();
    }
  }

  render() {
    if (!this.listContainer) return;
    this.listContainer.innerHTML = "";

    const checkedCount = this.items.filter(i => i.checked).length;
    const total = this.items.length;
    const percent = Math.round((checkedCount / total) * 100);

    if (this.progressEl) {
      this.progressEl.textContent = `${checkedCount} of ${total} items stocked (${percent}%)`;
    }

    // Group by category
    const categories = {};
    for (const item of this.items) {
      if (!categories[item.category]) categories[item.category] = [];
      categories[item.category].push(item);
    }

    for (const [catName, catItems] of Object.entries(categories)) {
      const catHeading = document.createElement("h4");
      catHeading.style.cssText = "margin: 16px 0 8px 0; color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;";
      catHeading.textContent = catName;
      this.listContainer.appendChild(catHeading);

      const itemsGrid = document.createElement("div");
      itemsGrid.style.cssText = "display: flex; flex-direction: column; gap: 8px;";

      catItems.forEach(item => {
        const row = document.createElement("label");
        row.style.cssText = `display: flex; align-items: center; gap: 10px; background: #1b243b; padding: 10px 14px; border-radius: 8px; border: 1px solid #273553; cursor: pointer; user-select: none; transition: background 0.15s;`;
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.style.cssText = "width: 18px; height: 18px; accent-color: #10b981; cursor: pointer;";
        checkbox.addEventListener("change", () => this.toggleItem(item.id));

        const span = document.createElement("span");
        span.textContent = item.name;
        span.style.cssText = item.checked ? "color: #cbd5e1; text-decoration: none;" : "color: #94a3b8;";

        row.appendChild(checkbox);
        row.appendChild(span);
        itemsGrid.appendChild(row);
      });

      this.listContainer.appendChild(itemsGrid);
    }
  }
}

window.KitChecklistController = KitChecklistController;

