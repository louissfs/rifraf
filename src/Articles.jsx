
import { useState } from "react";
import "./Articles.css";

const EPISODES = [
  {
    name: "Crazy Legs",
    nickname: "The Bronx legend",
    description:
      "A pioneer of breaking and one of the most influential figures in hip-hop dance. Crazy Legs helped bring the culture from the Bronx to the world.",
    urls: [
      "https://youtu.be/C4yP3u0nf0g",
      "https://www.youtube.com/watch?v=J6OqhJrp7Wk",
      "https://www.youtube.com/watch?v=Se4lzkP-6Cw",
    ],
    facts: [
      { label: "Real name", value: "Richard Colón" },
      { label: "Known for", value: "Rock Steady Crew" },
      { label: "Origin", value: "Bronx, New York" },
      { label: "Era", value: "1970s — present" },
    ],
    links: [
      {
        label: "Watch on YouTube ↗",
        url: "https://www.youtube.com/results?search_query=Crazy+Legs+breaking",
      },
    ],
  },
  {
    name: "Ken Swift",
    nickname: "The style master",
    description:
      "A foundational B-boy whose movement, musicality, and originality helped define the language of breaking. His influence can still be seen in dancers around the world.",
    urls: [
      "https://www.youtube.com/watch?v=nAwMARLEb0M",
      "https://www.youtube.com/watch?v=eRrpW6nUVt8",
    ],
    facts: [
      { label: "Real name", value: "Kenneth James Gabbert" },
      { label: "Known for", value: "Rock Steady Crew" },
      { label: "Style", value: "Footwork & originality" },
      { label: "Origin", value: "New York City" },
    ],
    links: [
      {
        label: "Watch on YouTube ↗",
        url: "https://www.youtube.com/results?search_query=Ken+Swift+breaking",
      },
    ],
  },
  {
    name: "Boogaloo Shrimp",
    nickname: "The animation pioneer",
    description:
      "Michael Chambers helped popularize popping and animation. His robotic movement and character work became a major part of street dance history.",
    urls: [
      "https://www.boogalooshrimpdocumentary.com/assets/boogaloo-trailer.mp4",
      "https://youtu.be/iCmPpdd8xcQ?list=RDiCmPpdd8xcQ",
    ],
    facts: [
      { label: "Real name", value: "Michael Chambers" },
      { label: "Known for", value: "Popping & animation" },
      { label: "Film", value: "Breakin’" },
      { label: "Origin", value: "California, USA" },
    ],
    links: [
      {
        label: "Watch on YouTube ↗",
        url: "https://www.youtube.com/results?search_query=Boogaloo+Shrimp+dancing",
      },
    ],
  },
  {
    name: "B-Boy Victor",
    nickname: "The new generation",
    description:
      "A world-class breaker known for explosive power moves, precision, and competitive drive. Victor represented breaking on the Olympic stage in Paris.",
    urls: [
      "https://youtu.be/Nio4AQrxMK8",
    ],
    facts: [
      { label: "Real name", value: "Victor Montalvo" },
      { label: "Known for", value: "Power moves" },
      { label: "Competition", value: "Paris 2024 Olympics" },
      { label: "Result", value: "Bronze medal" },
    ],
    links: [
      {
        label: "Watch on YouTube ↗",
        url: "https://www.youtube.com/results?search_query=B-Boy+Victor+Paris+2024",
      },
    ],
  },
];

function getYouTubeId(url) {
  if (!url || /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.includes("/embed/")) {
        return parsed.pathname.split("/embed/")[1].split("/")[0];
      }

      if (parsed.pathname.includes("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1].split("/")[0];
      }

      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

export default function Articles() {
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(0);

  const episode = EPISODES[selectedEpisode];
  const currentUrl = episode.urls[selectedVideo];
  const isLocalVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(currentUrl);
  const youtubeId = getYouTubeId(currentUrl);

  const selectEpisode = (index) => {
    setSelectedEpisode(index);
    setSelectedVideo(0);
  };

  const nextVideo = () => {
    setSelectedVideo((current) => (current + 1) % episode.urls.length);
  };

  return (
    <main className="articles">
      {/* INTRO */}
      <section className="a-grid">
        <div>
          <div className="a-label">RIFRAF / STREET ARCHIVE</div>

          <h1 className="a-title">
            Legends
            <br />
            of the floor.
          </h1>

          <p className="a-description">
            From the Bronx to the world stage. A look into the people,
            movement, and moments that shaped street dance culture.
          </p>
        </div>

        <div className="a-intro-side">
          Breaking. Popping. Originality.
          <br />
          The culture is bigger than the moves.
          <br />
          This is the archive.
        </div>
      </section>

      {/* VIDEO PLAYER */}
      <section className="player-section">
        <div className="player-top">
          <span className="player-label">
            Now viewing / {episode.name}
          </span>

          <span className="player-count">
            {String(selectedEpisode + 1).padStart(2, "0")} /{" "}
            {String(EPISODES.length).padStart(2, "0")}
          </span>
        </div>

        <div className="player-frame">
          {isLocalVideo ? (
            <video
              key={currentUrl}
              src={currentUrl}
              controls
              playsInline
              preload="metadata"
            />
          ) : youtubeId ? (
            <iframe
              key={currentUrl}
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
              title={`${episode.name} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="player-empty">
              <p>Video unavailable</p>
            </div>
          )}
        </div>

        <div className="video-switcher">
          {episode.urls.map((url, index) => (
            <button
              key={`${episode.name}-${index}`}
              type="button"
              className={selectedVideo === index ? "active" : ""}
              onClick={() => setSelectedVideo(index)}
            >
              Video {String(index + 1).padStart(2, "0")}
            </button>
          ))}

          {episode.urls.length > 1 && (
            <button type="button" onClick={nextVideo}>
              Next video ↗
            </button>
          )}
        </div>
      </section>

      {/* EPISODE LIST */}
      <section className="episodes-section">
        <div className="section-heading">
          <h2>The archive</h2>
          <span>{EPISODES.length} profiles / select to explore</span>
        </div>

        <div className="episode-list">
          {EPISODES.map((item, index) => (
            <div
              key={item.name}
              className={`episode ${selectedEpisode === index ? "active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => selectEpisode(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectEpisode(index);
                }
              }}
            >
              <span className="episode-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <h3 className="episode-title">{item.name}</h3>
                <p className="episode-description">{item.nickname}</p>
              </div>

              <span className="episode-status">
                {selectedEpisode === index ? "Selected ↗" : "Explore ↗"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* BREAKER PROFILES */}
      <section className="spotlight-section">
        <div className="section-heading">
          <h2>Culture makers</h2>
          <span>People who shaped the movement</span>
        </div>

        {EPISODES.map((item, index) => (
          <section className="spot" key={item.name}>
            <div>
              <div className="spot-label">
                Profile / {String(index + 1).padStart(2, "0")}
              </div>

              <h2 className="spot-name">{item.name}</h2>

              <p className="spot-description">{item.description}</p>

              <div className="spot-links">
                {item.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="spot-facts">
              {item.facts.map((fact) => (
                <div className="spot-fact" key={fact.label}>
                  <span className="spot-fact-label">{fact.label}</span>
                  <span className="spot-fact-value">{fact.value}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="articles-footer">
        <span>RIFRAF / Street archive</span>
        <span>Respect the culture. Keep it moving.</span>
      </footer>
    </main>
  );
}
