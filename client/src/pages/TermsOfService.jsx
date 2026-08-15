

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-2xl p-8">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Terms of Service
        </h1>

        <p className="text-sm text-gray-500 mb-6 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-sm text-gray-600">
            Welcome to FixNearby. By accessing or using our platform, you agree to be bound by these Terms of Service.
            If you do not agree, please do not use the platform.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Services</h2>
          <p className="text-sm text-gray-600">
            FixNearby connects users with independent service providers such as plumbers, electricians, and cleaners.
            We do not directly provide these services and are not responsible for the quality of work performed.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. User Responsibilities</h2>
          <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
            <li>Provide accurate information during registration</li>
            <li>Use the platform only for lawful purposes</li>
            <li>Respect service providers and other users</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Bookings & Payments</h2>
          <p className="text-sm text-gray-600">
            All bookings are agreements between users and service providers. FixNearby is not responsible for payment disputes,
            cancellations, or service outcomes.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Cancellations</h2>
          <p className="text-sm text-gray-600">
            Users may cancel bookings according to the cancellation policy defined in the platform. Late cancellations may incur penalties.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
          <p className="text-sm text-gray-600">
            FixNearby shall not be liable for any damages arising from the use of the platform, including service quality,
            delays, or disputes between users and workers.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">7. Termination</h2>
          <p className="text-sm text-gray-600">
            We reserve the right to suspend or terminate accounts that violate these terms without prior notice.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">8. Changes to Terms</h2>
          <p className="text-sm text-gray-600">
            We may update these Terms at any time. Continued use of the platform indicates acceptance of the updated terms.
          </p>
        </section>

        {/* Section */}
        <section>
          <h2 className="text-xl font-semibold mb-2">9. Contact</h2>
          <p className="text-sm text-gray-600">
            If you have any questions about these Terms, please contact us at support@fixnearby.com.
          </p>
        </section>

      </div>
    </div>
  );
};

export default TermsOfService;