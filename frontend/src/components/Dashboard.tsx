// ...existing imports...

const handleDownloadResults = async () => {
  const currentDate = new Date().toLocaleDateString();
  const userInfo = JSON.parse(localStorage.getItem("userData") || "{}");
  const prescription = document.createElement("div");

  prescription.innerHTML = `
    <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; margin: 0; color: #333;">QuickMed AI Doctor</h1>
        <p style="color: #666; margin: 5px 0;">Date: ${currentDate}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>Patient:</strong> ${
          userInfo.name || "[Patient Name]"
        }</p>
        <p style="margin: 5px 0;"><strong>DOB:</strong> ${
          userInfo.dob || "Not Provided"
        }</p>
        <p style="margin: 5px 0;"><strong>Gender:</strong> ${
          userInfo.gender || "Not Provided"
        }</p>
      </div>
      
      <div style="margin: 30px 0;">
        <h2 style="font-size: 18px; color: #333; margin-bottom: 15px;">Prescribed Medications</h2>
        <div style="font-family: 'Courier New', monospace; white-space: pre-wrap;">
          ${analysisResults.medication}
        </div>
      </div>
      
      <div style="margin-top: 40px; text-align: center;">
        <p style="color: #666;"><strong>Doctor's Signature:</strong></p>
        <div style="font-family: Arial; font-size: 20px; margin-top: 10px;">
          QuickMed AI
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">
          This is an AI-generated prescription for reference only.<br>
          Please consult a licensed healthcare professional before taking any medication.
        </p>
      </div>
    </div>
  `;

  const opt = {
    margin: 1,
    filename: `quickmed-prescription-${currentDate}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  try {
    await html2pdf().set(opt).from(prescription).save();
    toast({
      title: "Success",
      description: "Prescription downloaded successfully",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to download prescription",
      variant: "destructive",
    });
  }
};

// ...rest of the component code...
