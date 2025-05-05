import axios from "axios";

export async function determineSpeciality(symptoms: string[]): Promise<string> {
  try {
    const response = await axios.post("/api/gemini/doctor-recommendation", {
      symptoms,
    });
    return response.data.responseText || "general-physician";
  } catch (error) {
    console.error("Error getting specialist recommendation:", error);
    return "general-physician";
  }
}

export function generatePractoURL(speciality: string): string {
  // Directly use bangalore as the default city
  const city = "bangalore";

  // Map of specialities to Practo URLs
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

  const mappedSpeciality =
    specialityMap[speciality.toLowerCase()] || "general-physician";
  return `https://www.practo.com/${city}/${mappedSpeciality}`;
}
