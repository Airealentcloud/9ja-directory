// Simple script to import all business listings from the admin import page
const businesses = [
  {
    business_name: "Nevada Hotels and Suites",
    phone: "0904 473 6776",
    address: "3 Aaron Irabor St, off Alh. Prince Raufu Ishola Lemomu Street, Agungi, Lekki 106104, Lagos",
    location: "Lagos",
    category: "Accommodation",
    description: "We offer a complete experience of standard and state-of-the art guest facilities and cuisine to inspire and please demanding food cravings. Nevada adds a perfect hospitality solution to business and leisure visitors."
  },
  {
    business_name: "Chesney Hotel",
    phone: "0909 685 1899",
    address: "37, Saka Tinubu Street, Victoria Island, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Chesney Hotel is an oasis of luxury hotel strategically located in the heart of Lagos for great lodging accommodation with state-of-the-arts facilities to suit all clients."
  },
  {
    business_name: "DeRitz Hotel",
    phone: "0802 135 2167",
    address: "4 Tiwalade Close, Allen Avenue, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "DeRitz Hotel is located in Ikeja, Lagos and they provides affordable room service with delicious food in our restaurants and at banquets."
  },
  {
    business_name: "Protea Hotels",
    phone: "0 1 631 0250",
    address: "Plot 2, Assbifi Road, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Protea Hotels is a luxurious 4-star hotel located in Ikeja known to be an embodiment of class for kind of services they provide such as executive room services with Wi-Fi access and gym, swimming pool, restaurant etc."
  },
  {
    business_name: "Sofitel Moorhouse Hotel",
    phone: "0708 427 7309",
    address: "1 Bankole Oki road, Ikoyi, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Sofitel Moorhouse Hotel is a luxury hotel in Ikoyi, Lagos that is committed to providing home away luxury room services, restaurant services and related others."
  },
  {
    business_name: "Welcome Centre Hotels",
    phone: "0805 476 3801",
    address: "70 International Airport Road, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Welcome Centre Hotels is a cosy hotel located in a tranquil area in Ikeja offering lodging accommodation with lots of  other facilities such as conference hall, wedding hall, leisure facilities and others."
  },
  {
    business_name: "Morning Side Suites",
    phone: "0704 643 6379",
    address: "11b Taslim Elias Close, Victoria Island, Lagos",
    location: "Lagos",
    category: "Accommodation",
    description: "Morning Side Suites is a four star hotel that offers full accomodation services with modern facilities like events hall, equipped gym, bar, restaurant and serviced rooms."
  },
  {
    business_name: "The Art Hotel",
    phone: "0916 610 5381",
    address: "Plot 13A, Block III Yesufu Abiodun Oniru Way, Victoria Island, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "The Art Hotel provides well decorated rooms annd suites, dining, meetings and events halls, gym and art gallery."
  },
  {
    business_name: "Tudor House Hotel",
    phone: "0818 004 8923",
    address: "14 Dr Adewale Oshin St, Prince Bode Adebowale Crescent, Off Chief Collins Uchiejuno, Lekki Phase 1, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Tudor House Hotel offers luxurious rooms, incredible dining experience at a pocket friendly rate."
  },
  {
    business_name: "Villa Angelia Hotels",
    phone: "0909 080 2422",
    address: "Villa Angelia, VI 20, Ojuolobun Close off Bishop Oluwole, Victoria Island, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Villa Angelia Hotels provides hospitality needs at afforable rate, featuring standard room and double executive suite."
  },
  {
    business_name: "White Orchid Hotel",
    phone: "0901 200 2206",
    address: "1637 Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "White Orchid Hotel is a serene hotel with a luxury accomdation services such as turaka rooftop restaurant, Jinja garden, luxury cinema and modern facilities."
  },
  {
    business_name: "Berry and Bricks Apartment",
    phone: "0816 480 4088",
    address: "1, James Anyaeche, Bera Estate, Chevron Drive, Lekki, Lagos",
    location: "Lagos",
    category: "Accommodation",
    description: "Berry and bricks apartment is a 5 bedroom fully furnished luxury shortlet located in a serene and fully secured gated estate."
  },
  {
    business_name: "Cadebridge Homes",
    phone: "0807 404 9468",
    address: "15 Awolowo rd, Ikoyi, Lagos State",
    location: "Lagos",
    category: "Accommodation",
    description: "Cadebridgehomes is an expertise property development and management company with activities in Nigeria and Africa. Experience our premium luxury accommodations, homes and realestate."
  },
  {
    business_name: "Autocera Homes",
    phone: "0707 025 3975",
    address: "24 Glover Rd., Ikoyi Lagos, Lagos State",
    location: "Lagos",
    category: "Accommodation",
    description: "Autocera homes are real estate developers providing different real estate properties, with shortlets, apartments, vacation rentals and Airbnb real estate."
  },
  {
    business_name: "Alafia Honestay",
    phone: "0703 109 0165",
    address: "74A Ogudu road,. Next to Area H Police station, Ogudu GRA, Lagos",
    location: "Lagos",
    category: "Accommodation",
    description: "Alafia Homestay is an oasis of calm in the midst of this bustling city, providing unique and affordable short and long-term bookings at our staycation destination located in Ogudu, Lagos."
  },
  {
    business_name: "Bec Suites",
    phone: "08034035514",
    address: "16, Joel Ogunnaike Street / X51A & 53 Sir Michael Otedola Crescent, G.R.A, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Bec Suites is located in Ikeja, Lagos."
  },
  {
    business_name: "Chez Moi Apartment",
    phone: "0815 423 7201",
    address: "12 Ayoola Cooker Street, G.R.A, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Chez Moi Apartment contemporary living rooms with sofa beds, dining tables and 32 inch LCD flat screen televisions multi channels and DSTV."
  },
  {
    business_name: "Embassy Court Hotel",
    phone: "08033700063",
    address: "15A Admiralty Way, Lekki Phase 1, Victoria Island, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Embassy Court Hotel is located in Victoria Island, Lagos."
  },
  {
    business_name: "Find Nigeria Property",
    phone: "0805 790 9314",
    address: "Mobolaji Bank Anthony Way, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Find Nigeria Property is an internet portal where you can find properties anywhere in Nigeria or make a request or we will find it for you."
  },
  {
    business_name: "GrandBee Suites",
    phone: "08032761206",
    address: "31A, Joel Ogunnaike Street, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "GrandBee Suites is located in Ikeja, Lagos."
  },
  {
    business_name: "Hillcrest Hotel",
    phone: "07098111180",
    address: "2, Afolabi Awosanya Street, Opebi, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Hillcrest Hotel are a hospitality center in Lagos for luxurious lodging, banqueting, bar and conferencing services."
  },
  {
    business_name: "Hotel 1960 Eagles Park",
    phone: "0808 374 5991",
    address: "7 Obokun Close, Awolowo way, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "hotel 1960 eagles park is located in Ikeja and strives to meet with customers expectations in the areas of luxury guest rooms, restaurant, cocktail bar, room service and 24 hour front desk staff."
  },
  {
    business_name: "Oakwood Park Hotels",
    phone: "08074497177",
    address: "Lekki Expressway, Lekki, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Oakwood Park Hotels is located in Lekki Peninsula, Lagos."
  },
  {
    business_name: "Olatunde Kehinde & Co",
    phone: "0703 421 5599",
    address: "26,Alimosho road, Iyana Ipaja, Lagos",
    location: "Lagos",
    category: "Accommodation",
    description: "Olatunde Kehinde & Co operations is sourcing for reliable tenants and accommodations for companies, individual and property management and valuations of all purposes."
  },
  {
    business_name: "The PalmView Manor Limited",
    phone: "08034020116",
    address: "2, Tony Anegbode Street, Victoria Island, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "A Lagos based hotel for luxurious lodging accommodation and banquetting facilities."
  },
  {
    business_name: "Westown Hotel",
    phone: "0809 810 2983",
    address: "7, Sheraton-Opebi Link road, Ikeja, Lagos, Nigeria",
    location: "Lagos",
    category: "Accommodation",
    description: "Westown Hotel is a 4-star hotel located in Ikeja that provides room services for clients, bar services and range of their hotel services for the comfort of their clients."
  }
]

async function importData() {
  console.log(`🚀 Starting import of ${businesses.length} businesses...`)

  try {
    const response = await fetch('http://localhost:3006/api/admin/import-listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businesses: businesses,
        dryRun: false  // Set to true to test first
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Import failed')
    }

    console.log('\n✅ Import successful!')
    console.log(`📊 Categories created: ${data.categoriesCreated}`)
    console.log(`📋 Listings inserted: ${data.listingsInserted}`)
    console.log('\n📝 First few listings:')
    console.log(JSON.stringify(data.preview, null, 2))

    return data
  } catch (error) {
    console.error('\n❌ Import failed:', error.message)
    throw error
  }
}

// Run the import
importData()
  .then(() => {
    console.log('\n🎉 All done! Your database is now populated with business listings.')
    console.log('🔗 Visit http://localhost:3006 to see your listings!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Import process failed:', error)
    process.exit(1)
  })
