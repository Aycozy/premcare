
import Link from 'next/link';
import { Metadata } from 'next';
import { blogPosts } from '@/data/blogPosts';
import styles from './blog.module.css';

export const metadata: Metadata = {
    title: 'Premcare Physiotherapy Blog | Expert Insights & Location Guides',
    description: 'Read the latest articles on physiotherapy, rehabilitation tips, and our service coverage in Lagos areas like Ikorodu, Lekki, and Ikeja.',
};

export default function BlogIndex() {
    // Show the first (featured/overview) post as a highlight
    const featuredPost = blogPosts[0];
    // All other posts (locations + telerehab)
    const otherPosts = blogPosts.slice(1);

    return (
        <div className={styles.blogPage}>
            <section className={styles.hero}>
                <div className="container">
                    <h1 className="animate-fadeInUp">Premcare Health Blog</h1>
                    <p className={styles.heroSubtitle}>
                        Expert advice, local guides, and rehabilitation tips for your recovery journey.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    {/* Featured Card */}
                    <div className={styles.featuredSection}>
                        <div className={styles.featuredCard}>
                            <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredImageLink}>
                                <div className={styles.featuredImageWrapper}>
                                    <img src={featuredPost.image} alt={featuredPost.title} className={styles.blogImage} />
                                </div>
                            </Link>
                            <div className={styles.featuredContent}>
                                <span className={styles.featuredBadge}>Featured</span>
                                <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredTitleLink}>
                                    <h2>{featuredPost.title}</h2>
                                </Link>
                                <p>{featuredPost.excerpt}</p>

                                <div className={styles.locationsDivider}></div>

                                <h3 className={styles.locationsHeading}>Locations We Serve</h3>
                                <p className={styles.locationsSubtitle}>
                                    We bring expert physiotherapy directly to your home across Lagos. Explore our dedicated guides for each area.
                                </p>

                                <div className={styles.locationTags}>
                                    {otherPosts
                                        .filter((p) => p.slug !== 'premcare-telerehab-system')
                                        .map((post) => (
                                            <Link href={`/blog/${post.slug}`} key={post.id} className={styles.locationPill}>
                                                {post.location}
                                            </Link>
                                        ))}
                                </div>

                                <div className={styles.viewAllSection}>
                                    <Link href="/blog/articles" className="btn btn-primary">
                                        View All Locations
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Telerehab as a separate blog post card */}
                    {otherPosts
                        .filter((p) => p.slug === 'premcare-telerehab-system')
                        .map((post) => (
                            <div key={post.id} className={styles.featuredSection}>
                                <Link href={`/blog/${post.slug}`} className={styles.blogCard}>
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
                            </div>
                        ))}
                </div>
            </section>
        </div>
    );
}
