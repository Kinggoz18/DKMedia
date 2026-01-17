import { useState, useEffect } from 'react';
import { SideNavBar } from '@/components/cms/SideNavBar';
import ManageEvents from './sections/manage-events';
import HomeSection from './sections/home';
import ManageContactUs from './sections/manage-contact-us';
import ManageArticles from './sections/manage-articles';
import ManageOrganizations from './sections/manage-organizations';
import ManageMedia from './sections/manage-media';
import HomeReturnSectionProps from '@/lib/interfaces/HomeReturnSectionProps';
import AboutUs from './sections/about-us';
import Subscriptions from './sections/subscriptions';
import { AuthService } from '@/lib/redux/Auth/AuthService';

function ReturnSection(props: HomeReturnSectionProps) {
  const { currentPage } = props
  if (!currentPage) return;

  switch (currentPage) {
    case "home":
      return <HomeSection />
    case "Manage events":
      return <ManageEvents />
    case "Manage contact us":
      return <ManageContactUs />
    case "Manage articles":
      return <ManageArticles />
    case "Manage organizations":
      return <ManageOrganizations />
    case "Manage media":
      return <ManageMedia />
    case "About us":
      return <AboutUs />
    case "Subscription":
      return <Subscriptions />
  }
}

export default function CMSHome() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isClient, setIsClient] = useState(false);
  const authService = new AuthService();

  // Check authentication - only on client
  useEffect(() => {
    setIsClient(true);
    checkAuthorization();
  }, []);

  // Check authorization on page navigation
  useEffect(() => {
    if (isClient && currentPage !== "home") {
      checkAuthorization();
    }
  }, [currentPage, isClient]);

  /**
   * Check if user is authorized by calling the confirm endpoint
   */
  async function checkAuthorization() {
    try {
      await authService.confirmAuthorizedUser();
    } catch (error: any) {
      // If unauthorized, redirect to login (handled in AuthService)
      console.error('Authorization check failed:', error);
    }
  }

  if (!isClient) {
    return null; // Don't render on server
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col lg:flex-row text-neutral-100">
      <SideNavBar currentPage={currentPage} setCurrentPage={setCurrentPage}></SideNavBar>
      <div className="flex-1 lg:ml-[240px] min-h-screen pt-16 lg:pt-0 z-10 overflow-auto">
        <ReturnSection currentPage={currentPage} />
      </div>
    </div>
  )
}
