"""Generate the public CV PDF (public/cv.pdf) in the site's visual identity.

Run:
    python3 -m pip install -r scripts/requirements.txt
    python3 scripts/generate_cv.py

Typeface: the site's own Instrument Sans (public/fonts, variable woff2),
instanced to static weights with fontTools and embedded as subsets.
Layout flows across pages automatically; a job heading never ends a page.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as ReportLabTTFont
from reportlab.pdfgen.canvas import Canvas

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "cv.pdf"
SOURCE_FONT = ROOT / "public" / "fonts" / "instrument-sans-var-latin.woff2"
FONT_CACHE = ROOT / "tmp" / "cv-fonts"

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_X = 50
MARGIN_TOP = 50
MARGIN_BOTTOM = 32
CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN_X

# Site palette, light theme (src/styles.css)
INK = HexColor("#15181C")
MUTED = HexColor("#56606B")
ACCENT = HexColor("#2743C7")
RULE = HexColor("#D9DCD6")

REGULAR, MEDIUM, SEMIBOLD = "Sans", "Sans-Medium", "Sans-SemiBold"

BODY_SIZE = 9.6
BODY_LEADING = 13.6

# Same rule as the site (career-entry.ts): standalone numbers are emphasised.
NUMBER = re.compile(r"(?<![A-Za-z])(\d[\d,.]*\+?%?)(?![A-Za-z])")


# ----------------------------------------------------------------- content

NAME = "Andrei Parcheuski"
ROLE = "Senior Angular Developer · 3D / WebGL"
AVAILABILITY = "Open to remote senior / lead roles · Warsaw (CET) · 6+ years working with US teams"
CONTACTS = [
    ("parchevscky17@gmail.com", "mailto:parchevscky17@gmail.com"),
    ("+48 572 017 314", "tel:+48572017314"),
    ("andreiparcheuski.com", "https://andreiparcheuski.com"),
    ("linkedin.com/in/andrewpar14", "https://linkedin.com/in/andrewpar14"),
]

SUMMARY = (
    "Senior Angular engineer with 11+ years in production web apps, specializing in 3D product "
    "configurators: Angular and Three.js with real-time Unreal Engine pixel streaming, ~30 enterprise "
    "projects on one shared 80,000-line codebase. 9+ years of Angular (Signals, NgRx, RxJS), 3+ years "
    "leading frontend teams and 6+ years with US companies. Author of 8 public @3dsource npm packages; "
    "95% test coverage on core modules with Playwright and Vitest."
)

SKILLS = [
    ("Angular & TypeScript", "TypeScript, Angular (9+ yrs), Signals, NgRx, NgRx\u00a0Signal\u00a0Store, RxJS, Reactive\u00a0Forms, Angular\u00a0Material"),
    ("3D & XR", "Three.js, WebGL, Unreal Engine pixel streaming, 8th\u00a0Wall, Wikitude, WebXR"),
    ("React & Web", "React, Next.js, SSR, React Query, Redux Toolkit, JavaScript, HTML, CSS / SCSS, i18n (LTR/RTL)"),
    ("Quality & Delivery", "Playwright, Vitest, Jest, GraphQL, REST, web\u00a0performance, CI/CD, Docker, AWS, Azure"),
]


@dataclass
class Job:
    company: str
    role: str
    dates: str
    place: str
    bullets: list[str]


JOBS = [
    Job("3D Source", "Senior Front-End Developer", "Oct 2023 – Present", "Warsaw, Poland", [
        "Architect and build 3D product configurators with Angular and Three.js: ~30 enterprise projects on a shared 80,000-line codebase.",
        "Integrated real-time Unreal Engine pixel streaming into the Angular front end for high-fidelity 3D rendering.",
        "Authored and published 8 public npm packages under @3dsource: a shared Angular UI library, data loaders and configurator APIs.",
        "Built an external integration API for embedding configurators via iframe, with two-way interaction.",
        "Raised core-module test coverage to 95%: Playwright E2E with GraphQL stubbing and code coverage, plus Vitest unit tests.",
        "Led a full front-end performance optimization of the platform.",
    ]),
    Job("ITRex Group", "Front-End Team Lead", "Nov 2021 – Sep 2023", "Remote, US", [
        "Led a 4-person frontend team across two flagship projects on a 2-week release cycle; shipped ~20 major features on schedule and mentored 2 developers.",
        "Owned the React / Next.js frontend architecture of a sports-industry vendor-management platform, from schema design to Azure deployment.",
        "Built multi-language i18n with full LTR/RTL support (including Arabic), dynamic routing and responsive layouts.",
        "Delivered hybrid iOS / Android support via a WebView bridge, push notifications and custom elements through the Kentico CMS API.",
        "Worked with management and third parties (Google Ads, Batch) on performance and SEO; reviewed pull requests and owned feature estimates.",
    ]),
    Job("ITRex Group", "Front-End Developer", "Dec 2019 – Nov 2021", "Remote, US", [
        "Delivered 4 key projects with React, Angular and 8th Wall.",
        "Built a high-traffic marketplace with Angular, RxJS and Material UI: set up the architecture, integrated 8th Wall for AR model display, owned testing and Heroku deployment.",
    ]),
    Job("HQSoftware", "Full-Stack Web Developer", "Nov 2018 – Dec 2019", "Remote, US", [
        "Lead developer on a 9-person team: product definition, requirements analysis and full implementation; synchronized desktop and mobile XR experiences.",
        "Selected and owned the technology stack: Three.js, Angular, Angular Material and NgRx.",
    ]),
    Job("HQSoftware", "Front-End Web Developer", "Jul 2017 – Nov 2018", "Remote, US", [
        "Built a client web platform from scratch for authoring AR and VR scenes.",
        "Developed PWA and SPA experiences with Angular, Three.js, Wikitude and a custom XR Builder.",
    ]),
    Job("IBA Group", "Full-Stack Web Developer", "Apr 2016 – Jun 2017", "Minsk, Belarus", [
        "Migrated a legacy Learning Management System to a modern React UI on a Ruby on Rails backend.",
    ]),
    Job("SoftClub", "JavaScript Developer", "Mar 2015 – Apr 2016", "Minsk, Belarus", [
        "Built automated banking-data dashboards with JavaScript, QlikView and SQL.",
    ]),
]

EDUCATION = [
    ("M.Sc. in Applied Mathematics and Computer Science", "Belarusian State University", "2016 – 2017", "Minsk, Belarus"),
    ("B.Sc. in Applied Mathematics (Optimization Methods)", "Belarusian State University", "2011 – 2016", "Minsk, Belarus"),
]

LANGUAGES = "Russian (native) · Belarusian (native) · English (professional working)"

LINKS = [
    ("Portfolio", "andreiparcheuski.com", "https://andreiparcheuski.com"),
    ("npm", "npmjs.com/org/3dsource", "https://www.npmjs.com/org/3dsource"),
    ("LinkedIn", "linkedin.com/in/andrewpar14", "https://linkedin.com/in/andrewpar14"),
]


# ------------------------------------------------------------------- fonts

def register_fonts() -> None:
    """Instance the site's variable font into static TTFs ReportLab can embed."""
    FONT_CACHE.mkdir(parents=True, exist_ok=True)
    for name, weight in ((REGULAR, 400), (MEDIUM, 500), (SEMIBOLD, 600)):
        path = FONT_CACHE / f"InstrumentSans-{weight}.ttf"
        if not path.exists() or path.stat().st_mtime < SOURCE_FONT.stat().st_mtime:
            font = TTFont(SOURCE_FONT)
            static = instantiateVariableFont(font, {"wght": weight})
            static.flavor = None
            # Each instance needs its own name: PDF embedding keys fonts by
            # PostScript name, so three "Regular"s would collapse into one.
            style = {400: "Regular", 500: "Medium", 600: "SemiBold"}[weight]
            names = static["name"]
            names.setName(f"Instrument Sans {style}", 1, 3, 1, 0x409)
            names.setName("Regular", 2, 3, 1, 0x409)
            names.setName(f"Instrument Sans {style}", 4, 3, 1, 0x409)
            names.setName(f"InstrumentSans-{style}", 6, 3, 1, 0x409)
            static.save(path)
        pdfmetrics.registerFont(ReportLabTTFont(name, str(path)))


