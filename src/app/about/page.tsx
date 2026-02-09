import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './about.module.css';

export const metadata: Metadata = {
    title: 'About Premcare | Mobile Physiotherapy in Lagos',
    description: 'Discover Premcare\'s commitment to convenient, home-based rehabilitation. Our expert physiotherapists serve Lekki, Ikoyi, VI, Ikeja, and surrounding areas.',
};

export default function About() {
    const team = [
        {
            name: 'Dr. Sarah Mitchell',
            role: 'Lead Physiotherapist & Founder',
            qualifications: 'PT, DPT, OCS',
            bio: 'With over 15 years of experience in sports rehabilitation and orthopedic physiotherapy, Dr. Mitchell founded Premcare to provide exceptional, patient-centered care.',
            specialties: ['Sports Injuries', 'Post-Op Rehabilitation', 'Manual Therapy'],
            image: '/our-story.png'
        },
        {
            name: 'Dr. Michael Chen',
            role: 'Senior Physiotherapist',
            qualifications: 'PT, DPT, CSCS',
            bio: 'Specializing in sports performance and injury prevention, Dr. Chen works with athletes of all levels to optimize their recovery and performance.',
            specialties: ['Sports Rehab', 'Strength Training', 'Injury Prevention'],
            image: '/sports-rehab.png'
        },
        {
            name: 'Dr. Emily Rodriguez',
            role: 'Physiotherapist',
            qualifications: 'PT, DPT, GCS',
            bio: 'Expert in geriatric physiotherapy and chronic pain management, Dr. Rodriguez is passionate about helping seniors maintain independence and mobility.',
            specialties: ['Geriatric Care', 'Pain Management', 'Fall Prevention'],
            image: '/post-op-rehab.png'
        },
        {
            name: 'Dr. James Wilson',
            role: 'Physiotherapist',
            qualifications: 'PT, DPT, CIMT',
            bio: 'Certified in dry needling and manual therapy techniques, Dr. Wilson provides innovative treatment approaches for complex musculoskeletal conditions.',
            specialties: ['Dry Needling', 'Manual Therapy', 'Chronic Pain'],
            image: '/manual-therapy.png'
        }
    ];

    return (
        <div className={styles.aboutPage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1 className="animate-fadeInUp">About Premcare</h1>
                    <p className={styles.heroSubtitle}>
                        Dedicated to excellence in physiotherapy care since 2010
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="section">
                <div className="container">
                    <div className={styles.storyGrid}>
                        <div className={styles.storyContent}>
                            <h2>Our Vision</h2>
                            <p>
                                Premcare Physiotherapy was founded with a singular vision: to bring world-class rehabilitation directly
                                into your home. We understood that for many, traveling to a clinic adds stress and discomfort to an
                                already challenging recovery journey.
                            </p>
                            <p>
                                That's why we established a mobile-first approach, serving the vibrant communities of Lagos. From
                                Lekki to Ikoyi, Surulere to Maryland, and extending to Ikeja, Ikorodu, Victoria Island, and Ajah, our
                                expert team travels to you.
                            </p>
                            <p>
                                We transform your living space into a professional healing environment, ensuring your path to recovery
                                is as convenient, comfortable, and effective as possible. Our mission is to provide accessible,
                                high-quality physiotherapy that fits seamlessly into your life.
                            </p>
                        </div>
                        <div className={styles.storyImage}>
                            <div className={styles.imageWrapper}>
                                <div className={styles.imageWrapper}>
                                    <img src="/mobile-physio-arrival.png" alt="Premcare physiotherapist arriving for home visit" className={styles.storyImg} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Areas - SEO Section */}
            <section className={`section ${styles.locationsSection}`}>
                <div className="container">
                    <div className={styles.locationsContent}>
                        <div className="section-title">
                            <h2>Serving the Heart of Lagos</h2>
                            <p>Bringing expert physiotherapy to your doorstep across the metropolis</p>
                        </div>

                        <div className={styles.locationsGrid}>
                            <div className={`card ${styles.locationBlock}`}>
                                <h3>Island Coverage</h3>
                                <p>
                                    <strong>Lekki & Ikoyi:</strong> For residents in Lekki Phase 1, Chevron, and the prestigious
                                    neighborhoods of Ikoyi, our mobile team eliminates the need for stressful commutes, offering
                                    discreet and professional home sessions tailored to your comfort.
                                </p>
                                <p>
                                    <strong>Victoria Island & Ajah:</strong> From the corporate hubs of Victoria Island to the
                                    expanding residential communities of Ajah, we provide flexible scheduling that fits seamlessly
                                    into your busy lifestyle, ensuring consistency in your recovery journey.
                                </p>
                            </div>

                            <div className={`card ${styles.locationBlock}`}>
                                <h3>Mainland Reach</h3>
                                <p>
                                    <strong>Ikeja & Maryland:</strong> We bring world-class rehabilitation to the capital's center.
                                    Whether you're in Ikeja GRA or Maryland, our physiotherapists arrive equipped with everything
                                    needed for effective treatment.
                                </p>
                                <p>
                                    <strong>Surulere & Ikorodu:</strong> Our commitment extends to the vibrant communities of
                                    Surulere and Ikorodu. We believe quality healthcare should be accessible, helping patients
                                    manage chronic pain and post-op recovery without leaving their homes.
                                </p>
                            </div>
                        </div>

                        <div className={styles.locationTagline}>
                            <p>
                                By covering these key locations, Premcare ensures that whether you are battling Lagos traffic or
                                simply prefer the privacy of your home, expert physiotherapy is always within reach.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Online Consultation Catalog - Unique Aspect */}
            <section className={`section ${styles.onlineConsultSection}`}>
                <div className="container">
                    <div className={styles.onlineGrid}>
                        <div className={styles.onlineImageWrapper}>
                            <div className={styles.imageWrapper}>
                                <img src="/online-physio-consult.png" alt="Online Physiotherapy Consultation" className={styles.onlineImg} />
                            </div>
                        </div>
                        <div className={styles.onlineContent}>
                            <span className={styles.sectionBadge}>New & Unique</span>
                            <h2>Online Consultation</h2>
                            <p className={styles.onlineIntro}>
                                Can't meet in person? Experience our premium physiotherapy care from anywhere in the world.
                                Our digital platform connects you directly with expert physiotherapists for a seamless recovery journey.
                            </p>

                            <div className={styles.catalogGrid}>
                                <div className={styles.catalogItem}>
                                    <div className={styles.catalogIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 7l-7 5 7 5V7z" />
                                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>Virtual Assessment</h4>
                                        <p>Comprehensive video evaluations to diagnose your condition and create a treatment plan.</p>
                                    </div>
                                </div>

                                <div className={styles.catalogItem}>
                                    <div className={styles.catalogIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                            <line x1="12" y1="18" x2="12.01" y2="18" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>Premcare App Access</h4>
                                        <p>Get personalized video exercise programs delivered straight to your phone with progress tracking.</p>
                                    </div>
                                </div>

                                <div className={styles.catalogItem}>
                                    <div className={styles.catalogIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>24/7 Chat Support</h4>
                                        <p>Direct messaging with your physiotherapist for questions, guidance, and motivation.</p>
                                    </div>
                                </div>
                            </div>

                            <Link href="/contact#book" className="btn btn-primary">
                                Book Online Session
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Philosophy */}
            <section className={`section ${styles.philosophySection}`}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Philosophy</h2>
                        <p>The principles that guide everything we do</p>
                    </div>

                    <div className={styles.philosophyGrid}>
                        <div className={`card ${styles.philosophyImageCard}`}>
                            <img src="/personalized-plan.png" alt="Patient-Centered Care" className={styles.cardImage} />
                            <div className={styles.cardOverlay}>
                                <div className={styles.cardContent}>
                                    <h3>Patient-Centered Care</h3>
                                    <p>
                                        Every treatment plan is customized to your unique needs, goals, and lifestyle. You're not just a patient –
                                        you're a partner in your recovery journey.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`card ${styles.philosophyImageCard}`}>
                            <img src="/manual-therapy.png" alt="Evidence-Based Practice" className={styles.cardImage} />
                            <div className={styles.cardOverlay}>
                                <div className={styles.cardContent}>
                                    <h3>Evidence-Based Practice</h3>
                                    <p>
                                        Our treatments are grounded in the latest scientific research and clinical best practices, ensuring you
                                        receive the most effective care available.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`card ${styles.philosophyImageCard}`}>
                            <img src="/expert-team.png" alt="Continuous Education" className={styles.cardImage} />
                            <div className={styles.cardOverlay}>
                                <div className={styles.cardContent}>
                                    <h3>Continuous Education</h3>
                                    <p>
                                        Our team regularly participates in advanced training and certification programs to bring you the most
                                        innovative treatment techniques.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`card ${styles.philosophyImageCard}`}>
                            <img src="/post-op-rehab.png" alt="Compassionate Approach" className={styles.cardImage} />
                            <div className={styles.cardOverlay}>
                                <div className={styles.cardContent}>
                                    <h3>Compassionate Approach</h3>
                                    <p>
                                        We understand that injury and pain affect more than just your body. We provide empathetic support
                                        throughout your entire recovery process.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet Our Team */}

            {/*
            <section className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Meet Our Expert Team</h2>
                        <p>Licensed professionals dedicated to your recovery</p>
                    </div>

                    <div className={styles.teamGrid}>
                        {team.map((member, index) => (
                            <div key={index} className={`card ${styles.teamCard}`}>
                                <div className={styles.teamImage}>
                                    <img src={member.image} alt={member.name} className={styles.teamImg} />
                                </div>
                                <div className={styles.teamInfo}>
                                    <h3>{member.name}</h3>
                                    <p className={styles.teamRole}>{member.role}</p>
                                    <p className={styles.teamQualifications}>{member.qualifications}</p>
                                    <p className={styles.teamBio}>{member.bio}</p>
                                    <div className={styles.specialties}>
                                        <strong>Specialties:</strong>
                                        <ul>
                                            {member.specialties.map((specialty, i) => (
                                                <li key={i}>{specialty}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            }

            {/* Stats Section */}
            <section className={`section ${styles.statsSection}`}>
                <div className="container">
                    <div className={styles.statsGrid}>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>15+</div>
                            <div className={styles.statLabel}>Years Experience</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>5,000+</div>
                            <div className={styles.statLabel}>Patients Treated</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>98%</div>
                            <div className={styles.statLabel}>Success Rate</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>4.9/5</div>
                            <div className={styles.statLabel}>Patient Rating</div>
                        </div>
                    </div>
                </div>
            </section>



            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaContent}>
                        <h2>Experience the Premcare Difference</h2>
                        <p>Join thousands of satisfied patients who have achieved their recovery goals with our expert team</p>
                        <Link href="/contact#book" className="btn btn-accent">
                            Book Your Appointment
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
