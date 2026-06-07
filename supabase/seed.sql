-- Seed blog posts for SEO (run after migrations with service role)

INSERT INTO blog_posts (slug, title, excerpt, content, category, status, published_at, seo_title, seo_description) VALUES
(
  'complete-guide-ats-friendly-resumes-2026',
  'Complete Guide to ATS-Friendly Resumes in 2026',
  'Learn how to format, keyword-optimize, and structure your resume to pass applicant tracking systems.',
  E'# Complete Guide to ATS-Friendly Resumes in 2026\n\nApplicant tracking systems (ATS) scan resumes before a human ever sees them. Here is how to win that first filter.\n\n## Use a clean, single-column layout\nAvoid tables, text boxes, and graphics that parsers cannot read.\n\n## Match keywords from the job description\nMirror role-specific skills and tools naturally in your experience bullets.\n\n## Standard section headings\nUse **Experience**, **Education**, and **Skills** — not creative alternatives.\n\n## Export as PDF with selectable text\nEnsure your file is machine-readable, not a scanned image.\n\n---\n\n**Ready to build yours?** Try the [Novora Resume Builder](/resume-builder) — free ATS-friendly templates included.',
  'Resume Writing',
  'published',
  now() - interval '7 days',
  'ATS-Friendly Resume Guide 2026 | Novora',
  'Step-by-step guide to writing ATS-friendly resumes that pass screening software in 2026.'
),
(
  'instagram-captions-that-convert',
  'How to Write Instagram Captions That Convert',
  'Proven caption formulas, hooks, and CTAs to turn scrollers into customers.',
  E'# How to Write Instagram Captions That Convert\n\nGreat visuals get attention. Great captions get action.\n\n## Start with a hook\nOpen with a question, bold claim, or relatable pain point in the first line.\n\n## Tell a micro-story\nThree sentences of context build trust faster than a product pitch.\n\n## End with one clear CTA\n"Save this", "DM us", or "Link in bio" — pick one.\n\n## Use 3-5 niche hashtags\nQuality beats quantity for discoverability.\n\n---\n\nGenerate captions instantly with [Novora Social Media Generator](/social-media-generator).',
  'Social Media Marketing',
  'published',
  now() - interval '6 days',
  'Instagram Captions That Convert | Novora',
  'Learn caption formulas and CTAs that drive engagement and sales on Instagram.'
),
(
  'ai-product-descriptions-ecommerce',
  'AI Product Descriptions: The E-commerce Copy Guide',
  'Write short, long, and SEO product descriptions that rank and sell.',
  E'# AI Product Descriptions: The E-commerce Copy Guide\n\nProduct pages need three layers of copy: a punchy short description, a detailed long form, and an SEO meta description.\n\n## Short description (above the fold)\nLead with the primary benefit in under 160 characters.\n\n## Long description (below the fold)\nCover features, use cases, and objections in scannable bullets.\n\n## SEO meta description\nTarget one primary keyword; stay under 155 characters.\n\n---\n\nCreate all three formats with [Novora Product Description Generator](/product-description-generator).',
  'E-commerce Marketing',
  'published',
  now() - interval '5 days',
  'AI Product Descriptions for E-commerce | Novora',
  'Guide to writing conversion-focused and SEO-optimized product descriptions with AI.'
),
(
  '50-social-media-hooks-small-business',
  '50 Social Media Hooks for Small Businesses',
  'Copy-paste hooks for Instagram, LinkedIn, TikTok, and Facebook posts.',
  E'# 50 Social Media Hooks for Small Businesses\n\nHooks stop the scroll. Here are fifty you can adapt today.\n\n1. "Nobody talks about this, but..."\n2. "I wasted $X before I learned..."\n3. "3 signs you need to..."\n4. "Stop doing X. Start doing Y."\n5. "The truth about [industry] that experts won''t say"\n\n*(...and 45 more in the full guide)*\n\n---\n\nGenerate custom hooks for your niche with [Novora](/social-media-generator).',
  'Social Media Marketing',
  'published',
  now() - interval '4 days',
  '50 Social Media Hooks for Small Business | Novora',
  'Fifty proven social media hooks small businesses can use to boost engagement.'
),
(
  'linkedin-post-formula-2026',
  'The LinkedIn Post Formula That Works in 2026',
  'Structure professional posts that build authority and drive profile visits.',
  E'# The LinkedIn Post Formula That Works in 2026\n\n## Line 1: Contrarian or insight hook\n## Lines 2-4: Story or data point\n## Lines 5-7: Actionable takeaway\n## Line 8: Question to drive comments\n\nConsistency beats virality on LinkedIn. Post 3x per week with this structure.\n\n---\n\n[Generate LinkedIn posts with Novora](/social-media-generator).',
  'Social Media Marketing',
  'published',
  now() - interval '3 days',
  'LinkedIn Post Formula 2026 | Novora',
  'A proven LinkedIn post structure for professionals and founders in 2026.'
),
(
  'resume-keywords-by-industry',
  'Resume Keywords by Industry: What ATS Systems Look For',
  'Industry-specific keyword lists for tech, healthcare, marketing, and finance roles.',
  E'# Resume Keywords by Industry\n\nATS systems match resumes against job descriptions. Include relevant keywords naturally.\n\n## Technology\nPython, AWS, CI/CD, Agile, SQL, REST APIs\n\n## Marketing\nSEO, Google Analytics, content strategy, CRM, A/B testing\n\n## Healthcare\nHIPAA, EHR, patient care, clinical documentation\n\n## Finance\nFinancial modeling, Excel, GAAP, risk analysis, Bloomberg\n\n---\n\nBuild an optimized resume with [Novora Resume Builder](/resume-builder).',
  'Resume Writing',
  'published',
  now() - interval '2 days',
  'Resume Keywords by Industry | Novora',
  'Industry-specific ATS keywords for tech, marketing, healthcare, and finance resumes.'
),
(
  'ai-content-creation-workflow',
  'AI Content Creation Workflow for Solo Founders',
  'A weekly system to plan, generate, and publish content without burnout.',
  E'# AI Content Creation Workflow for Solo Founders\n\n## Monday: Plan themes and offers\n## Tuesday: Batch social captions\n## Wednesday: Product copy updates\n## Thursday: Blog draft\n## Friday: Schedule and review analytics\n\nAI handles first drafts. You add voice and strategy.\n\n---\n\nStart with [Novora](/features) — three AI tools, one dashboard.',
  'AI Productivity',
  'published',
  now() - interval '1 day',
  'AI Content Workflow for Founders | Novora',
  'Weekly AI-powered content workflow for solo founders and small teams.'
),
(
  'etsy-product-description-tips',
  'Etsy Product Description Tips That Increase Sales',
  'How to write Etsy listings that rank in search and convert browsers to buyers.',
  E'# Etsy Product Description Tips That Increase Sales\n\n## Front-load keywords in the first 160 characters\nEtsy search weighs opening text heavily.\n\n## Describe the buyer''s moment\n"When you need a gift that feels personal..."\n\n## Include size, materials, and care instructions\nReduce message volume and returns.\n\n## Add a soft CTA\n"Order by Friday for weekend delivery."\n\n---\n\n[Generate Etsy-ready descriptions](/product-description-generator) with Novora.',
  'E-commerce Marketing',
  'published',
  now(),
  'Etsy Product Description Tips | Novora',
  'Etsy listing copy tips to improve search ranking and conversion rates.'
);
