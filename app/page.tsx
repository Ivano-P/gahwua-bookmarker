import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookMarked, BarChart3, Zap } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
    return (
        <>
            {/* Hero Section */}
            <section className={styles.hero}>
                <span className={styles.heroTag}>Comic Bookmark Manager</span>
                <h1 className={styles.heroTitle}>
                    Your Comic Journey,{" "}
                    <span className={styles.heroTitleAccent}>Organized</span>
                </h1>
                <p className={styles.heroSubtitle}>
                    Track, bookmark, and manage your favorite comics and manga
                    in one beautiful place. Never lose your reading progress
                    again.
                </p>
                <div className={styles.heroCta}>
                    <Button asChild size="lg">
                        <Link href="/sign-up">Get Started — It&apos;s Free</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="#features">Learn More</Link>
                    </Button>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <h2 className={styles.featuresHeading}>
                    Everything you need to stay on track
                </h2>
                <p className={styles.featuresSubheading}>
                    Simple, powerful tools for comic and manga readers.
                </p>

                <div className={styles.featuresGrid}>
                    <article className={styles.featureCard}>
                        <div
                            className={`${styles.featureIcon} ${styles.featureIconBookmark}`}
                        >
                            <BookMarked size={22} />
                        </div>
                        <h3 className={styles.featureTitle}>
                            Smart Bookmarking
                        </h3>
                        <p className={styles.featureDescription}>
                            Save your progress across multiple series with a
                            single click. Pick up right where you left off.
                        </p>
                    </article>

                    <article className={styles.featureCard}>
                        <div
                            className={`${styles.featureIcon} ${styles.featureIconTrack}`}
                        >
                            <BarChart3 size={22} />
                        </div>
                        <h3 className={styles.featureTitle}>Track Everything</h3>
                        <p className={styles.featureDescription}>
                            Keep tabs on ongoing series, completed reads, and
                            your to-read list — all in one dashboard.
                        </p>
                    </article>

                    <article className={styles.featureCard}>
                        <div
                            className={`${styles.featureIcon} ${styles.featureIconFast}`}
                        >
                            <Zap size={22} />
                        </div>
                        <h3 className={styles.featureTitle}>
                            Beautiful &amp; Fast
                        </h3>
                        <p className={styles.featureDescription}>
                            A modern, responsive interface that works on any
                            device. No clutter, no lag — just your comics.
                        </p>
                    </article>
                </div>
            </section>
        </>
    );
}
