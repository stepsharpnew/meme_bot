import { monthsLabel } from '../../../shared/plans';
import styles from './SummaryBlock.module.css';

interface SummaryBlockProps {
  planName: string;
  months: number;
  total: number;
}

export function SummaryBlock({ planName, months, total }: SummaryBlockProps) {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <span className={styles.label}>Подписка:</span>
        <span className={styles.value}>
          {planName} • {monthsLabel(months)}
        </span>
      </div>
      <div className={styles.divider} />
      <div className={styles.row}>
        <span className={styles.totalLabel}>Итого:</span>
        <span className={styles.totalValue}>{total}₽</span>
      </div>
    </div>
  );
}
