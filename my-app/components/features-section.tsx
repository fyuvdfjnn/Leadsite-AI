import { Bot, Layers, Search, Zap, Globe, Edit3 } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Generation",
      description:
        "Upload your documents and let AI understand your business, products, and brand to create the perfect website.",
    },
    {
      icon: Bot,
      title: "Built-in AI Customer Service",
      description:
        "Every website comes with an intelligent chatbot trained on your content, ready to answer customer inquiries 24/7.",
    },
    {
      icon: Edit3,
      title: "Block Editor",
      description:
        "Edit like you're using Notion. Click to edit text, drag to reorder, and add new blocks effortlessly.",
    },
    {
      icon: Layers,
      title: "Smart Templates",
      description:
        "AI recommends the best template based on your industry and content. Choose from 50+ professionally designed options.",
    },
    {
      icon: Search,
      title: "SEO Optimized",
      description:
        "Auto-generated meta tags, semantic HTML, and sitemap ensure your site ranks well on search engines.",
    },
    {
      icon: Globe,
      title: "One-Click Deploy",
      description: "Publish your website instantly with a free subdomain, or connect your custom domain in seconds.",
    },
  ]

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Everything you need to grow globally</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            From AI content generation to intelligent customer service, LeadSite AI provides all the tools you need to
            establish your professional presence overseas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
