import { type Plan } from '../../../shared/plans';
import styles from './PlanCard.module.css';

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{plan.icon}</span>
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{plan.name}</span>
        <span className={styles.subtitle}>{plan.subtitle}</span>
      </div>
      <span className={styles.price}>{plan.price}₽</span>
    </button>
  );
}
