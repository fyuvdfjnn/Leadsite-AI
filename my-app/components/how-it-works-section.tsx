import { Upload, Wand2, Edit, Rocket } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      step: "01",
      title: "Upload Your Content",
      description:
        "Drop your product PDF, PPT, or paste your existing website URL. Our AI reads and understands your business.",
    },
    {
      icon: Wand2,
      step: "02",
      title: "AI Generates Your Site",
      description: "In under 2 minutes, AI creates a complete website with optimized content, images, and structure.",
    },
    {
      icon: Edit,
      step: "03",
      title: "Edit with Ease",
      description:
        "Use our intuitive block editor to fine-tune. Click to edit text, drag to reorder, or let AI regenerate sections.",
    },
    {
      icon: Rocket,
      step: "04",
      title: "Publish & Grow",
      description: "One-click deploy with built-in AI customer service. Start receiving inquiries from day one.",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-foreground text-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">From documents to website in 4 steps</h2>
          <p className="text-lg text-background/70 max-w-2xl mx-auto text-pretty">
            No design skills needed. No coding required. Just your business content and a few minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-background/20" />
              )}

              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-background text-foreground flex items-center justify-center relative">
                  <item.icon className="w-10 h-10" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-background/70 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
