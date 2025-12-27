const API_URL = 'http://localhost:8000';

export const optimizeCutsRequest = async (pieces, machineConfig) => {
  try {
    const response = await fetch(`${API_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Konwertujemy elementy na liczby w momencie wysyłki
        pieces: pieces.map(p => ({
            id: p.id,
            length: Number(p.length) || 0, // Zabezpieczenie: jeśli puste to 0
            width: Number(p.width) || 0,
            quantity: Number(p.quantity) || 0
        })),
        // Konwertujemy konfigurację maszyny na liczby
        config: {
            sawWidth: Number(machineConfig.sawWidth) || 0,
            plateLength: Number(machineConfig.plateLength) || 0,
            plateWidth: Number(machineConfig.plateWidth) || 0,
            algorithm: machineConfig.algorithm,
            allowRotation: machineConfig.allowRotation
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Optimization request failed:", error);
    throw error;
  }
};