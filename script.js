
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
  const fields = [...new Set(praktikaData.map(p => p.field))];

    countries.sort().forEach(c => {
        const opt = document.createElement("option");
        opt.value = c; opt.textContent = c;
        countryFilter.appendChild(opt);
    });

  fields.sort().forEach(f => {
    const opt = document.createElement("option");
    opt.value = f; opt.textContent = f;
    fieldFilter.appendChild(opt);
  });
}

// Filter anwenden
[countryFilter, fieldFilter].forEach(select => {
  select.addEventListener('change', () => {
    const filtered = praktikaData.filter(p => {
      return (!countryFilter.value || p.country === countryFilter.value)
          && (!fieldFilter.value || p.field === fieldFilter.value);
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


// Cards rendern
function renderCards(data) {
  cardsContainer.innerHTML = "";
  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${flagFromRef(p.id)} ${p.id}</strong> - ${p.employer}, ${p.city}, ${p.country}<br>
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
            let text = `Organized by ${l.lodging},  Lodging Cost ${l.lodgingcost} ${l.currency},  Living Cost ${l.livingcost} ${l.currency}`;
            return text;
        }).join(" ");
    }


    modalBody.innerHTML = `
        <h2>${p.id}</h2>
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
        <p><strong>Description:</strong> ${p.description || ""}</p>
        <p><strong>Other Requirements:</strong> ${p.other_requirements || ""}</p>
        <p><strong>Required Knowledge & Experiences:</strong> ${p.requiredknowledgeandexperiences || ""}</p>
        <p><strong>Additional Info:</strong> ${p.additional_Info || ""}</p>
    `;
    modal.style.display = "block";
}

closeModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if(e.target == modal) modal.style.display = "none"; }
