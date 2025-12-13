import pandas as pd
import sys

DEBUG = True
SEED = 2026   # dokumentierter Zufalls-Seed

def log(msg):
    if DEBUG:
        print(msg)

# ===============================
# 1. DATEN LADEN & NORMALISIEREN
# ===============================

df = pd.read_excel("input.xlsx", sheet_name="Bewerber")
praktika_df = pd.read_excel("input.xlsx", sheet_name="Praktika")

# Strings säubern
df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)
praktika_df = praktika_df.applymap(lambda x: x.strip() if isinstance(x, str) else x)

df["Status"] = df["Status"].str.title()

praktika = set(praktika_df["PraktikumID"])

log(f"Bewerber geladen: {len(df)}")
log(f"Praktika geladen: {len(praktika)}")

# ===============================
# 2. EDGE-CASE VALIDIERUNG
# ===============================

# 2.1 Doppelte Bewerber
dupes = df["BewerberID"].duplicated()
if dupes.any():
    raise ValueError(
        "FEHLER: Doppelte BewerberID gefunden:\n" +
        "\n".join(df.loc[dupes, "BewerberID"])
    )

# 2.2 Ungültige Statuswerte
valid_status = {"Member", "Student"}
invalid_status = set(df["Status"]) - valid_status
if invalid_status:
    raise ValueError(f"FEHLER: Ungültiger Status gefunden: {invalid_status}")

# 2.3 Ungültige Wünsche sammeln (nicht abbrechen)
invalid_wishes = set()

# ===============================
# 3. VERGABE
# ===============================

matches = {}
used_praktika = set()

for status in ["Member", "Student"]:
    group = df[df["Status"] == status].copy()

    # Zufällige, reproduzierbare Reihenfolge
    group = group.sample(frac=1, random_state=SEED)

    log(f"\n=== Vergabe für {status} ({len(group)} Bewerber) ===")

    for prio in range(1, 6):
        log(f"-- Prio {prio} --")

        for _, row in group.iterrows():
            bid = row["BewerberID"]

            if bid in matches:
                continue

            wunsch = row.get(f"Prio{prio}")

            if pd.isna(wunsch):
                continue

            if wunsch not in praktika:
                invalid_wishes.add(wunsch)
                log(f"{bid}: Ungültiger Wunsch {wunsch}")
                continue

            if wunsch in used_praktika:
                continue

            # VERGABE
            matches[bid] = {
                "BewerberID": bid,
                "LC": row["LC"],
                "Status": row["Status"],
                "PraktikumID": wunsch,
                "Prio": prio
            }
            used_praktika.add(wunsch)

            log(f"✔ {bid} → {wunsch} (Prio {prio})")

log("\n=== VERGABE ABGESCHLOSSEN ===")
log(f"Vergeben: {len(matches)}")
log(f"Unvergeben: {len(praktika - used_praktika)}")

# ===============================
# 4. OUTPUT-DATEN
# ===============================

out = pd.DataFrame(matches.values())

unassigned_df = pd.DataFrame({
    "PraktikumID": sorted(praktika - used_praktika)
})

invalid_wishes_df = pd.DataFrame({
    "Ungültiger_Wunsch": sorted(invalid_wishes)
})

# ===============================
# 5. LC-STATISTIKEN
# ===============================

# Bewerber ohne Match
no_match_ids = set(df["BewerberID"]) - set(out["BewerberID"])
no_match_df = df[df["BewerberID"].isin(no_match_ids)]

lc_stats = df.groupby("LC").size().reset_index(name="Bewerber_gesamt")

vergeben_stats = out.groupby("LC").size().reset_index(name="Vergeben")

leer_stats = no_match_df.groupby("LC").size().reset_index(name="Ohne_Praktikum")

prio_stats = out.groupby("LC")["Prio"].mean().reset_index(name="Ø_Prio")

lc_stats = (
    lc_stats
    .merge(vergeben_stats, on="LC", how="left")
    .merge(leer_stats, on="LC", how="left")
    .merge(prio_stats, on="LC", how="left")
)

lc_stats = lc_stats.fillna(0)
lc_stats["Vergabequote"] = lc_stats["Vergeben"] / lc_stats["Bewerber_gesamt"]

# ===============================
# 6. EXCEL OUTPUT
# ===============================

with pd.ExcelWriter("output.xlsx", engine="openpyxl") as writer:
    out.to_excel(writer, sheet_name="Vergabe", index=False)
    unassigned_df.to_excel(writer, sheet_name="Unvergebene_Praktika", index=False)
    lc_stats.to_excel(writer, sheet_name="LC_Statistik", index=False)

    if not invalid_wishes_df.empty:
        invalid_wishes_df.to_excel(
            writer,
            sheet_name="Ungültige_Wünsche",
            index=False
        )
log("\nOutput in 'output.xlsx' geschrieben.")