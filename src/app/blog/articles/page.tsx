
import Link from 'next/link';
import { Metadata } from 'next';
import { blogPosts } from '@/data/blogPosts';
import styles from '../blog.module.css';

export const metadata: Metadata = {
    title: 'All Articles | Premcare Physiotherapy Blog',
    description: 'Browse all Premcare physiotherapy articles covering home physiotherapy services in Lekki, Ikoyi, Victoria Island, Ikeja, Surulere, Maryland, Ikorodu, and Ajah.',
};

export default function AllArticles() {
    return (
        <div className={styles.blogPage}>
            <section className={styles.hero}>
                <div className="container">
                    <h1 className="animate-fadeInUp">All Articles</h1>
                    <p className={styles.heroSubtitle}>
                        Browse our complete collection of physiotherapy guides and location-specific articles.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className={styles.blogGrid}>
                        {blogPosts.map((post) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className={styles.blogCard}>
                                <div className={styles.imageWrapper}>
                                    <img src={post.image} alt={post.title} className={styles.blogImage} />
                                </div>
                                <div className={styles.cardContent}>
                                    <span className={styles.locationTag}>{post.location}</span>
                                    <h3>{post.title}</h3>
                                    <p>{post.excerpt}</p>
                                    <span className={styles.readMore}>Read Article &rarr;</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
                        <Link href="/blog" className={styles.readMore} style={{ display: 'inline-flex', fontSize: '1.1rem' }}>
                            &larr; Back to Blog
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
