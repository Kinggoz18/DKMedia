import { Link } from '@remix-run/react';
import type { MetaFunction } from "@remix-run/node";
import Header from '@/components/public/Header';
import { generateSEOMeta } from '@/lib/utils/seo';

export const meta: MetaFunction = ({ location }) => {
  return generateSEOMeta({
    title: "Privacy Policy | DKMEDIA305",
    description: "DKMEDIA305 Privacy Policy - Learn how we collect, use, and protect your personal information. We are committed to your privacy and data security.",
    keywords: [
      "DKMEDIA305 privacy policy",
      "data protection",
      "privacy policy",
      "data security"
    ],
    url: location.pathname,
    type: "website",
    noindex: true, // Privacy policies typically don't need to be indexed
  }, location as any);
};

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main className="bg-[#050505] min-h-screen pt-20 lg:pt-24 px-4 lg:px-6">
        <article className="max-w-4xl mx-auto py-12 lg:py-20">
          {/* Header */}
          <div className="mb-12 text-center lg:text-left">
            <p className="text-luxury-sm text-[10px] tracking-[0.3em] mb-4 text-[#666]">LEGAL</p>
            <h1 className="h1-luxury text-3xl lg:text-5xl text-white mb-4">Privacy Policy</h1>
            <p className="text-luxury text-sm text-[#666]">Last updated: January 2026</p>
          </div>

          {/* Content */}
          <div className="space-y-6 lg:space-y-8">
            {/* Introduction */}
            <section className="glass-luxury rounded-sm p-6 lg:p-10">
              <h2 className="h2-luxury text-2xl lg:text-3xl text-white mb-4">Introduction</h2>
              <p className="text-luxury text-base lg:text-lg leading-relaxed text-[#888]">
                DKMEDIA305 Hospitality Group ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, and safeguard your personal information when 
                you use our website and services.
              </p>
            </section>

            {/* Data Collection */}
            <section className="glass-luxury rounded-sm p-6 lg:p-10">
              <h2 className="h2-luxury text-2xl lg:text-3xl text-white mb-4">Information We Collect</h2>
              <p className="text-luxury text-base lg:text-lg leading-relaxed mb-4 text-[#888]">
                We only collect the following information:
              </p>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                    <span><strong className="text-[#c9a962]">Email Address:</strong> Used exclusively for our newsletter subscription service.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                    <span><strong className="text-[#c9a962]">Name (Optional):</strong> To personalize your newsletter experience.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                    <span><strong className="text-[#c9a962]">Contact Form Data:</strong> Information you provide when submitting inquiries through our contact form.</span>
                </li>
              </ul>
            </section>

            {/* How We Use Data */}
            <section className="glass-luxury rounded-sm p-6 lg:p-10">
              <h2 className="h2-luxury text-2xl lg:text-3xl text-white mb-4">How We Use Your Information</h2>
              <p className="text-luxury text-base lg:text-lg leading-relaxed mb-4 text-[#888]">
                Your information is used solely for:
              </p>
              <ul className="space-y-4 text-luxury text-base lg:text-lg text-[#888]">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Sending newsletters about upcoming events, promotions, and news</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Responding to your inquiries and requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Improving our services and website experience</span>
                </li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="glass-luxury rounded-sm p-6 lg:p-10">
              <h2 className="h2-luxury text-2xl lg:text-3xl text-white mb-4">Data Sharing</h2>
              <p className="text-luxury text-base lg:text-lg leading-relaxed text-[#888]">
                We do <strong className="text-white">NOT</strong> sell, trade, or rent your personal information to third parties. 
                Your data is stored securely and only accessed by authorized personnel for the purposes 
                described in this policy.
              </p>
            </section>

            {/* Your Rights */}
            <section className="glass-luxury rounded-sm p-6 lg:p-10">
              <h2 className="h2-luxury text-2xl lg:text-3xl text-white mb-4">Your Rights</h2>
              <p className="text-luxury text-base lg:text-lg leading-relaxed mb-4 text-[#888]">
                You have the right to:
              </p>
              <ul className="space-y-4 text-luxury text-base lg:text-lg text-[#888] mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                    <span><strong className="text-[#c9a962]">Unsubscribe at any time</strong> from our newsletter</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                    <span><strong className="text-[#c9a962]">Request deletion</strong> of your personal data</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                    <span><strong className="text-[#c9a962]">Access your data</strong> that we have collected</span>
                </li>
              </ul>
              <Link 
                to="/unsubscribe" 
                className="btn-outline-luxury inline-flex items-center gap-4 text-xs"
              >
                Unsubscribe from Newsletter
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </section>

            {/* Contact */}
            <section className="glass-luxury rounded-sm p-6 lg:p-10">
              <h2 className="h2-luxury text-2xl lg:text-3xl text-white mb-4">Contact Us</h2>
              <p className="text-luxury text-base lg:text-lg leading-relaxed mb-4 text-[#888]">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us through our{' '}
                <Link to="/contact" className="text-[#c9a962] hover:text-[#d4b872] transition-colors">
                  contact page
                </Link>.
              </p>
            </section>

            {/* Updates */}
            <section className="glass-luxury rounded-sm p-6 lg:p-10">
              <h2 className="h2-luxury text-2xl lg:text-3xl text-white mb-4">Policy Updates</h2>
              <p className="text-luxury text-base lg:text-lg leading-relaxed text-[#888]">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page 
                with an updated revision date. We encourage you to review this policy periodically.
              </p>
            </section>
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
            <Link 
              to="/" 
              className="text-luxury-sm text-[10px] tracking-[0.15em] text-[#666] hover:text-[#c9a962] transition-colors"
            >
              HOME
            </Link>
            <Link 
              to="/unsubscribe" 
              className="text-luxury-sm text-[10px] tracking-[0.15em] text-[#666] hover:text-[#c9a962] transition-colors"
            >
              UNSUBSCRIBE
            </Link>
            <Link 
              to="/contact" 
              className="text-luxury-sm text-[10px] tracking-[0.15em] text-[#666] hover:text-[#c9a962] transition-colors"
            >
              CONTACT
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

