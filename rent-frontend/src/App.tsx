import { useMemo, useState } from "react";

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

const API_URL = "http://127.0.0.1:8001/predict";

function numberOrNaN(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
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

  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onPredict() {
    setError(null);
    setResult(null);

    if (!payload) {
      setError("Vul alle velden correct in.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as PredictResponse;
      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  function input(label: string, key: keyof typeof form, unit?: string) {
    return (
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 600 }}>
          {label} {unit ? <span style={{ opacity: 0.7 }}>({unit})</span> : null}
        </span>
        <input
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 16,
          }}
          inputMode="decimal"
        />
      </label>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 6 }}>Huurprijs voorspeller (Amsterdam)</h1>
      <p style={{ marginTop: 0, opacity: 0.75 }}>
        Vul kenmerken in en krijg een voorspelling (±€50 band).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
        {input("Woonoppervlakte", "vierkante_meter", "m²")}
        {input("Inhoud", "inhoud_m3", "m³")}
        {input("Buitenruimte", "buitenruimte_m2", "m²")}
        {input("Badkamers", "aantal_badkamers")}
        {input("Kamers", "aantal_kamers")}
        {input("Woonlagen", "aantal_woonlagen")}
      </div>

      <button
        onClick={onPredict}
        disabled={loading}
        style={{
          marginTop: 18,
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {loading ? "Bezig..." : "Voorspel huurprijs"}
      </button>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 12, border: "1px solid #f3c2c2" }}>
          <strong>Fout:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 16, borderRadius: 16, border: "1px solid #ddd" }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            Voorspelling: €{result.predicted_eur.toFixed(0)} / maand
          </div>
          <div style={{ marginTop: 6, opacity: 0.8 }}>
            Band: €{result.interval_low_eur.toFixed(0)} – €{result.interval_high_eur.toFixed(0)}
          </div>
        </div>
      )}
    </div>
  );
}
