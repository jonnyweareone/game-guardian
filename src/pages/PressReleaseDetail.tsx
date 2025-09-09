import { useParams, Navigate, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Share2 } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const pressReleaseContent = {
  "2025-09-09-guardian-os-launch": {
    title: "Guardian AI Limited Announces Guardian OS: The World's First Operating System Built to Keep Children Safe While They Play, Learn, and Explore",
    date: "2025-09-09",
    author: "Guardian AI Limited",
    summary: "Guardian OS launches 12 September 2025. The first OS built for child safety—safe by design—with AI protection, family app store, and a parent dashboard. Freemium with 30-day trial; premium from £8.99 single / £14.99 family.",
    tags: ["Guardian OS", "Online Safety", "Parental Controls", "Kids Tech", "AI"],
    hero_image: "/lovable-uploads/6fce88ea-da31-4e50-a2c6-268258c9655f.png",
    logo_image: "/lovable-uploads/guardian-logo-shield-text-dark.png",
    contact_email: "contact@gameguardian.ai",
    content: `
## FOR IMMEDIATE RELEASE

**Portsmouth, UK – 9 September 2025** – Guardian AI Limited today announced the upcoming launch of **Guardian OS**, the first operating system in the world designed from the ground up to protect children online. More than just a filter or an app, Guardian OS is *safe by design* — combining built-in protection with a platform for children to **play, learn, and explore** the digital world with confidence.

Launching officially on **12 September 2025**, Guardian OS is based on **Ubuntu 24.04 LTS**, one of the world's most trusted and secure open-source systems, enhanced with **AI-powered parental controls**. This unique combination makes Guardian OS the first complete computing environment designed around the needs of families in a digital age.

> "The internet wasn't created with children in mind. Parents are forced to choose between over-restricting their kids or letting them roam unsafe spaces," said **Jonny Robinson**, founder of Guardian AI Limited. "**Guardian OS changes that.** It's a foundation built for children to play, learn, and explore safely — with parents in control, but without having to hover."

---

## The First of Its Kind

Guardian OS is more than an operating system — it's a **complete family environment**. Children can enjoy games, creative apps, and educational tools, while parents have peace of mind that protection is working in the background.

**Key features include:**
- ✅ **Safe by Design** – protection isn't optional; it's built into the system itself.
- 🤖 **AI Reflex Protection** – real-time AI that blurs unsafe images, mutes toxic voice chats, and blocks grooming attempts instantly.
- 🌐 **Built-In Safe Browsing** – Guardian DNS and NextDNS block harmful sites automatically.
- 🎮 **Family-Friendly App Store** – every app comes with age ratings, warnings, and parent approval prompts.
- ☁️ **Parental Dashboard** – manage devices, screen time, and app approvals from anywhere.
- 📊 **Activity Insights** – clear reports on learning, gaming, and browsing habits.
- 👤 **Portable Profiles** – children's safety settings follow them to any Guardian OS device.
- 🔐 **Trusted Security** – built on Ubuntu 24.04 LTS, with encryption and secure device management.

---

## Play, Learn, Explore

Guardian OS is designed not to limit children, but to **empower them**. Kids can access safe games, explore age-appropriate websites, and use creative and educational apps without stumbling into harm. Parents gain visibility, guidance, and reassurance — while children keep their independence.

---

## Free to Start – With Affordable Premium Options

Guardian OS is **free for personal and educational use**. Core protections, including grooming detection, are always included. Families also receive a **30-day free trial** of Guardian Reflex and Advanced Protection.

**Premium pricing:** **£8.99/month** (single-child) and **£14.99/month** (family).  
Guardian AI Limited is also preparing a **bundle tier with cloud gaming platforms**, expected to launch in **Q1 2026**.

---

## What's Next: Nova Virtual Assistant

Guardian AI Limited already has its next update in the works: **Nova**, a child-friendly **virtual assistant** built directly into Guardian OS. Nova will help children with homework, guide them through safe online activities, and support parents by reinforcing healthy digital habits. Nova is planned as the first major feature update after launch, extending Guardian OS from a protective platform to a supportive one.

---

## Screenshots

**Parent Dashboard (Web)**  
![Guardian OS Parent Dashboard](/lovable-uploads/b5791501-f943-40a1-8ee8-44fad233dfea.png)
*Manage your family's digital safety from anywhere*

**Desktop Experience**  
![Guardian OS Desktop](/lovable-uploads/6fce88ea-da31-4e50-a2c6-268258c9655f.png)
*A clean, familiar Ubuntu-based desktop tailored for families*

---

## Live Stream Launch Event

To celebrate the launch, Guardian AI Limited is hosting a **live stream on child online safety** on **12th September**. Parents and experts will discuss how technology like Guardian OS can finally close the safety gaps left by today's platforms. Families will also see Guardian OS in action.

📺 Watch live at: **https://gameguardian.ai/online-safety-livestream**

---

## Availability & Pre-Registration

Guardian OS officially launches **12 September 2025**. Families can **pre-register today** to be first in line for downloads and early access to advanced features.

👉 Pre-register now at **https://gameguardian.ai/guardian-os**

---

**About Guardian AI Limited**  
Guardian AI Limited develops technology to protect children in the digital world. Its flagship product, Guardian OS, is the first operating system designed with child safety at its core, combining trusted open-source technology with advanced AI protections. Future updates, including the Nova Virtual Assistant, will continue to expand Guardian OS as the leading safe platform for families.

**Media Contact:**  
Email: **contact@gameguardian.ai**  
Website: **https://gameguardian.ai**
    `
  }
};

