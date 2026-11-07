import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="home-hero">
        <div className="hero-topline">
          <span>INDEPENDENT CULTURE ARCHIVE</span>
          <span>EST. 2026 — EVERYWHERE</span>
        </div>

        <div className="hero-content">
          <p className="hero-eyebrow">FOR THE CULTURE.</p>

          <h1>
            NOT MADE
            <br />
            TO FIT <span>IN.</span>
          </h1>

          <div className="hero-bottom">
            <p>
              A visual archive of street culture.
              <br />
              Skateboarding, graffiti, music and everything in between.
            </p>

            <Link to="/street" className="hero-link">
              EXPLORE THE ARCHIVE <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img src="/skate1.png" alt="Skateboarding street culture" />
          <span className="image-caption">01 — STREET CULTURE</span>
        </div>
      </section>

      {/* INTRO */}
      <section className="home-intro reveal">
        <p className="section-label">01 / THE IDEA</p>

        <h2>
          CULTURE HAS
          <br />
          <span>NO RULEBOOK.</span>
        </h2>

        <div className="intro-bottom">
          <p>
            RIFRAF is a place for the scenes, people and creative movements
            that exist outside the ordinary. No categories needed.
            Just culture in its rawest form.
          </p>

          <span className="intro-symbol">R.</span>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="home-explore">
        <div className="explore-heading reveal">
          <p className="section-label">02 / EXPLORE</p>
          <h2>FIND YOUR SCENE.</h2>
        </div>

        <div className="explore-grid">

          <Link to="/street" className="explore-card reveal">
            <div className="explore-image">
              <img src="/graffiti1.png" alt="Graffiti and street art" />
              <span className="card-number">01</span>
              <span className="card-arrow">↗</span>
            </div>

            <div className="explore-card-info">
              <div>
                <h3>STREET</h3>
                <p>Skating, graffiti, movement and expression.</p>
              </div>
              <span>EXPLORE</span>
            </div>
          </Link>

          <Link to="/mood" className="explore-card reveal">
            <div className="explore-image">
              <img src="/breakdance1.png" alt="Breakdancing street culture" />
              <span className="card-number">02</span>
              <span className="card-arrow">↗</span>
            </div>

            <div className="explore-card-info">
              <div>
                <h3>MOOD</h3>
                <p>A collection of images, moments and inspiration.</p>
              </div>
              <span>EXPLORE</span>
            </div>
          </Link>

        </div>
      </section>

      {/* STATEMENT */}
      <section className="home-statement reveal">
        <p className="section-label">03 / OUR PERSPECTIVE</p>

        <h2>
          IT'S NOT
          <br />
          A TREND.
          <br />
          <span>IT'S CULTURE.</span>
        </h2>

        <p className="statement-description">
          Made for the curious. Built around the underground.
          Inspired by the people who make things happen.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-top">
          <h2>RIFRAF<span>.</span></h2>
          <p>KEEP CULTURE ALIVE.</p>
        </div>

        <div className="footer-bottom">
          <span>© 2026 RIFRAF</span>
          <span>MADE FOR THE CULTURE.</span>
          <Link to="/">BACK TO TOP ↑</Link>
        </div>
      </footer>

    </div>
  );
}

export default Home;