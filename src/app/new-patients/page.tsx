import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './new-patients.module.css';

export const metadata: Metadata = {
    title: 'New Patients | Premcare Physiotherapy',
    description: 'Everything you need to know for your first visit—what to expect, forms to download, insurance information, and pricing.',
};

export default function NewPatients() {
    return (
        <div className={styles.newPatientsPage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1 className="animate-fadeInUp">Welcome New Patients</h1>
                    <p className={styles.heroSubtitle}>
                        We're excited to bring expert physiotherapy care directly to your doorstep.
                    </p>
                </div>
            </section>

            {/* What to Expect */}
            <section className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>What to Expect on Your First Visit</h2>
                        <p>Your initial home visit typically lasts 60 minutes</p>
                    </div>

                    <div className={styles.expectGrid}>
                        <div className={`card ${styles.expectCard}`}>
                            <div className={styles.stepBadge}>Step 1</div>
                            <h3>Comprehensive Assessment</h3>
                            <p>
                                We'll discuss your medical history, current symptoms, and goals. Our physiotherapist will perform a
                                thorough physical examination to understand your condition.
                            </p>
                            <ul>
                                <li>Review of medical history</li>
                                <li>Discussion of symptoms and goals</li>
                                <li>Physical examination</li>
                                <li>Posture and movement analysis</li>
                            </ul>
                        </div>

                        <div className={`card ${styles.expectCard}`}>
                            <div className={styles.stepBadge}>Step 2</div>
                            <h3>Diagnosis & Treatment Plan</h3>
                            <p>
                                Based on our findings, we'll explain your diagnosis, discuss treatment options, and create a
                                personalized recovery plan tailored to your needs.
                            </p>
                            <ul>
                                <li>Clear explanation of findings</li>
                                <li>Customized treatment plan</li>
                                <li>Expected timeline for recovery</li>
                                <li>Home exercise recommendations</li>
                            </ul>
                        </div>

                        <div className={`card ${styles.expectCard}`}>
                            <div className={styles.stepBadge}>Step 3</div>
                            <h3>Initial Treatment</h3>
                            <p>
                                If appropriate, we'll begin treatment during your first visit. This may include manual therapy,
                                exercises, or other therapeutic interventions.
                            </p>
                            <ul>
                                <li>Hands-on therapy</li>
                                <li>Therapeutic exercises</li>
                                <li>Pain relief strategies</li>
                                <li>Education and advice</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* What to Bring */}
            <section className={`section ${styles.bringSection}`}>
                <div className="container">
                    <div className={styles.bringGrid}>
                        <div className={styles.bringContent}>
                            <h2>How to Prepare for Your Home Visit</h2>
                            <div className={styles.bringList}>
                                <div className={styles.bringItem}>
                                    <div className={styles.bringIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>Have Insurance Ready</h4>
                                        <p>Please have your current insurance information and photo ID available</p>
                                    </div>
                                </div>

                                <div className={styles.bringItem}>
                                    <div className={styles.bringIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4" />
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>Complete Forms Online</h4>
                                        <p>Save time by filling out intake forms before we arrive</p>
                                    </div>
                                </div>

                                <div className={styles.bringItem}>
                                    <div className={styles.bringIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>Gather Medical Records</h4>
                                        <p>Any relevant imaging reports, physician notes, or test results needed for review</p>
                                    </div>
                                </div>

                                <div className={styles.bringItem}>
                                    <div className={styles.bringIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4>Comfortable Clothing</h4>
                                        <p>Wear or bring athletic clothing for movement assessment</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formsDownload}>
                            <h3>Download Patient Forms</h3>
                            <p>Complete these forms to ensure your home session flows smoothly</p>
                            <div className={styles.formsList}>
                                <a href="#" className={styles.formLink}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span>Patient Intake Form (PDF)</span>
                                </a>
                                <a href="#" className={styles.formLink}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span>Medical History Form (PDF)</span>
                                </a>
                                <a href="#" className={styles.formLink}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span>Consent Form (PDF)</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Insurance & Pricing */}
            <section className={`section ${styles.insuranceSection}`}>
                <div className="container">
                    <div className="section-title">
                        <h2>Insurance & Pricing</h2>
                        <p>We make quality care accessible and affordable</p>
                    </div>

                    <div className={styles.insuranceGrid}>
                        <div className={`card ${styles.insuranceCard}`}>
                            <h3>Insurance Accepted</h3>
                            <p>We accept most major insurance plans, including:</p>
                            <ul>
                                <li>Blue Cross Blue Shield</li>
                                <li>Aetna</li>
                                <li>Cigna</li>
                                <li>UnitedHealthcare</li>
                                <li>Medicare</li>
                                <li>And many more</li>
                            </ul>
                            <p className={styles.note}>
                                <strong>Note:</strong> Please call us to verify your specific plan coverage.
                            </p>
                        </div>

                        <div className={`card ${styles.insuranceCard}`}>
                            <h3>Self-Pay Options</h3>
                            <p>Transparent pricing for those without insurance:</p>
                            <div className={styles.pricing}>
                                <div className={styles.priceItem}>
                                    <span className={styles.priceLabel}>Initial Assessment</span>
                                    <span className={styles.priceAmount}>$150</span>
                                </div>
                                <div className={styles.priceItem}>
                                    <span className={styles.priceLabel}>Follow-up Session (45 min)</span>
                                    <span className={styles.priceAmount}>$120</span>
                                </div>
                                <div className={styles.priceItem}>
                                    <span className={styles.priceLabel}>Extended Session (60 min)</span>
                                    <span className={styles.priceAmount}>$150</span>
                                </div>
                            </div>
                            <p className={styles.note}>
                                <strong>Package deals available—</strong>ask about our multi-session discounts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Frequently Asked Questions</h2>
                    </div>

                    <div className={styles.faqGrid}>
                        <div className={styles.faqItem}>
                            <h4>Do I need a referral?</h4>
                            <p>
                                In most cases, you don't need a physician referral to see a physiotherapist. However, some insurance
                                plans may require one. We recommend checking with your insurance provider.
                            </p>
                        </div>

                        <div className={styles.faqItem}>
                            <h4>How long is each session?</h4>
                            <p>
                                Initial assessments are 60 minutes. Follow-up sessions are typically 45 minutes, though we offer
                                extended 60-minute sessions when needed for comprehensive treatment.
                            </p>
                        </div>

                        <div className={styles.faqItem}>
                            <h4>How many sessions will I need?</h4>
                            <p>
                                This varies depending on your condition and goals. Some patients see improvement in 4-6 sessions,
                                while others may need ongoing care. We'll discuss this during your initial assessment.
                            </p>
                        </div>

                        <div className={styles.faqItem}>
                            <h4>What should I wear?</h4>
                            <p>
                                Wear comfortable, loose-fitting clothing that allows easy movement. Athletic wear is ideal. For certain
                                conditions, you may need to expose the affected area for assessment and treatment.
                            </p>
                        </div>

                        <div className={styles.faqItem}>
                            <h4>Can I book online?</h4>
                            <p>
                                Yes! You can book appointments directly through our contact page, call us at +234 802 333 1387, or email
                                info@premcare.com.
                            </p>
                        </div>

                        <div className={styles.faqItem}>
                            <h4>What is your cancellation policy?</h4>
                            <p>
                                We require 24 hours' notice for cancellations. Late cancellations or no-shows may be subject to a fee.
                                We understand emergencies happen—please call us to discuss your situation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaContent}>
                        <h2>Ready to Get Started?</h2>
                        <p>Book your first appointment and begin your journey to recovery</p>
                        <Link href="/contact#book" className="btn btn-accent">
                            Book Your First Appointment
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
