// Helper to create a WAV header for RAW PCM data
function createWavHeader(dataLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // "RIFF" chunk descriptor
    view.setUint32(0, 0x52494646, false); // 'RIFF'
    view.setUint32(4, 36 + dataLength, true); // File size - 8
    view.setUint32(8, 0x57415645, false); // 'WAVE'

    // "fmt " sub-chunk
    view.setUint32(12, 0x666D7420, false); // 'fmt '
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
    view.setUint16(34, bitsPerSample, true); // BitsPerSample

    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // 'data'
    view.setUint32(40, dataLength, true); // Subchunk2Size

    return Buffer.from(header);
}

export async function generateTTS(text: string): Promise<string | null> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("TTS Skipped: Missing API Key");
            return null;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text }] }],
            generationConfig: { responseModalities: ["AUDIO"] }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gemini TTS API Error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();

        // Find the audio inlineData
        if (data.candidates && data.candidates[0]?.content?.parts) {
            const part = data.candidates[0].content.parts.find((p: any) => p.inlineData);
            if (part && part.inlineData && part.inlineData.data) {
                // Determine sample rate from mimeType if possible, otherwise assume 24000
                // MimeType is usually "audio/L16;codec=pcm;rate=24000"
                const rawAudioBuffer = Buffer.from(part.inlineData.data, 'base64');

                // Construct WAV Header
                const wavHeader = createWavHeader(rawAudioBuffer.length, 24000); // Using 24kHz as specified by API

                // Combine Header and RAW PCM
                const completeWavBuffer = Buffer.concat([wavHeader, rawAudioBuffer]);
                const base64Wav = completeWavBuffer.toString('base64');

                return `data:audio/wav;base64,${base64Wav}`;
            }
        }

        console.warn("TTS Generated no audio part in response.");
        return null;

    } catch (error) {
        console.error("Failed to generate TTS:", error);
        return null; // Gracefully fail if TTS breaks so UI still loads
    }
}