def width(text: str, font: str, size: float) -> float:
    return pdfmetrics.stringWidth(text, font, size)


# ------------------------------------------------------------------ layout

class Document:
    """A cursor over the page; starts a new page when a block does not fit."""

    def __init__(self, canvas: Canvas) -> None:
        self.c = canvas
        self.page = 1
        self.y = PAGE_HEIGHT - MARGIN_TOP

    def ensure(self, height: float) -> None:
        if self.y - height < MARGIN_BOTTOM:
            self.c.showPage()
            self.page += 1
            self.y = PAGE_HEIGHT - MARGIN_TOP
            self.running_header()

    # -- pieces -----------------------------------------------------------

    def text(self, x: float, y: float, value: str, font: str, size: float, color=INK) -> float:
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        self.c.drawString(x, y, value)
        return x + width(value, font, size)

    def link(self, x: float, y: float, label: str, url: str, font: str, size: float) -> float:
        end = self.text(x, y, label, font, size, ACCENT)
        self.c.linkURL(url, (x, y - 2, end, y + size), relative=0)
        return end

    def inline_links(self, items: list[tuple[str, str]], size: float, max_width: float) -> None:
        """Links separated by middle dots; wraps between items, never after a dot."""
        sep = "  ·  "
        x = MARGIN_X
        for index, (label, url) in enumerate(items):
            item_width = width(label, REGULAR, size)
            sep_width = width(sep, REGULAR, size) if index else 0
            if index and x + sep_width + item_width > MARGIN_X + max_width:
                self.y -= size + 5
                x = MARGIN_X
            elif index:
                x = self.text(x, self.y, sep, REGULAR, size, MUTED)
            x = self.link(x, self.y, label, url, REGULAR, size)

    # -- blocks -----------------------------------------------------------

    def header(self) -> None:
        c = self.c
        self.y -= 4
        # Tight tracking for the name only: PDF char spacing (Tc) persists
        # for the rest of the page unless the graphics state is restored.
        c.saveState()
        text = c.beginText(MARGIN_X, self.y - 20)
        text.setFont(SEMIBOLD, 26)
        text.setCharSpace(-0.5)
        text.setFillColor(INK)
        text.textOut(NAME)
        c.drawText(text)
        c.restoreState()
        self.y -= 42
        self.text(MARGIN_X, self.y, ROLE, MEDIUM, 12.5)
        self.y -= 16
        self.text(MARGIN_X, self.y, AVAILABILITY, REGULAR, 9.4, MUTED)
        self.y -= 16
        self.inline_links(CONTACTS, 9.4, CONTENT_WIDTH)
        self.y -= 18

    def running_header(self) -> None:
        """Compact header on continuation pages."""
        left = self.text(MARGIN_X, self.y, NAME, SEMIBOLD, 10.5)
        self.text(left + 8, self.y, ROLE, REGULAR, 9.2, MUTED)
        label = "andreiparcheuski.com"
        self.link(PAGE_WIDTH - MARGIN_X - width(label, REGULAR, 9.2), self.y, label,
                  "https://andreiparcheuski.com", REGULAR, 9.2)
        self.y -= 10
        self.rule()
        self.y -= 18

    def rule(self) -> None:
        self.c.setStrokeColor(RULE)
        self.c.setLineWidth(0.6)
        self.c.line(MARGIN_X, self.y, PAGE_WIDTH - MARGIN_X, self.y)

    def section(self, title: str, keep_with: float = 40) -> None:
        # A heading never ends a page: keep it with the start of its content.
        self.ensure(26 + keep_with)
        self.rule()
        self.y -= 16
        self.text(MARGIN_X, self.y, title, SEMIBOLD, 11)
        self.y -= 15

    def paragraph(self, value: str, size: float = BODY_SIZE + 0.4) -> None:
        for line in wrap_plain(value, REGULAR, size, CONTENT_WIDTH):
            self.ensure(BODY_LEADING)
            self.text(MARGIN_X, self.y, line, REGULAR, size)
            self.y -= BODY_LEADING
        self.y -= 8

    def skills(self) -> None:
        gutter = 22
        column = (CONTENT_WIDTH - gutter) / 2
        rows = [SKILLS[i:i + 2] for i in range(0, len(SKILLS), 2)]
        for row in rows:
            heights = []
            for col, (label, values) in enumerate(row):
                x = MARGIN_X + col * (column + gutter)
                y = self.y
                self.text(x, y, label, SEMIBOLD, 9.2)
                y -= 12.5
                for line in wrap_plain(values, REGULAR, 9.2, column):
                    self.text(x, y, line, REGULAR, 9.2, MUTED)
                    y -= 12.5
                heights.append(self.y - y)
            self.y -= max(heights) + 4
        self.y -= 4

    def job(self, job: Job) -> None:
        bullets = [wrap_rich(b, BODY_SIZE, CONTENT_WIDTH - 14) for b in job.bullets]
        heights = [len(lines) * BODY_LEADING + 2.4 for lines in bullets]
        # Short jobs stay whole; longer ones keep at least the first bullet.
        keep = sum(heights) if len(bullets) <= 2 else heights[0]
        self.ensure(15 + keep)

        x = self.text(MARGIN_X, self.y, job.company, SEMIBOLD, 10.5)
        x = self.text(x, self.y, "  ·  ", REGULAR, 10.5, MUTED)
        self.text(x, self.y, job.role, MEDIUM, 10.5)
        meta = f"{job.dates}  ·  {job.place}"
        self.text(PAGE_WIDTH - MARGIN_X - width(meta, REGULAR, 9), self.y, meta, REGULAR, 9, MUTED)
        self.y -= 15

        for lines in bullets:
            self.ensure(len(lines) * BODY_LEADING)
            # Marker: a short dash on the x-height of the first line (as on the site).
            self.c.setStrokeColor(MUTED)
            self.c.setLineWidth(0.8)
            self.c.line(MARGIN_X + 1, self.y + 3.1, MARGIN_X + 6.5, self.y + 3.1)
            for line in lines:
                self.rich_line(MARGIN_X + 14, self.y, line)
                self.y -= BODY_LEADING
            self.y -= 2.4
        self.y -= 8

    def rich_line(self, x: float, y: float, segments: list[tuple[str, bool]]) -> None:
        for value, strong in segments:
            font = SEMIBOLD if strong else REGULAR
            x = self.text(x, y, value, font, BODY_SIZE, INK if strong else HexColor("#2A3038"))

    def education(self) -> None:
        for degree, school, years, place in EDUCATION:
            self.ensure(28)
            self.text(MARGIN_X, self.y, degree, SEMIBOLD, 10)
            meta = f"{years}  ·  {place}"
            self.text(PAGE_WIDTH - MARGIN_X - width(meta, REGULAR, 9), self.y, meta, REGULAR, 9, MUTED)
            self.y -= 13
            self.text(MARGIN_X, self.y, school, REGULAR, 9.4, MUTED)
            self.y -= 17
        self.y -= 4

    def links(self) -> None:
        label_width = 64
        for label, text, url in LINKS:
            self.ensure(14)
            self.text(MARGIN_X, self.y, label, REGULAR, 9.6, MUTED)
            self.link(MARGIN_X + label_width, self.y, text, url, REGULAR, 9.6)
            self.y -= 14


