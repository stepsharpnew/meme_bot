import WebApp from "@twa-dev/sdk";
import QRCode from "qrcode";
import { useCallback, useState } from "react";
import {
  DURATIONS,
  PLANS,
  calculateTotal,
  type Plan,
} from "../../../shared/plans";
import { DurationGrid } from "../components/DurationGrid";
import { Header } from "../components/Header";
import { PlanCard } from "../components/PlanCard";
import { QrModal } from "../components/QrModal";
import { SummaryBlock } from "../components/SummaryBlock";
import { useMainButton } from "../hooks/useMainButton";
import { useTelegramUser } from "../hooks/useTelegramUser";

export function PurchasePage() {
  const user = useTelegramUser();
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[0]);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [configText, setConfigText] = useState("");

  const total = calculateTotal(selectedPlan.price, selectedMonths);

  const handlePurchase = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      WebApp.MainButton.showProgress(false);

      const clientName =
        user.username !== "username" ? user.username : `tg_${user.id}`;

      const res = await fetch("/api/vpn-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          duration: `${selectedMonths}m`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.status}`);
      }

      const json = await res.json();
      const config: string = json.config;

      setConfigText(config);

      const dataUrl = await QRCode.toDataURL(config, {
        width: 260,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Неизвестная ошибка";
      WebApp.showAlert(`Ошибка: ${message}`);
    } finally {
      WebApp.MainButton.hideProgress();
      setLoading(false);
    }
  }, [loading, selectedMonths, user]);

  useMainButton({
    text: loading ? "ЗАГРУЗКА..." : `КУПИТЬ ЗА ${total}₽`,
    onClick: handlePurchase,
  });

  return (
    <div style={{ flex: 1 }}>
      <Header />

      <section style={{ padding: "0 16px" }}>
        <h3 style={sectionTitle}>Тип подписки</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan.id === plan.id}
              onSelect={() => setSelectedPlan(plan)}
            />
          ))}
        </div>
      </section>

      <section style={{ padding: "20px 16px 0" }}>
        <h3 style={sectionTitle}>Срок подписки</h3>
        <DurationGrid
          durations={DURATIONS}
          selectedMonths={selectedMonths}
          onSelect={setSelectedMonths}
        />
      </section>

      <section style={{ padding: "20px 16px 24px" }}>
        <SummaryBlock
          planName={selectedPlan.name}
          months={selectedMonths}
          total={total}
        />
      </section>

      {qrDataUrl && (
        <QrModal
          qrDataUrl={qrDataUrl}
          configText={configText}
          onClose={() => setQrDataUrl(null)}
        />
      )}
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#7777AA",
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 12,
};
