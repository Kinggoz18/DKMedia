import AboutUsService from '@/services/AboutUsService';
import AbousUs from '../AbousUs';
import IAboutUs from '@/lib/interfaces/IAboutUs';

export default async function AboutUsPage() {
  const aboutUsService = new AboutUsService();
  let aboutUs: IAboutUs;;

  try {
    aboutUs = await aboutUsService.getAboutUs();
  } catch (error) {
    console.error("Error fetching about us:", error);
    return <p>Failed to load about us. Please try again later.</p>;
  }

  return (
    <AbousUs
      aboutUs={aboutUs}
    />
  );
}