"use client";

import { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ReactMarkdown from "react-markdown";

export default function Home() {
    const formRef = useRef<HTMLFormElement>(null);
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSummary("");
        setError("");
        setLoading(true);
        const form = formRef.current;
        if (!form) return;
        const formData = new FormData(form);
        try {
            const res = await fetch("/api/summarize", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Unknown error");
            setSummary(data.summary);
        } catch (err: any) {
            setError(err.message || "Failed to summarize PDF");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-xl">
                <h1 className="text-4xl font-bold tracking-tight text-center mb-2">
                    PDFy
                </h1>
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 w-full bg-white/70 dark:bg-black/30 rounded-lg p-6 border border-border shadow"
                >
                    <label className="font-semibold text-base">
                        Upload a PDF to summarize
                    </label>
                    <Input
                        type="file"
                        name="file"
                        accept="application/pdf"
                        required
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Summarizing..." : "Summarize PDF"}
                    </Button>
                </form>
                {summary && (
                    <div className="w-full bg-muted/60 dark:bg-muted/20 rounded-lg p-4 border border-border mt-2">
                        <div className="font-semibold mb-2">Summary:</div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{summary}</ReactMarkdown>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="w-full bg-destructive/10 text-destructive rounded-lg p-3 border border-destructive mt-2">
                        {error}
                    </div>
                )}
            </main>
        </div>
    );
}
