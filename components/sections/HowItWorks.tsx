const steps = [
  {
    number: '1',
    title: 'Download & Install',
    description:
      'Download Pilot Car Admin for Windows desktop. Installation is quick and easy.',
  },
  {
    number: '2',
    title: 'Set Up Your Business',
    description:
      'Add your customers, destinations, and vehicle information. Customize your billing types.',
  },
  {
    number: '3',
    title: 'Start Managing',
    description:
      'Create invoices, track expenses, log mileage, and generate reports. All offline, all secure.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Get started in three simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-800 text-white text-2xl font-bold mb-4 transform transition-transform duration-300 hover:scale-110 hover:bg-primary-700">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
