import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './services.module.css';

export const metadata: Metadata = {
    title: 'Physiotherapy Services | Premcare Clinic',
    description: 'Comprehensive physiotherapy services including manual therapy, sports rehabilitation, dry needling, post-op rehab, and more.',
};

export default function Services() {
    const services = [
        {
            id: 'pain-management',
            title: 'Pain Management',
            description: 'Evidence-based approaches to chronic pain relief and long-term wellness',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            ),
            image: '/personalized-plan.png',
            details: [
                'Comprehensive pain assessment',
                'Multimodal treatment approaches',
                'Education and self-management',
                'Lifestyle modification strategies'
            ],
            benefits: [
                'Reduced pain levels',
                'Improved function',
                'Better sleep quality',
                'Enhanced wellbeing'
            ],
            idealFor: ['Chronic back pain', 'Fibromyalgia', 'Nerve pain', 'Persistent pain']
        },
        {
            id: 'sports-rehab',
            title: 'Sports Rehabilitation',
            description: 'Specialized programs to help athletes recover from injuries and enhance performance',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                </svg>
            ),
            image: '/sports-rehab.png',
            details: [
                'Sport-specific injury assessment',
                'Functional movement screening',
                'Progressive strengthening programs',
                'Return-to-sport protocols'
            ],
            benefits: [
                'Optimized athletic performance',
                'Reduced injury risk',
                'Faster return to play',
                'Improved biomechanics'
            ],
            idealFor: ['Sports injuries', 'ACL/MCL tears', 'Sprains and strains', 'Performance optimization']
        },
        {
            id: 'post-op',
            title: 'Post-Operative Rehabilitation',
            description: 'Comprehensive recovery programs following orthopedic and surgical procedures',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            ),
            image: '/post-op-rehab.png',
            details: [
                'Pre and post-surgical education',
                'Progressive mobility training',
                'Strength and conditioning',
                'Scar tissue management'
            ],
            benefits: [
                'Accelerated healing',
                'Restored function and strength',
                'Reduced complications',
                'Minimized scar tissue'
            ],
            idealFor: ['Joint replacement', 'Arthroscopic surgery', 'Fracture repair', 'Ligament reconstruction']
        },
        {
            id: 'neuro-rehab',
            title: 'Neuro Rehabilitation',
            description: 'Specialized therapy to restore movement and function after neurological conditions',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20" />
                    <circle cx="12" cy="12" r="10" />
                </svg>
            ),
            image: '/manual-therapy.png',
            details: [
                'Gait and balance training',
                'Coordination exercises',
                'Spasticity management',
                'Functional independence training'
            ],
            benefits: [
                'Improved mobility',
                'Better coordination',
                'Increased independence',
                'Muscle control'
            ],
            idealFor: ['Stroke', 'Parkinson\'s Disease', 'Multiple Sclerosis', 'Brain Injury']
        },
        {
            id: 'geriatric',
            title: 'Geriatric Physiotherapy',
            description: 'Specialized care for seniors to maintain independence and improve quality of life',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            image: '/geriatric-care.png',
            details: [
                'Balance and fall prevention',
                'Strength and endurance training',
                'Arthritis management',
                'Mobility assistance'
            ],
            benefits: [
                'Improved independence',
                'Reduced fall risk',
                'Better quality of life',
                'Enhanced mobility'
            ],
            idealFor: ['Arthritis', 'Osteoporosis', 'Balance issues', 'Age-related weakness']
        },
        {
            id: 'pediatric-care',
            title: 'Pediatric Care',
            description: 'Gentle and effective physiotherapy treatments tailored for children and adolescents',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.48-.56.91-1.23 1.26-2.02C8.9 17.79 9.15 18 9.5 18H14c.35 0 .6-.21.74-.52.35.79.78 1.46 1.26 2.02 1.26 1.5 5 2 5 2s-.5-3.74-2-5c-.71-1.02-1.84-2.58-3.05-4.48.55-1.14.92-2.5 1.05-3.02.5-.5 1-2.5 1-2.5s-2 1-2.5 1.5c-1.1-.3-2.31-.38-3.5 0C11.5 4.5 9.5 3.5 9.5 3.5s.5 2 1 2.5c.13.52.5 1.88 1.05 3.02-1.21 1.9-2.34 3.46-3.05 4.48z" />
                </svg>
            ),
            image: '/pediatric-care.png',
            details: [
                'Developmental milestone assessment',
                'Congenital condition management',
                'Gross motor skill development',
                'Play-based therapy sessions'
            ],
            benefits: [
                'Improved motor skills',
                'Enhanced social participation',
                'Confidence building',
                'Family education and support'
            ],
            idealFor: ['Cerebral Palsy', 'Developmental Delays', 'Torticollis', 'Youth Sports Injuries']
        }
    ];

    return (
        <div className={styles.servicesPage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1 className="animate-fadeInUp">Our Services</h1>
                    <p className={styles.heroSubtitle}>
                        Comprehensive physiotherapy treatments delivered directly to your home for maximum convenience and comfort
                    </p>
                </div>
            </section>

            {/* Services Detail */}
            <section className="section">
                <div className="container">
                    {services.map((service, index) => (
                        <div key={service.id} id={service.id} className={styles.serviceSection}>
                            <div className={`${styles.serviceContent} ${index % 2 === 1 ? styles.reverse : ''}`}>
                                <div className={styles.serviceInfo}>
                                    <div className={styles.serviceHeader}>
                                        <div className={styles.serviceIconLarge}>
                                            {service.icon}
                                        </div>
                                        <div>
                                            <h2>{service.title}</h2>
                                            <p className={styles.serviceDescription}>{service.description}</p>
                                        </div>
                                    </div>

                                    <div className={styles.serviceDetails}>
                                        <div className={styles.detailSection}>
                                            <h4>What's Included:</h4>
                                            <ul>
                                                {service.details.map((detail, i) => (
                                                    <li key={i}>{detail}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className={styles.detailSection}>
                                            <h4>Benefits:</h4>
                                            <ul>
                                                {service.benefits.map((benefit, i) => (
                                                    <li key={i}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className={styles.detailSection}>
                                            <h4>Ideal For:</h4>
                                            <div className={styles.tags}>
                                                {service.idealFor.map((condition, i) => (
                                                    <span key={i} className={styles.tag}>{condition}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <Link href="/contact#book" className="btn btn-primary">
                                        Book This Service
                                    </Link>
                                </div>

                                <div className={styles.serviceVisual}>
                                    <div className={styles.visualCard}>
                                        <img src={service.image} alt={service.title} className={styles.serviceImg} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Process Section */}
            <section className={`section ${styles.processSection}`}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Treatment Process</h2>
                        <p>A proven approach to your recovery</p>
                    </div>

                    <div className={styles.processSteps}>
                        <div className={styles.step}>
                            <div className={styles.stepImageWrapper}>
                                <img src="/expert-team.png" alt="Initial Assessment" className={styles.stepImage} />
                                <div className={styles.stepNumber}>1</div>
                            </div>
                            <h3>Initial Assessment</h3>
                            <p>Comprehensive evaluation of your condition, medical history, and recovery goals</p>
                        </div>
                        <div className={styles.stepArrow}>→</div>

                        <div className={styles.step}>
                            <div className={styles.stepImageWrapper}>
                                <img src="/personalized-plan.png" alt="Custom Treatment Plan" className={styles.stepImage} />
                                <div className={styles.stepNumber}>2</div>
                            </div>
                            <h3>Custom Treatment Plan</h3>
                            <p>Personalized program combining the most effective therapies for your needs</p>
                        </div>
                        <div className={styles.stepArrow}>→</div>

                        <div className={styles.step}>
                            <div className={styles.stepImageWrapper}>
                                <img src="/manual-therapy.png" alt="Active Treatment" className={styles.stepImage} />
                                <div className={styles.stepNumber}>3</div>
                            </div>
                            <h3>Active Treatment</h3>
                            <p>Hands-on therapy, exercises, and education to support your recovery</p>
                        </div>
                        <div className={styles.stepArrow}>→</div>

                        <div className={styles.step}>
                            <div className={styles.stepImageWrapper}>
                                <img src="/proven-results.png" alt="Progress & Adjust" className={styles.stepImage} />
                                <div className={styles.stepNumber}>4</div>
                            </div>
                            <h3>Progress & Adjust</h3>
                            <p>Regular assessment and plan adjustments to ensure optimal outcomes</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaContent}>
                        <h2>Ready to Begin Your Recovery?</h2>
                        <p>Schedule a consultation to discuss which treatment is right for you</p>
                        <div className={styles.ctaActions}>
                            <Link href="/contact#book" className="btn btn-accent">
                                Book Appointment
                            </Link>
                            {/*
                            <Link href="/new-patients" className="btn btn-secondary">
                                New Patient Info
                            </Link>
                            */}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
