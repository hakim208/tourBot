import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";

const API_KEY = import.meta.env.VITE_API_KEY;

export default function Chat() {
    const [messages, setMessages] = useState([
        {
            role: "system",
            content:
                "Шумо ёрдамчии як сайти туристӣ ҳастед. Ба истифодабарандаҳо кӯмак расонед — ҷавобҳо кӯтоҳ ва бо emoji 😊.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    marked.setOptions({ breaks: true });

    const renderMarkdown = (content) => {
        const renderer = new marked.Renderer();
        renderer.link = (href, title, text) =>
            `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${text}</a>`;
        return DOMPurify.sanitize(marked(content, { renderer }));
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const inputLower = input.toLowerCase();

        const dateWords = ["imruz", "sana", "date", "имрӯз", "сана"];
        const questionWords = ["chandum", "chi", "kadom", "which", "чандум", "чи", "кадом"];

        const ticketWords = ["bilet", "ticket", "билет", "чипта"];
        const tourismWords = ["tojikistan", "tajikistan", "тоҷикистон", "саёҳӣ", "туризм", "сафар"];

        const hasDate = dateWords.some((w) => inputLower.includes(w));
        const hasQuestion = questionWords.some((w) => inputLower.includes(w));
        const hasTicket = ticketWords.some((w) => inputLower.includes(w));
        const hasTourism = tourismWords.some((w) => inputLower.includes(w));

        setMessages((prev) => [...prev, { role: "user", content: input }]);
        setInput("");

        if (hasDate && hasQuestion) {
            const today = new Date();
            const day = today.getDate();
            const month = today.toLocaleString("tg-TJ", { month: "long" });
            const year = today.getFullYear();

            const answer = `Имрӯз ${day} ${month} соли ${year} аст. 😊`;
            setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
            return;
        }

        if (hasTicket || hasTourism) {
            const answer = `Барои харидани билетҳо ба Тоҷикистон ё маълумоти сайёҳӣ, лутфан ба сомонаи расмии мо дар [https://tajiktravels.tj](https://tajiktravels.tj) муроҷиат кунед 😊✈️`;
            setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
            return;
        }

        setLoading(true);

        try {
            const contextText =
                [...messages, { role: "user", content: input }]
                    .filter((m) => m.content)
                    .map((m) => {
                        if (m.role === "user") return `User: ${m.content}`;
                        if (m.role === "assistant") return `tourBot: ${m.content}`;
                        if (m.role === "system") return `System: ${m.content}`;
                        return m.content;
                    })
                    .join("\n") + "\n\nЛутфан ҷавобро на танҳо бо забони тоҷикӣ ва бо emoji бинависед. 😊";

            const res = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
                {
                    contents: [{ parts: [{ text: contextText }] }],
                },
                { headers: { "Content-Type": "application/json" } }
            );

            const aiText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "Ҳеҷ ҷавоб пайдо нашуд.";
            setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);
        } catch (error) {
            const msg = error?.response?.data?.error?.message || "Хатогӣ рух дод. Лутфан дертар кӯшиш кунед.";
            setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
        return () => clearTimeout(timeout);
    }, [messages]);

    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-indigo-100 to-white p-6">
            <div className="w-full max-w-2xl flex flex-col h-[90vh] rounded-2xl shadow-xl bg-white border border-indigo-100">
                <header className="bg-indigo-600 text-white p-5 text-center rounded-t-2xl shadow-sm">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide select-none">
                        🗺️ AI Ёрдамчии Туристӣ
                    </h1>
                </header>
                <section
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent"
                    aria-live="polite"
                >
                    {messages
                        .filter((msg) => msg.role !== "system")
                        .map((msg, idx) => (
                            <article
                                key={idx}
                                className={`relative group flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div className="max-w-[75%]">
                                    <div
                                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${msg.role === "user"
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-gray-100 text-gray-800 rounded-bl-none"
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                    />
                                </div>

                                {msg.role === "user" && (
                                    <button
                                        onClick={() => handleCopy(msg.content)}
                                        className="absolute -bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-indigo-600"
                                        aria-label="Нусхабардорӣ"
                                        title="Copy"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </article>
                        ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="p-2 animate-spin text-indigo-600" aria-label="Илтимос интизор шавед">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="h-6 w-6"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </section>
                <footer className="p-4 sm:p-6 border-t border-gray-200 flex items-center gap-4 rounded-b-2xl bg-gray-50">
                    <label htmlFor="chat-input" className="sr-only">Навиштани паём</label>

                    <div className="relative w-full max-w-xl group">
                        <textarea
                            id="chat-input"
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Саволи худро нависед..."
                            disabled={loading}
                            aria-label="Саволи худро нависед"
                            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400 transition"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        aria-label="Фиристодани паём"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                        >
                            <path d="M22 2L11 13" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                    </button>
                </footer>
            </div>
        </div>
    );
}