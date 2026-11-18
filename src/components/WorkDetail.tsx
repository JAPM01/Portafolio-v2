"use client";

import { useEffect, useRef, useState } from "react";
import { px } from "../lib/paths";
import { useRouter } from "next/navigation";
import styles from "./work-detail.module.css";
import { CharRise } from "../lib/anim";
import { usePointerParallax, useReveals } from "../lib/scroll";
import type { Project } from "../lib/projects";
import BrandMedia, { isBrandPlaceholder } from "./BrandMedia";

/** Plantilla de proyecto 1:1 — título gigante, hero con la grabación
    del scroll del sitio (poster → video con toggle Pause/Play), ficha
    (Year/Role/Services/Live site), narrativa, testimonio, galería
    escalonada con parallax y cierre "Next?". */

function Arrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path d="M18.5 12L4.99997 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path d="M4 7C4 5.58579 4 4.87868 4.43934 4.43934C4.87868 4 5.58579 4 7 4C8.41421 4 9.12132 4 9.56066 4.43934C10 4.87868 10 5.58579 10 7V17C10 18.4142 10 19.1213 9.56066 19.5607C9.12132 20 8.41421 20 7 20C5.58579 20 4.87868 20 4.43934 19.5607C4 19.1213 4 18.4142 4 17V7Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 7C14 5.58579 14 4.87868 14.4393 4.43934C14.8787 4 15.5858 4 17 4C18.4142 4 19.1213 4 19.5607 4.43934C20 4.87868 20 5.58579 20 7V17C20 18.4142 20 19.1213 19.5607 19.5607C19.1213 20 18.4142 20 17 20C15.5858 20 14.8787 20 14.4393 19.5607C14 19.1213 14 18.4142 14 17V7Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path d="M8 5.5C8 4.67157 8.67157 4 9.5 4C9.75385 4 10.0036 4.07176 10.2239 4.21125L16.7239 8.21125C17.3449 8.59767 17.5 9.04737 17.5 9.5C17.5 9.95263 17.3449 10.4023 16.7239 10.7888L10.2239 14.7888C10.0036 14.9282 9.75385 15 9.5 15C8.67157 15 8 14.3284 8 13.5V5.5Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function WorkDetail({ project, next }: { project: Project; next: Project }) {
  const rigRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  usePointerParallax();
  useReveals();

  // Rail del gate "Next?" (ref NextProjectGate): al llegar al final de la
  // página el gate se arma (solo desktop, puntero fino, ≥768px, sin
  // reduced-motion) y el rail fijo aparece al pie del viewport; seguir
  // bajando con la rueda acumula 850px de delta y navega al siguiente
  // proyecto. Sin el título volador de la ref (transición de 2.7s): la
  // navegación es directa.
  const router = useRouter();
  const fillRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const accumulatedRef = useRef(0);
  const navigatingRef = useRef(false);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(min-width: 768px)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const check = () => {
      const el = document.scrollingElement;
      if (!el) return;
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <= 2;
      setArmed((prev) => (prev === atBottom ? prev : atBottom));
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    if (!armed) {
      accumulatedRef.current = 0;
      if (fillRef.current) fillRef.current.style.inlineSize = "0";
      return;
    }
    const setFill = () => {
      if (!fillRef.current) return;
      const frac = accumulatedRef.current / 850;
      fillRef.current.style.inlineSize = `${(100 * frac).toFixed(2)}%`;
    };
    const goNext = () => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      router.push(`/work/${project.next}`);
    };
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        e.preventDefault();
        accumulatedRef.current = Math.min(
          850,
          accumulatedRef.current + e.deltaY,
        );
        setFill();
        if (accumulatedRef.current >= 850) goNext();
        return;
      }
      if (accumulatedRef.current > 0) {
        e.preventDefault();
        accumulatedRef.current = Math.max(
          0,
          accumulatedRef.current + e.deltaY,
        );
        setFill();
      }
    };
    window.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [armed, project.next, router]);

  // El video sustituye al poster al montar (como en la referencia).
  useEffect(() => {
    setVideoReady(true);
  }, []);

  // --img-p del siteRig (parallax del hero) y de cada marco de galería.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const vh = window.innerHeight;
      const setImgP = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        const ip = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty("--img-p", ip.toFixed(4));
      };
      if (rigRef.current) setImgP(rigRef.current);
      document
        .querySelectorAll<HTMLElement>(`.${styles.galleryFrame}`)
        .forEach(setImgP);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggleVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      delete v.dataset.userPaused;
      setPaused(false);
      v.play().catch(() => {});
    } else {
      v.dataset.userPaused = "";
      setPaused(true);
      v.pause();
    }
  };

  return (
    <div className={`site-grid ${styles.page}`}>
      <header className={styles.header}>
        <h1
          className={`${styles.title} clipped`}
          style={{ "--title-em": project.titleEm } as React.CSSProperties}
        >
          <span style={{ "--anim-base": "0ms" } as React.CSSProperties}>
            <span className="sr-only">{project.title}</span>
            <CharRise word={project.title} base="0ms" />
          </span>
        </h1>
      </header>

      <div className={styles.siteRig} data-work-media="" ref={rigRef}>
        <a
          className={`${styles.shot} ${styles.site} ${styles.hasMedia}`}
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-work-link=""
          aria-label={`Visit ${project.title}, opens in a new tab`}
        >
          {videoReady && project.videoBase ? (
            <video
              ref={videoRef}
              className={styles.media}
              autoPlay
              muted
              loop
              playsInline
              poster={isBrandPlaceholder(project.poster) ? undefined : project.poster}
              aria-hidden="true"
            >
              <source src={`${project.videoBase}-1672.webm`} type="video/webm" media="(min-width: 1672px)" />
              <source src={`${project.videoBase}-1672.mp4`} type="video/mp4" media="(min-width: 1672px)" />
              <source src={`${project.videoBase}.webm`} type="video/webm" />
              <source src={`${project.videoBase}.mp4`} type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <BrandMedia
              className={styles.media}
              src={project.poster}
              srcSet={`${project.poster1280} 1280w, ${project.poster} 2400w`}
              sizes="(max-width: 767px) calc(100vw - 32px), 1512px"
              alt=""
              width={1512}
              height={850}
              aria-hidden="true"
            />
          )}
        </a>
        <button
          type="button"
          data-video-toggle=""
          className={styles.toggle}
          hidden={!videoReady || !project.videoBase}
          aria-label={`${paused ? "Play" : "Pause"} the ${project.title} recording`}
          onClick={toggleVideo}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      </div>

      <div className={`site-grid ${styles.body}`}>
        <h2 className={styles.sectionHeading}>The project</h2>
        <div className={styles.explanation}>
          {project.paras.map((p, i) => (
            <p key={i} className={styles.para}>
              {p}
            </p>
          ))}
        </div>
        <dl className={styles.meta}>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Year</dt>
            <dd className={styles.metaValue}>{project.year}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Role</dt>
            <dd className={styles.metaValue}>{project.role}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Services</dt>
            <dd className={styles.metaValue}>
              <ul className={styles.services}>
                {project.services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Link</dt>
            <dd className={styles.metaValue}>
              <a
                className={styles.liveLink}
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Live site: ${project.title}, opens in a new tab`}
              >
                <span className={styles.liveLinkLabel}>Live site</span>
                <Arrow />
              </a>
            </dd>
          </div>
        </dl>
      </div>

      {project.testimonial && (
        <section className={styles.testimonial} aria-labelledby="testimonial-heading">
          <div className={`site-grid ${styles.testimonialGrid}`}>
            <h2 id="testimonial-heading" className={styles.testimonialHeading}>
              What the client said
            </h2>
            <blockquote className={styles.quote}>
              <p className={styles.quoteText}>
                &ldquo;{project.testimonial.quote}&rdquo;
              </p>
              <footer className={styles.attribution}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <BrandMedia
                  className={styles.avatar}
                  src={project.testimonial.avatar}
                  alt={project.testimonial.name}
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                />
                <p className={styles.attributionLine}>
                  <span className={styles.attributionName}>{project.testimonial.name}</span>
                  <span className={styles.attributionRole}> - {project.testimonial.role}</span>
                </p>
              </footer>
            </blockquote>
          </div>
        </section>
      )}

      <div className={styles.gallery} data-gallery-reveal="">
        <h2 className={styles.galleryHeading}>Gallery</h2>
        <div className={styles.rest}>
          {project.gallery.map((fig, i) => (
            <figure
              key={i}
              className={styles.figure}
              data-work-media=""
              data-row={fig.row}
              data-align={fig.align}
              style={fig.scale ? ({ "--fig-scale": `${fig.scale}%` } as React.CSSProperties) : undefined}
            >
              <div className={styles.lift}>
                <span
                  className={styles.galleryFrame}
                  data-reveal={fig.reveal}
                  data-ptr-parallax=""
                  data-bleed={fig.bleed ? "" : undefined}
                  style={{ aspectRatio: fig.ar } as React.CSSProperties}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <BrandMedia
                    alt={fig.alt}
                    loading="lazy"
                    width={fig.w ?? undefined}
                    height={fig.h ?? undefined}
                    decoding="async"
                    className={styles.galleryImage}
                    sizes={fig.row === "full" && fig.scale ? `(min-width: 768px) ${fig.scale}vw, 100vw` : "(min-width: 768px) 50vw, 100vw"}
                    src={fig.src}
                  />
                  <span />
                </span>
                <figcaption className={styles.caption}>{fig.cap}</figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>

      <a
        className={styles.gate}
        data-next-gate=""
        data-armed={armed ? "" : undefined}
        href={px(`/work/${project.next}`)}
      >
        <span className={styles.gateLabel}>Next?</span>
        <span className={styles.gateTitle} style={{ "--title-em": next.titleEm } as React.CSSProperties}>
          {next.title}
        </span>
        <div className={styles.rail} aria-hidden="true">
          <div ref={fillRef} className={styles.fill} />
        </div>
      </a>
    </div>
  );
}
