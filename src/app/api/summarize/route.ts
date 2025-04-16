import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const runtime = "edge";

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json(
            { error: "Missing Gemini API key." },
            { status: 500 }
        );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
        return NextResponse.json(
            { error: "No file uploaded." },
            { status: 400 }
        );
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const fileBlob = new Blob([await file.arrayBuffer()], {
            type: file.type,
        });
        const uploaded = await ai.files.upload({
            file: fileBlob,
            config: { displayName: file.name },
        });

        if (!uploaded.name) {
            return NextResponse.json(
                { error: "Failed to get file name after upload." },
                { status: 500 }
            );
        }

        let getFile = await ai.files.get({ name: uploaded.name });
        while (getFile.state === "PROCESSING") {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            getFile = await ai.files.get({ name: uploaded.name });
        }
        if (getFile.state === "FAILED") {
            return NextResponse.json(
                { error: "File processing failed." },
                { status: 500 }
            );
        }

        const contents = [
            { text: "Summarize this document" },
            { fileData: { fileUri: getFile.uri } },
        ];
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro-exp-03-25",
            contents,
        });
        return NextResponse.json({ summary: response.text });
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message || "Unknown error" },
            { status: 500 }
        );
    }
}
