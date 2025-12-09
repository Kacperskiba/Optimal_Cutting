const API_URL = 'http://localhost:8000'; // Adres Twojego FastAPI

export const optimizeCutsRequest = async (pieces, machineConfig) => {
  try {
    const response = await fetch(`${API_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pieces: pieces.map(p => ({
            id: p.id,
            length: Number(p.length),
            width: Number(p.width),
            quantity: Number(p.quantity)
        })),
        config: machineConfig
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