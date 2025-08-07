import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navigation from "@/components/Navigation";

const Blog = () => {
  const navigate = useNavigate();

  const featuredPost = {
    title: "AI-Powered Gaming Safety: Protecting the Next Generation of Gamers",
    excerpt: "As online gaming becomes increasingly social, Game Guardian AI introduces revolutionary technology to create safer digital playgrounds for children worldwide.",
    category: "Technology",
    date: "2025-08-07",
    readTime: "6 min read",
    author: "Guardian AI Research Team",
    slug: "ai-powered-gaming-safety"
  };

  const blogPosts = [
    {
      title: "The Hidden Dangers of Voice Chat in Popular Games",
      excerpt: "From Fortnite to Minecraft, we explore how predators exploit voice chat features and what parents need to know to keep their children safe.",
      category: "Safety Guide",
      date: "2025-08-06",
      readTime: "8 min read",
      author: "Guardian Safety Team",
      slug: "voice-chat-dangers"
    },
    {
      title: "Machine Learning Meets Child Protection: How Our AI Works",
      excerpt: "A deep dive into the neural networks and natural language processing that power Game Guardian's real-time threat detection system.",
      category: "Technology",
      date: "2025-08-05",
      readTime: "12 min read",
      author: "Guardian AI Engineering Team",
      slug: "ai-technology-explained"
    },
    {
      title: "Setting Healthy Gaming Boundaries: A Psychologist's Perspective",
      excerpt: "Evidence-based strategies for creating positive gaming experiences while maintaining safety and balance in your child's digital life.",
      category: "Parenting",
      date: "2025-08-04",
      readTime: "7 min read",
      author: "Guardian Child Psychology Team",
      slug: "healthy-gaming-boundaries"
    },
    {
      title: "Game Guardian OS Mini: Transform Your Raspberry Pi into a Safety Hub",
      excerpt: "Step-by-step guide to installing our lightweight operating system on affordable hardware for comprehensive gaming protection.",
      category: "Tutorial",
      date: "2025-08-03",
      readTime: "9 min read",
      author: "Guardian Technical Support Team",
      slug: "raspberry-pi-setup-guide"
    },
    {
      title: "The Evolution of Online Gaming Threats: 2025 Report",
      excerpt: "Our annual analysis of emerging threats in online gaming environments and how artificial intelligence is revolutionizing child protection.",
      category: "Research",
      date: "2025-08-02",
      readTime: "15 min read",
      author: "Guardian Research Team",
      slug: "2025-gaming-threats-report"
    },
    {
      title: "Real Families, Real Protection: Guardian Success Stories",
      excerpt: "How families across the UK are using Game Guardian technology to create safer gaming experiences for their children.",
      category: "Testimonials",
      date: "2025-08-01",
      readTime: "5 min read",
      author: "Guardian Community Team",
      slug: "family-success-stories"
    }
  ];

  const categories = ["All", "Safety Guide", "Tutorial", "Technology", "Parenting", "Product Guide", "Press Release", "Testimonials"];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Game Guardian Blog",
    "description": "Expert insights, guides, and updates on child safety in online gaming environments",
    "url": "https://guardianai.co.uk/blog"
  };

  return (
    <>
      <SEOHead
        title="Game Guardian Blog - Expert Insights on Gaming Safety"
        description="Stay informed with expert insights, safety guides, and the latest updates on protecting children in online gaming environments. Tips for parents and technical guides."
        keywords="gaming safety blog, child protection online, parenting guides, ai safety technology, game guardian updates"
        canonicalUrl="https://guardianai.co.uk/blog"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Game Guardian Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Expert insights, safety guides, and the latest updates on protecting children in online gaming environments
            </p>
          </div>

          {/* Featured Post */}
          <section className="mb-16">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer border-primary/20" onClick={() => navigate(`/blog/${featuredPost.slug}`)}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="default">Featured</Badge>
                  <Badge variant="outline">{featuredPost.category}</Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl">{featuredPost.title}</CardTitle>
                <CardDescription className="text-lg mt-4">{featuredPost.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Category Filter */}
          <section className="mb-12">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button key={category} variant="outline" size="sm">
                  {category}
                </Button>
              ))}
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/blog/${post.slug}`)}>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit">{post.category}</Badge>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      Read More
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Newsletter Signup */}
          <div className="text-center bg-card rounded-lg p-8 border">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest insights on gaming safety, product updates, and expert parenting tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-foreground"
              />
              <Button onClick={() => navigate("/auth")}>
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;