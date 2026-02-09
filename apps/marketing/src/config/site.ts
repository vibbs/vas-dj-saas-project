export const siteConfig = {
  name: "VAS-DJ SaaS Platform",
  description:
    "Streamline your business operations with our comprehensive platform designed for modern teams.",
  url: "https://yourcompany.com",
  ogImage: "https://yourcompany.com/og.jpg",
  links: {
    twitter: "https://twitter.com/yourcompany",
    github: "https://github.com/yourcompany",
    linkedin: "https://linkedin.com/company/yourcompany",
  },
  author: {
    name: "Your Company",
    url: "https://yourcompany.com",
  },
  contact: {
    email: "hello@yourcompany.com",
    phone: "+1 (555) 123-4567",
    address: {
      street: "123 Business Avenue",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "USA",
    },
  },
  navigation: {
    main: [
      { name: "Home", href: "/" },
      { name: "Features", href: "/#features" },
      { name: "Pricing", href: "/pricing" },
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    footer: {
      product: [
        { name: "Dashboard", href: "https://app.yourcompany.com" },
        { name: "Features", href: "/#features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Help", href: "/help" },
      ],
      company: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Blog", href: "/blog" },
        { name: "Contact Us", href: "/contact" },
      ],
      legal: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Settings", href: "/cookies" },
      ],
      social: [
        {
          name: "Twitter",
          href: "https://twitter.com/yourcompany",
          icon: "twitter",
        },
        {
          name: "LinkedIn",
          href: "https://linkedin.com/company/yourcompany",
          icon: "linkedin",
        },
        {
          name: "GitHub",
          href: "https://github.com/yourcompany",
          icon: "github",
        },
      ],
    },
  },
} as const;