def wrap_plain(value: str, font: str, size: float, max_width: float) -> list[str]:
    lines: list[str] = []
    line = ""
    for word in value.split(" "):
        candidate = f"{line} {word}".strip()
        if not line or width(candidate, font, size) <= max_width:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def wrap_rich(value: str, size: float, max_width: float) -> list[list[tuple[str, bool]]]:
    """Wraps text into lines of (text, is_number) segments, numbers emphasised."""

    def segments(word: str) -> list[tuple[str, bool]]:
        parts: list[tuple[str, bool]] = []
        last = 0
        for match in NUMBER.finditer(word):
            if match.start() > last:
                parts.append((word[last:match.start()], False))
            parts.append((match.group(1), True))
            last = match.end()
        if last < len(word):
            parts.append((word[last:], False))
        return parts

    def seg_width(parts: list[tuple[str, bool]]) -> float:
        return sum(width(t, SEMIBOLD if s else REGULAR, size) for t, s in parts)

    space = width(" ", REGULAR, size)
    lines: list[list[tuple[str, bool]]] = []
    line: list[tuple[str, bool]] = []
    line_width = 0.0
    for word in value.split(" "):
        parts = segments(word)
        w = seg_width(parts)
        if line and line_width + space + w > max_width:
            lines.append(line)
            line, line_width = [], 0.0
        if line:
            line.append((" ", False))
            line_width += space
        line.extend(parts)
        line_width += w
    if line:
        lines.append(line)
    return lines


# -------------------------------------------------------------------- main

def main() -> None:
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas = Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    canvas.setTitle(f"{NAME} — CV")
    canvas.setAuthor(NAME)
    canvas.setSubject(ROLE)
    canvas.setCreator("andreiparcheuski.com")
    canvas.setKeywords(
        "Senior Angular Developer, Angular, TypeScript, NgRx, RxJS, Signals, Three.js, WebGL, "
        "3D product configurators, Unreal Engine pixel streaming, React, Next.js, Team Lead"
    )

    doc = Document(canvas)
    doc.header()
    doc.section("Summary")
    doc.paragraph(SUMMARY)
    doc.section("Skills")
    doc.skills()
    doc.section("Experience", keep_with=60)
    for job in JOBS:
        doc.job(job)
    doc.section("Education")
    doc.education()
    doc.section("Languages", keep_with=14)
    doc.text(MARGIN_X, doc.y, LANGUAGES, REGULAR, 9.8)
    doc.y -= 26
    doc.section("Links", keep_with=42)
    doc.links()
    canvas.save()
    print(f"wrote {OUTPUT.relative_to(ROOT)} ({doc.page} pages)")


if __name__ == "__main__":
    main()
