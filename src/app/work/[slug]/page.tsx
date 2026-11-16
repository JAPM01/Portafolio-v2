import { notFound } from "next/navigation";
import SiteNav from "../../../components/SiteNav";
import HeroLoader from "../../../components/HeroLoader";
import WorkDetail from "../../../components/WorkDetail";
import PanelLines from "../../../components/PanelLines";
import ThemeGate from "../../../components/ThemeGate";
import { PROJECTS, PROJECT_SLUGS } from "../../../lib/projects";

export function generateStaticParams() {
  return PROJECT_SLUGS.map((slug) => ({ slug }));
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS[slug];
  if (!project) notFound();
  const next = PROJECTS[project.next];

  return (
    <>
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <ThemeGate base="light" />
      <HeroLoader />
      <SiteNav />
      <main id="main">
        <PanelLines />
        <div className="container">
          <WorkDetail project={project} next={next} />
        </div>
      </main>
    </>
  );
}
