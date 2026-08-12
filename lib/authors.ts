export interface Author {
  name: string
  role: string
  bio: string
  expertise: string[]
  initials: string
  color: string
}

export const authors: Record<string, Author> = {
  'Israel Akhas': {
    name: 'Israel Akhas',
    role: 'Founder & CEO',
    bio: 'Israel founded 9jaDirectory to help Nigerian SMEs gain online visibility across all 36 states. He has spent years building digital platforms for Nigerian businesses and writes on entrepreneurship, business strategy, and digital growth.',
    expertise: ['Business Strategy', 'Digital Marketing', 'Nigerian SMEs', 'Entrepreneurship'],
    initials: 'IA',
    color: 'bg-green-600',
  },
  'Sarah Adebayo': {
    name: 'Sarah Adebayo',
    role: 'Senior Business Writer',
    bio: 'Sarah covers business registration, compliance, and regulatory topics for Nigerian entrepreneurs. She has a background in law and business administration, with a focus on CAC registration, NAFDAC, and SCUML processes.',
    expertise: ['Business Registration', 'Legal Compliance', 'CAC', 'NAFDAC', 'Regulatory Affairs'],
    initials: 'SA',
    color: 'bg-blue-600',
  },
  'Tunde Bakare': {
    name: 'Tunde Bakare',
    role: 'Finance & Investment Writer',
    bio: 'Tunde writes about SME finance, investment opportunities, and banking products for Nigerian businesses. He covers topics including business loans, grants, payment gateways, and fintech solutions relevant to Nigerian entrepreneurs.',
    expertise: ['SME Finance', 'Investment', 'Banking', 'Fintech Nigeria', 'Business Loans'],
    initials: 'TB',
    color: 'bg-purple-600',
  },
  'Ngozi Uche': {
    name: 'Ngozi Uche',
    role: 'Marketing & SEO Specialist',
    bio: 'Ngozi specialises in digital marketing, local SEO, and business visibility strategies for Nigerian companies. She writes guides on social media marketing, Google Business Profile, and customer acquisition for Nigerian SMEs.',
    expertise: ['Digital Marketing', 'Local SEO', 'Social Media', 'Business Listings', 'Google Maps'],
    initials: 'NU',
    color: 'bg-orange-600',
  },
  'Emmanuel Kalu': {
    name: 'Emmanuel Kalu',
    role: 'Technology Writer',
    bio: 'Emmanuel covers technology topics for Nigerian businesses, including web hosting, e-commerce platforms, payment solutions, and digital tools. He focuses on practical technology adoption for small and medium enterprises in Nigeria.',
    expertise: ['Web Hosting', 'E-commerce', 'Business Technology', 'Payment Solutions', 'Digital Tools'],
    initials: 'EK',
    color: 'bg-teal-600',
  },
  'Musa Ibrahim': {
    name: 'Musa Ibrahim',
    role: 'Business Guide Writer',
    bio: 'Musa produces practical step-by-step guides for starting and growing businesses in Nigeria. He focuses on agriculture, logistics, retail, and import/export sectors, drawing on his experience advising Nigerian SMEs in the northern states.',
    expertise: ['Agriculture Business', 'Logistics', 'Import/Export', 'Retail', 'Northern Nigeria Markets'],
    initials: 'MI',
    color: 'bg-amber-600',
  },
  'Chinyere Okeke': {
    name: 'Chinyere Okeke',
    role: 'Legal & Compliance Writer',
    bio: 'Chinyere writes about business law, regulatory compliance, and legal requirements for Nigerian companies. She covers topics including CAC registration, tax obligations, intellectual property, and business licensing across Nigerian states.',
    expertise: ['Business Law', 'Tax Compliance', 'CAC Registration', 'Intellectual Property', 'Regulatory Compliance'],
    initials: 'CO',
    color: 'bg-red-600',
  },
  'Chinedu Okonkwo': {
    name: 'Chinedu Okonkwo',
    role: 'Real Estate & Property Writer',
    bio: 'Chinedu covers real estate, property investment, and the Nigerian housing market. He writes in-depth guides on buying, renting, and investing in property across Lagos, Abuja, Port Harcourt, and other major Nigerian cities.',
    expertise: ['Real Estate Nigeria', 'Property Investment', 'Lagos Property', 'Abuja Real Estate', 'Housing Market'],
    initials: 'CO',
    color: 'bg-indigo-600',
  },
  '9jaDirectory Editorial Team': {
    name: '9jaDirectory Editorial Team',
    role: 'Editorial Team',
    bio: 'The 9jaDirectory editorial team produces business guides, directory resources, and research-backed articles for Nigerian entrepreneurs and consumers. Our writers combine local market expertise with practical knowledge of Nigerian business regulations and opportunities.',
    expertise: ['Nigerian Business', 'SME Guides', 'Business Directory', 'Local Services', 'Entrepreneurship'],
    initials: '9J',
    color: 'bg-green-700',
  },
}
