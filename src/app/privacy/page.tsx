import SiteNav from "../../components/SiteNav";
import { px } from "../../lib/paths";
import HeroLoader from "../../components/HeroLoader";
import ThemeGate from "../../components/ThemeGate";
import styles from "../../components/privacy-page.module.css";

export default function PrivacyPage() {
  return (
    <>
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <ThemeGate base="dark" />
      <HeroLoader />
      <SiteNav />
      <main id="main">
        <div className="container site-grid">
          <div className={styles.page}>
            <h1 className={styles.title}>Privacy</h1>
            <p className={styles.updated}>Updated October 15, 2026</p>
            <div className={styles.body}>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                eiusmod tempor incididunt.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                eiusmod tempor.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua
                enim ad minim veniam quis nostrud exercitation ullamco
                laboris nisi aliquip ex ea commodo consequat duis aute irure
                dolor in reprehenderit in voluptate velit esse cillum dolore
                eu fugiat nulla pariatur.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua
                enim ad minim veniam quis nostrud.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua
                enim ad minim veniam quis nostrud exercitation ullamco
                laboris nisi aliquip ex ea commodo consequat.
              </p>
            </div>
            <a className={styles.back} href={px("/")}>
              Back to the homepage
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
