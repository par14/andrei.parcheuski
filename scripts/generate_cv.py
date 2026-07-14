"""Generate the public CV PDF from the verified portfolio data.

Run with: python3 scripts/generate_cv.py
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen.canvas import Canvas


OUTPUT = Path(__file__).resolve().parents[1] / "public" / "cv.pdf"
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 48
CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN
INK = HexColor("#1F2937")
MUTED = HexColor("#5F6B7A")
TEAL = HexColor("#008A8A")
RULE = HexColor("#D9E0E6")


def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if not line or stringWidth(candidate, font, size) <= width:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_link(canvas: Canvas, text: str, x: float, y: float, url: str) -> float:
    canvas.setFillColor(TEAL)
    canvas.drawString(x, y, text)
    width = stringWidth(text, "Helvetica", 9.2)
    canvas.linkURL(url, (x, y - 2, x + width, y + 10), relative=0)
    return x + width


def draw_header(canvas: Canvas, compact: bool = False) -> float:
    y = PAGE_HEIGHT - MARGIN
    if compact:
        canvas.setFont("Helvetica-Bold", 12)
        canvas.setFillColor(INK)
        canvas.drawString(MARGIN, y, "Andrei Parcheuski")
        canvas.setFont("Helvetica", 9.2)
        draw_link(canvas, "andreiparcheuski.com", MARGIN + 116, y, "https://andreiparcheuski.com")
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN + 218, y, "|  Senior Angular Developer · 3D / WebGL")
        y -= 18
    else:
        canvas.setFont("Helvetica-Bold", 24)
        canvas.setFillColor(INK)
        canvas.drawString(MARGIN, y, "Andrei Parcheuski")
        y -= 18
        canvas.setFont("Helvetica", 13)
        canvas.setFillColor(TEAL)
        canvas.drawString(MARGIN, y, "Senior Angular Developer  ·  3D / WebGL")
        y -= 16
        canvas.setFont("Helvetica", 9.2)
        canvas.setFillColor(MUTED)
        x = MARGIN
        for text, url in (
            ("parchevscky17@gmail.com", "mailto:parchevscky17@gmail.com"),
            ("+48 572 017 314", "tel:+48572017314"),
            ("Warsaw, Poland", ""),
        ):
            if url:
                x = draw_link(canvas, text, x, y, url)
            else:
                canvas.drawString(x, y, text)
                x += stringWidth(text, "Helvetica", 9.2)
            canvas.setFillColor(MUTED)
            canvas.drawString(x + 7, y, "|")
            x += 18
        y -= 14
        x = MARGIN
        x = draw_link(canvas, "andreiparcheuski.com", x, y, "https://andreiparcheuski.com")
        canvas.setFillColor(MUTED)
        canvas.drawString(x + 7, y, "|")
        draw_link(canvas, "linkedin.com/in/andrewpar14", x + 18, y, "https://linkedin.com/in/andrewpar14")
        y -= 15
    canvas.setStrokeColor(RULE)
    canvas.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
    return y - 18


def section(canvas: Canvas, title: str, y: float) -> float:
    canvas.setFont("Helvetica-Bold", 11.5)
    canvas.setFillColor(TEAL)
    canvas.drawString(MARGIN, y, title.upper())
    y -= 7
    canvas.setStrokeColor(RULE)
    canvas.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
    return y - 15


def paragraph(canvas: Canvas, text: str, y: float, size: float = 10.2, leading: float = 14) -> float:
    canvas.setFont("Helvetica", size)
    canvas.setFillColor(INK)
    for line in wrap(text, "Helvetica", size, CONTENT_WIDTH):
        canvas.drawString(MARGIN, y, line)
        y -= leading
    return y - 5


def skills(canvas: Canvas, y: float) -> float:
    groups = [
        ("Angular & Architecture", "Angular (9+ yrs), Signals, NgRx, Signal Store, RxJS, Reactive Forms, Angular Material"),
        ("3D & AR/XR", "Three.js, WebGL, Unreal Engine pixel streaming, 8th Wall, Wikitude"),
        ("React & Web", "React, Next.js, SSR, React Query, Redux Toolkit, TypeScript, JavaScript, HTML5, CSS, SCSS"),
        ("Quality & Delivery", "Playwright, Vitest, Jest, GraphQL, REST, CI/CD, Docker, AWS, Azure, i18n, SEO"),
    ]
    column_width = (CONTENT_WIDTH - 22) / 2
    for index, (label, value) in enumerate(groups):
        x = MARGIN + (index % 2) * (column_width + 22)
        row_y = y - (index // 2) * 38
        canvas.setFont("Helvetica-Bold", 9.2)
        canvas.setFillColor(INK)
        canvas.drawString(x, row_y, f"{label}:")
        value_y = row_y - 12
        canvas.setFont("Helvetica", 8.9)
        for line in wrap(value, "Helvetica", 8.9, column_width):
            canvas.drawString(x, value_y, line)
            value_y -= 11
    return y - 83


def job(canvas: Canvas, company: str, title: str, date: str, bullets: list[str], y: float) -> float:
    canvas.setFont("Helvetica-Bold", 10.5)
    canvas.setFillColor(INK)
    canvas.drawString(MARGIN, y, f"{company} — {title}")
    canvas.setFont("Helvetica", 9.4)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_WIDTH - MARGIN, y, date)
    y -= 14
    canvas.setFont("Helvetica", 9.6)
    for bullet in bullets:
        lines = wrap(bullet, "Helvetica", 9.6, CONTENT_WIDTH - 18)
        canvas.setFillColor(TEAL)
        canvas.rect(MARGIN + 1, y - 5, 6, 6, stroke=0, fill=1)
        canvas.setFillColor(INK)
        for line_index, line in enumerate(lines):
            canvas.drawString(MARGIN + 15, y, line)
            y -= 12
        y -= 1
    return y - 7


def education(canvas: Canvas, degree: str, date: str, y: float) -> float:
    canvas.setFont("Helvetica-Bold", 10.2)
    canvas.setFillColor(INK)
    canvas.drawString(MARGIN, y, degree)
    canvas.setFont("Helvetica", 9.4)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_WIDTH - MARGIN, y, date)
    y -= 13
    canvas.setFont("Helvetica", 9.8)
    canvas.setFillColor(INK)
    canvas.drawString(MARGIN, y, "Belarusian State University")
    return y - 18


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas = Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    canvas.setTitle("Andrei Parcheuski — Senior Angular Developer")
    canvas.setAuthor("Andrei Parcheuski")

    y = draw_header(canvas)
    y = section(canvas, "Professional Summary", y)
    y = paragraph(
        canvas,
        "Senior Angular Developer with 11+ years delivering production web applications across healthcare, e-commerce, LMS, and AR/XR. 9+ years in Angular (Signals, NgRx, RxJS, Reactive Forms) and 3+ years leading frontend teams. Combines frontend architecture and performance expertise with deep 3D web experience (Three.js, WebGL, Unreal Engine pixel streaming). Author of 8 published npm packages; strong focus on testing, mentoring, and reliable delivery.",
        y,
    )
    y = section(canvas, "Technical Skills", y)
    y = skills(canvas, y)
    y = section(canvas, "Work Experience", y)
    y = job(canvas, "3D Source", "Senior Front-End Developer", "Oct 2023 – Present  |  Warsaw, Poland", [
        "Architect and build Angular and Three.js product configurators for ~30 enterprise projects on a shared 80,000-line codebase.",
        "Integrated real-time Unreal Engine pixel streaming for high-fidelity 3D rendering in the Angular front end.",
        "Authored and published 8 @3dsource npm packages: shared UI components, data loaders, and configurator APIs.",
        "Built an external iframe integration API with two-way interaction and strengthened core-module quality to 95% test coverage using Playwright and Vitest.",
    ], y)
    y = job(canvas, "ITRex Group", "Front-End Team Lead", "Nov 2021 – Sep 2023  |  Remote, US", [
        "Led a 4-person frontend team across two flagship projects; shipped ~20 major features on a 2-week release cycle and mentored 2 developers.",
        "Owned React/Next.js frontend architecture for a sports-industry vendor-management platform, from schema design to Azure deployment.",
        "Delivered multi-language i18n with full LTR/RTL support, dynamic routing, responsive layouts, and hybrid iOS/Android WebView support.",
        "Partnered with management and third parties on performance and SEO; reviewed pull requests and owned feature estimates.",
    ], y)
    y = job(canvas, "ITRex Group", "Front-End Developer", "Dec 2019 – Nov 2021  |  Remote, US", [
        "Delivered 4 key projects using React, Angular, and 8th Wall.",
        "Built a high-traffic Angular marketplace with RxJS and Material UI; owned architecture, AR asset display, testing, and Heroku deployment.",
    ], y)

    canvas.showPage()
    y = draw_header(canvas, compact=True)
    y = section(canvas, "Additional Experience", y)
    y = job(canvas, "HQSoftware", "Full-Stack Web Developer", "Nov 2018 – Dec 2019  |  Remote, US", [
        "Lead developer on a 9-person team; drove product definition and requirements analysis, and synchronized desktop and mobile XR experiences.",
        "Selected and owned the technology stack: Three.js, Angular, Angular Material, and NgRx.",
    ], y)
    y = job(canvas, "HQSoftware", "Front-End Web Developer", "Jul 2017 – Nov 2018  |  Remote, US", [
        "Built a client web platform from scratch for authoring AR and VR scenes.",
        "Developed PWA and SPA experiences with Angular, Three.js, Wikitude, and a custom XR Builder.",
    ], y)
    y = job(canvas, "IBA Group", "Full-Stack Web Developer", "Apr 2016 – Jun 2017  |  Minsk, Belarus", [
        "Migrated a legacy Learning Management System to a modern React UI on a Ruby on Rails backend.",
    ], y)
    y = job(canvas, "SoftClub", "JavaScript Developer", "Mar 2015 – Apr 2016  |  Minsk, Belarus", [
        "Built automated banking-data dashboards with JavaScript, QlikView, and SQL.",
    ], y)
    y = section(canvas, "Education", y)
    y = education(canvas, "M.Sc. in Applied Mathematics and Computer Science", "2016 – 2017  |  Minsk, Belarus", y)
    y = education(canvas, "B.Sc. in Applied Mathematics (Optimization Methods)", "2011 – 2016  |  Minsk, Belarus", y)
    y = section(canvas, "Languages", y)
    canvas.setFont("Helvetica", 10)
    canvas.setFillColor(INK)
    canvas.drawString(MARGIN, y, "Russian (Native)  ·  Belarusian (Native)  ·  English (Professional Working)")
    y -= 28
    y = section(canvas, "Selected Public Proof", y)
    canvas.setFont("Helvetica", 9.8)
    canvas.setFillColor(INK)
    canvas.drawString(MARGIN, y, "Portfolio:")
    draw_link(canvas, "andreiparcheuski.com", MARGIN + 43, y, "https://andreiparcheuski.com")
    canvas.setFillColor(INK)
    canvas.drawString(MARGIN + 182, y, "|  Published packages:")
    draw_link(canvas, "@3dsource", MARGIN + 297, y, "https://www.npmjs.com/search?q=3dsource")
    canvas.save()


if __name__ == "__main__":
    main()
