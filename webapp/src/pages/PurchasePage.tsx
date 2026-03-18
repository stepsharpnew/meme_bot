import { useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { Header } from '../components/Header';
import { PlanCard } from '../components/PlanCard';
import { DurationGrid } from '../components/DurationGrid';
import { SummaryBlock } from '../components/SummaryBlock';
import { useMainButton } from '../hooks/useMainButton';
import {
  PLANS,
  DURATIONS,
  calculateTotal,
  type Plan,
  type WebAppPurchasePayload,
} from '../../../shared/plans';

export function PurchasePage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[0]);
  const [selectedMonths, setSelectedMonths] = useState(1);

  const total = calculateTotal(selectedPlan.price, selectedMonths);

  const handlePurchase = useCallback(() => {
    const payload: WebAppPurchasePayload = {
      type: 'purchase',
      plan: selectedPlan.id,
      planName: selectedPlan.name,
      months: selectedMonths,
      total,
    };
    WebApp.sendData(JSON.stringify(payload));
  }, [selectedPlan, selectedMonths, total]);

  useMainButton({
    text: `КУПИТЬ ЗА ${total}₽`,
    onClick: handlePurchase,
  });

  return (
    <div style={{ flex: 1 }}>
      <Header />

      <section style={{ padding: '0 16px' }}>
        <h3 style={sectionTitle}>Тип подписки</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

      <section style={{ padding: '20px 16px 0' }}>
        <h3 style={sectionTitle}>Срок подписки</h3>
        <DurationGrid
          durations={DURATIONS}
          selectedMonths={selectedMonths}
          onSelect={setSelectedMonths}
        />
      </section>

      <section style={{ padding: '20px 16px 24px' }}>
        <SummaryBlock
          planName={selectedPlan.name}
          months={selectedMonths}
          total={total}
        />
      </section>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#7777AA',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 12,
};
