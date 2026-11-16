import type { CSSProperties, ReactNode } from "react";
import styles from "../app/anim.module.css";

type VarStyle = CSSProperties & Record<`--${string}`, string | number>;

/** Divide una palabra en caracteres con retardo escalonado (--i). */
export function CharRise({
  word,
  base = "0ms",
  className = "",
}: {
  word: string;
  base?: string;
  className?: string;
}) {
  return (
    <span className={`${styles.word} ${className}`} aria-hidden="true">
      {[...word].map((ch, i) => (
        <span
          key={i}
          className={styles.charRise}
          style={{ "--i": i, "--anim-base": base } as VarStyle}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/** Una línea de título con acceso: texto sr-only + caracteres animados. */
export function TitleLine({ text, base = "0ms" }: { text: string; base?: string }) {
  return (
    <span className={styles.word}>
      <span className="sr-only">{text}</span>
      <CharRise word={text} base={base} />
    </span>
  );
}

/** Palabras con fundido escalonado. */
export function WordFade({
  words,
  base = "0ms",
}: {
  words: string[];
  base?: string;
}) {
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true"> </span>}
          <span
            className={styles.wordFade}
            aria-hidden="true"
            style={{ "--i": i, "--anim-base": base } as VarStyle}
          >
            {w}
          </span>
        </span>
      ))}
    </>
  );
}

/** Bloque que sube entero. */
export function RiseWhole({
  children,
  base = "0ms",
  riseY,
  className = "",
}: {
  children: ReactNode;
  base?: string;
  riseY?: string;
  className?: string;
}) {
  return (
    <span
      className={`${styles.riseWhole} ${className}`}
      style={{ "--anim-base": base, ...(riseY ? { "--rise-y": riseY } : {}) } as VarStyle}
    >
      {children}
    </span>
  );
}
