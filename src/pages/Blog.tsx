import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, User, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import Navigation from "@/components/Navigation";
import { blogPosts, categories, getFeaturedPost } from "@/data/blogData";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPost = getFeaturedPost();

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && !post.featured;
  });

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
          {featuredPost && (
            <section className="mb-16">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer border-primary/20">
                <Link to={`/blog/${featuredPost.slug}`}>
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
                </Link>
              </Card>
            </section>
          )}

          {/* Search and Filter */}
          <section className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button 
                  key={category} 
                  variant={selectedCategory === category ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                  <Link to={`/blog/${post.slug}`}>
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
                    </CardContent>
                  </Link>
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
              <Link to="/auth">
                <Button>
                  Subscribe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;