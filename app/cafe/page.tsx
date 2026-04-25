import { ComicService } from "@/app/services/comic.service";
import { CafeComicList } from "@/components/cafe/CafeComicList";
import styles from "./page.module.css";

export default async function CafePage() {
  const result = await ComicService.getAllComics();

  if ("error" in result) {
    return (
      <div className={styles.cafeFeed}>
        <p>Something went wrong loading comics.</p>
      </div>
    );
  }

  const comics = result.data;

  // Serialize for client component
  const serializedComics = comics.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl,
    status: c.status,
    genres: c.genres,
    _count: c._count,
  }));

  return (
    <>
      <section className={styles.cafeHero}>
        <span className={styles.cafeTag}>Community Hub</span>
        <h1 className={styles.cafeTitle}>
          The <span className={styles.cafeTitleAccent}>Cafe</span>
        </h1>
        <p className={styles.cafeSubtitle}>
          Discover comics, share chapter links, and help fellow readers find
          their next great read. Powered by the community.
        </p>
      </section>

      <CafeComicList comics={serializedComics} />
    </>
  );
}
