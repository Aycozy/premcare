import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './conditions.module.css';

export const metadata: Metadata = {
    title: 'Conditions We Treat | Premcare Physiotherapy',
    description: 'Expert treatment for back pain, neck pain, knee injuries, shoulder pain, sports injuries, arthritis, and more.',
    keywords: 'back pain treatment, neck pain, knee injury, shoulder pain, sports injury, arthritis, physiotherapy',
};

export default function Conditions() {
    const conditions = [
        {
            name: 'Back Pain',
            description: 'Comprehensive treatment for lower back pain, upper back pain, sciatica, and spinal conditions.',
            symptoms: ['Persistent aching', 'Sharp shooting pain', 'Limited mobility', 'Muscle stiffness'],
            treatments: ['Manual therapy', 'Core strengthening', 'Postural correction', 'Pain management'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M8 6h8M6 12h12M8 18h8" />
                </svg>
            ),
            image: '/back-pain.png'
        },
        {
            name: 'Neck Pain',
            description: 'Relief for cervical strain, whiplash, stiffness, and chronic neck conditions.',
            symptoms: ['Neck stiffness', 'Headaches', 'Reduced range of motion', 'Shoulder pain'],
            treatments: ['Cervical mobilization', 'Soft tissue therapy', 'Postural training', 'Strengthening exercises'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M12 12v8M8 16l4 4 4-4" />
                </svg>
            ),
            image: '/neck-pain.png'
        },
        {
            name: 'Knee Injuries',
            description: 'Treatment for ACL/MCL tears, meniscus injuries, patellofemoral pain, and post-surgical rehabilitation.',
            symptoms: ['Knee pain', 'Swelling', 'Instability', 'Difficulty walking'],
            treatments: ['Strengthening protocols', 'Balance training', 'Manual therapy', 'Return-to-activity programs'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
                </svg>
            ),
            image: '/knee-injury.png'
        },
        {
            name: 'Shoulder Pain',
            description: 'Expert care for rotator cuff injuries, frozen shoulder, impingement, and shoulder instability.',
            symptoms: ['Shoulder pain', 'Limited range', 'Weakness', 'Night pain'],
            treatments: ['Joint mobilization', 'Rotator cuff strengthening', 'Scapular stabilization', 'Stretching protocols'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8M12 8v8" />
                </svg>
            ),
            image: '/shoulder-pain.png'
        },
        {
            name: 'Sports Injuries',
            description: 'Specialized treatment for sprains, strains, tendonitis, and athletic performance injuries.',
            symptoms: ['Acute pain', 'Reduced performance', 'Swelling', 'Limited function'],
            treatments: ['Sport-specific rehab', 'Progressive loading', 'Biomechanical analysis', 'Return-to-sport protocols'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            ),
            image: '/sports-injury.png'
        },
        {
            name: 'Arthritis',
            description: 'Management strategies for osteoarthritis, rheumatoid arthritis, and degenerative joint conditions.',
            symptoms: ['Joint pain', 'Morning stiffness', 'Reduced mobility', 'Swelling'],
            treatments: ['Joint protection', 'Strengthening exercises', 'Pain management', 'Mobility training'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
            ),
            image: '/arthritis.png'
        },
        {
            name: 'Hip Pain',
            description: 'Treatment for hip bursitis, labral tears, hip arthritis, and post-surgical rehabilitation.',
            symptoms: ['Hip pain', 'Groin discomfort', 'Limited mobility', 'Difficulty walking'],
            treatments: ['Hip mobilization', 'Strengthening programs', 'Gait training', 'Manual therapy'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                </svg>
            ),
            image: '/manual-therapy.png'
        },
        {
            name: 'Ankle & Foot Pain',
            description: 'Care for sprains, plantar fasciitis, Achilles tendonitis, and post-fracture rehabilitation.',
            symptoms: ['Ankle pain', 'Heel pain', 'Swelling', 'Difficulty bearing weight'],
            treatments: ['Joint mobilization', 'Strengthening exercises', 'Balance training', 'Taping techniques'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
            image: '/sports-rehab.png'
        },
        {
            name: 'Headaches & Migraines',
            description: 'Treatment for tension headaches, cervicogenic headaches, and migraine-related neck pain.',
            symptoms: ['Frequent headaches', 'Neck tension', 'Eye strain', 'Facial pain'],
            treatments: ['Cervical treatment', 'Postural correction', 'Soft tissue therapy', 'Ergonomic advice'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                </svg>
            ),
            image: '/neck-pain.png'
        },
        {
            name: 'Post-Surgical Recovery',
            description: 'Comprehensive rehabilitation following orthopedic surgeries and procedures.',
            symptoms: ['Post-op pain', 'Limited mobility', 'Weakness', 'Scar tissue'],
            treatments: ['Progressive mobilization', 'Strengthening protocols', 'Scar management', 'Functional training'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            ),
            image: '/post-op-rehab.png'
        },
        {
            name: 'Chronic Pain',
            description: 'Holistic approach to managing persistent pain conditions and improving quality of life.',
            symptoms: ['Ongoing pain', 'Fatigue', 'Sleep issues', 'Reduced activity'],
            treatments: ['Pain education', 'Graduated exercise', 'Manual therapy', 'Self-management strategies'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            ),
            image: '/personalized-plan.png'
        },
        {
            name: 'Work-Related Injuries',
            description: 'Treatment for repetitive strain injuries, ergonomic issues, and workplace accidents.',
            symptoms: ['Repetitive pain', 'Muscle strain', 'Joint discomfort', 'Reduced function'],
            treatments: ['Ergonomic assessment', 'Strengthening programs', 'Activity modification', 'Preventive strategies'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            ),
            image: '/back-pain.png'
        }
    ];

    return (
        <div className={styles.conditionsPage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1 className="animate-fadeInUp">Conditions We Treat</h1>
                    <p className={styles.heroSubtitle}>
                        Expert physiotherapy treatment for a wide range of musculoskeletal conditions
                    </p>
                </div>
            </section>

            {/* Conditions Grid */}
            <section className="section">
                <div className="container">
                    <div className={styles.conditionsGrid}>
                        {conditions.map((condition, index) => (
                            <div key={index} className={`card ${styles.conditionCard}`}>
                                <div className={styles.cardHeaderImage}>
                                    <img src={condition.image} alt={condition.name} className={styles.conditionImg} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3>{condition.name}</h3>
                                    <p className={styles.conditionDescription}>{condition.description}</p>

                                    <div className={styles.conditionDetails}>
                                        <div className={styles.detailBlock}>
                                            <h5>Common Symptoms:</h5>
                                            <ul>
                                                {condition.symptoms.map((symptom, i) => (
                                                    <li key={i}>{symptom}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className={styles.detailBlock}>
                                            <h5>Our Treatment Approach:</h5>
                                            <ul>
                                                {condition.treatments.map((treatment, i) => (
                                                    <li key={i}>{treatment}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <Link href="/contact#book" className={styles.bookBtn}>
                                        Book Consultation
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* When to Seek Treatment */}
            <section className={`section ${styles.whenSection}`}>
                <div className="container">
                    <div className="section-title">
                        <h2>When Should You Seek Treatment?</h2>
                        <p>Don't wait for pain to become chronic—early intervention leads to better outcomes</p>
                    </div>

                    <div className={styles.signsGrid}>
                        <div className={styles.signCard}>
                            <div className={styles.signImageWrapper}>
                                <img src="/back-pain.png" alt="Persistent Pain" className={styles.signImage} />
                            </div>
                            <div className={styles.signContent}>
                                <h4>Persistent Pain</h4>
                                <p>Pain lasting more than a few days or recurring frequently</p>
                            </div>
                        </div>

                        <div className={styles.signCard}>
                            <div className={styles.signImageWrapper}>
                                <img src="/knee-injury.png" alt="Limited Function" className={styles.signImage} />
                            </div>
                            <div className={styles.signContent}>
                                <h4>Limited Function</h4>
                                <p>Difficulty performing daily activities or work tasks</p>
                            </div>
                        </div>

                        <div className={styles.signCard}>
                            <div className={styles.signImageWrapper}>
                                <img src="/neck-pain.png" alt="Medication Reliance" className={styles.signImage} />
                            </div>
                            <div className={styles.signContent}>
                                <h4>Medication Reliance</h4>
                                <p>Needing regular pain medication to function normally</p>
                            </div>
                        </div>

                        <div className={styles.signCard}>
                            <div className={styles.signImageWrapper}>
                                <img src="/sports-injury.png" alt="Recent Injury" className={styles.signImage} />
                            </div>
                            <div className={styles.signContent}>
                                <h4>Recent Injury</h4>
                                <p>New injury from sports, work, or accident</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaContent}>
                        <h2>Get Expert Help Today</h2>
                        <p>Don't let pain hold you back. Our team is ready to help you recover.</p>
                        <div className={styles.ctaActions}>
                            <Link href="/contact#book" className="btn btn-accent">
                                Book Appointment
                            </Link>
                            <a href="tel:+2348023331387" className="btn btn-secondary">
                                Call +234 802 333 1387
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
