"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Work from "../components/Work";
import Manifesto from "../components/Manifesto";
import Experience from "../components/Experience";
import Footer from "../components/Footer";
import Cursor from "../components/Cursor";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#010101] text-[#fefefe]">
      <Cursor />
      <Header />
      <Hero />
      <Work />
      <Manifesto />
      <Experience />
      <Footer />
    </main>
  );
}
