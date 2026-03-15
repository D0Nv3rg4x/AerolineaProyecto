import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.badges}>
        <div className={`${styles.skeleton} ${styles.badge}`} />
        <div className={`${styles.skeleton} ${styles.badge}`} />
      </div>
      
      <div className={styles.main}>
        <div className={styles.routeBlock}>
          <div className={`${styles.skeleton} ${styles.time}`} />
          <div className={`${styles.skeleton} ${styles.code}`} />
          <div className={`${styles.skeleton} ${styles.city}`} />
        </div>

        <div className={styles.routeLine}>
          <div className={`${styles.skeleton} ${styles.line}`} />
        </div>

        <div className={styles.routeBlock}>
          <div className={`${styles.skeleton} ${styles.time}`} />
          <div className={`${styles.skeleton} ${styles.code}`} />
          <div className={`${styles.skeleton} ${styles.city}`} />
        </div>
      </div>

      <div className={styles.info}>
        <div className={`${styles.skeleton} ${styles.airline}`} />
        <div className={`${styles.skeleton} ${styles.plane}`} />
      </div>

      <div className={styles.side}>
        <div className={`${styles.skeleton} ${styles.priceLabel}`} />
        <div className={`${styles.skeleton} ${styles.price}`} />
        <div className={`${styles.skeleton} ${styles.button}`} />
      </div>
    </div>
  )
}
