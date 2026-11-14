import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { useWorkspace } from "../app/context";
import { api } from "../services/api";
import { Heading, Badge } from "../components/ui";
export default function Mentor() {
  const { view: w, run, busy } = useWorkspace();
  const [message, setMessage] = useState("");
  if (!w) return null;
  return (
    <>
      <Heading
        eyebrow="GUIDANCE GROUNDED IN YOUR PROGRESS"
        title="Think it through with your mentor."
      >
        <Badge tone={w.aiConfigured ? "green" : "amber"}>
          {w.aiConfigured ? "Live AI configured" : "Live AI unavailable"}
        </Badge>
      </Heading>
      <div className="notice">
        AI data use: your message, target role, assessed score summary, and
        current task are sent to Google Gemini. Profile name and email are
        excluded. Advice is not a grade or certification. Avoid sharing personal
        information or secrets.
      </div>
      <section className="card mentor">
        <div className="mentor-welcome">
          <span className="icon-tile">
            <Sparkles size={24} />
          </span>
          <h2>A little clarity for your next step.</h2>
          <p>
            {w.aiConfigured
              ? "Ask about a concept, your current task, or what your evidence means."
              : "Live AI is unavailable until credentials and a model are configured. Curated references remain available in My Plan."}
          </p>
          <div className="suggestions">
            {[
              "Explain my weakest assessed skill.",
              "Help me understand API authentication.",
              "Give me a small practice challenge.",
              "Why is this task recommended?",
            ].map((p) => (
              <button
                key={p}
                className="button secondary"
                onClick={() => setMessage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {w.messages.map((m) => (
          <div key={m.id} className="conversation">
            <p className="user-message">{m.question}</p>
            <Badge tone="indigo">{m.source}</Badge>
            <p className="mentor-answer">{m.answer}</p>
          </div>
        ))}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const response = await run(
              () => api("/mentor/messages", "POST", { message }),
              "Mentor response saved.",
            );
            if (response) setMessage("");
          }}
        >
          <label htmlFor="message">Your question</label>
          <div className="chat-input">
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              required
              rows={3}
              placeholder="What would you like to understand?"
            />
            <button
              className="button primary"
              disabled={busy || !w.aiConfigured || !message.trim()}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
          <small>
            {w.demo
              ? `${Math.max(0, 3 - w.aiUsed)} live AI attempts remaining in this demo`
              : "AI calls are subject to account and global quotas."}
          </small>
        </form>
      </section>
    </>
  );
}
