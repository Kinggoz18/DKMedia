import { Link, useActionData, useNavigation, Form } from '@remix-run/react';
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import axios from 'axios';
import Header from '@/components/public/Header';
import { generateSEOMeta } from '@/lib/utils/seo';
import { BACKEND_URL } from '@/lib/config/api';

export const meta: MetaFunction = ({ location }) => {
  return generateSEOMeta({
    title: "Unsubscribe from Newsletter | DKMEDIA305",
    description: "Unsubscribe from DKMEDIA305 newsletter. We're sorry to see you go, but you can easily manage your subscription preferences here.",
    keywords: [
      "unsubscribe DKMEDIA305",
      "newsletter unsubscribe",
      "email preferences"
    ],
    url: location.pathname,
    type: "website",
    noindex: true, // Unsubscribe pages typically don't need to be indexed
  });
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    if (!email) {
      return json(
        { success: false, message: 'Please enter your email address' },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${BACKEND_URL}/subscriptions/unsubscribe`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;

    if (data.success) {
      return json({
        success: true,
        message: 'You have been successfully unsubscribed from our newsletter.',
      });
    } else {
      return json(
        { success: false, message: data.data || 'Failed to unsubscribe. Please try again.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return json(
      {
        success: false,
        message: error?.response?.data?.data || 'An error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export default function Unsubscribe() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const status = actionData?.success ? 'success' : actionData ? 'error' : 'idle';
  const message = actionData?.message || '';

  return (
    <>
      <Header />
      <main className="bg-[#050505] min-h-screen pt-20 lg:pt-24 px-4 lg:px-6">
        <div className="max-w-lg mx-auto py-12 lg:py-20">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-luxury-sm text-[10px] tracking-[0.3em] mb-4 text-[#666]">NEWSLETTER</p>
            <h1 className="h1-luxury text-3xl lg:text-4xl text-white mb-4">Unsubscribe</h1>
            <p className="text-luxury text-sm text-[#888] max-w-md mx-auto">
              We're sorry to see you go. Enter your email below to unsubscribe from our newsletter.
            </p>
          </div>

          {/* Form */}
          <div className="glass-luxury rounded-sm p-8 lg:p-12">
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-[#c9a962]/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#c9a962]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="h2-luxury text-xl lg:text-2xl text-white mb-3">Unsubscribed Successfully</h2>
                <p className="text-luxury text-sm text-[#888] mb-8">{message}</p>
                <Link 
                  to="/" 
                  className="btn-outline-luxury inline-flex items-center gap-4 text-xs"
                >
                  Back to Home
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
              </div>
            ) : (
              <Form method="post" className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-luxury-sm text-[10px] tracking-[0.15em] text-[#666] mb-3 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="your.email@example.com"
                    className="input-modern w-full bg-transparent border-b border-[#2a2a2a] focus:border-[#c9a962]/50 px-0 py-3 text-white text-sm tracking-wide placeholder:text-[#555] focus:outline-none transition-colors"
                    disabled={isSubmitting}
                  />
                </div>

                {status === 'error' && (
                  <div className="p-4 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-luxury">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-outline-luxury w-full text-xs disabled:bg-[#1a1a1a] disabled:text-[#444] disabled:cursor-not-allowed disabled:border-[#1a1a1a]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Unsubscribing...
                    </span>
                  ) : (
                    'Unsubscribe'
                  )}
                </button>

                <p className="text-center text-luxury-sm text-xs text-[#555]">
                  Changed your mind?{' '}
                  <Link to="/" className="text-[#c9a962] hover:text-[#d4b872] transition-colors">
                    Return to homepage
                  </Link>
                </p>
              </Form>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center flex justify-center gap-6 text-luxury-sm text-[10px] tracking-[0.15em] text-[#666]">
            <Link to="/privacy-policy" className="hover:text-[#c9a962] transition-colors">
              PRIVACY
            </Link>
            <span className="text-[#444]">•</span>
            <Link to="/" className="hover:text-[#c9a962] transition-colors">
              HOME
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

