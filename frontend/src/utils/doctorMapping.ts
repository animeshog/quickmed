import axios from "axios";

const specialityMap: { [key: string]: string } = {
  "general-physician": "general-physician",
  dermatologist: "dermatologist",
  orthopedist: "orthopedist",
  cardiologist: "cardiologist",
  "ent-specialist": "ear-nose-throat-ent-specialist",
  neurologist: "neurologist",
  psychiatrist: "psychiatrist",
  pediatrician: "pediatrician",
  gynecologist: "gynecologist",
  dentist: "dentist",
  ophthalmologist: "ophthalmologist",
  pulmonologist: "pulmonologist",
  gastroenterologist: "gastroenterologist",
};

const specialitySynonyms: { [key: string]: string[] } = {
  "general-physician": ["general physician", "general practitioner", "gp"],
  dermatologist: ["skin doctor", "skin specialist"],
  orthopedist: ["orthopedic", "bone specialist", "orthopaedist"],
  cardiologist: ["heart specialist", "cardiac specialist"],
  "ent-specialist": ["ent specialist", "ear nose throat", "ear-nose-throat"],
  neurologist: ["brain specialist", "nerve specialist"],
  psychiatrist: ["mental health", "mental health specialist"],
  pediatrician: ["child specialist", "children's doctor", "kids doctor"],
  gynecologist: ["women's health", "ob-gyn", "ob gyn"],
  dentist: ["dental", "tooth specialist"],
  ophthalmologist: ["eye specialist", "eye doctor"],
  pulmonologist: ["lung specialist", "breathing specialist"],
  gastroenterologist: ["stomach specialist", "digestive specialist"],
};

const normalizeSpecialityText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function determineSpeciality(symptoms: string[]): Promise<string> {
  try {
    const response = await axios.post("/api/gemini/doctor-recommendation", {
      symptoms,
    });

    const rawText = normalizeSpecialityText(
      String(response.data.responseText || "")
    );

    for (const key of Object.keys(specialityMap)) {
      if (rawText.includes(key)) {
        return key;
      }
      const synonyms = specialitySynonyms[key] || [];
      if (synonyms.some((synonym) => rawText.includes(synonym))) {
        return key;
      }
    }

    if (rawText.includes("ent specialist") || rawText.includes("ear nose throat")) {
      return "ent-specialist";
    }
    if (rawText.includes("general physician") || rawText.includes("general practitioner") || rawText.includes("gp")) {
      return "general-physician";
    }

    return "general-physician";
  } catch (error) {
    console.error("Error getting specialist recommendation:", error);
    return "general-physician";
  }
}

export function generatePractoURL(speciality: string): string {
  const city = "bangalore";
  const normalizedSpeciality = normalizeSpecialityText(speciality).replace(/\s+/g, "-");
  const mappedSpeciality =
    specialityMap[normalizedSpeciality] ||
    specialityMap[
      Object.keys(specialitySynonyms).find((key) =>
        specialitySynonyms[key].some((synonym) =>
          normalizedSpeciality.includes(synonym)
        )
      ) || "general-physician"
    ];

  return `https://www.practo.com/${city}/${mappedSpeciality}`;
}
