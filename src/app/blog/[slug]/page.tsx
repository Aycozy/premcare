
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '@/data/blogPosts';
import styles from '../blog.module.css';


interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Post Not Found | Premcare Physiotherapy',
        };
    }

    return {
        title: `${post.title} | Premcare Blog`,
        description: post.excerpt,
        keywords: post.keywords,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: ['Premcare Physiotherapy'],
        },
    };
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.image,
        datePublished: post.date,
        author: {
            '@type': 'Organization',
            name: 'Premcare Physiotherapy',
        },
        description: post.excerpt,
    };

    return (
        <article className={styles.postPage}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className={styles.hero} style={{ backgroundImage: `linear-gradient(rgba(26, 49, 82, 0.9), rgba(26, 49, 82, 0.8)), url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="container">
                    <span className={styles.locationTag}>{post.location}</span>
                    <h1 className="animate-fadeInUp">{post.title}</h1>
                    <div className={styles.postMeta}>
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>By Premcare Team</span>
                    </div>
                </div>
            </div>

            <div className="container">
                <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className={styles.ctaBox}>
                    <h3>Need Physiotherapy in {post.location}?</h3>
                    <p>Our expert team is ready to visit you at home. No traffic, no stress, just professional care.</p>
                    <Link href="/contact#book" className="btn btn-primary">
                        Book Your Session Now
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '3rem' }}>
                    <Link href="/blog" className={styles.readMore} style={{ display: 'inline-flex', fontSize: '1.1rem' }}>
                        &larr; Back to All Articles
                    </Link>
                </div>
            </div>
        </article>
    );
}
