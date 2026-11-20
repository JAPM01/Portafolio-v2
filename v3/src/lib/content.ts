export const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export const LOREM_SHORT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export type WorkItem = {
  index: string;
  total: string;
  title: string;
  desc: string;
  tags: string[];
  year: string;
  metric: string;
  frame: string;
};

export const WORK: WorkItem[] = [
  { index: "01", total: "01 / 10", title: "Lorem Atlas", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.", tags: ["PRODUCT", "UX/UI", "SYSTEMS"], year: "2026", metric: "+38% Lorem, 94% Ipsum", frame: "FRAME 12/48" },
  { index: "02", total: "02 / 10", title: "Ipsum Dolor", desc: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea.", tags: ["PRODUCT", "BRANDING"], year: "2026", metric: "+24% Lorem, 88% Ipsum", frame: "FRAME 08/32" },
  { index: "03", total: "03 / 10", title: "Nodo Atlas", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.", tags: ["PRODUCT", "UX/UI", "SYSTEMS"], year: "2026", metric: "+38% Lorem, 94% Ipsum", frame: "FRAME 12/48" },
  { index: "04", total: "04 / 10", title: "Dolor Sit", desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.", tags: ["UX/UI", "SYSTEMS"], year: "2025", metric: "+41% Lorem, 91% Ipsum", frame: "FRAME 21/40" },
  { index: "05", total: "05 / 10", title: "Amet Consectetur", desc: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.", tags: ["PRODUCT", "BRANDING"], year: "2025", metric: "+19% Lorem, 86% Ipsum", frame: "FRAME 05/28" },
  { index: "06", total: "06 / 10", title: "Adipiscing Elit", desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.", tags: ["PRODUCT", "UX/UI"], year: "2025", metric: "+27% Lorem, 90% Ipsum", frame: "FRAME 16/44" },
  { index: "07", total: "07 / 10", title: "Eiusmod Tempor", desc: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.", tags: ["UX/UI", "SYSTEMS"], year: "2024", metric: "+33% Lorem, 89% Ipsum", frame: "FRAME 09/36" },
  { index: "08", total: "08 / 10", title: "Incididunt Labore", desc: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.", tags: ["PRODUCT", "BRANDING"], year: "2024", metric: "+22% Lorem, 87% Ipsum", frame: "FRAME 14/30" },
  { index: "09", total: "09 / 10", title: "Dolore Magna", desc: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam nisi.", tags: ["PRODUCT", "UX/UI", "SYSTEMS"], year: "2024", metric: "+30% Lorem, 92% Ipsum", frame: "FRAME 18/52" },
  { index: "10", total: "10 / 10", title: "Aliqua Enim", desc: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae.", tags: ["BRANDING", "SYSTEMS"], year: "2023", metric: "+17% Lorem, 84% Ipsum", frame: "FRAME 07/24" },
];

export const CLIENTS = [
  "LOREM", "IPSUM", "DOLOR", "SIT", "AMET", "CONSECTETUR", "ADIPISCING", "EIUSMOD", "TEMPOR", "MAGNA",
];
