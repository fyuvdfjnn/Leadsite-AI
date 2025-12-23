"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const categories = ["All", "SaaS", "AI Product", "App Landing", "B2B Industrial", "Agency", "Professional Services"]

const templates = [
  {
    id: 1,
    name: "Industrial Pro",
    category: "B2B Industrial",
    style: "Minimal Professional",
    image: "/img1.png",
  },
  {
    id: 2,
    name: "Tech Forward",
    category: "SaaS",
    style: "Modern & Bold",
    image: "/img2.png",
  },
  {
    id: 3,
    name: "Brand Studio",
    category: "AI Product",
    style: "Visual Impact",
    image: "/img3.png",
  },
  {
    id: 4,
    name: "Corporate Edge",
    category: "Professional Services",
    style: "Clean & Trust",
    image: "/img4.png",
  },
  {
    id: 5,
    name: "Factory Direct",
    category: "B2B Industrial",
    style: "Product Focused",
    image: "/img5.png",
  },
  {
    id: 6,
    name: "Innovation Lab",
    category: "AI Product",
    style: "Futuristic",
    image: "/img6.png",
  },
  {
    id: 7,
    name: "Agency Starter",
    category: "Agency",
    style: "Creative Bold",
    image: "/img7.png",
  },
  {
    id: 8,
    name: "Fintech Pro",
    category: "SaaS",
    style: "Trust & Security",
    image: "/img8.png",
  },
  {
    id: 9,
    name: "App Landing",
    category: "App Landing",
    style: "Mobile First",
    image: "/img9.png",
  },
]

export function TemplatesSection() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredTemplates =
    activeCategory === "All" ? templates : templates.filter((t) => t.category === activeCategory)

  return (
    <section id="templates" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">AI-recommended templates</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our AI analyzes your content and recommends the perfect template. Or browse our library of 50+
            professionally designed options.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid - 3x3 Layout */}
        <div className="grid grid-cols-3 gap-5 max-w-6xl mx-auto">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative bg-background rounded-2xl overflow-hidden border border-border hover:border-foreground/20 transition-all duration-300 hover:shadow-xl cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={template.image || "/placeholder.svg"}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Hover Overlay with Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" className="bg-white text-black border-0 hover:bg-white/90">
                    View
                  </Button>
                  <Button size="sm" className="gap-1">
                    Use Template
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{template.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{template.style}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Templates
          </Button>
        </div>
      </div>
    </section>
  )
}
