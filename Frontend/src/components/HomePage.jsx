import React, { useState, useEffect } from 'react';
import './HomePage.css';
import Auth from './Auth';
import AIChatbot from './AIChatbot';

// 🎨 Custom SVG Logo: Represents "Observation (Problem) -> Verification (Solution)"
const BrandLogo = ({ className = "logo-icon", checkColor = "#2563eb" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="45" cy="45" r="35" stroke="currentColor" strokeWidth="8" />
    <line x1="70" y1="70" x2="90" y2="90" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    <path d="M30 45L40 55L65 35" stroke={checkColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HomePage = ({ user, onLoginSuccess, onLogout, onNavigateToDashboard }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const observerOptions = { threshold: 0.3 };
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = ['hero', 'mission', 'process', 'features', 'consequences', 'impact', 'contact'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      window.scrollTo({
        top: elementRect - bodyRect - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="homepage civic-serious">
      {/* 🎭 Creative Background Pattern */}
      <div className="bg-pattern-wrapper">
        <div className="bg-grid"></div>
        <div className="bg-subgrid"></div>
        <div className="bg-crisscross"></div>
        <div className="bg-dots"></div>
        <div className="bg-gradient-overlay"></div>
      </div>

      {/* 🧭 Professional Navbar */}
      <nav className={`nav-serious ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <BrandLogo className="nav-logo-svg" />
            <span className="brand-name">CivicSense</span>
          </div>
          
          <div className="nav-menu">
            <button className={`nav-item ${activeSection === 'features' || activeSection === 'process' ? 'active' : ''}`} onClick={() => scrollTo('features')}>Issues</button>
            <button className={`nav-item ${activeSection === 'impact' ? 'active' : ''}`} onClick={() => scrollTo('impact')}>Impact</button>
            <button className={`nav-item ${activeSection === 'mission' ? 'active' : ''}`} onClick={() => scrollTo('mission')}>About</button>
            <button className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`} onClick={() => scrollTo('contact')}>Contact</button>
          </div>

          <div className="nav-cta">
            {user ? (
              <div className="nav-user-info">
                <span className="nav-welcome">Welcome, <strong>{user.name}</strong>!</span>
                <button className="btn-serious primary sm" onClick={onNavigateToDashboard}>Dashboard</button>
                <button className="btn-serious logout-outline sm" onClick={onLogout}>Logout</button>
              </div>
            ) : (
              <button className="btn-serious primary" onClick={() => setShowAuth(true)}>Get Started</button>
            )}
          </div>
        </div>
      </nav>

      {/* 🏛️ Hero Section */}
      <section id="hero" className="hero-serious">
        <div className="container hero-layout">
          <div className="hero-text">
            <div className="hero-eyebrow">A Unified Civic Operating System</div>
            <h1 className="hero-title">
              Small Issues, <br />
              <span className="text-accent">Big Impact.</span>
            </h1>
            <h2 className="hero-subtitle">Let's Fix Them Together.</h2>
            <p className="hero-description">
              Report civic issues in your neighborhood. Track their progress and help build a better community. Your voice matters in creating positive change.
            </p>
            <div className="hero-btns">
              <button className="btn-serious large primary" onClick={onNavigateToDashboard}>Report Issue</button>
              <button className="btn-serious large secondary" onClick={() => scrollTo('impact')}>Track Progress</button>
            </div>
            
            <div className="hero-stats-row">
              <div className="hero-stat">
                <strong>1500+</strong>
                <span>Issues Reported</span>
              </div>
              <div className="hero-stat">
                <strong>850+</strong>
                <span>Issues Resolved</span>
              </div>
              <div className="hero-stat">
                <strong>25+</strong>
                <span>Cities Covered</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-card">
            <div className="sample-card">
              <div className="card-tag">Bengaluru</div>
              <div className="card-img-placeholder">
                <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800" alt="Definitive Pothole Bengaluru" />
              </div>
              <div className="card-body">
                <h3>Pothole on MG Road</h3>
                <p>Deep pothole causing accidents near the main junction.</p>
                <div className="card-footer">
                  <span className="votes-badge">👍 45 votes</span>
                  <span className="status-tag resolved">Resolved</span>
                </div>
              </div>
            </div>
            <div className="card-decoration"></div>
          </div>
        </div>
      </section>

      {/* 🤝 Mission Section: Two Column */}
      <section id="mission" className="section-serious bg-light-pattern">
        <div className="container mission-grid">
          <div className="mission-col">
            <h2 className="title-serious">Our Mission.</h2>
            <p className="lead-serious">
              CivicSense is a revolutionary crowdsourced civic issue reporting system designed to empower every Indian citizen to create positive change in their communities. We believe that when citizens and government work together, extraordinary transformations happen.
            </p>
          </div>
          <div className="mission-col problem-solution">
            <div className="ps-box">
              <h3>The Problem We're Solving</h3>
              <p>Every day, millions of Indians face civic issues — broken roads, water leaks, garbage dumping, non-functioning streetlights, etc. Traditional reporting methods are slow, inefficient, and often ignored. Citizens feel powerless while authorities lack real-time information.</p>
            </div>
            <div className="ps-box solution">
              <h3>Our Solution</h3>
              <p>CivicSense creates a direct, transparent channel between citizens and government authorities. Through our platform, users can post issues with photos, descriptions, and locations while authorities can acknowledge, track, and resolve problems efficiently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ Process Section: How it Works */}
      <section id="process" className="section-serious bg-white-pattern">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="title-serious">Operational Workflow.</h2>
            <p className="lead-serious mx-auto">From reporting to resolution — a transparent civic process.</p>
          </div>
          
          <div className="process-grid">
            {[
              { 
                n: '1', 
                t: 'Report', 
                d: 'Spot an issue? Take a photo and report it with location details.', 
                i: '📢' 
              },
              { 
                n: '2', 
                t: 'Community Support', 
                d: 'Other citizens vote and comment to show support for the issue.', 
                i: '👥' 
              },
              { 
                n: '3', 
                t: 'Authority Action', 
                d: 'Local authorities get notified and can action on high priority issues.', 
                i: '🏛️' 
              },
              { 
                n: '4', 
                t: 'Resolution', 
                d: 'Track progress and celebrate when issues get resolved!', 
                i: '✅' 
              }
            ].map((step, i) => (
              <div key={i} className="process-step-card">
                <div className="step-number">{step.n}</div>
                <div className="step-icon">{step.i}</div>
                <h4>{step.t}</h4>
                <p>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 Why Choose CivicSense Section */}
      <section id="features" className="section-serious">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="title-serious">Why Choose CivicSense?</h2>
            <p className="lead-serious mx-auto">Built for impact, transparency, and community-driven progress.</p>
          </div>
          
          <div className="features-grid">
            {[
              { t: 'Targeted Action', d: 'Location-based reporting ensures issues reach the right authority.', i: '📍' },
              { t: 'Visual Evidence', d: 'Users can upload photos to clearly show the problem.', i: '📸' },
              { t: 'Community Power', d: 'Voting and commenting prioritize the most important issues.', i: '👥' },
              { t: 'Real-time Updates', d: 'Track issue progress from reporting to resolution.', i: '🔄' },
              { t: 'Secure & Transparent', d: 'User authentication and transparent tracking ensure accountability.', i: '🔒' }
            ].map((f, i) => (
              <div key={i} className={`feature-card-vibrant ${i === 4 ? 'centered-box' : ''}`}>
                <div className="f-icon">{f.i}</div>
                <h4>{f.t}</h4>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚠️ Consequences: What Happens When Resolution is Delayed? */}
      <section id="consequences" className="section-serious bg-light-pattern">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="title-serious">⚠️ What Happens When Resolution is Delayed?</h2>
            <p className="lead-serious mx-auto">Real consequences of unresolved civic issues sorted by data.</p>
          </div>
          
          <div className="consequences-grid-four">
            <div className="consequence-card-light">
              <div className="con-visual">
                <span className="con-emoji">🚑</span>
                <div className="con-stat">
                  <span className="con-val">4,000+</span>
                  <span className="con-lbl">DEATHS ANNUALLY DUE TO POTHOLES</span>
                </div>
              </div>
              <div className="con-info">
                <h4>Accidents & Injuries</h4>
                <p>Potholes or missing manhole covers can be fatal</p>
              </div>
            </div>

            <div className="consequence-card-light">
              <div className="con-visual">
                <span className="con-emoji">🦟</span>
                <div className="con-stat">
                  <span className="con-val">62M</span>
                  <span className="con-lbl">TONS OF WASTE GENERATED YEARLY</span>
                </div>
              </div>
              <div className="con-info">
                <h4>Public Health Risks</h4>
                <p>Garbage & sewage overflow attract mosquitoes → dengue/malaria spread</p>
              </div>
            </div>

            <div className="consequence-card-light">
              <div className="con-visual">
                <span className="con-emoji">💡</span>
                <div className="con-stat">
                  <span className="con-val">30%</span>
                  <span className="con-lbl">OF STREETLIGHTS OFTEN NON-FUNCTIONAL</span>
                </div>
              </div>
              <div className="con-info">
                <h4>Safety Concerns</h4>
                <p>Dark streets due to broken lights → rise in thefts, harassment</p>
              </div>
            </div>

            <div className="consequence-card-light">
              <div className="con-visual">
                <span className="con-emoji">💸</span>
                <div className="con-stat">
                  <span className="con-val">2-3</span>
                  <span className="con-lbl">WEEKS AVERAGE RESOLUTION TIME</span>
                </div>
              </div>
              <div className="con-info">
                <h4>Economic Loss</h4>
                <p>Wasted fuel & traffic jams due to poor road infrastructure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📈 Impact: Data-Driven Minimalism */}
      <section id="impact" className="section-serious bg-navy-pattern text-white">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="title-serious">Institutional Accountability.</h2>
            <p className="lead-serious text-white opacity-70 mx-auto">Verifiable outcomes of an integrated civic accountability framework.</p>
          </div>
          
          <div className="impact-grid-cards">
            {[
              { 
                v: '62 Million Tons', 
                t: 'Waste generated yearly in India', 
                d: 'Only 70% collected, 30% processed.', 
                i: '🗑️',
                img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400'
              },
              { 
                v: '4,000+ Deaths', 
                t: 'Annually due to potholes', 
                d: 'NCRB data on road accidents.', 
                i: '🚗',
                img: 'https://images.unsplash.com/photo-1597328290883-50c5787b7c7e?auto=format&fit=crop&q=80&w=400'
              },
              { 
                v: '30% Non-functional', 
                t: 'Streetlights in many cities', 
                d: 'Due to poor maintenance.', 
                i: '💡',
                img: 'https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=400'
              },
              { 
                v: '2-3 Weeks', 
                t: 'Average resolution time', 
                d: 'If complaints get resolved at all.', 
                i: '⏰',
                img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400'
              }
            ].map((card, i) => (
              <div key={i} className="impact-card-dark">
                <div className="impact-card-img-overlay">
                  <img src={card.img} alt={card.t} />
                  <div className="impact-overlay-shade"></div>
                </div>
                <div className="impact-card-content-wrap">
                  <div className="impact-card-icon">{card.i}</div>
                  <h3 className="impact-card-value">{card.v}</h3>
                  <h4 className="impact-card-title">{card.t}</h4>
                  <p className="impact-card-desc">{card.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📞 Contact: Professional Interaction */}
      <section id="contact" className="section-serious bg-white-pattern">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="title-serious">Get in touch.</h2>
            <p className="lead-serious mx-auto">Connecting citizens, authorities, and stakeholders.</p>
          </div>
          <div className="contact-grid-serious">
            <div className="contact-card-grey">
              <div className="box-header">
                <span className="box-dot blue"></span>
                <strong>General Support</strong>
              </div>
              <p>For technical assistance or general platform inquiries.</p>
              <a href="mailto:civicsensequery@gmail.com?subject=General Support Inquiry" className="contact-detail">📧 civicsensequery@gmail.com</a>
            </div>
            <div className="contact-card-grey">
              <div className="box-header">
                <span className="box-dot green"></span>
                <strong>Municipal Relations</strong>
              </div>
              <p>For city authorities and official government integrations.</p>
              <a href="mailto:civicsensequery@gmail.com?subject=Municipal Partnership Proposal" className="contact-detail">🤝 civicsensequery@gmail.com</a>
            </div>
            <div className="contact-card-grey">
              <div className="box-header">
                <span className="box-dot red"></span>
                <strong>Strategic Operations</strong>
              </div>
              <p>For critical civic oversight and high-priority escalation.</p>
              <a href="mailto:civicsensequery@gmail.com?subject=Strategic Operations/Escalation" className="contact-detail">📍 New Delhi, India</a>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Ready to Make a Difference? (Green CTA) */}
      <section className="cta-vibrant-green">
        <div className="container text-center">
          <h2 className="cta-title">Ready to Make a Difference?</h2>
          <p className="cta-subtitle">Join the movement of citizens making their communities better, one issue at a time.</p>
          
          <div className="cta-btns">
            <button className="btn-serious large primary" onClick={() => setShowAuth(true)}>Get Started Today</button>
            <button className="btn-serious large secondary-outline" onClick={() => scrollTo('mission')}>Learn More</button>
          </div>

          <div className="cta-stats-minimal">
            <div className="cta-stat">
              <strong>10,000+</strong>
              <span>Citizens Joined</span>
            </div>
            <div className="cta-stat">
              <strong>850+</strong>
              <span>Issues Resolved</span>
            </div>
            <div className="cta-stat">
              <strong>25+</strong>
              <span>Cities Covered</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🦶 Footer: Clean & Corrected */}
      <footer className="footer-serious">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo-wrapper">
                <BrandLogo className="footer-logo-svg" />
                <span className="footer-brand-name">CivicSense</span>
              </div>
              <p>The standard for professional urban governance and civic accountability.</p>
            </div>
            <div className="footer-nav">
              <div className="footer-col">
                <h6>Platform</h6>
                <button onClick={() => scrollTo('features')}>Issues</button>
                <button onClick={() => scrollTo('impact')}>Impact</button>
                <button onClick={() => scrollTo('mission')}>About</button>
                <button onClick={() => scrollTo('contact')}>Contact</button>
              </div>
              <div className="footer-col">
                <h6>Legal</h6>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 CivicSense. All rights reserved.</p>
            <div className="socials">
              <a href="#">LinkedIn</a>
              <a href="#">Twitter</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 🤖 AI Assistant */}
      <AIChatbot />

      <Auth 
        show={showAuth} 
        onHide={() => setShowAuth(false)}
        onLogin={(userData, token) => {
          setShowAuth(false);
          onLoginSuccess(userData.user, token);
        }}
      />
    </div>
  );
};

export default HomePage;