export default function PressReleaseDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug || !pressReleaseContent[slug as keyof typeof pressReleaseContent]) {
    return <Navigate to="/press-releases" replace />;
  }
  
  const release = pressReleaseContent[slug as keyof typeof pressReleaseContent];
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: release.title,
          text: release.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatInline = (text: string) => {
    if (!text) return '';
    let t = text;
    // Bold **text**
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic *text* (not part of **bold**)
    t = t.replace(/(^|\s)\*(?!\*)([^*]+?)\*(?!\*)((?=\s|$|[.,;:!?]))/g, '$1<em>$2</em>');
    // Links [text](url)
    t = t.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline decoration-primary">$1<\/a>');
    return t;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${release.title} | Guardian AI Press Release`}
        description={`${release.summary} Read the full press release from Guardian AI Limited.`}
        keywords={`${release.tags.join(', ')}, Guardian AI Limited, press release, announcement`}
        canonicalUrl={`https://gameguardian.ai/press-releases/${slug}`}
        ogImage={release.hero_image}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": release.title,
          "description": release.summary,
          "author": {
            "@type": "Organization",
            "name": release.author
          },
          "publisher": {
            "@type": "Organization", 
            "name": "Guardian AI Limited",
            "logo": {
              "@type": "ImageObject",
              "url": "https://gameguardian.ai/lovable-uploads/guardian-logo-shield-text-dark.png"
            }
          },
          "datePublished": release.date,
          "image": release.hero_image,
          "url": `https://gameguardian.ai/press-releases/${slug}`
        }}
      />
      
      {/* Logo Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {release.logo_image && (
            <Link to="/" className="inline-block">
              <img 
                src={release.logo_image} 
                alt="Guardian AI Logo"
                className="h-12 hover:opacity-80 transition-opacity"
              />
            </Link>
          )}
        </div>
      </div>
      
      <article className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {new Date(release.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{release.author}</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {release.title}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {release.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button 
                asChild
                variant="outline" 
                size="sm"
              >
                <a href={`mailto:${release.contact_email}`} className="inline-flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Media Contact
                </a>
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          {release.hero_image && (
            <div className="mb-8">
              <img 
                src={release.hero_image} 
                alt={release.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ 
              __html: release.content
                .split('\n')
                .filter(line => !line.match(/^##\s*FOR\s+IMMEDIATE\s+RELEASE\s*$/i))
                .map(line => {
                  // Handle headers
                  if (line.startsWith('##')) {
                    return `<h2 class="text-2xl font-bold mt-8 mb-4">${formatInline(line.replace('## ', ''))}</h2>`;
                  }
                  
                  // Handle blockquotes
                  if (line.startsWith('> ')) {
                    const quoteLine = formatInline(line.replace('> ', ''));
                    return `<blockquote class="border-l-4 border-primary pl-6 py-4 my-6 bg-muted/50 rounded-r-lg"><p class="text-lg italic font-medium">${quoteLine}</p></blockquote>`;
                  }
                  
                  // Handle list items
                  if (line.startsWith('- ')) {
                    const listLine = formatInline(line.replace('- ', ''));
                    return `<li class="mb-2">${listLine}</li>`;
                  }
                  
                  // Handle images
                  if (line.includes('![')) {
                    const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
                    if (imgMatch) {
                      return `<div class="my-8"><img src="${imgMatch[2]}" alt="${imgMatch[1]}" class="w-full rounded-lg shadow-md" /><p class="text-center text-sm text-muted-foreground mt-2 italic">${imgMatch[1]}</p></div>`;
                    }
                  }
                  
                  // Handle italic-only caption lines (single asterisks spanning whole line)
                  if (line.startsWith('*') && line.endsWith('*') && !line.includes('**')) {
                    return `<p class="text-center text-sm text-muted-foreground italic mb-6">${line.replace(/\*/g, '')}</p>`;
                  }
                  
                  // Handle horizontal rules
                  if (line.trim() === '---') {
                    return `<hr class="my-8 border-border" />`;
                  }
                  
                  // Standalone bold lines
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return `<p class="font-semibold text-lg mb-4">${formatInline(line)}</p>`;
                  }
                  
                  // Handle regular paragraphs with inline formatting
                  if (line.trim()) {
                    const formattedLine = formatInline(line);
                    return `<p class="mb-4 leading-relaxed">${formattedLine}</p>`;
                  }
                  
                  return '';
                })
                .join('')
            }} />
          </div>
        </div>
      </article>
    </div>
  );
}