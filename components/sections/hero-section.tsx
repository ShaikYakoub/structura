interface HeroSectionProps {
  data: {
    title: string;
    subtitle: string;
    image: string;
  };
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${data.image})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-6xl font-bold mb-4">{data.title}</h1>
        <p className="text-2xl max-w-2xl mx-auto">{data.subtitle}</p>
      </div>
    </section>
  );
}
