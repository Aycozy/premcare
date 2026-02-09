'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import styles from './contact.module.css';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        service: '',
        preferredDate: '',
        preferredTime: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    service: '',
                    preferredDate: '',
                    preferredTime: '',
                    message: ''
                });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus('idle'), 5000);
        }
    };

    return (
        <div className={styles.contactPage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1 className="animate-fadeInUp">Contact Us</h1>
                    <p className={styles.heroSubtitle}>
                        We're here to answer your questions and help you book your appointment
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className={`section ${styles.contactCardsSection}`}>
                <div className="container">
                    <div className={styles.contactCards}>
                        <div className={`card ${styles.contactCard}`}>
                            <div className={styles.contactIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <h3>Phone</h3>
                            <p>Call us during business hours</p>
                            <a href="tel:+2348023331387" className={styles.contactLink}>
                                +234 802 333 1387
                            </a>
                        </div>

                        <div className={`card ${styles.contactCard}`}>
                            <div className={styles.contactIcon} style={{ background: '#25D366' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                            </div>
                            <h3>WhatsApp</h3>
                            <p>Chat with us instantly</p>
                            <a href="https://wa.me/2348023331387" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                Start Chat →
                            </a>
                        </div>

                        <div className={`card ${styles.contactCard}`}>
                            <div className={styles.contactIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <h3>Email</h3>
                            <p>Send us a message anytime</p>
                            <a href="mailto:info@premcare.com" className={styles.contactLink}>
                                info@premcare.com
                            </a>
                        </div>

                        <div className={`card ${styles.contactCard}`}>
                            <div className={styles.contactIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <h3>Hours</h3>
                            <p className={styles.hours}>
                                Mon - Fri: 8:00 AM - 7:00 PM<br />
                                Saturday: 9:00 AM - 3:00 PM<br />
                                Sunday: Closed
                            </p>
                        </div>


                    </div>
                </div>
            </section>

            {/* Booking Form & Map */}
            <section className={`section ${styles.bookingSection}`} id="book">
                <div className="container">
                    <div className={styles.bookingGrid}>
                        {/* Booking Form */}
                        <div className={styles.formWrapper}>
                            <h2>Book an Appointment</h2>
                            <p className={styles.formDescription}>
                                Fill out the form below and we'll contact you to confirm your appointment
                            </p>

                            <form onSubmit={handleSubmit} className={styles.bookingForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="email">Email *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone">Phone *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="+234 802 333 1387"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="address">Address / Location for Home Visit *</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., 123 Lekki Phase 1, Lagos"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="service">Service Needed</label>
                                    <select
                                        id="service"
                                        name="service"
                                        value={formData.service}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a service...</option>
                                        <option value="manual-therapy">Manual Therapy</option>
                                        <option value="sports-rehab">Sports Rehabilitation</option>
                                        <option value="post-op">Post-Operative Rehabilitation</option>
                                        <option value="dry-needling">Dry Needling</option>
                                        <option value="geriatric">Geriatric Physiotherapy</option>
                                        <option value="pain-management">Pain Management</option>
                                        <option value="other">Other / Not Sure</option>
                                    </select>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="preferredDate">Preferred Date</label>
                                        <input
                                            type="date"
                                            id="preferredDate"
                                            name="preferredDate"
                                            value={formData.preferredDate}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="preferredTime">Preferred Time</label>
                                        <select
                                            id="preferredTime"
                                            name="preferredTime"
                                            value={formData.preferredTime}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select time...</option>
                                            <option value="morning">Morning (8 AM - 12 PM)</option>
                                            <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                                            <option value="evening">Evening (5 PM - 7 PM)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="message">Message (Optional)</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Tell us about your condition or any specific concerns..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                    style={{ width: '100%' }}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Book Appointment'}
                                </button>

                                {submitStatus === 'success' && (
                                    <div className={styles.successMessage}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        <span>Thank you! We'll contact you soon to confirm your appointment.</span>
                                    </div>
                                )}

                                {submitStatus === 'error' && (
                                    <div className={styles.errorMessage}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                        <span>Something went wrong. Please check your connection or call us at +234 802 333 1387.</span>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Map */}
                        <div className={styles.mapWrapper}>
                            <div className={styles.mapPlaceholder}>
                                <img src="/modern-facility.png" alt="Premcare Clinic External View" className={styles.mapImage} />
                                <div className={styles.mapOverlay}>
                                    <a
                                        href="https://www.google.com/maps"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Open in Google Maps
                                    </a>
                                </div>
                            </div>
                            {/*
                            <div className={styles.directionsInfo}>
                                <h4>Getting Here</h4>
                                <ul>
                                    <li>
                                        <strong>Parking:</strong> Free parking available in our lot
                                    </li>
                                    <li>
                                        <strong>Public Transit:</strong> Accessible via subway lines A, C, E
                                    </li>
                                    <li>
                                        <strong>Accessibility:</strong> Wheelchair accessible entrance and facilities
                                    </li>
                                </ul>
                            </div>
                            */}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
