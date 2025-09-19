import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import multer from "multer";
import fs from "fs/promises";
import express from "express";

const app = express();
const upload = multer();

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = "gemini-2.5-flash";

app.use(express.json());

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//generete text

// Fungsi untuk mengekstrak teks dari response Gemini API
function extractText(resp) {
  // Cek struktur response dan ambil teks
  if (resp && resp.candidates && resp.candidates.length > 0) {
    const candidate = resp.candidates[0];
    if (
      candidate &&
      candidate.content &&
      candidate.content.parts &&
      candidate.content.parts.length > 0
    ) {
      return candidate.content.parts[0].text || "";
    }
  }
  return "";
}

app.post("/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    res.json({ result: extractText(resp) });
  } catch (err) {
    console.error("Error generating text:", err);
    res.status(500).json({ error: "Error generating text" });
  }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageBase64 = req.file.buffer.toString("base64");
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {text: prompt},
        {inlineData: { mimeType: req.file.mimetype, data: imageBase64 }}
      ],
    });
    res.json({ result: extractText(resp) });
  } catch (err) {
    console.error("Error generating text:", err);
    res.status(500).json({ error: "Error generating text" });
  }
});

app.post("/generate-from-document", upload.single("document"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const documentBase64 = req.file.buffer.toString("base64");
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {text: prompt || "Ringkas dokumen berikut:"},
        {inlineData: { mimeType: req.file.mimetype, data: documentBase64 }}
      ],
    });
    res.json({ result: extractText(resp) });
  } catch (err) {
    console.error("Error generating text:", err);
    res.status(500).json({ error: "Error generating text" });
  } 
});

app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const audioBase64 = req.file.buffer.toString("base64");
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {text: prompt || "Transkrip audio berikut:"},
        {inlineData: { mimeType: req.file.mimetype, data: audioBase64 }}
      ],
    });
    res.json({ result: extractText(resp) });
  } catch (err) {
    console.error("Error generating text:", err);
    res.status(500).json({ error: "Error generating text" });
  }
});
