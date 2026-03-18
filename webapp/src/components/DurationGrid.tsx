import { type Duration } from '../../../shared/plans';
import styles from './DurationGrid.module.css';

interface DurationGridProps {
  durations: Duration[];
  selectedMonths: number;
  onSelect: (months: number) => void;
}

export function DurationGrid({ durations, selectedMonths, onSelect }: DurationGridProps) {
  return (
    <div className={styles.grid}>
      {durations.map((d) => (
        <button
          key={d.months}
          className={`${styles.item} ${selectedMonths === d.months ? styles.selected : ''}`}
          onClick={() => onSelect(d.months)}
        >
          <span className={styles.label}>{d.label}</span>
          {d.discount > 0 && (
            <span className={styles.badge}>
              -{Math.round(d.discount * 100)}%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
