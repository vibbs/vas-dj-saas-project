export const pricingConfig = {
  title: "Plans That Scale With Your Business",
  subtitle: "Choose a plan that suits your needs. Whether you're a startup or an enterprise, we offer flexible options to support your growth journey",
  billingToggle: {
    monthly: "Monthly",
    annual: "Annual",
  },
  plans: [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small teams and growing businesses getting started.",
      price: {
        monthly: 29,
        annual: 290, // ~$24/month
      },
      features: [
        "Up to 5 team members",
        "Basic analytics dashboard",
        "Email support",
        "Core integrations",
        "Standard templates",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      id: "professional",
      name: "Professional",
      description: "Ideal for established teams who need advanced features and customization.",
      price: {
        monthly: 59,
        annual: 590, // ~$49/month
      },
      features: [
        "Up to 25 team members",
        "Advanced analytics & reporting",
        "Priority support",
        "Custom workflows",
        "API access",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Best for large organizations requiring enterprise-grade features and support.",
      price: {
        monthly: 99,
        annual: 990, // ~$82.50/month
      },
      features: [
        "Unlimited team members",
        "Enterprise security & compliance",
        "Custom branding & white-label",
        "Dedicated account manager",
        "24/7 priority support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ],
  faq: [
    {
      question: "How do I get started with the platform?",
      answer: "Getting started is simple! Sign up for a free account, complete the onboarding process, and you'll have access to our core features immediately. Our setup wizard will guide you through the initial configuration.",
    },
    {
      question: "Does the platform integrate with other business tools?",
      answer: "Yes! We integrate with over 150 popular business tools including Slack, Google Workspace, Microsoft Teams, Salesforce, and many more. Our API also allows for custom integrations.",
    },
    {
      question: "Can I customize workflows and dashboards?",
      answer: "Absolutely! Our platform is highly customizable. You can create custom dashboards, set up automated workflows, and configure the interface to match your team's specific needs and preferences.",
    },
    {
      question: "How do billing and upgrades work?",
      answer: "You can upgrade or downgrade your plan at any time. Billing is prorated automatically, and you can cancel anytime with no long-term commitments. We accept all major credit cards and offer annual discounts.",
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes! Our mobile app is available on both iOS and Android platforms. The mobile app syncs seamlessly with the web platform, so you can stay productive anywhere, anytime.",
    },
    {
      question: "What's included in each plan?",
      answer: "Each plan includes different levels of features, team members, and support. Check our detailed comparison above, or contact our sales team to discuss which plan is best for your specific needs.",
    },
  ],
} as const;