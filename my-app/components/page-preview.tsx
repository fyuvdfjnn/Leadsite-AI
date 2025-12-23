"use client"

import type { ActivePage } from "./preview-content"
import { useState, useRef } from "react"
import { RichTextEditor } from "./rich-text-editor"
import { BlockToolbar } from "./block-toolbar"
import { AIChatbot } from "./ai-chatbot"
import { SelectElementProvider } from "./select-element-provider"
import type { DetectedElement } from "@/lib/element-detector"

interface PagePreviewProps {
  page: ActivePage
  isEditing: boolean
  selectElementEnabled?: boolean
}

export function PagePreview({ page, isEditing, selectElementEnabled = false }: PagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 模块操作回调
  const handleModuleDelete = (element: DetectedElement) => {
    if (confirm('确定要删除这个模块吗？')) {
      element.element.remove()
    }
  }

  const handleModuleDuplicate = (element: DetectedElement) => {
    const clone = element.element.cloneNode(true) as HTMLElement
    element.element.parentNode?.insertBefore(clone, element.element.nextSibling)
  }

  const handleModuleMove = (element: DetectedElement, direction: 'up' | 'down') => {
    const parent = element.element.parentElement
    if (!parent) return

    if (direction === 'up') {
      const prev = element.element.previousElementSibling
      if (prev) {
        parent.insertBefore(element.element, prev)
      }
    } else {
      const next = element.element.nextElementSibling
      if (next) {
        parent.insertBefore(next, element.element)
      }
    }
  }

  const handleModuleAdd = (element: DetectedElement, position: 'before' | 'after') => {
    const newSection = document.createElement('section')
    newSection.setAttribute('data-component', 'section')
    newSection.className = 'px-8 py-16 bg-muted/30'
    newSection.innerHTML = `
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-4">新模块</h2>
        <p class="text-muted-foreground">点击编辑此模块的内容</p>
      </div>
    `
    
    if (position === 'before') {
      element.element.parentNode?.insertBefore(newSection, element.element)
    } else {
      element.element.parentNode?.insertBefore(newSection, element.element.nextSibling)
    }
  }

  return (
    <SelectElementProvider 
      enabled={selectElementEnabled}
      containerRef={containerRef as React.RefObject<HTMLElement>}
      onModuleDelete={handleModuleDelete}
      onModuleDuplicate={handleModuleDuplicate}
      onModuleMove={handleModuleMove}
      onModuleAdd={handleModuleAdd}
    >
      <div ref={containerRef} className="h-full overflow-auto">
      {page === "home" && <HomePagePreview isEditing={isEditing} />}
      {page === "products" && <ProductsPagePreview isEditing={isEditing} />}
      {page === "about" && <AboutPagePreview isEditing={isEditing} />}
      {page === "contact" && <ContactPagePreview isEditing={isEditing} />}

      {/* AI Chatbot Widget */}
      <AIChatbot
        botName="TechMfg Support"
        welcomeMessage="Hi! I'm here to help you learn about our industrial machinery and solutions. What can I assist you with today?"
        data-no-edit
      />
    </div>
    </SelectElementProvider>
  )
}

