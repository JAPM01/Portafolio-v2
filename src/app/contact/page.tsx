import SiteNav from "../../components/SiteNav";
import HeroLoader from "../../components/HeroLoader";
import ContactClose from "../../components/ContactClose";
import ContactPitch from "../../components/ContactPitch";
import ThemeGate from "../../components/ThemeGate";
import styles from "../../components/contact-page.module.css";

export default function ContactPage() {
  return (
    <>
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <ThemeGate base="dark" />
      <HeroLoader />
      <SiteNav />
      <main id="main">
        <div className={styles.page}>
          <ContactClose
            heading="Lorem ipsum dolor sit amet elit."
            headingId="contact-heading"
            headingLevel="h1"
            name="Contact"
            nameDivisor={3.62}
            pitch={<ContactPitch />}
            compact
          />
        </div>
      </main>
    </>
  );
}
