

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-2xl p-8">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-500 mb-6 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-sm text-gray-600">
            FixNearby respects your privacy and is committed to protecting your personal data.
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
            <li>Personal details (name, email, phone number)</li>
            <li>Account credentials (encrypted passwords)</li>
            <li>Location data (to show nearby services)</li>
            <li>Booking and transaction history</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
            <li>To connect users with local service providers</li>
            <li>To manage bookings and user accounts</li>
            <li>To improve platform performance and user experience</li>
            <li>To communicate updates and support responses</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Data Sharing</h2>
          <p className="text-sm text-gray-600">
            We do not sell your personal data. Information may be shared with service providers
            only as necessary to fulfill bookings and improve service delivery.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
          <p className="text-sm text-gray-600">
            We implement industry-standard security measures such as encryption and secure authentication
            to protect your data. However, no system is completely secure.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">6. Cookies & Tracking</h2>
          <p className="text-sm text-gray-600">
            FixNearby may use cookies to enhance user experience, remember preferences,
            and analyze platform usage.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
          <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
            <li>Access and update your personal information</li>
            <li>Request account deletion</li>
            <li>Opt out of communications</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">8. Changes to Policy</h2>
          <p className="text-sm text-gray-600">
            We may update this Privacy Policy from time to time. Continued use of the platform
            means you accept the updated policy.
          </p>
        </section>

        {/* Section */}
        <section>
          <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
          <p className="text-sm text-gray-600">
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <span className="font-medium">support@fixnearby.com</span>
          </p>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicy;