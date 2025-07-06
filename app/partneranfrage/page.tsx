export default function PartneranfragePage() {
  useEffect(() => {
    // Dynamically load the Tally embed script
    const scriptId = 'tally-embed-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://tally.so/widgets/embed.js';
      script.onload = () => {
        if (typeof window.Tally !== 'undefined') {
          window.Tally.loadEmbeds();
        }
      };
      document.body.appendChild(script);
    } else {
      if (typeof window.Tally !== 'undefined') {
        window.Tally.loadEmbeds();
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white/80 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2 text-center">Zugang zum Partnerportal anfragen</h1>
        <p className="text-center text-gray-700 mb-6">Füllen Sie das Formular aus, um Zugang zum INDUWA Partnerportal zu beantragen.</p>
        <div className="w-full" style={{ minHeight: 400 }}>
          <iframe
            data-tally-src="https://tally.so/embed/3NgzoN?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
            loading="lazy"
            width="100%"
            height="400"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="INDUWA Partnerportal Zugangsanfrage"
            className="rounded-lg border border-gray-200 bg-transparent"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Partneranfrage – Partnerportal INDUWA",
  description: "Stellen Sie eine Partneranfrage bei INDUWA und profitieren Sie von exklusiven Vorteilen.",
}; 