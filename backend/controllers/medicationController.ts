interface Medication {
  name: string;
  dosage: string;
  duration: string;
  precautions?: string[];
  sideEffects?: string[];
}

export async function getMedications(
  symptoms: string[]
): Promise<Medication[]> {
  // This will be handled by Gemini API instead
  throw new Error("Use Gemini API for medication recommendations");
}
