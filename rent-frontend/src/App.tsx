import { useMemo, useState } from "react";
import "./App.css";

type PredictRequest = {
  vierkante_meter: number;
  inhoud_m3: number;
  buitenruimte_m2: number;
  aantal_badkamers: number;
  aantal_kamers: number;
  aantal_woonlagen: number;
};

type PredictResponse = {
  predicted_eur: number;
  interval_low_eur: number;
  interval_high_eur: number;
  interval_type: "fixed_abs_50";
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const API_URL = "http://127.0.0.1:8001/predict";

function numberOrNaN(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function formatUserPrompt(values: PredictRequest) {
  return [
    "Nieuwe voorspelling aangevraagd:",
    `• Woonoppervlakte: ${values.vierkante_meter} m²`,
    `• Inhoud: ${values.inhoud_m3} m³`,
    `• Buitenruimte: ${values.buitenruimte_m2} m²`,
    `• Badkamers: ${values.aantal_badkamers}`,
    `• Kamers: ${values.aantal_kamers}`,
    `• Woonlagen: ${values.aantal_woonlagen}`,
  ].join("\n");
}

function formatAssistantResponse(result: PredictResponse) {
  return `Ik schat de huur op €${result.predicted_eur.toFixed(
    0
  )} per maand.\nBandbreedte: €${result.interval_low_eur.toFixed(
    0
  )} – €${result.interval_high_eur.toFixed(0)} (${result.interval_type}).`;
}

export default function App() {
  const [form, setForm] = useState({
    vierkante_meter: "75",
    inhoud_m3: "210",
    buitenruimte_m2: "8",
    aantal_badkamers: "1",
    aantal_kamers: "3",
    aantal_woonlagen: "2",
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hoi! Ik ben je huurassistent. Vul de woningdetails in en ik geef een indicatie met bandbreedte.",
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const payload: PredictRequest | null = useMemo(() => {
    const req: PredictRequest = {
      vierkante_meter: numberOrNaN(form.vierkante_meter),
      inhoud_m3: numberOrNaN(form.inhoud_m3),
      buitenruimte_m2: numberOrNaN(form.buitenruimte_m2),
      aantal_badkamers: numberOrNaN(form.aantal_badkamers),
      aantal_kamers: numberOrNaN(form.aantal_kamers),
      aantal_woonlagen: numberOrNaN(form.aantal_woonlagen),
    };
    return Object.values(req).every((x) => Number.isFinite(x)) ? req : null;
  }, [form]);

  const invalidFields = useMemo(() => {
    return Object.entries(form)
      .filter(([, value]) => !Number.isFinite(numberOrNaN(value)))
      .map(([key]) => key);
  }, [form]);

  const statusText = loading
    ? "Model denkt na…"
    : !payload
    ? "Vul alle velden in"
    : "Klaar voor een nieuwe voorspelling.";

  async function onPredict(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowErrors(true);
    setError(null);

    if (!payload) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: formatUserPrompt(payload),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as PredictResponse;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: formatAssistantResponse(data),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      setError(e?.message ?? "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  function renderInput(
    label: string,
    key: keyof typeof form,
    unit?: string
  ) {
    const hasError = showErrors && invalidFields.includes(key);

    return (
      <label className="label" htmlFor={key}>
        <span>
          {label} {unit ? <span className="unit">({unit})</span> : null}
        </span>
        <input
          id={key}
          className={`input ${hasError ? "input-error" : ""}`.trim()}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          inputMode="decimal"
        />
        {hasError ? (
          <span className="helper">Vul een geldig getal in.</span>
        ) : null}
      </label>
    );
  }

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">€</div>
          <div>
            <div>Huurprijs Studio</div>
            <div className="brand-subtext">Amsterdam · ML voorspellingsdemo</div>
          </div>
        </div>
      </div>

      <main className="layout">
        <section className="card">
          <div className="header">
            <div>
              <h1>Huurprijs voorspeller</h1>
              <p>
                Vul de woningkenmerken in en bekijk een ChatGPT-stijl advies met
                bandbreedte.
              </p>
            </div>
          </div>

          <div className="alert-info">
            Dit is een experimentele voorspeller. Resultaten zijn indicatief en
            geen formeel advies.
          </div>

          {error ? <div className="alert-error">{error}</div> : null}

          <div className="messages">
            {messages.map((message) => (
              <div key={message.id} className="message">
                <div className="meta">
                  {message.role === "user" ? "Jij" : "Assistent"}
                </div>
                <div
                  className={`bubble bubble-${
                    message.role === "user" ? "user" : "assistant"
                  }`}
                >
                  {message.content.split("\n").map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="disclaimer">
            Tip: experimenteer met de velden om te zien hoe het model reageert.
            De voorspelling gebruikt een vast interval (±€50) en houdt geen
            rekening met specifieke wijken of contractvormen.
          </div>

          <form className="composer" onSubmit={onPredict}>
            <div className="inputs-grid">
              {renderInput("Woonoppervlakte", "vierkante_meter", "m²")}
              {renderInput("Inhoud", "inhoud_m3", "m³")}
              {renderInput("Buitenruimte", "buitenruimte_m2", "m²")}
              {renderInput("Badkamers", "aantal_badkamers")}
              {renderInput("Kamers", "aantal_kamers")}
              {renderInput("Woonlagen", "aantal_woonlagen")}
            </div>

            <div className="status-line">
              <span>{statusText}</span>
              {loading ? (
                <span className="loader-dots" aria-label="Bezig">
                  <span />
                  <span />
                  <span />
                </span>
              ) : null}
            </div>

            <div className="composer-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                <span className={loading ? "btn-loading" : undefined}>
                  {loading ? (
                    <>
                      <span className="loader-dots" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </span>
                      Model denkt na…
                    </>
                  ) : (
                    "Voorspel huurprijs"
                  )}
                </span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
