import pandas as pd
import json

# Google Sheets CSV
df = pd.read_csv("praktika.csv", sep=',', encoding='utf-8', quotechar='"')

# Spaltennamen bereinigen (Whitespaces entfernen)
df.columns = df.columns.str.strip()


# === 3️⃣ JSON-Daten aufbereiten ===
data = []



for _, row in df.iterrows():
    languages = []

    payment = []

    lodging = []
    if pd.notna(row.get("Language1")):
        languages.append({
            "language": row["Language1"],
            "level": row["Language1Level"] if pd.notna(row.get("Language1Level")) else "",
            "andor": row["Language1Or"] if pd.notna(row.get("Language1Or")) else ""
        })

    if pd.notna(row.get("Language2")):
        languages.append({
            "language": row["Language2"],
            "level": row["Language2Level"] if pd.notna(row.get("Language2Level")) else "",
            "andor": row["Language2Or"] if pd.notna(row.get("Language2Or")) else ""
        })

    if pd.notna(row.get("Language3")):
        languages.append({
            "language": row["Language3"],
            "level": row["Language3Level"] if pd.notna(row.get("Language3Level")) else "",
        })


    if pd.notna(row.get("Payment")):
        payment.append({
            "payment": row["Payment"],
            "currency": row["Currency"] if pd.notna(row.get("Currency")) else "",
            "period": row["PaymentFrequency"] if pd.notna(row.get("PaymentFrequency")) else "",
            "deduction": row["Deduction"] if pd.notna(row.get("Deduction")) else ""
    })


    if pd.notna(row.get("Lodging")):
            lodging.append({
                "lodging": row["Lodging"]  if pd.notna(row.get("Lodging")) else "",
                "lodgingcost": row["LodgingCost"] if pd.notna(row.get("LodgingCost")) else "",
                "livingcost": row["LivingCost"] if pd.notna(row.get("LivingCost")) else "",
                "currency": row["Currency"] if pd.notna(row.get("Currency")) else "",
        })


    entry = {
        "id": row["Ref.No"] if pd.notna(row.get("Ref.No")) else "",
        "offer-type": row["OfferType"] if pd.notna(row.get("OfferType")) else "",
        "employer": row["Employer"] if pd.notna(row.get("Employer")) else "",
        "workplace": row["Workplace"] if pd.notna(row.get("Workplace")) else "",
        "business": row["Business"] if pd.notna(row.get("Business")) else "",
        "employees": row["Employees"] if pd.notna(row.get("Employees")) else "",
        "hoursweekly": row["HoursWeekly"] if pd.notna(row.get("HoursWeekly")) else "",
        "hoursdaily": row["HoursDaily"] if pd.notna(row.get("HoursDaily")) else "",
        "website": row["Website"] if pd.notna(row.get("Website")) else "",
        "country": row["Country"] if pd.notna(row.get("Country")) else "",
        "city": row["City"] if pd.notna(row.get("City")) else "",
        "from": row["From"] if pd.notna(row.get("From")) else "",
        "to": row["To"] if pd.notna(row.get("To")) else "",
        "weeksmin": row["WeeksMin"] if pd.notna(row.get("WeeksMin")) else "",
        "weeksmax": row["WeeksMax"] if pd.notna(row.get("WeeksMax")) else "",
        "deadline": row["Deadline"] if pd.notna(row.get("Deadline")) else "",
        "field1": row["FieldsOfStudy"] if pd.notna(row.get("FieldsOfStudy")) else "",
        "field2": row["Faculty 1"] if pd.notna(row.get("Faculty 1")) else "",
        "field": row["GeneralDisciplinesText"] if pd.notna(row.get("GeneralDisciplinesText")) else "",
        "completedyearsofstudy": row["CompletedYearsOfStudy"] if pd.notna(row.get("CompletedYearsOfStudy")) else "",
        "languages": languages,
        "payment": payment,
        "lodging": lodging,
        "description": row["Workkind"] if pd.notna(row.get("Workkind")) else "",
        "other_requirements": row["OtherRequirements"] if pd.notna(row.get("OtherRequirements")) else "",
        "additional_Info": row["Additional_Info"] if pd.notna(row.get("Additional_Info")) else "",
        "requiredknowledgeandexperiences": row["RequiredKnowledgeAndExperiences"] if pd.notna(row.get("RequiredKnowledgeAndExperiences")) else "",
    }
    data.append(entry)

# === 4️⃣ JSON speichern ===
with open("praktika.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("praktika.json erfolgreich erstellt! Anzahl Einträge:", len(data))
