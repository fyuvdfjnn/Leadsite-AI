export function StatsSection() {
  const stats = [
    { value: "2 min", label: "Average generation time" },
    { value: "85%+", label: "Content accuracy rate" },
    { value: "10K+", label: "Websites generated" },
    { value: "50+", label: "Industries supported" },
  ]

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-6">
        <p className="text-center text-muted-foreground mb-8">
          Trusted by B2B companies and cross-border sellers worldwide
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
