import { useState } from 'react'
import { C, btnPrimary } from '../styles'

const Section = ({ children }) => (
  <div style={{ maxWidth:800, margin:'0 auto', padding:'52px 20px' }}>{children}</div>
)
const H1 = ({ children }) => <h1 style={{ fontWeight:800, fontSize:28, color:C.text, marginBottom:12 }}>{children}</h1>
const H2 = ({ children }) => <h2 style={{ fontWeight:700, fontSize:18, color:C.text, margin:'28px 0 10px' }}>{children}</h2>
const P  = ({ children }) => <p  style={{ color:C.muted, fontSize:15, lineHeight:1.8, marginBottom:14 }}>{children}</p>

export function AboutPage() {
  return (
    <Section>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
        <img src="/homies-logo.png" alt="Homies" style={{ width:48, height:48, objectFit:'contain' }} />
        <div>
          <H1>About Homies</H1>
          <p style={{ color:C.muted, fontSize:15, margin:0 }}>India's most trusted PG finder for students</p>
        </div>
      </div>

      <div style={{ background:'linear-gradient(135deg,#FF5A3C,#FF8C42)', borderRadius:16, padding:'28px 32px', marginBottom:32, color:'#fff' }}>
        <h2 style={{ fontWeight:800, fontSize:22, margin:'0 0 8px' }}>Our Mission</h2>
        <p style={{ margin:0, fontSize:15, opacity:0.9, lineHeight:1.7 }}>
          To make finding a safe, affordable PG as easy as ordering food online — for every student in India, in every city.
        </p>
      </div>

      <H2>Who we are</H2>
      <P>Homies was founded by students who struggled to find decent PGs when they moved to a new city for college. We know what it feels like to be shown 10 listings and find that 8 of them are fake, overpriced or have cockroaches. So we built a platform where every listing is verified by a human before it goes live.</P>

      <H2>What makes us different</H2>
      <P>Every PG on Homies is physically verified by our team. Every owner submits their Aadhaar or PAN for KYC. Every listing shows real photos. No fake listings. No brokerage. No middlemen.</P>
      <P>We currently have 300+ verified PGs across 8 cities — Mumbai, Navi Mumbai, Pune, Delhi, Bangalore, Hyderabad, Chennai and Noida — with 120+ cities coming soon.</P>

      <H2>For students</H2>
      <P>Browse, filter and contact PG owners directly — completely free. No subscription, no brokerage, no hidden charges. Just find your perfect PG and move in.</P>

      <H2>For property owners</H2>
      <P>List your PG starting at just ₹99/month and reach thousands of verified students actively looking for accommodation near their college. Our platform brings you direct, quality leads — no brokers involved.</P>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:32 }}>
        {[['300+','Verified PGs'],['8','Cities Live'],['2M+','Happy Students']].map(([n,l]) => (
          <div key={l} style={{ background:'#F9FAFB', borderRadius:14, padding:'20px', textAlign:'center', border:'1px solid #E5E7EB' }}>
            <p style={{ fontWeight:800, fontSize:30, color:C.primary, margin:'0 0 4px' }}>{n}</p>
            <p style={{ color:C.muted, fontSize:13, margin:0 }}>{l}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function ContactPage({ showToast }) {
  const handleSubmit = async e => {
    e.preventDefault()
    const form = e.target
    try {
      const { supabase } = await import('../supabase')
      await supabase.from('support_requests').insert({
        type:    'contact_form',
        name:    form.name.value,
        email:   form.email.value,
        message: `Subject: ${form.subject.value}\n\n${form.message.value}`,
        status:  'new',
      })
    } catch {}
    showToast('Message sent! We will reply within 24 hours.', 'info')
    form.reset()
  }
  const inp = { width:'100%', border:'1.5px solid #E5E7EB', borderRadius:9, padding:'11px 14px', fontSize:15, color:'#1A1A2E', background:'#fff', outline:'none', boxSizing:'border-box', fontFamily:'inherit', marginBottom:14 }
  return (
    <Section>
      <H1>Contact Us</H1>
      <P>Have a question, issue or feedback? We would love to hear from you. Our team typically responds within 24 hours.</P>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32 }}>
        {[['📧','Email Us','homiessupport@gmail.com'],['📞','Call Us','+91 83696 10730'],['💬','WhatsApp','wa.me/918369610730'],['🕐','Hours','Mon–Sat 9am–7pm IST']].map(([i,l,v]) => (
          <div key={l} style={{ background:'#F9FAFB', borderRadius:14, padding:20, border:'1px solid #E5E7EB' }}>
            <p style={{ fontSize:26, margin:'0 0 8px' }}>{i}</p>
            <p style={{ fontWeight:700, fontSize:14, color:C.text, margin:'0 0 4px' }}>{l}</p>
            <p style={{ color:C.muted, fontSize:13, margin:0 }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', borderRadius:16, padding:28, border:'1px solid #E5E7EB' }}>
        <h2 style={{ fontWeight:700, fontSize:17, color:C.text, marginBottom:20 }}>Send us a message</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <input name="name" placeholder="Your name" required style={inp} />
            <input name="email" type="email" placeholder="Your email" required style={inp} />
          </div>
          <input name="subject" placeholder="Subject" required style={inp} />
          <textarea name="message" placeholder="Your message..." required rows={5} style={{ ...inp, resize:'vertical' }} />
          <button type="submit" style={{ ...btnPrimary, padding:'12px 28px', fontSize:15 }}>Send Message →</button>
        </form>
      </div>
    </Section>
  )
}

export function CareersPage() {
  const roles = [
    { title:'City Operations Manager', loc:'Mumbai', type:'Full-time', desc:'Physically verify PG listings, manage owner relationships and ensure listing quality in Mumbai.' },
    { title:'Growth & Marketing Intern', loc:'Remote', type:'Internship', desc:'Run student acquisition campaigns across college campuses. Social media, WhatsApp groups, flyers.' },
    { title:'Full Stack Developer', loc:'Remote', type:'Full-time', desc:'React, Supabase, Node.js. Help build the features that thousands of students use daily.' },
    { title:'Customer Support Executive', loc:'Remote', type:'Part-time', desc:'Help students find the right PG and assist owners with listing queries. WhatsApp and email support.' },
  ]
  return (
    <Section>
      <H1>Careers at Homies</H1>
      <P>We are a small team building something big. If you are passionate about solving real problems for students in India, we would love to work with you.</P>
      <div style={{ background:'#FFF1EE', border:'1px solid #FECACA', borderRadius:14, padding:'18px 22px', marginBottom:28 }}>
        <p style={{ fontWeight:700, color:C.primary, fontSize:14, margin:'0 0 4px' }}>🚀 We are early stage</p>
        <p style={{ color:'#9D174D', fontSize:13, margin:0 }}>Compensation includes equity + salary. You will work directly with the founders and own meaningful chunks of the product.</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {roles.map(r => (
          <div key={r.title} style={{ background:'#fff', borderRadius:14, padding:'20px 22px', border:'1px solid #E5E7EB' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:8 }}>
              <h3 style={{ fontWeight:700, fontSize:16, color:C.text, margin:0 }}>{r.title}</h3>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{r.type}</span>
                <span style={{ background:'#F0FDF4', color:'#15803D', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{r.loc}</span>
              </div>
            </div>
            <p style={{ color:C.muted, fontSize:13, margin:'0 0 12px', lineHeight:1.6 }}>{r.desc}</p>
            <a href="mailto:homiessupport@gmail.com" style={{ color:C.primary, fontWeight:700, fontSize:13, textDecoration:'none' }}>Apply → homiessupport@gmail.com</a>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function BlogPage() {
  const [active, setActive] = useState(null)
  const posts = [
    {
      emoji:'🏙️', title:'Top 10 Areas to Find PGs in Mumbai Under ₹12,000',
      date:'April 10, 2026', read:'5 min', tag:'City Guide',
      content:`Finding an affordable PG in Mumbai can feel overwhelming — but it doesn't have to be. Here are the top 10 areas where you can find great PGs under ₹12,000/month.

1. Andheri East — Close to SEEPZ, JB Nagar Metro and corporate offices. Triple sharing available from ₹8,000.
2. Goregaon West — Excellent Western Railway connectivity. Many PGs near Aarey Colony and NESCO from ₹7,500.
3. Malad West — Quieter than Andheri, equally well connected. PGs from ₹8,000 with meals.
4. Borivali West — North Mumbai's best value. Spacious rooms from ₹7,000. National Park nearby.
5. Kandivali East — Affordable area with good food options. Budget PGs from ₹7,500.
6. Ghatkopar East — Central Line + Metro connectivity. Great for SIES and Somaiya students.
7. Mulund West — Clean, residential, safe. Great for students at Thane and Mulund colleges.
8. Vikhroli — Often overlooked but great value. Near Godrej offices and KJSIEIT college.
9. Chembur — Best for Harbour Line commuters. KJ Somaiya students prefer this area.
10. Wadala — Access to both Harbour Line and Mumbai Monorail. PGs from ₹9,000.

Pro tip: Always visit in person before paying deposit. Check the water supply, ventilation and security.`,
    },
    {
      emoji:'📋', title:'PG vs Hostel vs Flat — What is Right for You as a Student?',
      date:'March 28, 2026', read:'7 min', tag:'Advice',
      content:`Choosing where to live as a student is one of the most important decisions you will make. Here is an honest comparison.

PG (Paying Guest)
Best for: Students who want meals included and minimal responsibility.
Pros: Meals cooked for you, furnished room, bills included, someone to talk to.
Cons: Rules (timing, guests), sharing bathroom, less privacy.
Cost: ₹7,000–₹20,000/month all-inclusive in most cities.

Hostel
Best for: First-year students, short stays, very tight budgets.
Pros: Cheapest option, college facilities nearby, built-in friend circle.
Cons: Very little privacy, strict rules, noisy, shared everything.
Cost: ₹3,000–₹8,000/month.

Flat / Apartment
Best for: Final year students, working professionals, those who want independence.
Pros: Full privacy, cook your own food, your own rules.
Cons: You pay for everything separately, coordinate with flatmates, no support system.
Cost: ₹8,000–₹25,000/month (rent alone, before bills and food).

Verdict: If you are in your first or second year, a PG is usually the smartest choice. You get structure, meals and safety without the responsibilities of managing a full apartment.`,
    },
    {
      emoji:'⚠️', title:'7 Red Flags to Watch Out for When Visiting a PG',
      date:'March 12, 2026', read:'4 min', tag:'Safety',
      content:`Before you pay any deposit, visit the PG in person. Here are 7 warning signs you should never ignore.

1. Owner refuses to show you the room before payment — A legitimate owner will always let you see the room first. If they ask for advance without showing the room, walk away.

2. No written agreement — Every PG should give you a written rent receipt and agreement. No documentation means no legal protection for you.

3. Smells of damp or mold — Check corners, walls and under beds. Mold is a serious health hazard and costly to fix.

4. No working locks on doors or windows — Your safety matters. If locks are broken and the owner is dismissive, that is a red flag.

5. Water pressure and supply issues — Turn on the tap and flush the toilet. Ask when water is available. Many PGs have water only 1–2 hours a day.

6. Unusually low price — If a 2 BHK in Andheri is ₹4,000/month including meals, something is wrong. Always ask why the price is so low.

7. Owner gets aggressive or defensive — If asking basic questions makes the owner uncomfortable or angry, trust your instincts and leave.

Always use Homies verified listings — every property is physically checked before going live.`,
    },
    {
      emoji:'💰', title:'How to Negotiate PG Rent — A Practical Guide',
      date:'February 18, 2026', read:'6 min', tag:'Money',
      content:`Most students never negotiate PG rent. The ones who do save ₹500–₹2,000 every month. Here is exactly how to do it.

Step 1 — Research first. Before visiting, check what similar PGs in the same area cost on Homies. Knowledge is your strongest negotiating tool.

Step 2 — Visit multiple PGs. Never negotiate at the first place you see. Visit at least 3. Mention to each owner that you are comparing options.

Step 3 — Ask about long-term discounts. If you commit to 6 or 12 months upfront, most owners will reduce rent by 5–15%.

Step 4 — Negotiate the deposit. Many owners ask for 2–3 months deposit. You can often negotiate this down to 1 month, especially if you have a job offer letter or college ID.

Step 5 — Ask what is included. Meals, WiFi, electricity — get clarity on what is in the rent. Then negotiate on what you don't need. If you don't eat at home, ask for a no-meals discount.

Step 6 — Be polite but firm. The phrase that works: "I really like this place. If you can match ₹X, I can move in this week." Owners prefer a confirmed tenant over an empty room.

Common mistake: Negotiating after moving in. Always settle rent before paying deposit.`,
    },
    {
      emoji:'📦', title:'Moving into a PG? The Ultimate Checklist',
      date:'January 25, 2026', read:'8 min', tag:'Checklist',
      content:`Use this checklist before, during and after moving into your new PG.

BEFORE MOVING IN
✅ Visit in person — never book a PG you haven't seen
✅ Check water supply timings
✅ Test WiFi speed (ask owner to show you)
✅ Confirm what is included in rent (meals, electricity, WiFi)
✅ Get a written agreement signed by owner
✅ Take photos of the room condition before moving in
✅ Note any existing damage so you are not charged later
✅ Confirm deposit amount and refund terms in writing
✅ Check safety — working locks, emergency exits, CCTV

WHAT TO BRING
🧺 Bedsheet, pillow, blanket
🔒 Small padlock (for your cupboard)
🪣 Bucket and mug (in case geysers fail)
💡 Extension board with surge protection
🧴 Basic medicines — paracetamol, ORS, bandages
📁 Folder with ID copies, rent agreement, college docs
🔌 Laptop lock / cable

FIRST WEEK
✅ Save owner and caretaker numbers
✅ Introduce yourself to flatmates
✅ Locate nearest hospital, pharmacy, ATM and grocery store
✅ Set up UPI payment for rent
✅ Join the building WhatsApp group if one exists

A smooth move-in starts with preparation. Good luck!`,
    },
  ]

  return (
    <Section>
      <H1>Homies Blog</H1>
      <P>Tips, guides and advice for students finding PGs across India.</P>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {posts.map(p => (
          <div key={p.title} style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', overflow:'hidden', transition:'box-shadow 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
            <div style={{ padding:'20px 22px', cursor:'pointer', display:'flex', gap:14, alignItems:'flex-start', justifyContent:'space-between' }}
              onClick={() => setActive(active === p.title ? null : p.title)}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <span style={{ fontSize:32, flexShrink:0 }}>{p.emoji}</span>
                <div>
                  <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                    <span style={{ background:'#FFF1EE', color:C.primary, fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:20 }}>{p.tag}</span>
                    <span style={{ color:C.muted, fontSize:12 }}>{p.date} · {p.read} read</span>
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:15, color:C.text, margin:0, lineHeight:1.4 }}>{p.title}</h3>
                </div>
              </div>
              <span style={{ color:C.muted, fontSize:18, flexShrink:0, marginTop:4 }}>{active === p.title ? '▲' : '▼'}</span>
            </div>
            {active === p.title && (
              <div style={{ padding:'0 22px 22px 68px', borderTop:'1px solid #F3F4F6' }}>
                {p.content.split('\n\n').map((para, i) => (
                  <p key={i} style={{ color:'#374151', fontSize:14, lineHeight:1.8, margin:'14px 0 0', whiteSpace:'pre-line' }}>{para}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{ color:C.muted, fontSize:13, textAlign:'center', marginTop:24 }}>More articles coming soon. Follow us on Instagram @homies.in</p>
    </Section>
  )
}

export function PrivacyPage() {
  return (
    <Section>
      <H1>Privacy Policy</H1>
      <p style={{ color:C.muted, fontSize:13, marginBottom:24 }}>Last updated: April 2026</p>

      <H2>Purpose</H2>
      <P>Homies is committed to protecting any personal information that we may receive while you access our online and mobile website www.homies.in. We believe it is important for you to know how we treat information about you that we may receive from this website. This Privacy Policy is devised to help you feel more confident about the privacy and security of your personal details. "You" shall mean You, the User of the Website. "We" / "Us" means Homies and "Our" interpreted accordingly.</P>

      <H2>Eligibility</H2>
      <P>This website is intended for all persons who are interested in listing or renting a PG accommodation across India.</P>

      <H2>The Information We Collect</H2>
      <P>We receive both information that is directly provided to us, such as personal information you provide when you visit the website, and information that is passively or automatically collected from you, such as information collected from the browser or device you used to access our website.</P>
      <P>Information You Provide To Us: There are portions of this website where we may need to collect personal information from you for a specific purpose — for example, when you register, list a property for rent, or contact an owner. In the course of these various offerings, we often seek to collect: name, address, email address, telephone number, date of birth, ID proof (Aadhaar/PAN/Driving Licence/Passport) and property details.</P>
      <P>Information That is Automatically Collected: In general, you can visit this website without telling us who you are. We may use automated means to collect various types of information about you, your computer or other device used to access our website — including network or Internet protocol address, browser type, operating system, device identifiers, location information, and the web pages you have visited.</P>

      <H2>How We Use Your Information</H2>
      <P>By entering your information, you accept that we may retain it and use it for the following purposes: matching students with suitable PGs, verifying listings and owner identities, enabling communication between students and owners, improving our services and user experience, and complying with legal obligations.</P>

      <H2>ID Proof Storage</H2>
      <P>Your ID proof is stored securely in encrypted cloud storage. Only our admin team can access it for verification purposes. It is never shared publicly or with other users. We retain ID proof documents only as long as necessary for verification.</P>

      <H2>Cookies and Tracking</H2>
      <P>We use cookies to keep you logged in and to understand how users navigate our site. We may use cookies to personalise your experience, save your session, and assess the effectiveness of our services. You can disable cookies in your browser settings, though some features may be affected. We do not use advertising cookies or sell your data to advertisers.</P>

      <H2>Security and Data Storage</H2>
      <P>Security is very important to us. All security procedures are in place to protect the confidentiality, integrity and availability of your information. We maintain strict physical, electronic and administrative safeguards to protect your personal information from unauthorised or inappropriate access. We use encryption and follow generally accepted standards to collect, store and protect personal data.</P>
      <P>While we take all reasonable measures to guard against misuse of personal data submitted to us, we cannot guarantee that someone will not overcome our security measures. By posting personal data on this website, you acknowledge and accept this risk.</P>

      <H2>Information Sharing and Disclosures</H2>
      <P>We may disclose your information to service providers that perform business-related functions on our behalf — including research and analytics, customer support, marketing, hosting and database maintenance. We may also disclose information in response to legal process, court orders, law enforcement requests, or to investigate potentially illegal activities or fraud.</P>
      <P>We reserve the right to disclose and transfer user information in compliance with all relevant data protection legislation.</P>

      <H2>Linked Services</H2>
      <P>Our website may contain links to other services such as social media platforms whose information practices may be different from ours. Visitors should consult those services' privacy notices, as we have no control over information submitted to or collected by third parties.</P>

      <H2>Acceptance of This Policy</H2>
      <P>By visiting our website, signing up or logging in, you acknowledge and unconditionally accept this policy. If you do not agree with this policy, do not use our website or provide any personal data.</P>

      <H2>Governing Law and Jurisdiction</H2>
      <P>This Privacy Policy is governed by and operated in accordance with the laws of India. If any of the parties wish to seek legal recourse, they may do so by using the courts of law in Mumbai.</P>

      <H2>Updates</H2>
      <P>We may change this privacy policy from time to time. Your continued use of the website will be deemed acceptance of the policy existing at that time.</P>

      <H2>Contact</H2>
      <P>Questions about your privacy? Email us at homiessupport@gmail.com or call +91 83696 10730.</P>
    </Section>
  )
}

export function TermsPage() {
  return (
    <Section>
      <H1>Terms of Service</H1>
      <p style={{ color:C.muted, fontSize:13, marginBottom:24 }}>Last updated: January 2025</p>
      <H2>1. Who can use Homies</H2>
      <P>Homies is available to individuals aged 18 and above. By creating an account you confirm that the information you provide is accurate and truthful.</P>
      <H2>2. For students</H2>
      <P>Students can browse and contact PG owners for free. Homies is a platform connecting students with owners — we do not own, manage or operate any of the listed properties. Always visit a property in person before paying any deposit.</P>
      <H2>3. For property owners</H2>
      <P>Owners must list only properties they legally own or manage. Listing fees are charged as per the selected subscription plan. Homies reserves the right to remove listings that violate our quality guidelines.</P>
      <H2>4. Prohibited conduct</H2>
      <P>You may not post fake listings, misrepresent your identity, harass other users, or use Homies for any illegal purpose. Violations will result in immediate account suspension.</P>
      <H2>5. Liability</H2>
      <P>Homies is a marketplace connecting students and owners. We are not liable for disputes between students and owners, property conditions, or transactions made outside our platform.</P>
      <H2>6. Changes to these terms</H2>
      <P>We may update these terms from time to time. Continued use of Homies after changes constitutes acceptance of the new terms.</P>
      <H2>Contact</H2>
      <P>Questions? Email homiessupport@gmail.com</P>
    </Section>
  )
}