function HomePagePreview({ isEditing }: { isEditing: boolean }) {
  const [heroTitle, setHeroTitle] = useState("Industrial Solutions for Global Markets")
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Leading manufacturer of precision machinery and equipment. Serving clients in 50+ countries with quality, reliability, and innovation.",
  )
  const [featuresTitle, setFeaturesTitle] = useState("Why Choose Us")
  const [features, setFeatures] = useState([
    { id: 1, title: "Quality Assured", desc: "ISO 9001 certified manufacturing processes" },
    { id: 2, title: "Global Reach", desc: "Serving 50+ countries with local support" },
    { id: 3, title: "Innovation First", desc: "R&D-driven product development" },
  ])
  const [productsTitle, setProductsTitle] = useState("Our Products")
  const [ctaTitle, setCtaTitle] = useState("Ready to Partner with Us?")
  const [ctaText, setCtaText] = useState(
    "Get in touch for a custom quote or to learn more about our products.",
  )

  return (
    <div className="min-h-full">
      {/* Navigation */}
      <nav 
        data-component="header" 
        className="px-8 py-4 flex items-center justify-between border-b border-border"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded" />
          <span className="font-semibold">TechMfg Co.</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="#" data-component="link" className="text-muted-foreground hover:text-foreground cursor-pointer">Home</a>
          <a href="#" data-component="link" className="text-muted-foreground hover:text-foreground cursor-pointer">Products</a>
          <a href="#" data-component="link" className="text-muted-foreground hover:text-foreground cursor-pointer">About</a>
          <a href="#" data-component="link" className="text-muted-foreground hover:text-foreground cursor-pointer">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section data-component="hero" className="relative bg-gray-100 text-foreground px-8 py-24">
        {isEditing && <BlockToolbar blockType="hero" />}
        <div className="max-w-4xl mx-auto text-center">
          <RichTextEditor
            value={heroTitle}
            onChange={setHeroTitle}
            isEditing={isEditing}
            className="text-4xl md:text-5xl font-bold mb-6"
            placeholder="Enter hero title..."
          />
          <RichTextEditor
            value={heroSubtitle}
            onChange={setHeroSubtitle}
            isEditing={isEditing}
            className="text-lg text-background/70 max-w-2xl mx-auto mb-8"
            placeholder="Enter hero subtitle..."
            style={{
              borderWidth: "1px",
              borderColor: "rgba(82, 30, 30, 1)",
              borderStyle: "solid",
              color: "rgba(64, 64, 64, 1)",
              opacity: 0.97,
              boxShadow: "0px 4px 12px 0px rgba(0, 0, 0, 0.15)",
            }}
          />
          <div className="flex items-center justify-center gap-4">
            <button data-component="button" className="px-6 py-3 bg-background text-foreground rounded-lg font-medium">View Products</button>
            <button 
              data-component="button" 
              className="px-6 py-3 bg-background text-foreground rounded-lg font-medium"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section data-component="features" className="px-8 py-16">
        {isEditing && <BlockToolbar blockType="features" />}
        <div className="max-w-5xl mx-auto">
          <RichTextEditor
            value={featuresTitle}
            onChange={setFeaturesTitle}
            isEditing={isEditing}
            className="text-3xl font-bold text-center mb-12"
            placeholder="Enter section title..."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="p-6 bg-muted/50 rounded-xl">
                <div className="w-12 h-12 bg-foreground rounded-lg mb-4" />
                <RichTextEditor
                  value={feature.title}
                  onChange={(val) => {
                    setFeatures((prev) =>
                      prev.map((f) => (f.id === feature.id ? { ...f, title: val.replace(/<[^>]*>/g, "") } : f)),
                    )
                  }}
                  isEditing={isEditing}
                  className="text-xl font-semibold mb-2"
                  placeholder="Enter feature title..."
                />
                <RichTextEditor
                  value={feature.desc}
                  onChange={(val) => {
                    setFeatures((prev) =>
                      prev.map((f) => (f.id === feature.id ? { ...f, desc: val.replace(/<[^>]*>/g, "") } : f)),
                    )
                  }}
                  isEditing={isEditing}
                  className="text-muted-foreground"
                  placeholder="Enter feature description..."
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section data-component="section" className="px-8 py-16 bg-muted/30">
        {isEditing && <BlockToolbar blockType="products" />}
        <div className="max-w-5xl mx-auto">
          <RichTextEditor
            value={productsTitle}
            onChange={setProductsTitle}
            isEditing={isEditing}
            className="text-3xl font-bold text-center mb-12"
            placeholder="Enter section title..."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background rounded-xl overflow-hidden border border-border">
                <div className="aspect-square bg-muted" />
                <div className="p-4">
                  <RichTextEditor
                    value={`Product ${i}`}
                    onChange={() => {}}
                    isEditing={isEditing}
                    className="font-semibold mb-1"
                    placeholder="Enter product name..."
                  />
                  <RichTextEditor
                    value="Industrial-grade machinery"
                    onChange={() => {}}
                    isEditing={isEditing}
                    className="text-sm text-muted-foreground"
                    placeholder="Enter product description..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-component="cta" className="px-8 py-16">
        {isEditing && <BlockToolbar blockType="cta" />}
        <div className="max-w-3xl mx-auto text-center">
          <RichTextEditor
            value={ctaTitle}
            onChange={setCtaTitle}
            isEditing={isEditing}
            className="text-3xl font-bold mb-4"
            placeholder="Enter CTA title..."
          />
          <RichTextEditor
            value={ctaText}
            onChange={setCtaText}
            isEditing={isEditing}
            className="text-muted-foreground mb-8"
            placeholder="Enter CTA text..."
          />
          <button data-component="button" className="px-8 py-3 bg-foreground text-background rounded-lg font-medium">Request Quote</button>
        </div>
      </section>

      {/* Footer */}
      <footer data-component="footer" className="px-8 py-8 bg-foreground text-background">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-background rounded" />
            <span className="font-medium">TechMfg Co.</span>
          </div>
          <p className="text-sm text-background/60">© 2025 TechMfg Co. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function ProductsPagePreview({ isEditing }: { isEditing: boolean }) {
  return (
    <div className="min-h-full p-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-muted/30 rounded-xl overflow-hidden border border-border">
            {isEditing && <BlockToolbar blockType="product-card" />}
            <div className="aspect-square bg-muted" />
            <div className="p-4">
              <h3 className="font-semibold mb-1">Product {i}</h3>
              <p className="text-sm text-muted-foreground mb-2">Industrial-grade machinery for manufacturing</p>
              <button className="text-sm font-medium">Learn More →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AboutPagePreview({ isEditing }: { isEditing: boolean }) {
  return (
    <div className="min-h-full p-8">
      {isEditing && <BlockToolbar blockType="about" />}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About TechMfg Co.</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Founded in 2010, TechMfg Co. has grown to become a leading manufacturer of precision machinery and industrial
          equipment.
        </p>
        <div className="aspect-video bg-muted rounded-xl mb-8" />
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-6">
          To provide innovative, high-quality manufacturing solutions that empower businesses worldwide to achieve their
          production goals.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { value: "50+", label: "Countries Served" },
            { value: "1000+", label: "Happy Clients" },
            { value: "15+", label: "Years Experience" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 bg-muted/30 rounded-xl">
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactPagePreview({ isEditing }: { isEditing: boolean }) {
  return (
    <div className="min-h-full p-8">
      {isEditing && <BlockToolbar blockType="contact" />}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" className="w-full px-4 py-3 bg-muted/50 rounded-lg border-0" />
            <input type="text" placeholder="Last Name" className="w-full px-4 py-3 bg-muted/50 rounded-lg border-0" />
          </div>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 bg-muted/50 rounded-lg border-0"
          />
          <input type="text" placeholder="Company Name" className="w-full px-4 py-3 bg-muted/50 rounded-lg border-0" />
          <textarea
            placeholder="Your Message"
            rows={5}
            className="w-full px-4 py-3 bg-muted/50 rounded-lg border-0 resize-none"
          />
          <button type="submit" className="w-full py-3 bg-foreground text-background rounded-lg font-medium">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
