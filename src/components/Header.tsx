'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/services' },
        { name: 'Conditions', href: '/conditions' },
        /*  { name: 'New Patients', href: '/new-patients' }, */
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className="container">
                <nav className={styles.nav}>
                    <Link href="/" className={styles.logo}>
                        <img src="/logo.png" alt="Premcare Logo" className={styles.logoIcon} />
                        <div className={styles.logoText}>
                            <div className={styles.logoMain}>
                                <span className={styles.logoPrimary}>Prem</span>
                                <span className={styles.logoSecondary}>care</span>
                            </div>
                            <div className={styles.logoSecondary}>Physiotherapy</div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className={styles.navLinks}>
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href} className={styles.navLink}>
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className={styles.navActions}>
                        <a href="tel:+2348023331387" className={styles.phone}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span className={styles.phoneNumber}>Call Now</span>
                        </a>
                        <Link href="/contact#book" className="btn btn-primary">
                            Book Now
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={styles.mobileMenuBtn}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}></span>
                    </button>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <ul className={styles.mobileNavLinks}>
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={styles.mobileNavLink}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.mobileActions}>
                            <a href="tel:+2348023331387" className={styles.mobilePhone}>
                                Call: +234 802 333 1387
                            </a>
                            <Link href="/contact#book" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
                                Book Appointment
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
