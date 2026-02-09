import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Premcare Physiotherapy Clinic | Expert Physiotherapy & Rehabilitation',
  description: 'Expert physiotherapy services for sports injuries, post-op rehab, back pain, and more. Book your appointment today.',
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PhysiotherapyClinic',
    name: 'Premcare Physiotherapy',
    image: 'https://premcare.com/logo.png',
    description: 'Expert mobile physiotherapy services delivered to your home in Lagos. Serving Lekki, Ikoyi, Victoria Island, Ikeja, and more.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lekki',
      addressRegion: 'Lagos',
      addressCountry: 'NG'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 6.4698,
      longitude: 3.5852
    },
    url: 'https://premcarephysiotherapyclinic.com',
    telephone: '+2348023331387',
    areaServed: [
      { '@type': 'City', name: 'Lekki' },
      { '@type': 'City', name: 'Ikoyi' },
      { '@type': 'City', name: 'Victoria Island' },
      { '@type': 'City', name: 'Ikeja' },
      { '@type': 'City', name: 'Surulere' },
      { '@type': 'City', name: 'Maryland' },
      { '@type': 'City', name: 'Ikorodu' },
      { '@type': 'City', name: 'Ajah' }
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '19:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '15:00'
      }
    ],
    priceRange: '₦₦'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Your Journey to <span className={styles.highlight}>Recovery</span> Starts Here
            </h1>
            <p className={styles.heroSubtitle}>
              Expert physiotherapy care tailored to your needs. From sports injuries, neurorehabilitation to chronic pain, we help you move better and feel stronger.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact#book" className="btn btn-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Book Appointment
              </Link>
              <Link href="/new-patients" className="btn btn-secondary">
                New Patient Info
              </Link>
            </div>

            {/* Trust Badges */}
            <div className={styles.trustBadges}>
              <div className={styles.badge}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>500+ Happy Patients</span>
              </div>
              <div className={styles.badge}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Licensed Professionals</span>
              </div>
              <div className={styles.badge}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>15+ Years Experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.mouse}>
            <div className={styles.wheel}></div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className={`section ${styles.servicesSection}`}>
        <div className="container">
          <div className="section-title">
            <h2>Our Services</h2>
            <p>Comprehensive physiotherapy treatments designed to restore your mobility and improve your quality of life right at the comfort of your home.</p>
          </div>

          <div className={styles.servicesGrid}>
            <div className={`card ${styles.imageCard}`}>
              <img src="/personalized-plan.png" alt="Pain Management" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Pain Management</h3>
                  <p>Comprehensive strategies and intervention for chronic pain relief and long-term wellness.</p>
                  <Link href="/services#pain-management" className={styles.serviceLink}>
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>

            <div className={`card ${styles.imageCard}`}>
              <img src="/sports-rehab.png" alt="Sports Rehabilitation Training" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Sports Rehabilitation</h3>
                  <p>Specialized programs for athletes to recover from injuries and enhance performance.</p>
                  <Link href="/services#sports-rehab" className={styles.serviceLink}>
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>

            <div className={`card ${styles.imageCard}`}>
              <img src="/post-op-rehab.png" alt="Post-Operative Rehabilitation" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Post-Op Rehabilitation</h3>
                  <p>Comprehensive recovery programs following surgery to restore function and strength.</p>
                  <Link href="/services#post-op" className={styles.serviceLink}>
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>

            <div className={`card ${styles.imageCard}`}>
              <img src="/manual-therapy.png" alt="Neuro Rehabilitation" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Neuro Rehabilitation</h3>
                  <p>Specialized therapy to restore movement and function after neurological conditions.</p>
                  <Link href="/services#neuro-rehab" className={styles.serviceLink}>
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>

            <div className={`card ${styles.imageCard}`}>
              <img src="/geriatric-care.png" alt="Geriatric Physiotherapy Care" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Geriatric Physiotherapy</h3>
                  <p>Specialized care for seniors to maintain independence and improve quality of life.</p>
                  <Link href="/services#geriatric" className={styles.serviceLink}>
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>

            <div className={`card ${styles.imageCard}`}>
              <img src="/pediatric-care.png" alt="Pediatric Care" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Pediatric Care</h3>
                  <p>Gentle and effective physiotherapy treatments tailored for children and adolescents.</p>
                  <Link href="/services#pediatric-care" className={styles.serviceLink}>
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/services" className="btn btn-primary">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section className={`section ${styles.conditionsSection}`}>
        <div className="container">
          <div className="section-title">
            <h2>Conditions We Treat</h2>
            <p>Expert treatment for a wide range of musculoskeletal conditions</p>
          </div>

          <div className={styles.conditionsGrid}>
            <div className={`card ${styles.conditionImageCard}`}>
              <img src="/back-pain.png" alt="Back Pain Treatment" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Back Pain</h3>
                  <p>Chronic or acute back pain relief through targeted therapy</p>
                </div>
              </div>
            </div>
            <div className={`card ${styles.conditionImageCard}`}>
              <img src="/neck-pain.png" alt="Neck Pain Treatment" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Neck Pain</h3>
                  <p>Treatment for stiffness, strain, and cervical conditions</p>
                </div>
              </div>
            </div>
            <div className={`card ${styles.conditionImageCard}`}>
              <img src="/knee-injury.png" alt="Knee Injury Rehabilitation" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Knee Injuries</h3>
                  <p>ACL tears, meniscus injuries, and knee rehabilitation</p>
                </div>
              </div>
            </div>
            <div className={`card ${styles.conditionImageCard}`}>
              <img src="/shoulder-pain.png" alt="Shoulder Pain Therapy" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Shoulder Pain</h3>
                  <p>Rotator cuff injuries and frozen shoulder treatment</p>
                </div>
              </div>
            </div>
            <div className={`card ${styles.conditionImageCard}`}>
              <img src="/sports-injury.png" alt="Sports Injury Care" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Sports Injuries</h3>
                  <p>Sprains, strains, and athletic performance recovery</p>
                </div>
              </div>
            </div>
            <div className={`card ${styles.conditionImageCard}`}>
              <img src="/manual-therapy.png" alt="Neurological Conditions" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Neurological Conditions</h3>
                  <p>Rehabilitation for stroke, Parkinson's, and movement disorders</p>
                </div>
              </div>
            </div>
            <div className={`card ${styles.conditionImageCard}`}>
              <img src="/pediatric-care.png" alt="Pediatric Conditions" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Pediatric Issues</h3>
                  <p>Developmental delays, torticollis, and congenital conditions</p>
                </div>
              </div>
            </div>
            <div className={`card ${styles.conditionImageCard}`}>
              <img src="/arthritis.png" alt="Arthritis Pain Management" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Arthritis</h3>
                  <p>Managing joint pain and improving mobility</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/conditions" className={styles.viewAllLink}>
              View All Conditions →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={`section ${styles.whyChooseSection}`}>
        <div className="container">
          <div className="section-title">
            <h2>Why Choose Premcare?</h2>
            <p>Excellence in physiotherapy through experience, expertise, and personalized care</p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={`card ${styles.featureImageCard}`}>
              <img src="/expert-team.png" alt="Expert Physiotherapy Team" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Expert Team</h3>
                  <p>Licensed physiotherapists with advanced certifications and years of specialized experience</p>
                </div>
              </div>
            </div>

            <div className={`card ${styles.featureImageCard}`}>
              <img src="/personalized-plan.png" alt="Personalized Treatment Plans" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Personalized Plans</h3>
                  <p>Custom treatment programs tailored to your specific condition and recovery goals</p>
                </div>
              </div>
            </div>

            <div className={`card ${styles.featureImageCard}`}>
              <img src="/our-story.png" alt="Patient-Centered Care" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Patient-Centered Care</h3>
                  <p>We treat every patient with empathy, respect, and undivided attention.</p>
                </div>
              </div>
            </div>

            <div className={`card ${styles.featureImageCard}`}>
              <img src="/manual-therapy.png" alt="Holistic Approach" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Holistic Approach</h3>
                  <p>Focusing on the root cause of your pain, not just the symptoms.</p>
                </div>
              </div>
            </div>

            <div className={`card ${styles.featureImageCard}`}>
              <img src="/modern-facility.png" alt="Modern Physiotherapy Facility" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Modern Facility</h3>
                  <p>State-of-the-art equipment and comfortable treatment spaces for optimal care</p>
                </div>
              </div>
            </div>

            <div className={`card ${styles.featureImageCard}`}>
              <img src="/proven-results.png" alt="Proven Patient Results" className={styles.cardImage} />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Proven Results</h3>
                  <p>Track record of successful patient outcomes and high satisfaction rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Ready to Start Your Recovery Journey?</h2>
            <p>Book your appointment today and take the first step towards a pain-free life</p>
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
    </>
  );
}
