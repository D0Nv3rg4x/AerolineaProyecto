import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.left}>
        <div className={`${styles.shimmer} ${styles.titleLine}`}></div>
        <div className={`${styles.shimmer} ${styles.subLine}`}></div>
      </div>
      <div className={styles.center}>
        <div className={`${styles.shimmer} ${styles.lineTrack}`}></div>
        <div className={`${styles.shimmer} ${styles.duration}`}></div>
      </div>
      <div className={styles.right}>
        <div className={`${styles.shimmer} ${styles.priceBox}`}></div>
        <div className={`${styles.shimmer} ${styles.btnPlaceholder}`}></div>
      </div>
    </div>
  )
}
