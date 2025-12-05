
let praktikaData = [];

const cardsContainer = document.getElementById("cardsContainer");
const countryFilter = document.getElementById("countryFilter");
const fieldFilter = document.getElementById("fieldFilter");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

// JSON laden
fetch('praktika.json')
  .then(res => res.json())
  .then(data => {
    praktikaData = data;
    populateFilters();
    renderCards(praktikaData);
  });

// Filter Dropdowns füllen
function populateFilters() {

  const countries = [...new Set(praktikaData.map(p => p.country))];
  
  // Extrahiere Hauptfelder (vor dem ersten Komma)
  const mainFields = [...new Set(praktikaData.map(p => {
    const field = p.field || "";
    return field.split(",")[0].trim();
  }))].filter(f => f);

    countries.sort().forEach(c => {
        const opt = document.createElement("option");
        opt.value = c; opt.textContent = c;
        countryFilter.appendChild(opt);
    });

  mainFields.sort().forEach(f => {
    const opt = document.createElement("option");
    opt.value = f; opt.textContent = f;
    fieldFilter.appendChild(opt);
  });
}

// Filter anwenden
[countryFilter, fieldFilter].forEach(select => {
  select.addEventListener('change', () => {
    const filtered = praktikaData.filter(p => {
      const matchesCountry = !countryFilter.value || p.country === countryFilter.value;
      // Filter: alle Felder die mit dem gewählten Hauptfeld beginnen
      const matchesField = !fieldFilter.value || (p.field && p.field.startsWith(fieldFilter.value));
      return matchesCountry && matchesField;
    });
    renderCards(filtered);
  });
});

// emojis aus ref no generieren
function flagFromRef(refno) {
  if (!refno) return "";
  const iso = refno.split("-")[0];
  return `<img src="https://flagcdn.com/24x18/${iso.toLowerCase()}.png"> `;
}

// Format description text for better readability
function formatDescription(text) {
  if (!text) return "";
  
  // Split by newlines and clean up
  let lines = text.split(/\\n/).map(line => line.trim()).filter(line => line);
  
  // Convert to HTML with proper formatting
  let formatted = lines.map(line => {
    // Check if line starts with dash, bullet, or number (list item)
    if (/^[-•*]\s/.test(line)) {
      return `<li>${line.replace(/^[-•*]\s/, '')}</li>`;
    } else if (/^\d+[\.)]\s/.test(line)) {
      return `<li>${line.replace(/^\d+[\.)]\s/, '')}</li>`;
    } else if (line.endsWith(':')) {
      // Section headers
      return `</ul><strong>${line}</strong><ul>`;
    } else {
      // Regular paragraph
      return `</ul><p>${line}</p><ul>`;
    }
  }).join('');
  
  // Wrap in proper structure and clean up empty lists
  formatted = '<ul>' + formatted + '</ul>';
  formatted = formatted.replace(/<ul>\s*<\/ul>/g, '');
  formatted = formatted.replace(/<\/ul>\s*<ul>/g, '');
  
  return formatted;
}

// Cards rendern
function renderCards(data) {
  cardsContainer.innerHTML = "";
  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${flagFromRef(p.id)} ${p.id}</strong> - ${p.employer}, ${p.city}, ${p.country} <br>
      <em>${p.field}</em><br>
      Start: ${p.from} | End: ${p.to} | Deadline: ${p.deadline}
    `;
    card.addEventListener('click', () => showModal(p));
    cardsContainer.appendChild(card);
  });
}

// Modal anzeigen
function showModal(p) {
    // Format languages with level and and/or connectors
    let languagesText = "";
    if (p.languages && p.languages.length > 0) {
        languagesText = p.languages.map((l, index) => {
            let text = l.language;
            if (l.level) text += ` (${l.level})`;
            if (l.andor && index < p.languages.length - 1) text += ` ${l.andor}`;
            return text;
        }).join(" ");
    }

    if (p.payment && p.payment.length > 0) {
        paymentText = p.payment.map((l) => {
            let text = l.payment + " " + l.currency + " " + l.period + ", Deduction: " + l.deduction;
            return text;
        }).join(" ");
    }

    if (p.lodging && p.lodging.length > 0) {
        lodgingText = p.lodging.map((l) => {
            let actual_living_cost = Number(l.livingcost) - Number(l.lodgingcost);
            let text = `Organized by ${l.lodging},  Lodging Cost ${l.lodgingcost} ${l.currency},  Living Cost ${actual_living_cost} ${l.currency}, Total Cost ${l.livingcost} ${l.currency}`;
            return text;
        }).join(" ");
    }


    modalBody.innerHTML = `
        <h2>${flagFromRef(p.id)} ${p.id}</h2>
        <p><strong>Ref. No.:</strong> ${p.id || ""}</p>
        <p><strong>Offer Type:</strong> ${p["offer-type"] || ""}</p>
        <p><strong>Workplace:</strong> ${p.workplace || ""}</p>
        <p><strong>Business:</strong> ${p.business || ""}</p>
        <p><strong>Employees:</strong> ${p.employees || ""}</p>
        <p><strong>Hours Weekly:</strong> ${p.hoursweekly || ""}</p>
        <p><strong>Hours Daily:</strong> ${p.hoursdaily || ""}</p>
        <p><strong>Website:</strong> ${p.website ? `<a href="${p.website}" target="_blank">${p.website}</a>` : ""}</p>
        <p><strong>Location:</strong> ${p.city || ""}, ${p.country || ""}</p>
        <p><strong>Duration:</strong> ${p.from || ""} to ${p.to || ""}</p>
        <p><strong>Weeks:</strong> ${p.weeksmin || ""} - ${p.weeksmax || ""}</p>
        <p><strong>Deadline:</strong> ${p.deadline || ""}</p>
        <p><strong>Field of Study:</strong> ${p.field || ""}</p>
        <p><strong>Field Details:</strong> ${(p.field2 || "")}, ${(p.field1 || "")}</p>
        <p><strong>General Disciplines:</strong> ${p.generalisciplinesText || ""}</p>
        <p><strong>Completed Years of Study:</strong> ${p.completedyearsofstudy || ""}</p>
        <p><strong>Languages:</strong> ${languagesText}</p>
        <p><strong>Payment:</strong> ${paymentText || ""}</p>
        <p><strong>Lodging:</strong> ${lodgingText || ""}</p>
        <div><strong>Description:</strong> ${formatDescription(p.description)}</div>
        <div><strong>Other Requirements:</strong> ${formatDescription(p.other_requirements)}</div>
        <div><strong>Required Knowledge & Experiences:</strong> ${formatDescription(p.requiredknowledgeandexperiences)}</div>
        <div><strong>Additional Info:</strong> ${formatDescription(p.additional_Info)}</div>
    `;
    modal.style.display = "block";
}

closeModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if(e.target == modal) modal.style.display = "none"; }
